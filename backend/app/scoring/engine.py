from __future__ import annotations

from math import sqrt
from statistics import mean, pstdev
from typing import List

from app.models.github import GitHubProfileSummary
from app.models.scoring import DimensionScore, PortfolioScoreBreakdown, RedFlags


def score_structure(profile: GitHubProfileSummary) -> DimensionScore:
    score = 0.0
    reasons: list[str] = []

    repos = [r for r in profile.repositories if not r.is_fork]

    readme_repos = [r for r in repos if r.has_readme]
    if readme_repos:
        score += 20
        reasons.append("+20: At least one repository has a README.")
    else:
        reasons.append("0: No repositories with README detected.")

    if len(readme_repos) >= 1:
        score += 10
        reasons.append("+10: At least one README exists; assume basic documentation length.")

    if any("badge" in (r.description or "").lower() for r in repos):
        score += 10
        reasons.append("+10: Badges or status indicators detected in descriptions.")

    if any("license" in (r.description or "").lower() for r in repos):
        score += 10
        reasons.append("+10: License information hinted in descriptions.")

    if len(repos) >= 3:
        score += 20
        reasons.append("+20: Multiple meaningful (non-fork) repositories.")

    if any("-contrib" in (r.name.lower()) or "contributing" in (r.description or "").lower() for r in repos):
        score += 10
        reasons.append("+10: Contribution guide hinted by repo names/descriptions.")

    if len({r.language for r in repos if r.language}) >= 2:
        score += 20
        reasons.append("+20: Clear multi-repo structure across multiple tech stacks.")

    return DimensionScore(score=min(score, 100.0), explanation=" ".join(reasons))


def score_engineering_depth(profile: GitHubProfileSummary) -> DimensionScore:
    score = 0.0
    reasons: list[str] = []

    repos = [r for r in profile.repositories if not r.is_fork]
    if len(repos) >= 3:
        score += 20
        reasons.append("+20: Multiple original repositories indicate breadth.")

    multi_lang = len({r.language for r in repos if r.language}) >= 2
    if multi_lang:
        score += 15
        reasons.append("+15: Experience across multiple languages.")

    if any(r.has_notebooks_only for r in repos):
        score -= 10
        reasons.append("-10: Some repositories are notebook-only, suggesting experimentation over engineering.")

    popular_repos = [r for r in repos if r.stars >= 10]
    if popular_repos:
        score += 25
        reasons.append("+25: At least one repository with 10+ stars.")

    if profile.total_stars >= 50:
        score += 20
        reasons.append("+20: Strong evidence of community interest (50+ stars overall).")

    score = max(0.0, min(score, 100.0))
    return DimensionScore(score=score, explanation=" ".join(reasons))


def score_scalability(profile: GitHubProfileSummary) -> DimensionScore:
    score = 0.0
    reasons: list[str] = []

    repos = [r for r in profile.repositories if not r.is_fork]

    if any(r.has_tests for r in repos):
        score += 20
        reasons.append("+20: Tests folder detected.")
    else:
        reasons.append("0: No tests folder detected.")

    if any(r.has_dockerfile for r in repos):
        score += 20
        reasons.append("+20: Dockerfile present in at least one repo.")

    if any(r.has_ci for r in repos):
        score += 20
        reasons.append("+20: CI configuration detected.")

    if any(r.has_api_folder for r in repos):
        score += 20
        reasons.append("+20: API/server folder detected.")

    if any(r.has_db_layer for r in repos):
        score += 20
        reasons.append("+20: Database or persistence layer detected.")

    score = min(score, 100.0)
    return DimensionScore(score=score, explanation=" ".join(reasons))


def score_consistency(profile: GitHubProfileSummary) -> DimensionScore:
    points = profile.commit_activity
    if not points:
        return DimensionScore(
            score=0.0,
            explanation="0: No recent commit activity detected.",
        )

    daily_commits: List[int] = [p.commits for p in points]
    avg = mean(daily_commits)
    variability = pstdev(daily_commits) if len(daily_commits) > 1 else 0.0

    max_burst = max(daily_commits)
    inactivity_days = sum(1 for c in daily_commits if c == 0)

    # Normalize features into a 0–100 score
    score = 0.0

    if avg >= 1:
        score += 40
    elif avg > 0:
        score += 20

    if variability < 2:
        score += 20
    elif variability < 5:
        score += 10

    if inactivity_days < len(daily_commits) * 0.5:
        score += 20

    if max_burst <= 30:
        score += 20

    score = min(score, 100.0)

    explanation = (
        f"Avg commits/day: {avg:.2f}, variability: {variability:.2f}, "
        f"inactive days: {inactivity_days}, max burst: {max_burst}. "
        "Higher score indicates steadier contribution patterns and fewer long gaps."
    )

    return DimensionScore(score=score, explanation=explanation)


def score_business_impact(profile: GitHubProfileSummary) -> DimensionScore:
    score = 0.0
    reasons: list[str] = []

    repos = [r for r in profile.repositories if not r.is_fork]

    if any(r.homepage for r in repos):
        score += 20
        reasons.append("+20: Deployment or live demo link detected.")

    if any("metric" in (r.description or "").lower() or "kpi" in (r.description or "").lower() for r in repos):
        score += 20
        reasons.append("+20: Metrics or KPIs mentioned in descriptions.")

    if any("screenshot" in (r.description or "").lower() for r in repos):
        score += 20
        reasons.append("+20: Screenshots hinted in descriptions.")

    if any("api" in (r.description or "").lower() for r in repos):
        score += 20
        reasons.append("+20: API endpoints or integrations mentioned.")

    if any(word in (r.description or "").lower() for r in repos for word in ["client", "user", "customer"]):
        score += 20
        reasons.append("+20: Real-world, user-facing framing language.")

    score = min(score, 100.0)
    return DimensionScore(score=score, explanation=" ".join(reasons))


def score_readability(profile: GitHubProfileSummary) -> DimensionScore:
    score = 0.0
    reasons: list[str] = []

    readmes = profile.readme_samples
    if not readmes:
        return DimensionScore(score=0.0, explanation="0: No README content available for analysis.")

    text = "\n\n".join(readmes).lower()

    if "description" in text or "overview" in text:
        score += 20
        reasons.append("+20: Clear project descriptions or overview sections found.")

    if "-" in text or "*" in text:
        score += 20
        reasons.append("+20: Bullet-style formatting detected.")

    if "tech stack" in text or "technologies" in text:
        score += 20
        reasons.append("+20: Tech stack section present.")

    if "installation" in text or "setup" in text:
        score += 20
        reasons.append("+20: Installation/setup instructions present.")

    if "usage" in text or "how to run" in text:
        score += 20
        reasons.append("+20: Usage or run instructions documented.")

    score = min(score, 100.0)
    return DimensionScore(score=score, explanation=" ".join(reasons))


def compute_portfolio_score(profile: GitHubProfileSummary) -> PortfolioScoreBreakdown:
    structure = score_structure(profile)
    engineering = score_engineering_depth(profile)
    scalability = score_scalability(profile)
    consistency = score_consistency(profile)
    business_impact = score_business_impact(profile)
    readability = score_readability(profile)

    final_score = (
        structure.score * 0.15
        + engineering.score * 0.25
        + scalability.score * 0.15
        + consistency.score * 0.15
        + business_impact.score * 0.15
        + readability.score * 0.15
    )

    return PortfolioScoreBreakdown(
        structure=structure,
        engineering_depth=engineering,
        scalability=scalability,
        consistency=consistency,
        business_impact=business_impact,
        readability=readability,
        final_score=final_score,
    )


def detect_red_flags(profile: GitHubProfileSummary) -> RedFlags:
    flags: list[str] = []
    repos = profile.repositories

    if not any(r.has_readme for r in repos if not r.is_fork):
        flags.append("No README found on original repositories.")

    if repos and sum(1 for r in repos if r.is_fork) / len(repos) > 0.7:
        flags.append("Profile is mostly composed of forked repositories.")

    if not any(r.has_tests for r in repos if not r.is_fork):
        flags.append("No tests folder detected in original repositories.")

    if all(r.has_notebooks_only for r in repos if not r.is_fork):
        flags.append("Most projects are notebook-only with little production code.")

    if not any(r.description for r in repos if not r.is_fork):
        flags.append("Projects lack descriptions.")

    if not any(r.stars > 0 or r.forks > 0 for r in repos if not r.is_fork):
        flags.append("No visible community interaction (stars/forks).")

    # Simple massive burst detection from commit_activity
    if profile.commit_activity and max(p.commits for p in profile.commit_activity) > 100:
        flags.append("Massive one-day commit burst detected.")

    return RedFlags(red_flags=flags)

