"use client";

import { useState } from "react";

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
  };
}

export default function AnalyzePage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: githubUrl }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to analyze profile");
      }
      const data = (await resp.json()) as AnalyzeResponse;
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">Analyze GitHub</h1>
        <p className="text-sm text-slate-300">
          Paste a GitHub profile URL and HireLens AI will compute an explainable
          portfolio score, surface red flags, and simulate a recruiter verdict.
        </p>
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
            disabled={loading || !githubUrl}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-40"
          >
            {loading ? "Analyzing..." : "Run analysis"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </section>

      {result && (
        <section className="grid gap-5 md:grid-cols-3">
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Portfolio Score
              </h2>
              <span className="text-lg font-semibold text-emerald-400">
                {result.scores.final_score.toFixed(1)} / 100
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <ScorePill label="Structure" value={result.scores.structure.score} />
              <ScorePill
                label="Engineering"
                value={result.scores.engineering_depth.score}
              />
              <ScorePill
                label="Scalability"
                value={result.scores.scalability.score}
              />
              <ScorePill
                label="Consistency"
                value={result.scores.consistency.score}
              />
              <ScorePill
                label="Business impact"
                value={result.scores.business_impact.score}
              />
              <ScorePill
                label="Readability"
                value={result.scores.readability.score}
              />
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
                <span className="font-semibold">
                  {result.recruiter.shortlist ? "Yes" : "No"}
                </span>
              </p>
              <p className="mb-2">
                Readiness: {result.recruiter.hiring_readiness_level}
              </p>
              <p>
                <span className="font-semibold">Top strengths:</span>{" "}
                {result.recruiter.top_strengths.join(" · ")}
              </p>
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
          </div>
        </section>
      )}
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
      <span className="text-[11px] text-slate-300">{label}</span>
      <span className="text-sm font-semibold text-white">
        {value.toFixed(0)}
      </span>
    </div>
  );
}

