"use client";

import { useEffect, useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip
} from "recharts";
import { useAuth } from "../context/AuthContext";
import Particles from "../components/Particles";

interface AnalysisSnapshot {
  timestamp: string;
  scores: Record<string, number>;
  final_score: number;
  red_flags: string[];
  archetype: string;
  shortlist: boolean;
}

interface ScoreDelta {
  dimensions: Record<string, number>;
  final_score: number;
  direction: string;
  is_first_analysis: boolean;
  attribution_strings: string[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");
  const [snapshots, setSnapshots] = useState<AnalysisSnapshot[]>([]);
  const [delta, setDelta] = useState<ScoreDelta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.display_name && !usernameInput) {
      setUsernameInput(user.display_name);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!usernameInput.trim()) return;

    setLoading(true);
    setError(null);
    setSnapshots([]);
    setDelta(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://githubprofileanalyzer-paxc.onrender.com";
      const res = await fetch(`${apiUrl}/api/snapshots/${usernameInput}`, {
        credentials: "include"
      });
      if (res.status === 403) throw new Error("Not authorized to view these snapshots");
      if (!res.ok) throw new Error("Could not fetch snapshots");

      const data: AnalysisSnapshot[] = await res.json();
      setSnapshots(data);

      if (data.length > 0) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://githubprofileanalyzer-paxc.onrender.com";
        const deltaRes = await fetch(`${apiUrl}/api/snapshots/${usernameInput}/delta`, {
          credentials: "include"
        });
        if (deltaRes.ok) {
          const deltaData = await deltaRes.json();
          setDelta(deltaData);
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  const radarData = latest ? [
    { dimension: "Structure", score: latest.scores.structure || 0 },
    { dimension: "Engineering", score: latest.scores.engineering_depth || 0 },
    { dimension: "Scalability", score: latest.scores.scalability || 0 },
    { dimension: "Consistency", score: latest.scores.consistency || 0 },
    { dimension: "Business", score: latest.scores.business_impact || 0 },
    { dimension: "Readability", score: latest.scores.readability || 0 },
  ] : [];

  const trendData = snapshots.map((s, idx) => ({
    time: `T${idx + 1}`,
    score: Number(s.final_score.toFixed(1))
  }));

  return (
    <>
      <Particles />
      <div className="relative z-10 space-y-6 pt-24 pb-12 max-w-7xl mx-auto px-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">Portfolio Dashboard</h1>
        <p className="text-sm text-slate-300">
          Visualize portfolio score progression, historical snapshots, and performance deltas.
        </p>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="text"
            placeholder="GitHub username"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-brand"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !usernameInput.trim()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-40"
          >
            {loading ? "Loading..." : "Load Data"}
          </button>
        </form>
        {error && <p className="text-xs text-red-400 bg-red-950/20 p-2 rounded">{error}</p>}
      </header>

      {!loading && snapshots.length === 0 && !error && (
        <div className="text-sm text-slate-400 mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center">
          No snapshots found. Run an analysis on the Analyze page to generate initial signals.
        </div>
      )}

      {latest && (
        <>
          <section className="grid gap-5 md:grid-cols-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Latest Score Radar</h2>
                <span className="text-xs font-semibold text-brand-light">
                  Final Score: {latest.final_score.toFixed(1)}
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1f2937" />
                    <PolarAngleAxis dataKey="dimension" stroke="#9ca3af" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#4b5563" tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="score" stroke="#60a5fa" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 min-h-[140px]">
                <h2 className="mb-2 text-sm font-semibold text-white">Growth Delta</h2>
                {delta ? (
                  delta.is_first_analysis ? (
                    <p className="text-xs text-slate-300">Initial baseline recorded. Run another analysis later to compute growth delta.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm">
                        Recent change: <span className={`font-medium ${delta.final_score > 0 ? "text-emerald-400" : delta.final_score < 0 ? "text-red-400" : "text-yellow-400"}`}>
                          {delta.final_score > 0 ? "+" : ""}{delta.final_score.toFixed(1)} points
                        </span>
                      </p>
                      <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                        {delta.attribution_strings.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-slate-400">Loading delta...</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <h2 className="mb-2 text-sm font-semibold text-white">Latest Snapshot Highlights</h2>
                <p className="mb-1 text-xs text-brand-light">
                  {latest.archetype} · {latest.shortlist ? "Shortlisted" : "Not Shortlisted"}
                </p>
                {latest.red_flags.length > 0 ? (
                  <p className="text-[11px] text-red-400 mt-2 line-clamp-2">
                    Flags: {latest.red_flags.join(", ")}
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-400 mt-2">No critical red flags detected.</p>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Score History Trend</h2>
                <span className="text-xs text-slate-400">{snapshots.length} Snapshots Total</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: 11 }} />
                    <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 overflow-y-auto max-h-[280px]">
              <h2 className="mb-3 text-sm font-semibold text-white">Snapshot Log</h2>
              <div className="space-y-2">
                {[...snapshots].reverse().map((s, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded text-xs flex flex-col gap-1 hover:bg-slate-800 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(s.timestamp).toLocaleString()}
                      </span>
                      <span className="font-semibold text-white">{s.final_score.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-light font-medium truncate max-w-[120px]" title={s.archetype}>
                        {s.archetype}
                      </span>
                      <span className={s.shortlist ? "text-emerald-400" : "text-slate-500"}>
                        {s.shortlist ? "Shortlisted" : "Rejected"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      </div>
    </>
  );
}
