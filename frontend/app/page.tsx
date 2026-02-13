export default function LandingPage() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
      <section className="flex-1 space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Turn your GitHub into a{" "}
          <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
            recruiter-ready portfolio.
          </span>
        </h1>
        <p className="max-w-xl text-sm text-slate-300">
          HireLens AI analyzes your GitHub like a hiring manager: structure,
          engineering depth, scalability, consistency, business impact, and
          readability. Get an explainable portfolio score and a concrete plan
          to level up.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href="/analyze"
            className="inline-flex items-center rounded-lg bg-brand px-4 py-2 font-medium text-white shadow-sm hover:bg-brand-dark"
          >
            Analyze my GitHub
          </a>
          <a
            href="/job-match"
            className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:border-brand hover:text-white"
          >
            Try Job Match mode
          </a>
        </div>
        <div className="grid gap-4 text-xs text-slate-300 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <div className="text-sm font-semibold text-white">
              Recruiter-grade scoring
            </div>
            <p>Deterministic, explainable rules across 6 dimensions.</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <div className="text-sm font-semibold text-white">
              Red flags surfaced
            </div>
            <p>Spot gaps before a hiring manager does.</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <div className="text-sm font-semibold text-white">
              Roadmap to ready
            </div>
            <p>LLM-powered plans using only free OpenRouter models.</p>
          </div>
        </div>
      </section>
      <section className="flex-1">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg shadow-brand/10">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
            <span>Sample portfolio snapshot</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-400">
              Recruiter view
            </span>
          </div>
          <div className="space-y-3 text-xs text-slate-200">
            <div className="flex items-center justify-between">
              <span>Overall Portfolio Score</span>
              <span className="text-lg font-semibold text-emerald-400">
                82 / 100
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-900/60 p-2">
                <div className="text-[11px] text-slate-400">Structure</div>
                <div className="text-sm font-semibold text-white">78</div>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-2">
                <div className="text-[11px] text-slate-400">Engineering</div>
                <div className="text-sm font-semibold text-white">85</div>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-2">
                <div className="text-[11px] text-slate-400">Scalability</div>
                <div className="text-sm font-semibold text-white">80</div>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-2">
                <div className="text-[11px] text-slate-400">Consistency</div>
                <div className="text-sm font-semibold text-white">76</div>
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/40 p-2">
              <div className="mb-1 text-[11px] font-semibold text-slate-300">
                Recruiter verdict
              </div>
              <p className="text-[11px] text-slate-300">
                Shortlist for SDE-1. Strong product engineering signals, solid
                documentation, and consistent contribution history. Improve test
                coverage and highlight measurable impact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

