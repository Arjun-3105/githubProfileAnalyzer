from app.models.snapshot import SkillAttributionResult, SkillEvidence

def compute_skill_attribution(profile: dict) -> SkillAttributionResult:
    repos = profile.get("repos", [])
    
    skills_map = {
        "Backend": {"evidence": [], "keywords": ["api", "server", "routes", "controllers", "backend"]},
        "ML/AI": {"evidence": [], "keywords": ["ml", "ai", "deep-learning", "train.py", "notebook", "model", "tensorflow", "pytorch"]},
        "DevOps": {"evidence": [], "keywords": ["docker", "ci", "cd", "action", "kubernetes", "k8s", "terraform", "deploy"]},
        "Frontend": {"evidence": [], "keywords": ["react", "vue", "next", "frontend", "ui", "css", "html", "js", "ts", "tailwind"]},
        "Database": {"evidence": [], "keywords": ["db", "sql", "postgres", "mongo", "redis", "database", "schema", "migration"]},
        "Testing": {"evidence": [], "keywords": ["test", "jest", "pytest", "spec", "mocha", "cypress", "e2e"]}
    }

    for repo in repos:
        name = repo.get("name", "").lower()
        desc = (repo.get("description") or "").lower()
        topics = [t.lower() for t in repo.get("topics", [])]
        lang = (repo.get("language") or "").lower()
        
        has_tests = "test" in desc or "test" in name or "testing" in topics
        if repo.get("has_tests"):
             has_tests = True
             
        has_dockerfile = "docker" in topics or "docker" in desc or "docker" in name
        if repo.get("has_dockerfile"):
             has_dockerfile = True

        has_ci = "action" in topics or "action" in desc or "ci" in topics
        if repo.get("has_ci"):
             has_ci = True

        text_content = f"{name} {desc} {' '.join(topics)} {lang}"

        if any(k in text_content for k in skills_map["Backend"]["keywords"]):
            skills_map["Backend"]["evidence"].append(name)
            
        if any(k in text_content for k in skills_map["ML/AI"]["keywords"]) or (lang == "jupyter notebook" and "model" in text_content):
            skills_map["ML/AI"]["evidence"].append(name)
            
        if any(k in text_content for k in skills_map["DevOps"]["keywords"]) or has_dockerfile or has_ci:
            skills_map["DevOps"]["evidence"].append(name)
            
        if any(k in text_content for k in skills_map["Frontend"]["keywords"]):
            skills_map["Frontend"]["evidence"].append(name)
            
        if any(k in text_content for k in skills_map["Database"]["keywords"]):
            skills_map["Database"]["evidence"].append(name)
            
        if any(k in text_content for k in skills_map["Testing"]["keywords"]) or has_tests:
            skills_map["Testing"]["evidence"].append(name)

    results = []
    for skill_name, data in skills_map.items():
        # Remove duplicates
        evidence_list = list(set(data["evidence"]))
        count = len(evidence_list)
        if count > 0:
            confidence = min(1.0, count * 0.25 + 0.2)
            results.append(SkillEvidence(
                skill=skill_name,
                evidence_count=count,
                confidence=round(confidence, 2),
                evidence=evidence_list
            ))

    # Sort by confidence descending
    results.sort(key=lambda x: x.confidence, reverse=True)

    return SkillAttributionResult(skills=results)
