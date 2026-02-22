import asyncio
import json
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_user
from app.models.snapshot import AnalysisSnapshot
from app.services.snapshot_service import save_snapshot, get_latest_snapshot
from app.scoring.delta import compute_delta
from app.scoring.simulator import simulate_improvements
from app.scoring.skill_attribution import compute_skill_attribution

from app.models.github import GitHubProfileSummary, ProfileAnalysisRequest, RepoMode
from app.models.llm import ArchetypeResult, RecruiterSimulationResult
from app.models.scoring import PortfolioScoreBreakdown, RedFlags
from app.scoring.engine import compute_portfolio_score, detect_red_flags
from app.services.github_service import fetch_profile_summary, fetch_repo_list
from app.llm.client import get_openrouter_client


router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.get("/repos/{username}", response_model=List[dict])
async def get_repo_list(username: str) -> List[dict]:
    """
    Fetch lightweight repo list for user selection.
    Returns repos sorted by stars (descending).
    """
    try:
        loop = asyncio.get_event_loop()
        repos = await loop.run_in_executor(None, fetch_repo_list, username)
        return [
            {
                "name": r.name,
                "description": r.description,
                "stars": r.stars,
                "forks": r.forks,
                "language": r.language,
                "topics": r.topics,
            }
            for r in repos
        ]
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to fetch repos: {exc}") from exc


def _create_structured_summary(profile: GitHubProfileSummary, scores: PortfolioScoreBreakdown, red_flags: RedFlags) -> dict:
    """Create full structured summary for LLM - includes ALL information for accurate judgment."""
    return {
        "profile": {
            "username": profile.username,
            "name": profile.name,
            "bio": profile.bio,
            "company": profile.company,
            "location": profile.location,
            "followers": profile.followers,
            "following": profile.following,
            "public_repos": profile.public_repos,
            "total_stars": profile.total_stars,
            "total_forks": profile.total_forks,
            "languages": profile.languages,
        },
        "repositories": [
            {
                "name": r.name,
                "description": r.description,
                "stars": r.stars,
                "forks": r.forks,
                "language": r.language,
                "is_fork": r.is_fork,
                "has_readme": r.has_readme,
                "has_tests": r.has_tests,
                "has_dockerfile": r.has_dockerfile,
                "has_ci": r.has_ci,
                "has_api_folder": r.has_api_folder,
                "has_db_layer": r.has_db_layer,
                "has_notebooks_only": r.has_notebooks_only,
                "topics": r.topics,
                "homepage": str(r.homepage) if r.homepage else None,
            }
            for r in profile.repositories  # ALL repos, not limited
        ],
        "commit_activity": [
            {"date": str(ca.date), "commits": ca.commits}
            for ca in profile.commit_activity
        ],
        "scores": {
            "final_score": scores.final_score,
            "structure": {"score": scores.structure.score, "explanation": scores.structure.explanation},
            "engineering_depth": {"score": scores.engineering_depth.score, "explanation": scores.engineering_depth.explanation},
            "scalability": {"score": scores.scalability.score, "explanation": scores.scalability.explanation},
            "consistency": {"score": scores.consistency.score, "explanation": scores.consistency.explanation},
            "business_impact": {"score": scores.business_impact.score, "explanation": scores.business_impact.explanation},
            "readability": {"score": scores.readability.score, "explanation": scores.readability.explanation},
        },
        "red_flags": red_flags.red_flags,
        "readme_samples": profile.readme_samples[:3],  # Include sample READMEs for context
    }


@router.post("", response_model=dict)
async def analyze_profile(payload: ProfileAnalysisRequest, current_user: Optional[dict] = Depends(get_current_user)) -> dict:
    import asyncio
    
    try:
        username = payload.github_url.path.rstrip("/").split("/")[-1]
        
        # Determine repo filtering parameters based on mode
        repo_limit: Optional[int] = None
        selected_repo_names: Optional[List[str]] = None
        
        if payload.repo_mode == RepoMode.TOP_10:
            repo_limit = 10
        elif payload.repo_mode == RepoMode.TOP_20:
            repo_limit = 20
        elif payload.repo_mode == RepoMode.SELECTED:
            if not payload.selected_repo_names:
                raise HTTPException(
                    status_code=400,
                    detail="selected_repo_names is required when repo_mode is 'selected'",
                )
            selected_repo_names = payload.selected_repo_names
        # RepoMode.ENTIRE: no filtering (repo_limit and selected_repo_names remain None)
        
        # Run GitHub fetch in thread pool with timeout
        # Timeout varies based on repo count
        timeout = 90.0 if payload.repo_mode == RepoMode.ENTIRE else 60.0
        loop = asyncio.get_event_loop()
        profile: GitHubProfileSummary = await asyncio.wait_for(
            loop.run_in_executor(
                None,
                fetch_profile_summary,
                username,
                repo_limit,
                selected_repo_names,
            ),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=408, 
            detail="GitHub API request timed out after 90 seconds. This may happen for profiles with many repositories. Try again or ensure your GitHub token is valid."
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to fetch GitHub profile: {exc}") from exc

    scores: PortfolioScoreBreakdown = compute_portfolio_score(profile)
    red_flags: RedFlags = detect_red_flags(profile)

    client = await get_openrouter_client()
    # Send FULL structured data to LLM for accurate judgment
    structured_summary = _create_structured_summary(profile, scores, red_flags)
    
    import json
    summary_json = json.dumps(structured_summary, indent=2)

    recruiter_prompt = (
        "You are a senior recruiter hiring for an SDE-1 role at a top product company.\n\n"
        "Here is the COMPLETE candidate profile analysis (JSON):\n"
        f"{summary_json}\n\n"
        "Evaluate based on ALL available information including all repositories, commit activity, "
        "scores, and red flags. Respond in strict JSON with keys: "
        "`shortlist` (Yes/No), `top_strengths` (list of strings), "
        "`major_concerns` (list of strings), `hiring_readiness_level` (string), "
        "`critical_improvements` (list of strings).\n\n"
        "Be thorough and consider all aspects of the profile."
    )

    archetype_prompt = (
        "Classify this developer into ONE archetype based on their COMPLETE GitHub profile: "
        "Competitive Programmer, Research ML Builder, Framework User, Product Engineer, "
        "Systems Builder, Early Learner, Tutorial Follower.\n\n"
        "Profile data (JSON):\n"
        f"{summary_json}\n\n"
        "Consider all repositories, languages, project types, and patterns. "
        "Respond in strict JSON with keys: `archetype` (one name) and `reasoning` (one paragraph explaining why)."
    )

    # Sequential LLM calls to reduce rate-limit (429) hits; wrap in try/except for clean 503 response
    is_llm_failed = False
    try:
        recruiter_raw = await client.chat(
            model="arcee-ai/trinity-large-preview:free",
            messages=[
                {"role": "system", "content": "You are a precise JSON generator. Respond only with valid JSON."},
                {"role": "user", "content": recruiter_prompt},
            ],
            max_tokens=300,
            temperature=0.2,
        )
        archetype_raw = await client.chat(
            model="arcee-ai/trinity-large-preview:free",
            messages=[
                {"role": "system", "content": "You are a precise JSON generator. Respond only with valid JSON."},
                {"role": "user", "content": archetype_prompt},
            ],
            max_tokens=200,
            temperature=0.2,
        )
    except Exception as e:
        is_llm_failed = True

    try:
        if is_llm_failed:
            raise ValueError("LLM execution failed")
        recruiter_json = json.loads(recruiter_raw)
        archetype_json = json.loads(archetype_raw)
    except Exception:
        # Deterministic Fallback 
        recruiter_json = {
            "shortlist": scores.final_score >= 75,
            "top_strengths": ["Consistent GitHub activity" if scores.consistency.score > 70 else "N/A"],
            "major_concerns": ["Rule-based threshold triggered (LLM unavailable or invalid output)"],
            "hiring_readiness_level": "Strong" if scores.final_score >= 85 else "Needs Work",
            "critical_improvements": ["Review fundamentals" if scores.final_score < 75 else "None"],
        }
        archetype_json = {
            "archetype": "Systems Builder" if scores.engineering_depth.score >= 80 else "Product Engineer",
            "reasoning": "Rule-based threshold (LLM unavailable or invalid output)",
        }

    recruiter = RecruiterSimulationResult(
        shortlist=str(recruiter_json.get("shortlist", "No")).lower().startswith("y"),
        top_strengths=list(recruiter_json.get("top_strengths", [])),
        major_concerns=list(recruiter_json.get("major_concerns", [])),
        hiring_readiness_level=str(recruiter_json.get("hiring_readiness_level", "Unknown")),
        critical_improvements=list(recruiter_json.get("critical_improvements", [])),
    )

    archetype = ArchetypeResult(
        archetype=str(archetype_json.get("archetype", "Unknown")),
        reasoning=str(archetype_json.get("reasoning", "")),
    )

    profile_dict = profile.model_dump()
    skills_result = compute_skill_attribution(profile_dict)
    
    scoring_dict = {
        "structure": scores.structure.score,
        "engineering_depth": scores.engineering_depth.score,
        "scalability": scores.scalability.score,
        "consistency": scores.consistency.score,
        "business_impact": scores.business_impact.score,
        "readability": scores.readability.score,
    }
    simulator_result = simulate_improvements(profile_dict, scoring_dict)

    # Prepare AnalysisSnapshot
    new_snapshot = AnalysisSnapshot(
        user_id=current_user["id"] if current_user else None,
        username=profile.username,
        scores=scoring_dict,
        final_score=scores.final_score,
        red_flags=red_flags.red_flags,
        repo_scope=payload.repo_mode.name,
        archetype=archetype.archetype,
        shortlist=recruiter.shortlist,
        skills=skills_result.skills
    )

    previous_snapshot = get_latest_snapshot(profile.username)
    delta_result = compute_delta(new_snapshot, previous_snapshot)

    # Only save if authenticated
    if current_user:
        save_snapshot(profile.username, new_snapshot)

    return {
        "profile": profile,
        "scores": scores,
        "red_flags": red_flags,
        "recruiter": recruiter,
        "archetype": archetype,
        "delta": delta_result,
        "simulation": simulator_result,
        "skills": skills_result
    }

