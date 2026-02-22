import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";

export const metadata = {
  title: "HireLens AI – GitHub Intelligence Engine",
  description: "Recruiter-grade GitHub portfolio analysis and insights.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <AuthProvider>
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
              <NavBar />
            </header>
            <main className="flex-1">{children}</main>
            <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
              Built with FastAPI, Next.js, TailwindCSS, and OpenRouter.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

