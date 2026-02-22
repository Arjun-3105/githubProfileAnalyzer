from typing import Optional
from app.models.snapshot import AnalysisSnapshot, ScoreDelta
import datetime

def compute_delta(current: AnalysisSnapshot, previous: Optional[AnalysisSnapshot] = None) -> ScoreDelta:
    if not previous:
        return ScoreDelta(
            dimensions={k: 0.0 for k in current.scores.keys()},
            final_score=0.0,
            direction="flat",
            stagnation_flag=False,
            is_first_analysis=True,
            attribution_strings=["First analysis recorded."]
        )
    
    delta_dimensions = {}
    for k, v in current.scores.items():
        prev_v = previous.scores.get(k, 0.0)
        delta_dimensions[k] = round(v - prev_v, 2)
        
    delta_final = round(current.final_score - previous.final_score, 2)
    
    if delta_final > 2:
        direction = "up"
    elif delta_final < -2:
        direction = "down"
    else:
        direction = "flat"
        
    stagnation_flag = False
    if direction == "flat":
        try:
            curr_date = datetime.datetime.fromisoformat(current.timestamp.replace("Z", "+00:00"))
            prev_date = datetime.datetime.fromisoformat(previous.timestamp.replace("Z", "+00:00"))
            if (curr_date - prev_date).days > 7:
                stagnation_flag = True
        except Exception:
            pass
            
    attribution_strings = []
    
    # Ground truth lock validation for repo scope
    if current.repo_scope != previous.repo_scope:
       attribution_strings.append(f"Repo scope changed from {previous.repo_scope} to {current.repo_scope}. Deltas may be skewed.")

    if delta_final > 0:
        attribution_strings.append(f"Score improved by +{delta_final}")
    elif delta_final < 0:
        attribution_strings.append(f"Score decreased by {delta_final}")
    elif not stagnation_flag and not attribution_strings:
        attribution_strings.append("Score remains statistically flat.")
    
    if stagnation_flag:
        attribution_strings.append("Stagnation detected: score flat for > 7 days.")

    return ScoreDelta(
        dimensions=delta_dimensions,
        final_score=delta_final,
        direction=direction,
        stagnation_flag=stagnation_flag,
        is_first_analysis=False,
        attribution_strings=attribution_strings
    )
