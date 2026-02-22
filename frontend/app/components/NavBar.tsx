"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
    const { user, logout, loading, isWakingUp } = useAuth();

    return (
        <nav className="flex items-center gap-4 text-sm text-slate-300">
            {isWakingUp && (
                <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500 border border-amber-500/20 mr-2">
                    <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Waking backend...
                </div>
            )}
            <Link href="/" className="hover:text-white">Landing</Link>
            <Link href="/analyze" className="hover:text-white">Analyze</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/job-match" className="hover:text-white">Job Match</Link>
            <span className="text-slate-700">|</span>
            {!loading && (
                user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-brand-light font-medium">{user.display_name}</span>
                        <button onClick={logout} className="text-red-400 hover:text-red-300">Logout</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="hover:text-white">Login</Link>
                        <Link href="/register" className="bg-brand text-white px-3 py-1 rounded hover:bg-opacity-90">Register</Link>
                    </div>
                )
            )}
        </nav>
    );
}
