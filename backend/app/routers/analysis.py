from fastapi import APIRouter, HTTPException

from app.models.github import GitHubProfileSummary, ProfileAnalysisRequest
from app.models.llm import ArchetypeResult, RecruiterSimulationResult
from app.models.scoring import PortfolioScoreBreakdown, RedFlags
from app.scoring.engine import compute_portfolio_score, detect_red_flags
from app.services.github_service import fetch_profile_summary
from app.llm.client import get_openrouter_client


router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("", response_model=dict)
async def analyze_profile(payload: ProfileAnalysisRequest) -> dict:
    try:
        username = payload.github_url.path.rstrip("/").split("/")[-1]
        profile: GitHubProfileSummary = fetch_profile_summary(username)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to fetch GitHub profile: {exc}") from exc

    scores: PortfolioScoreBreakdown = compute_portfolio_score(profile)
    red_flags: RedFlags = detect_red_flags(profile)

    client = await get_openrouter_client()
    structured_summary = {
        "profile": profile.model_dump(),
        "scores": scores.model_dump(),
        "red_flags": red_flags.model_dump(),
    }

    recruiter_prompt = (
        "You are a senior recruiter hiring for an SDE-1 role at a top product company.\n\n"
        "Here is the candidate profile summary (JSON):\n"
        f"{structured_summary}\n\n"
        "Evaluate and respond in strict JSON with keys: "
        "`shortlist` (Yes/No), `top_strengths` (list of strings), "
        "`major_concerns` (list of strings), `hiring_readiness_level` (string), "
        "`critical_improvements` (list of strings).\n\n"
        "Be direct, realistic, and recruiter-style."
    )

    recruiter_raw = await client.chat(
        model="deepseek/deepseek-chat:free",
        messages=[
            {"role": "system", "content": "You are a precise JSON generator."},
            {"role": "user", "content": recruiter_prompt},
        ],
    )

    archetype_prompt = (
        "Classify this developer into one archetype: "
        "Competitive Programmer, Research ML Builder, Framework User, Product Engineer, "
        "Systems Builder, Early Learner, Tutorial Follower.\n\n"
        f"Profile summary JSON:\n{structured_summary}\n\n"
        "Respond in strict JSON with keys: `archetype` and `reasoning` "
        "(one short paragraph)."
    )

    archetype_raw = await client.chat(
        model="deepseek/deepseek-chat:free",
        messages=[
            {"role": "system", "content": "You are a precise JSON generator."},
            {"role": "user", "content": archetype_prompt},
        ],
    )

    import json  # local import to keep top small

    try:
        recruiter_json = json.loads(recruiter_raw)
        archetype_json = json.loads(archetype_raw)
    except Exception:
        recruiter_json = {
            "shortlist": "No",
            "top_strengths": [],
            "major_concerns": ["LLM output was not valid JSON."],
            "hiring_readiness_level": "Unknown",
            "critical_improvements": [],
        }
        archetype_json = {
            "archetype": "Unknown",
            "reasoning": "LLM output was not valid JSON.",
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

    return {
        "profile": profile,
        "scores": scores,
        "red_flags": red_flags,
        "recruiter": recruiter,
        "archetype": archetype,
    }

