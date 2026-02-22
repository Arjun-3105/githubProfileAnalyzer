from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.snapshot import AnalysisSnapshot, ScoreDelta, CounterfactualSimulation, SkillAttributionResult
from app.services.snapshot_service import load_snapshots, get_latest_snapshot, get_previous_snapshot
from app.scoring.delta import compute_delta
from app.scoring.simulator import simulate_improvements
from app.core.security import get_current_user_required

router = APIRouter(prefix="/api", tags=["snapshots"])

@router.get("/snapshots/{username}", response_model=List[AnalysisSnapshot])
async def list_snapshots(username: str, current_user: dict = Depends(get_current_user_required)):
    snapshots = load_snapshots(username)
    filtered = [s for s in snapshots if s.user_id == current_user["id"]]
    
    if not filtered and snapshots:
        raise HTTPException(status_code=403, detail="Not authorized to view these snapshots")
    return filtered

@router.get("/snapshots/{username}/latest", response_model=AnalysisSnapshot)
async def latest_snapshot(username: str, current_user: dict = Depends(get_current_user_required)):
    latest = get_latest_snapshot(username)
    if not latest:
        raise HTTPException(status_code=404, detail="No snapshots found")
    if latest.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return latest

@router.get("/snapshots/{username}/delta", response_model=ScoreDelta)
async def snapshot_delta(username: str, current_user: dict = Depends(get_current_user_required)):
    latest = get_latest_snapshot(username)
    if not latest:
        raise HTTPException(status_code=404, detail="No snapshots found")
    if latest.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    previous = get_previous_snapshot(username)
    if previous and previous.user_id != current_user["id"]:
        previous = None
        
    delta = compute_delta(latest, previous)
    return delta

@router.get("/simulate/{username}", response_model=CounterfactualSimulation)
async def simulate_for_user(username: str, current_user: dict = Depends(get_current_user_required)):
    latest = get_latest_snapshot(username)
    if not latest:
        raise HTTPException(status_code=404, detail="No snapshots found")
    if latest.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    simulation = simulate_improvements({}, latest.scores)
    return simulation

@router.get("/skills/{username}", response_model=SkillAttributionResult)
async def skills_for_user(username: str, current_user: dict = Depends(get_current_user_required)):
    latest = get_latest_snapshot(username)
    if not latest:
        raise HTTPException(status_code=404, detail="No snapshots found")
    if latest.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    res = SkillAttributionResult(skills=latest.skills)
    return res
