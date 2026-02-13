import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "HireLens AI – GitHub Intelligence Engine",
  description: "Recruiter-grade GitHub portfolio analysis and insights.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-light text-xl font-bold">
                HL
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-brand-light">
                  HireLens AI
                </div>
                <p className="text-xs text-slate-400">
                  Recruiter-grade GitHub Intelligence Engine
                </p>
              </div>
            </div>
            <nav className="flex gap-4 text-sm text-slate-300">
              <a href="/" className="hover:text-white">
                Landing
              </a>
              <a href="/analyze" className="hover:text-white">
                Analyze
              </a>
              <a href="/dashboard" className="hover:text-white">
                Dashboard
              </a>
              <a href="/job-match" className="hover:text-white">
                Job Match
              </a>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Built with FastAPI, Next.js, TailwindCSS, and OpenRouter.
          </footer>
        </div>
      </body>
    </html>
  );
}

