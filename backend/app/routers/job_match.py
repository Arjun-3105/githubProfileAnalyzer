import json
from fastapi import APIRouter, HTTPException

from app.llm.client import get_openrouter_client
from app.models.llm import JobMatchRequest, JobMatchResult
from app.services.github_service import fetch_profile_summary


router = APIRouter(prefix="/job-match", tags=["job-match"])


@router.post("", response_model=JobMatchResult)
async def job_match(payload: JobMatchRequest) -> JobMatchResult:
    try:
        username = payload.github_url.rstrip("/").split("/")[-1]
        
        from app.services.snapshot_service import get_latest_snapshot
        snapshot = get_latest_snapshot(username)
        
        if snapshot:
            profile_data = {
                "scores": snapshot.scores,
                "skills": [s.model_dump() for s in snapshot.skills],
                "red_flags": snapshot.red_flags,
                "archetype": snapshot.archetype
            }
        else:
            profile = fetch_profile_summary(username)
            from app.scoring.skill_attribution import compute_skill_attribution
            skills_res = compute_skill_attribution(profile.model_dump())
            profile_data = {
                "profile": profile.model_dump(),
                "skills": [s.model_dump() for s in skills_res.skills]
            }
            
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to fetch or load profile: {exc}") from exc

    client = await get_openrouter_client()

    prompt = (
        "You are an AI technical recruiter.\n\n"
        "Compare the candidate profile data below (JSON) with the job description.\n"
        "Pay special attention to the skills evidence and scores provided.\n\n"
        f"Candidate profile data JSON:\n{json.dumps(profile_data)}\n\n"
        f"Job description:\n{payload.job_description}\n\n"
        "Return a strict JSON object with keys:\n"
        "- `match_score` (number 0-100)\n"
        "- `missing_skills` (list of strings)\n"
        "- `missing_signals` (list of strings, what's missing in portfolio evidence)\n"
        "- `suggested_projects` (list of strings)\n"
        "- `repo_suggestions` (list of strings, existing repos to highlight)\n"
        "- `resume_positioning_advice` (string).\n"
    )

    raw = await client.chat(
        model="deepseek/deepseek-chat:free",
        messages=[
            {"role": "system", "content": "You are a precise JSON generator."},
            {"role": "user", "content": prompt},
        ],
    )

    import json

    try:
        data = json.loads(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="Job match model returned invalid JSON.")

    return JobMatchResult(
        match_score=float(data.get("match_score", 0)),
        missing_skills=list(data.get("missing_skills", [])),
        missing_signals=list(data.get("missing_signals", [])),
        suggested_projects=list(data.get("suggested_projects", [])),
        repo_suggestions=list(data.get("repo_suggestions", [])),
        resume_positioning_advice=str(data.get("resume_positioning_advice", "")),
    )

