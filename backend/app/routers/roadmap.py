from fastapi import APIRouter

from app.llm.client import get_openrouter_client
from app.models.llm import RoadmapRequest, RoadmapResult


router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.post("", response_model=RoadmapResult)
async def generate_roadmap(payload: RoadmapRequest) -> RoadmapResult:
    client = await get_openrouter_client()

    prompt = (
        "Based on the weaknesses identified in this profile, generate:\n"
        "- 30-day improvement plan\n"
        "- 90-day improvement plan\n"
        "- 3 high-impact project ideas\n"
        "- Skill gaps to prioritize\n\n"
        "Respond in strict JSON with keys: `plan_30_day`, `plan_90_day`, "
        "`high_impact_projects` (list of strings), `skill_gaps` (list of strings).\n\n"
        f"Weaknesses summary:\n{payload.weaknesses_summary}"
    )

    raw = await client.chat(
        model="meta-llama/llama-3-8b-instruct:free",
        messages=[
            {"role": "system", "content": "You are a precise JSON generator."},
            {"role": "user", "content": prompt},
        ],
    )

    import json

    data = json.loads(raw)
    return RoadmapResult(
        plan_30_day=str(data.get("plan_30_day", "")),
        plan_90_day=str(data.get("plan_90_day", "")),
        high_impact_projects=list(data.get("high_impact_projects", [])),
        skill_gaps=list(data.get("skill_gaps", [])),
    )

