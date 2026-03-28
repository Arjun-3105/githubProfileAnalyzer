"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, LogIn, LogOut, User as UserIcon } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { path: "/", label: "Overview" },
  { path: "/analyze", label: "Analyze" },
  { path: "/job-match", label: "Job Match" },
  { path: "/dashboard", label: "Dashboard", protected: true },
];

export default function NavBar() {
  const { user, logout, loading, isWakingUp } = useAuth();
  const pathname = usePathname();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full max-w-fit px-4 pointer-events-none">
      {isWakingUp && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 border border-amber-500/20 backdrop-blur-md pointer-events-auto"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Waking AI Engine...
        </motion.div>
      )}
      
      <nav className="flex items-center gap-1 p-1.5 rounded-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
        <Link href="/" className="px-4 py-2 font-bold text-white flex items-center gap-2 group">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-black text-xs font-bold group-hover:scale-105 transition-transform">
            HL
          </div>
        </Link>
        
        <div className="w-px h-6 bg-zinc-800 mx-2" />

        {navLinks.map((link) => {
          if (link.protected && !user && !loading) return null;
          
          const isActive = pathname === link.path;
          
          return (
            <Link
              key={link.path}
              href={link.path}
              className={clsx(
                "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-zinc-800 rounded-full z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}

        <div className="w-px h-6 bg-zinc-800 mx-2" />

        <div className="flex items-center px-2">
          {!loading && (
            user ? (
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link href="/dashboard" className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors">
                  <UserIcon className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.display_name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 rounded-full transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-zinc-200 rounded-full transition-all hover:scale-105 active:scale-95"
                >
                  Start Free
                </Link>
              </div>
            )
          )}
        </div>
      </nav>
    </div>
  );
}
