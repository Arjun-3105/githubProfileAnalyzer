from __future__ import annotations

from datetime import datetime, timedelta
from typing import List

from github import Auth, Github

from app.core.config import settings
from app.models.github import (
    CommitActivityPoint,
    GitHubProfileSummary,
    RepositorySummary,
)


def _get_client() -> Github:
    if settings.github_token:
        auth = Auth.Token(settings.github_token)
        return Github(auth=auth)
    return Github()


def _detect_has_tests(repo) -> bool:
    for path in ("tests", "test", "spec"):
        try:
            repo.get_contents(path)
            return True
        except Exception:
            continue
    return False


def _detect_file(repo, filenames: List[str]) -> bool:
    try:
        contents = repo.get_contents("")
    except Exception:
        return False
    names = {c.name.lower() for c in contents}
    return any(name in names for name in filenames)


def _detect_folder(repo, folder_names: List[str]) -> bool:
    try:
        contents = repo.get_contents("")
    except Exception:
        return False
    names = {c.name.lower() for c in contents if c.type == "dir"}
    return any(name in names for name in folder_names)


def _detect_notebooks_only(repo) -> bool:
    try:
        contents = repo.get_contents("")
    except Exception:
        return False
    has_ipynb = any(c.name.endswith(".ipynb") for c in contents)
    has_code = any(
        c.name.endswith(ext)
        for c in contents
        for ext in (".py", ".js", ".ts", ".tsx", ".java", ".go", ".rs")
    )
    return has_ipynb and not has_code


def fetch_profile_summary(username: str) -> GitHubProfileSummary:
    gh = _get_client()
    user = gh.get_user(username)

    repos = list(user.get_repos())
    repositories: List[RepositorySummary] = []

    total_stars = 0
    total_forks = 0
    language_set: set[str] = set()
    readme_samples: List[str] = []

    for repo in repos:
        total_stars += repo.stargazers_count
        total_forks += repo.forks_count
        if repo.language:
            language_set.add(repo.language)

        has_readme = False
        try:
            readme = repo.get_readme()
            has_readme = True
            if len(readme_samples) < 3:
                readme_samples.append(readme.decoded_content.decode("utf-8", errors="ignore"))
        except Exception:
            has_readme = False

        repositories.append(
            RepositorySummary(
                name=repo.name,
                description=repo.description,
                stars=repo.stargazers_count,
                forks=repo.forks_count,
                language=repo.language,
                is_fork=repo.fork,
                has_readme=has_readme,
                has_tests=_detect_has_tests(repo),
                has_dockerfile=_detect_file(repo, ["dockerfile"]),
                has_ci=_detect_file(repo, [".github", "github", "circleci", ".gitlab-ci.yml"]),
                has_api_folder=_detect_folder(repo, ["api", "apis", "server", "backend"]),
                has_db_layer=_detect_folder(repo, ["db", "database", "prisma", "migrations", "models"]),
                has_notebooks_only=_detect_notebooks_only(repo),
                topics=list(getattr(repo, "topics", []) or []),
                default_branch=repo.default_branch,
                homepage=repo.homepage or None,
            )
        )

    commit_activity = _compute_commit_activity(user)

    return GitHubProfileSummary(
        username=user.login,
        avatar_url=user.avatar_url,
        name=user.name,
        bio=user.bio,
        company=user.company,
        blog=user.blog or None,
        location=user.location,
        followers=user.followers,
        following=user.following,
        public_repos=user.public_repos,
        total_stars=total_stars,
        total_forks=total_forks,
        languages=sorted(language_set),
        repositories=repositories,
        commit_activity=commit_activity,
        readme_samples=readme_samples,
    )


def _compute_commit_activity(user) -> List[CommitActivityPoint]:
    """
    Approximate commit activity over last 12 months based on events API.
    """
    cutoff = datetime.utcnow() - timedelta(days=365)
    events = user.get_events()
    buckets: dict[datetime, int] = {}
    for event in events:
        created_at: datetime = event.created_at
        if created_at < cutoff:
            break
        day = datetime(created_at.year, created_at.month, created_at.day)
        buckets[day] = buckets.get(day, 0) + 1

    return [
        CommitActivityPoint(date=day, commits=count)
        for day, count in sorted(buckets.items(), key=lambda x: x[0])
    ]

