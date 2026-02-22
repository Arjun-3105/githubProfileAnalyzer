import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-dark/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[20%] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center max-w-5xl mx-auto px-6 py-20 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-2xl">
          <span className="flex h-2 w-2 rounded-full bg-brand-light animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
          <span className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase">AI-Powered Developer Assessment</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Turn your <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">GitHub</span> into a <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-brand to-brand-dark transform inline-block">
            recruiter-ready portfolio.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-medium">
          HireLens AI analyzes your GitHub like a hiring manager. Get an explainable score on structure, depth, scalability, and consistency, plus a concrete, actionable roadmap to level up.
        </p>

        {/* Calls to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </Link>
          <Link
            href="/analyze"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-md"
          >
            Try Demo Mode
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 text-left w-full">
          <div className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-brand/50 transition-colors backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand/20 text-brand-light">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="relative z-10 text-xl font-bold text-white mb-3">Recruiter-grade scoring</h3>
            <p className="relative z-10 text-slate-400 text-sm leading-relaxed">Deterministic rules across 6 dimensions give you a clear, objective analysis of your codebase quality.</p>
          </div>
          <div className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-brand/50 transition-colors backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand/20 text-brand-light">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="relative z-10 text-xl font-bold text-white mb-3">Red flags surfaced</h3>
            <p className="relative z-10 text-slate-400 text-sm leading-relaxed">Spot undocumented code, monolithic files, and missing unit tests before a hiring manager does.</p>
          </div>
          <div className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-brand/50 transition-colors backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand/20 text-brand-light">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="relative z-10 text-xl font-bold text-white mb-3">Roadmap to ready</h3>
            <p className="relative z-10 text-slate-400 text-sm leading-relaxed">Receive an AI-generated, prioritized roadmap to systematically improve your portfolio score over time.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
