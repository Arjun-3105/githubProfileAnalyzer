from pydantic import BaseModel


class DimensionScore(BaseModel):
    score: float
    explanation: str


class PortfolioScoreBreakdown(BaseModel):
    structure: DimensionScore
    engineering_depth: DimensionScore
    scalability: DimensionScore
    consistency: DimensionScore
    business_impact: DimensionScore
    readability: DimensionScore
    final_score: float


class RedFlags(BaseModel):
    red_flags: list[str]

