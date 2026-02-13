from pydantic import BaseModel


class RecruiterSimulationResult(BaseModel):
    shortlist: bool
    top_strengths: list[str]
    major_concerns: list[str]
    hiring_readiness_level: str
    critical_improvements: list[str]


class ArchetypeResult(BaseModel):
    archetype: str
    reasoning: str


class JobMatchRequest(BaseModel):
    github_url: str
    job_description: str


class JobMatchResult(BaseModel):
    match_score: float
    missing_skills: list[str]
    suggested_projects: list[str]
    resume_positioning_advice: str


class ReadmeRewriteRequest(BaseModel):
    content: str


class ReadmeRewriteResult(BaseModel):
    rewritten: str


class RoadmapRequest(BaseModel):
    weaknesses_summary: str


class RoadmapResult(BaseModel):
    plan_30_day: str
    plan_90_day: str
    high_impact_projects: list[str]
    skill_gaps: list[str]

