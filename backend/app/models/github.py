from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, HttpUrl


class CommitActivityPoint(BaseModel):
    date: datetime
    commits: int


class RepositorySummary(BaseModel):
    name: str
    description: Optional[str] = None
    stars: int
    forks: int
    language: Optional[str] = None
    is_fork: bool
    has_readme: bool
    has_tests: bool
    has_dockerfile: bool
    has_ci: bool
    has_api_folder: bool
    has_db_layer: bool
    has_notebooks_only: bool
    topics: List[str] = []
    default_branch: Optional[str] = None
    homepage: Optional[HttpUrl] = None


class RepoMode(str, Enum):
    ENTIRE = "entire"  # All repos (not recommended)
    TOP_10 = "top_10"  # Top 10 repos by stars
    TOP_20 = "top_20"  # Top 20 repos by stars
    SELECTED = "selected"  # User-selected repos


class ProfileAnalysisRequest(BaseModel):
    github_url: HttpUrl
    repo_mode: RepoMode = RepoMode.TOP_20
    selected_repo_names: Optional[List[str]] = None  # Required if repo_mode is SELECTED


class GitHubProfileSummary(BaseModel):
    username: str
    avatar_url: Optional[HttpUrl] = None
    name: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[HttpUrl] = None
    location: Optional[str] = None
    followers: int
    following: int
    public_repos: int
    total_stars: int
    total_forks: int
    languages: List[str]
    repositories: List[RepositorySummary]
    commit_activity: List[CommitActivityPoint]
    readme_samples: List[str]

