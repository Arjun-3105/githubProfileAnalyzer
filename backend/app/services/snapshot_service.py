import json
import os
from typing import List, Optional
from app.models.snapshot import AnalysisSnapshot

SNAPSHOTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "snapshots")

# Ensure directory exists
os.makedirs(SNAPSHOTS_DIR, exist_ok=True)

def _get_file_path(username: str) -> str:
    # Basic sanitization
    safe_username = "".join([c for c in username if c.isalnum() or c in "-_"])
    return os.path.join(SNAPSHOTS_DIR, f"{safe_username}.json")

def save_snapshot(username: str, snapshot: AnalysisSnapshot) -> None:
    filepath = _get_file_path(username)
    snapshots = load_snapshots(username)
    snapshots.append(snapshot)
    
    # Save back
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump([s.model_dump() for s in snapshots], f, indent=2)

def load_snapshots(username: str) -> List[AnalysisSnapshot]:
    filepath = _get_file_path(username)
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [AnalysisSnapshot(**item) for item in data]
    except (json.JSONDecodeError, Exception):
        return []

def get_latest_snapshot(username: str) -> Optional[AnalysisSnapshot]:
    snapshots = load_snapshots(username)
    if not snapshots:
        return None
    return snapshots[-1]

def get_previous_snapshot(username: str) -> Optional[AnalysisSnapshot]:
    snapshots = load_snapshots(username)
    if len(snapshots) < 2:
        return None
    return snapshots[-2]
