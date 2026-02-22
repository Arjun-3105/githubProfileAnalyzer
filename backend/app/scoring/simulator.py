from app.models.snapshot import CounterfactualSimulation, CounterfactualScenario

def simulate_improvements(profile: dict, base_scores: dict) -> CounterfactualSimulation:
    scenarios = []
    
    # 1. Add README
    # Impact: structure +10
    score1 = min(100.0, base_scores.get('structure', 0.0) + 10.0)
    delta1 = round(score1 - base_scores.get('structure', 0.0), 2)
    scenarios.append(CounterfactualScenario(
        action="Add README to all repos",
        projected_score=score1,
        delta=delta1,
        effort_hours=2,
        roi_rank=round(delta1 / 2, 2) if delta1 > 0 else 0.0,
        impacted_dimensions=["structure"]
    ))
    
    # 2. Add Tests
    # Impact: testing +20
    score2 = min(100.0, base_scores.get('testing', 0.0) + 20.0)
    delta2 = round(score2 - base_scores.get('testing', 0.0), 2)
    scenarios.append(CounterfactualScenario(
        action="Add test suites",
        projected_score=score2,
        delta=delta2,
        effort_hours=6,
        roi_rank=round(delta2 / 6, 2) if delta2 > 0 else 0.0,
        impacted_dimensions=["testing"]
    ))
    
    # 3. Add CI
    # Impact: engineering_depth +15
    score3 = min(100.0, base_scores.get('engineering_depth', 0.0) + 15.0)
    delta3 = round(score3 - base_scores.get('engineering_depth', 0.0), 2)
    scenarios.append(CounterfactualScenario(
        action="Add GitHub Actions CI",
        projected_score=score3,
        delta=delta3,
        effort_hours=3,
        roi_rank=round(delta3 / 3, 2) if delta3 > 0 else 0.0,
        impacted_dimensions=["engineering_depth"]
    ))

    # 4. Add Dockerfile
    # Impact: engineering_depth +10
    score4 = min(100.0, base_scores.get('engineering_depth', 0.0) + 10.0)
    delta4 = round(score4 - base_scores.get('engineering_depth', 0.0), 2)
    scenarios.append(CounterfactualScenario(
        action="Add Dockerfile",
        projected_score=score4,
        delta=delta4,
        effort_hours=2,
        roi_rank=round(delta4 / 2, 2) if delta4 > 0 else 0.0,
        impacted_dimensions=["engineering_depth"]
    ))
    
    # 5. Add deployment link
    # Impact: product_focus +15
    score5 = min(100.0, base_scores.get('product_focus', 0.0) + 15.0)
    delta5 = round(score5 - base_scores.get('product_focus', 0.0), 2)
    scenarios.append(CounterfactualScenario(
        action="Add deployment link / homepage",
        projected_score=score5,
        delta=delta5,
        effort_hours=1,
        roi_rank=round(delta5 / 1, 2) if delta5 > 0 else 0.0,
        impacted_dimensions=["product_focus"]
    ))
    
    # Sort descending by ROI
    scenarios.sort(key=lambda x: x.roi_rank, reverse=True)
    
    best_action = scenarios[0].action if scenarios and scenarios[0].roi_rank > 0 else "No obvious quick wins"
    
    # Fastest path to threshold 85
    # Naive assumption: average current scores + deltas
    current_avg = sum(base_scores.values()) / max(len(base_scores), 1)
    path = []
    projected = current_avg
    for s in scenarios:
        if projected >= 85:
            break
        if s.delta > 0:
            path.append(s.action)
            projected += (s.delta / len(base_scores)) # Approximation of impact on final score
            
    return CounterfactualSimulation(
        scenarios=scenarios,
        best_action=best_action,
        path_to_threshold=path
    )
