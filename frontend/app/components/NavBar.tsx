"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
    const { user, logout, loading } = useAuth();

    return (
        <nav className="flex items-center gap-4 text-sm text-slate-300">
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
