"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Placeholder static data; in a full implementation this page
// would be hydrated with real analysis data via context or search params.
const radarData = [
  { dimension: "Structure", score: 78 },
  { dimension: "Engineering", score: 85 },
  { dimension: "Scalability", score: 80 },
  { dimension: "Consistency", score: 76 },
  { dimension: "Business", score: 74 },
  { dimension: "Readability", score: 81 },
];

const trendData = [
  { month: "M-5", commits: 14 },
  { month: "M-4", commits: 20 },
  { month: "M-3", commits: 18 },
  { month: "M-2", commits: 22 },
  { month: "M-1", commits: 28 },
  { month: "Now", commits: 26 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Portfolio Dashboard</h1>
        <p className="text-sm text-slate-300">
          Visualize the 6-dimension portfolio score, commit consistency, and key
          recruiter signals.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Score Radar (sample)
            </h2>
            <span className="text-xs text-slate-400">
              Structure · Engineering · Scalability · Consistency · Business ·
              Readability
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="dimension" stroke="#9ca3af" />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  stroke="#4b5563"
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#60a5fa"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-4 md:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-white">
              Red flag warnings (example)
            </h2>
            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-200">
              <li>No tests folder detected in major repositories.</li>
              <li>Limited CI/CD configuration; pipelines missing.</li>
              <li>Some projects lack README or clear project description.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-white">
              Archetype & readiness
            </h2>
            <p className="mb-1 text-xs text-brand-light">
              Product Engineer · Shortlist for SDE-1
            </p>
            <p className="text-xs text-slate-300">
              Strong product-focused repos, well-structured codebases, and
              real-world framing. Improve automated testing depth and
              instrumentation of business impact.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Commit trend (sample)
            </h2>
            <span className="text-xs text-slate-400">
              Last 6 months aggregation
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1e293b",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="commits"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
            <h2 className="mb-2 text-sm font-semibold text-white">
              Improvement checklist (sample)
            </h2>
            <ul className="space-y-1">
              <li>✅ Consolidate a flagship product repo with strong README.</li>
              <li>✅ Add live deployment links where available.</li>
              <li>⬜ Introduce tests and CI for top 2 repos.</li>
              <li>⬜ Add metrics/impact section to key project READMEs.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

