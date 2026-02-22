from __future__ import annotations

from datetime import datetime, timedelta
from typing import List, Optional

from github import Auth, Github

from app.core.config import settings
from app.models.github import (
    CommitActivityPoint,
    GitHubProfileSummary,
    RepositorySummary,
)


def _get_client() -> Github:
    if settings.github_token and settings.github_token.strip():
        try:
            auth = Auth.Token(settings.github_token.strip())
            return Github(auth=auth)
        except Exception:
            # If token is invalid, fall back to unauthenticated
            from app.utils.logging import logger
            logger.warning("Invalid GitHub token provided, using unauthenticated requests (rate limit: 60/hour)")
            return Github()
    return Github()


def _get_repo_contents_cached(repo) -> tuple[list, bool]:
    """Get repo contents once and cache. Returns (contents_list, success)."""
    try:
        contents = repo.get_contents("")
        if isinstance(contents, list):
            return contents, True
        return [contents], True
    except Exception:
        return [], False


def _detect_repo_features(repo) -> dict:
    """
    Batch all repo feature detection into ONE API call.
    Returns dict with all detected features.
    """
    contents, success = _get_repo_contents_cached(repo)
    if not success:
        return {
            "has_tests": False,
            "has_dockerfile": False,
            "has_ci": False,
            "has_api_folder": False,
            "has_db_layer": False,
            "has_notebooks_only": False,
        }
    
    names_lower = {c.name.lower() for c in contents}
    dirs_lower = {c.name.lower() for c in contents if c.type == "dir"}
    files_lower = {c.name.lower() for c in contents if c.type == "file"}
    
    return {
        "has_tests": any(name in dirs_lower for name in ("tests", "test", "spec")),
        "has_dockerfile": "dockerfile" in files_lower or "docker-compose.yml" in files_lower,
        "has_ci": any(name in names_lower for name in (".github", "github", "circleci", ".gitlab-ci.yml", ".github/workflows")),
        "has_api_folder": any(name in dirs_lower for name in ("api", "apis", "server", "backend")),
        "has_db_layer": any(name in dirs_lower for name in ("db", "database", "prisma", "migrations", "models")),
        "has_notebooks_only": (
            any(c.name.endswith(".ipynb") for c in contents) and
            not any(c.name.endswith(ext) for c in contents for ext in (".py", ".js", ".ts", ".tsx", ".java", ".go", ".rs"))
        ),
    }


def fetch_repo_list(username: str) -> List[RepositorySummary]:
    """
    Fetch lightweight repo list (metadata only) for user selection.
    Returns repos sorted by stars (descending).
    """
    from app.utils.logging import logger
    
    logger.info(f"Fetching repo list for {username}...")
    gh = _get_client()
    user = gh.get_user(username)
    all_repos = list(user.get_repos())
    
    # Sort by stars descending, exclude forks
    original_repos = [r for r in all_repos if not r.fork]
    original_repos.sort(key=lambda r: r.stargazers_count, reverse=True)
    
    repos: List[RepositorySummary] = []
    for repo in original_repos:
        repos.append(
            RepositorySummary(
                name=repo.name,
                description=repo.description,
                stars=repo.stargazers_count,
                forks=repo.forks_count,
                language=repo.language,
                is_fork=False,
                has_readme=False,  # Not checked for list view
                has_tests=False,
                has_dockerfile=False,
                has_ci=False,
                has_api_folder=False,
                has_db_layer=False,
                has_notebooks_only=False,
                topics=list(getattr(repo, "topics", []) or []),
                default_branch=repo.default_branch,
                homepage=repo.homepage or None,
            )
        )
    
    return repos


def fetch_profile_summary(
    username: str,
    repo_limit: Optional[int] = None,
    selected_repo_names: Optional[List[str]] = None,
) -> GitHubProfileSummary:
    from app.utils.logging import logger
    
    logger.info(f"Fetching GitHub profile for {username}...")
    gh = _get_client()
    user = gh.get_user(username)

    # Fetch repos and apply filtering based on mode
    logger.info("Fetching repository list...")
    all_repos = list(user.get_repos())
    
    # Separate original repos from forks
    original_repos = [r for r in all_repos if not r.fork]
    fork_repos = [r for r in all_repos if r.fork]
    
    # Apply filtering
    if selected_repo_names:
        # Filter to selected repos only
        selected_set = set(selected_repo_names)
        original_repos = [r for r in original_repos if r.name in selected_set]
        logger.info(f"Filtered to {len(original_repos)} selected repos")
    elif repo_limit:
        # Sort by stars and take top N
        original_repos.sort(key=lambda r: r.stargazers_count, reverse=True)
        original_repos = original_repos[:repo_limit]
        logger.info(f"Filtered to top {len(original_repos)} repos by stars")
    else:
        logger.info(f"Processing all {len(original_repos)} original repos")
    
    # Calculate totals from ALL repos (not filtered) for accurate profile stats
    total_stars = sum(r.stargazers_count for r in all_repos)
    total_forks = sum(r.forks_count for r in all_repos)
    language_set: set[str] = {r.language for r in all_repos if r.language}
    
    repositories: List[RepositorySummary] = []
    readme_samples: List[str] = []
    
    logger.info(f"Found {len(original_repos)} original repos and {len(fork_repos)} forks")
    logger.info("Processing original repos with full detail checks...")
    
    # Process original repos with full detail checks
    processed = 0
    for repo in original_repos:
        processed += 1
        if processed % 5 == 0:  # Log progress every 5 repos
            logger.info(f"Processed {processed}/{len(original_repos)} original repos...")
        
        try:
            if repo.language:
                language_set.add(repo.language)

            has_readme = False
            # Check README for all original repos
            try:
                readme = repo.get_readme()
                has_readme = True
                if len(readme_samples) < 5:  # Increased from 3 to get more README samples
                    readme_samples.append(readme.decoded_content.decode("utf-8", errors="ignore")[:2000])  # Increased size limit
            except Exception as e:
                logger.debug(f"Could not fetch README for {repo.name}: {e}")
                has_readme = False
            
            # Batch all feature detection into ONE API call (performance optimization)
            features = _detect_repo_features(repo)
            
            repositories.append(
                RepositorySummary(
                    name=repo.name,
                    description=repo.description,
                    stars=repo.stargazers_count,
                    forks=repo.forks_count,
                    language=repo.language,
                    is_fork=False,
                    has_readme=has_readme,
                    has_tests=features["has_tests"],
                    has_dockerfile=features["has_dockerfile"],
                    has_ci=features["has_ci"],
                    has_api_folder=features["has_api_folder"],
                    has_db_layer=features["has_db_layer"],
                    has_notebooks_only=features["has_notebooks_only"],
                    topics=list(getattr(repo, "topics", []) or []),
                    default_branch=repo.default_branch,
                    homepage=repo.homepage or None,
                )
            )
        except Exception as e:
            # If a repo fails, log and continue with basic info
            logger.warning(f"Error processing repo {repo.name}: {e}. Continuing with basic info...")
            repositories.append(
                RepositorySummary(
                    name=repo.name,
                    description=repo.description,
                    stars=repo.stargazers_count,
                    forks=repo.forks_count,
                    language=repo.language,
                    is_fork=False,
                    has_readme=False,
                    has_tests=False,
                    has_dockerfile=False,
                    has_ci=False,
                    has_api_folder=False,
                    has_db_layer=False,
                    has_notebooks_only=False,
                    topics=[],
                    default_branch=repo.default_branch,
                    homepage=repo.homepage or None,
                )
            )
    
    # Process forks (less detail needed but still include them)
    logger.info(f"Processing {len(fork_repos)} forks (metadata only)...")
    for repo in fork_repos:
        if repo.language:
            language_set.add(repo.language)
        
        repositories.append(
            RepositorySummary(
                name=repo.name,
                description=repo.description,
                stars=repo.stargazers_count,
                forks=repo.forks_count,
                language=repo.language,
                is_fork=True,
                has_readme=False,  # Forks don't need README checks
                has_tests=False,
                has_dockerfile=False,
                has_ci=False,
                has_api_folder=False,
                has_db_layer=False,
                has_notebooks_only=False,
                topics=list(getattr(repo, "topics", []) or []),
                default_branch=repo.default_branch,
                homepage=repo.homepage or None,
            )
        )

    # Restore commit activity - needed for consistency scoring
    # But limit to reasonable number for performance
    logger.info("Computing commit activity...")
    try:
        commit_activity = _compute_commit_activity(user)
        logger.info(f"Found {len(commit_activity)} commit activity points")
    except Exception as e:
        logger.warning(f"Commit activity computation failed: {e}")
        commit_activity = []  # Fallback if it fails
    
    logger.info(f"Profile fetch complete: {len(repositories)} repos processed")

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
    Limited to 500 events for balance between completeness and speed.
    """
    from datetime import timezone
    
    # Use timezone-aware datetime to match PyGithub's event.created_at
    cutoff = datetime.now(timezone.utc) - timedelta(days=365)
    events = user.get_events()
    buckets: dict[datetime, int] = {}
    count = 0
    for event in events:
        if count >= 500:  # Increased limit for more complete data
            break
        created_at: datetime = event.created_at
        # Ensure both datetimes are timezone-aware for comparison
        if created_at.tzinfo is None:
            # If naive, assume UTC
            created_at = created_at.replace(tzinfo=timezone.utc)
        if created_at < cutoff:
            break
        # Store as naive datetime (date only, no time)
        day = datetime(created_at.year, created_at.month, created_at.day)
        buckets[day] = buckets.get(day, 0) + 1
        count += 1

    return [
        CommitActivityPoint(date=day, commits=count)
        for day, count in sorted(buckets.items(), key=lambda x: x[0])
    ]

