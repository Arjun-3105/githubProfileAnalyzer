from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SkillEvidence(BaseModel):
    skill: str
    evidence_count: int
    confidence: float
    evidence: list[str]

class SkillAttributionResult(BaseModel):
    skills: list[SkillEvidence]

class ScoreDelta(BaseModel):
    dimensions: dict[str, float]
    final_score: float
    direction: str # "up", "down", "flat"
    stagnation_flag: bool
    is_first_analysis: bool
    attribution_strings: list[str]

class CounterfactualScenario(BaseModel):
    action: str
    projected_score: float
    delta: float
    effort_hours: int
    roi_rank: float
    impacted_dimensions: list[str] = []

class CounterfactualSimulation(BaseModel):
    scenarios: list[CounterfactualScenario]
    best_action: str
    path_to_threshold: list[str]

class AnalysisSnapshot(BaseModel):
    schema_version: str = "1.0"
    app_version: str = "0.3.0"
    user_id: Optional[str] = None
    username: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    scores: dict[str, float]
    final_score: float
    red_flags: list[str]
    repo_scope: str # "TOP_10" or "ENTIRE"
    archetype: str
    shortlist: bool
    skills: list[SkillEvidence] = []
