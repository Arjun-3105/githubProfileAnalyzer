"use client";

import { useState } from "react";

interface JobMatchResult {
  match_score: number;
  missing_skills: string[];
  suggested_projects: string[];
  resume_positioning_advice: string;
}

export default function JobMatchPage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResult | null>(null);

  const handleMatch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("http://localhost:8000/api/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: githubUrl,
          job_description: jobDescription,
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to run job match");
      }
      const data = (await resp.json()) as JobMatchResult;
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
        <h1 className="text-2xl font-semibold text-white">Job Match Mode</h1>
        <p className="text-sm text-slate-300">
          Paste a GitHub profile and a job description. HireLens AI will score
          the fit, highlight missing skills, and suggest portfolio upgrades.
        </p>
        <div className="space-y-3">
          <input
            type="url"
            placeholder="https://github.com/username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-brand"
          />
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-brand"
          />
          <button
            onClick={handleMatch}
            disabled={loading || !githubUrl || !jobDescription}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-40"
          >
            {loading ? "Analyzing match..." : "Run job match"}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </section>

      {result && (
        <section className="grid gap-5 md:grid-cols-3">
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Match score</h2>
              <span className="text-lg font-semibold text-emerald-400">
                {result.match_score.toFixed(0)} / 100
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Higher scores indicate strong alignment between your GitHub signal
              and the role requirements.
            </p>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="mb-1 text-sm font-semibold text-white">
              Missing skills
            </h2>
            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-200">
              {result.missing_skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="mb-1 text-sm font-semibold text-white">
              Suggested projects
            </h2>
            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-200">
              {result.suggested_projects.map((proj) => (
                <li key={proj}>{proj}</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-200">
            <h2 className="mb-2 text-sm font-semibold text-white">
              Resume positioning advice
            </h2>
            <p>{result.resume_positioning_advice}</p>
          </div>
        </section>
      )}
    </div>
  );
}

