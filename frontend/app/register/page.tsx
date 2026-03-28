"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const success = await register(email, password, displayName);
        if (success) {
            router.push("/dashboard");
        } else {
            setError("Registration failed. Email might be in use.");
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white w-full max-w-none !px-0 !py-0 m-[-24px]">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-zinc-950/40 relative overflow-hidden border-r border-zinc-800/50">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black text-lg font-bold">
                            HL
                        </div>
                        <span className="text-xl font-bold tracking-tight">HireLens AI</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-md">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight"
                    >
                        Start your journey to <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-brand-light">
                            senior engineering.
                        </span>
                    </motion.h1>
                    <p className="text-zinc-400 text-lg">Join HireLens AI to start simulating your recruiter-readiness and building your personalized roadmap.</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-24 relative">
                <div className="w-full max-w-sm">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Create Account</h2>
                        <p className="text-zinc-400">Get started free. No credit card required.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 p-3 rounded-xl">
                                {error}
                            </motion.p>
                        )}
                        
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Display Name</label>
                            <input
                                type="text"
                                placeholder="Jane Doe"
                                className="w-full p-4 border border-zinc-800 bg-zinc-950/50 rounded-xl outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light/50 transition-all text-sm placeholder:text-zinc-600"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Email</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full p-4 border border-zinc-800 bg-zinc-950/50 rounded-xl outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light/50 transition-all text-sm placeholder:text-zinc-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-4 border border-zinc-800 bg-zinc-950/50 rounded-xl outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light/50 transition-all text-sm placeholder:text-zinc-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="w-full bg-white text-black font-semibold p-4 rounded-xl hover:bg-zinc-200 mt-2 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                            Sign Up
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-black px-4 text-zinc-500 uppercase tracking-widest font-semibold">Or</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <a href={`${process.env.NEXT_PUBLIC_API_URL || "https://githubprofileanalyzer-paxc.onrender.com"}/api/auth/login/github`} className="flex items-center justify-center gap-3 p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 transition-colors font-medium hover:scale-[1.02] active:scale-95">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                                Continue with GitHub
                            </a>
                        </div>

                        <p className="text-sm mt-8 text-center text-zinc-500 font-medium">
                            Already have an account? <Link href="/login" className="text-white hover:text-brand-light transition-colors ml-1">Log in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
