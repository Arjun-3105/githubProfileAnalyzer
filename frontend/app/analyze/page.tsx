"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Particles from "../components/Particles";

interface AnalyzeResponse {
  scores: {
    structure: { score: number };
    engineering_depth: { score: number };
    scalability: { score: number };
    consistency: { score: number };
    business_impact: { score: number };
    readability: { score: number };
    final_score: number;
  };
  red_flags: { red_flags: string[] };
  archetype: { archetype: string; reasoning: string };
  recruiter: {
    shortlist: boolean;
    hiring_readiness_level: string;
    top_strengths: string[];
    major_concerns: string[];
    critical_improvements?: string[];
  };
  delta?: {
    dimensions: Record<string, number>;
    final_score: number;
    direction: string;
    is_first_analysis: boolean;
    attribution_strings: string[];
  };
  simulation?: {
    scenarios: Array<{
      action: string;
      projected_score: number;
      delta: number;
      effort_hours: number;
      roi_rank: number;
    }>;
    best_action: string;
    path_to_threshold: string[];
  };
  skills?: {
    skills: Array<{
      skill: string;
      evidence_count: number;
      confidence: number;
      evidence: string[];
    }>;
  };
}

type RepoMode = "entire" | "top_10" | "top_20" | "selected";

interface Repo {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
}

export default function AnalyzePage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [repoMode, setRepoMode] = useState<RepoMode>("top_20");
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [availableRepos, setAvailableRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const { user } = useAuth();

  // Fetch repo list when mode is "selected" and username is available
  useEffect(() => {
    const fetchRepos = async () => {
      if (repoMode !== "selected" || !githubUrl) {
        setAvailableRepos([]);
        return;
      }

      try {
        const username = githubUrl.split("/").filter(Boolean).pop();
        if (!username) return;

        setLoadingRepos(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://githubprofileanalyzer-paxc.onrender.com";
        const resp = await fetch(`${apiUrl}/api/analyze/repos/${username}`);
        if (!resp.ok) {
          throw new Error("Failed to fetch repos");
        }
        const repos = (await resp.json()) as Repo[];
        setAvailableRepos(repos);
      } catch (e) {
        console.error("Failed to fetch repos:", e);
        setAvailableRepos([]);
      } finally {
        setLoadingRepos(false);
      }
    };

    fetchRepos();
  }, [githubUrl, repoMode]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingMessage("Fetching GitHub profile...");

    try {
      const body: any = {
        github_url: githubUrl,
        repo_mode: repoMode,
      };
      if (repoMode === "selected") {
        body.selected_repo_names = selectedRepos;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://githubprofileanalyzer-paxc.onrender.com";
      const resp = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to analyze profile");
      }

      setLoadingMessage("Computing scores and generating insights...");
      const data = (await resp.json()) as AnalyzeResponse;
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <>
      <Particles />
      <div className="relative z-10 space-y-8 pt-24 pb-12 max-w-7xl mx-auto px-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">Analyze GitHub</h1>
        <p className="text-sm text-slate-300">
          Paste a GitHub profile URL and HireLens AI will compute an explainable
          portfolio score, surface red flags, and simulate a recruiter verdict.
        </p>
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              placeholder="https://github.com/username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-brand"
            />
            <button
              onClick={handleAnalyze}
              disabled={
                loading ||
                !githubUrl ||
                (repoMode === "selected" && selectedRepos.length === 0)
              }
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-40"
            >
              {loading ? "Analyzing..." : "Run analysis"}
            </button>
          </div>

          {/* Repo Mode Selector */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400">Repository mode:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="repoMode"
                value="entire"
                checked={repoMode === "entire"}
                onChange={(e) => setRepoMode(e.target.value as RepoMode)}
                className="accent-brand"
              />
              <span className="text-slate-300">
                Entire <span className="text-red-400">(not recommended)</span>
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="repoMode"
                value="top_10"
                checked={repoMode === "top_10"}
                onChange={(e) => setRepoMode(e.target.value as RepoMode)}
                className="accent-brand"
              />
              <span className="text-slate-300">Top 10</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="repoMode"
                value="top_20"
                checked={repoMode === "top_20"}
                onChange={(e) => setRepoMode(e.target.value as RepoMode)}
                className="accent-brand"
              />
              <span className="text-slate-300">Top 20</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="repoMode"
                value="selected"
                checked={repoMode === "selected"}
                onChange={(e) => setRepoMode(e.target.value as RepoMode)}
                className="accent-brand"
              />
              <span className="text-slate-300">Select repos</span>
            </label>
          </div>

          {/* Repo Selection UI */}
          {repoMode === "selected" && (
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 max-h-64 overflow-y-auto">
              {loadingRepos ? (
                <p className="text-xs text-slate-400">Loading repositories...</p>
              ) : availableRepos.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Enter a GitHub URL to see repositories
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-300">
                      Select repositories to analyze ({selectedRepos.length} selected)
                    </p>
                    <button
                      onClick={() => {
                        if (selectedRepos.length === availableRepos.length) {
                          setSelectedRepos([]);
                        } else {
                          setSelectedRepos(availableRepos.map((r) => r.name));
                        }
                      }}
                      className="text-xs text-brand hover:text-brand-light"
                    >
                      {selectedRepos.length === availableRepos.length
                        ? "Deselect all"
                        : "Select all"}
                    </button>
                  </div>
                  {availableRepos.map((repo) => (
                    <label
                      key={repo.name}
                      className="flex items-start gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRepos.includes(repo.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRepos([...selectedRepos, repo.name]);
                          } else {
                            setSelectedRepos(
                              selectedRepos.filter((n) => n !== repo.name)
                            );
                          }
                        }}
                        className="mt-0.5 accent-brand"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white truncate">
                            {repo.name}
                          </span>
                          {repo.stars > 0 && (
                            <span className="text-[10px] text-slate-400">
                              ⭐ {repo.stars}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {repo.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {loading && loadingMessage && (
          <p className="text-xs text-brand-light animate-pulse">
            {loadingMessage}
          </p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
        {repoMode === "selected" &&
          !loading &&
          !loadingRepos &&
          availableRepos.length > 0 &&
          selectedRepos.length === 0 && (
            <p className="text-xs text-yellow-400">
              Please select at least one repository to analyze
            </p>
          )}
      </section>

      {result && (
        <section className="grid gap-5 md:grid-cols-3">
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Portfolio Score
              </h2>
              <div className="flex items-center gap-3">
                {result.delta && !result.delta.is_first_analysis && Math.abs(result.delta.final_score) > 0 && (
                  <span className={`text-sm font-medium ${result.delta.final_score > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {result.delta.final_score > 0 ? "+" : ""}{result.delta.final_score.toFixed(1)}
                  </span>
                )}
                <span className="text-lg font-semibold text-emerald-400">
                  {result.scores.final_score.toFixed(1)} / 100
                </span>
              </div>
            </div>
            {result.delta && result.delta.attribution_strings.length > 0 && !result.delta.is_first_analysis && (
              <div className="text-xs text-slate-400 mb-2 italic">
                {result.delta.attribution_strings.join(" • ")}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <ScorePill label="Structure" value={result.scores.structure.score} delta={result.delta?.dimensions?.structure} />
              <ScorePill label="Engineering" value={result.scores.engineering_depth.score} delta={result.delta?.dimensions?.engineering_depth} />
              <ScorePill label="Scalability" value={result.scores.scalability.score} delta={result.delta?.dimensions?.scalability} />
              <ScorePill label="Consistency" value={result.scores.consistency.score} delta={result.delta?.dimensions?.consistency} />
              <ScorePill label="Business impact" value={result.scores.business_impact.score} delta={result.delta?.dimensions?.business_impact} />
              <ScorePill label="Readability" value={result.scores.readability.score} delta={result.delta?.dimensions?.readability} />
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Archetype</span>
              <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] text-slate-300">
                Recruiter lens
              </span>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 text-xs">
              <div className="mb-1 text-[11px] font-semibold text-brand-light">
                {result.archetype.archetype}
              </div>
              <p className="text-[11px] text-slate-300">
                {result.archetype.reasoning}
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 text-[11px] text-slate-300">
              <div className="mb-1 font-semibold text-slate-200">
                Recruiter verdict
              </div>
              <p className="mb-1">
                Shortlist:{" "}
                <span className="font-semibold text-white">
                  {result.recruiter.shortlist ? "Yes" : "No"}
                </span>
              </p>
              <p className="mb-2">
                Readiness: {result.recruiter.hiring_readiness_level}
              </p>
              <div className="space-y-2 mt-2">
                <div>
                  <span className="font-semibold text-emerald-400">Top strengths:</span>{" "}
                  {result.recruiter.top_strengths.join(" · ")}
                </div>
                {result.recruiter.major_concerns?.length > 0 && (
                  <div>
                    <span className="font-semibold text-red-400">Concerns:</span>{" "}
                    {result.recruiter.major_concerns.join(" · ")}
                  </div>
                )}
                {result.recruiter.critical_improvements && result.recruiter.critical_improvements.length > 0 && (
                  <div>
                    <span className="font-semibold text-yellow-400">Key Fix:</span>{" "}
                    {result.recruiter.critical_improvements[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            {result.red_flags.red_flags.length > 0 && (
              <div className="rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-xs text-red-100">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-red-300">
                  Red flags detected
                </div>
                <ul className="list-disc space-y-1 pl-4">
                  {result.red_flags.red_flags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Simulation and Skills panels */}
            <div className="grid gap-5 md:grid-cols-2 mt-2">
              {result.skills && result.skills.skills.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Skill Attribution</h3>
                  <div className="space-y-3">
                    {result.skills.skills.map(s => (
                      <div key={s.skill} className="bg-slate-900 p-3 rounded text-xs space-y-1">
                        <div className="flex justify-between text-slate-200 font-medium">
                          <span>{s.skill}</span>
                          <span className="text-brand-light">{(s.confidence * 100).toFixed(0)}% Confidence</span>
                        </div>
                        <p className="text-slate-400 truncate">Evidence: {s.evidence.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.simulation && result.simulation.scenarios.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 w-full overflow-hidden">
                  <h3 className="text-sm font-semibold text-white mb-2">Counterfactual Simulator</h3>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Fastest path to 85+: <span className="text-emerald-400">{result.simulation.path_to_threshold.join(" → ") || "Already above threshold"}</span>
                  </p>
                  <div className="space-y-2">
                    {result.simulation.scenarios.slice(0, 4).map((sc, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between rounded bg-slate-900 p-2 text-xs">
                        <span className="text-slate-200 mt-0.5">{sc.action}</span>
                        <div className="flex gap-3 text-right">
                          <span className="text-emerald-400">+{sc.delta.toFixed(1)}</span>
                          <span className="text-slate-400 w-12">{sc.effort_hours} hrs</span>
                          <span className="text-brand-light font-medium w-16">ROI: {sc.roi_rank.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      )}
      </div>
    </>
  );
}

function ScorePill({ label, value, delta }: { label: string; value: number; delta?: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
      <span className="text-[11px] text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        {delta !== undefined && Math.abs(delta) > 0 && (
          <span className={`text-[10px] ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}
          </span>
        )}
        <span className="text-sm font-semibold text-white">
          {value.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

