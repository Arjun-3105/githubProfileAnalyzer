import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata = {
  title: "HireLens AI – Premium Portfolio Intelligence",
  description: "Recruiter-grade GitHub portfolio analysis, reimagined.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} font-sans`}>
      <body className="relative min-h-screen bg-black text-zinc-50 selection:bg-brand selection:text-white">
        <div className="bg-noise fixed inset-0 z-[50] pointer-events-none mix-blend-overlay opacity-[0.03]"></div>
        <AuthProvider>
          <NavBar />
          <div className="relative z-10 mx-auto flex min-h-screen flex-col">
            <main className="flex-1 w-full">{children}</main>
            <footer className="w-full max-w-7xl mx-auto px-6 py-8 mt-8 border-t border-zinc-800/50 text-xs text-zinc-500 font-medium relative z-20">
              <div className="flex items-center justify-between">
                <span>© {new Date().getFullYear()} HireLens AI</span>
                <span>Crafted with Fastapi & Next.js</span>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
