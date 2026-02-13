from fastapi import APIRouter, HTTPException

from app.llm.client import get_openrouter_client
from app.models.llm import JobMatchRequest, JobMatchResult
from app.services.github_service import fetch_profile_summary


router = APIRouter(prefix="/job-match", tags=["job-match"])


@router.post("", response_model=JobMatchResult)
async def job_match(payload: JobMatchRequest) -> JobMatchResult:
    try:
        username = payload.github_url.rstrip("/").split("/")[-1]
        profile = fetch_profile_summary(username)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to fetch GitHub profile: {exc}") from exc

    client = await get_openrouter_client()

    prompt = (
        "You are an AI technical recruiter.\n\n"
        "Compare the candidate profile below (JSON) with the job description.\n\n"
        f"Candidate profile JSON:\n{profile.model_dump()}\n\n"
        f"Job description:\n{payload.job_description}\n\n"
        "Return a strict JSON object with keys:\n"
        "- `match_score` (number 0-100)\n"
        "- `missing_skills` (list of strings)\n"
        "- `suggested_projects` (list of strings)\n"
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
        suggested_projects=list(data.get("suggested_projects", [])),
        resume_positioning_advice=str(data.get("resume_positioning_advice", "")),
    )

