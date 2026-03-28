"use client";

import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import { ArrowRight, Sparkles, Target, Zap, LayoutDashboard, GitBranch } from "lucide-react";
import dynamic from 'next/dynamic';
import LoadingScreen from "./components/LoadingScreen";

const Scene = dynamic(() => import('./components/Scene'), { ssr: false });

export default function LandingPage() {
  const { scrollYProgress } = useScroll();

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.5 },
    },
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const scrollVariant: any = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="relative overflow-hidden w-full bg-black">
      
      {/* GitHub-themed Loading Screen */}
      <LoadingScreen />

      {/* Fixed Background 3D Scene */}
      <div className="fixed inset-0 z-[1] h-screen w-screen pointer-events-auto">
        {/* Subtle overlay — pointer-events-none so clicks pass through */}
        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        <Scene scrollProgress={scrollYProgress} />
      </div>

      {/* Scrollable Content Layer */}
      <main className="relative z-10 flex flex-col items-center w-full px-4 text-center pointer-events-none min-h-[400vh]">
        
        {/* Hero Section */}
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center max-w-4xl pt-[15vh] min-h-[100vh]">
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-brand-light" />
            <span className="text-[11px] font-semibold text-zinc-300 tracking-wider uppercase">
              Next-Gen AI Portfolio Analysis
            </span>
          </motion.div>

          <motion.h1 variants={item} className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl">
            Code Speaks. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-brand to-emerald-400">
              We Translate.
            </span>
          </motion.h1>

          <motion.p variants={item} className="max-w-xl text-lg md:text-xl text-zinc-200 mb-10 leading-relaxed font-medium drop-shadow-lg">
            Instantly turn your fragmented GitHub history into a cohesive, recruiter-ready profile. Get scored on architecture, scale, and deeply technical metrics.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pointer-events-auto">
            <Link
              href="/analyze"
              className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Analyze Profile Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-full bg-black/40 border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-md"
            >
              Log in / Save History
            </Link>
          </motion.div>
        </motion.div>

        {/* Bento Grid Features - Scroll Reveals */}
        <div className="w-full max-w-5xl mt-[60vh] grid grid-cols-1 md:grid-cols-3 gap-6 text-left pb-64 pointer-events-auto">
          
          <motion.div 
            variants={scrollVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -5 }}
            className="md:col-span-2 p-10 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-600 transition-colors backdrop-blur-xl relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <Zap className="w-10 h-10 text-brand-light mb-12" />
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Instant Engineering Context</h3>
                <p className="text-zinc-400 text-lg">Our LLM engine pulls your Top 20 repositories and summarizes complex architectural decisions into a digestible format that hiring managers actually understand.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={scrollVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -5 }}
            className="md:col-span-1 p-10 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-600 transition-colors backdrop-blur-xl relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <Target className="w-10 h-10 text-emerald-400 mb-12" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Identify Red Flags</h3>
                <p className="text-zinc-400">Discover monolithic files and missing tests before recruiters do.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={scrollVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -5 }}
            className="md:col-span-1 p-10 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-600 transition-colors backdrop-blur-xl relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <LayoutDashboard className="w-10 h-10 text-purple-400 mb-12" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Live Simulation</h3>
                <p className="text-zinc-400">Test how adding tests or refactoring repos improves your overall score.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={scrollVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -5 }}
            className="md:col-span-2 p-10 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-600 transition-colors backdrop-blur-xl relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <GitBranch className="w-10 h-10 text-zinc-300 mb-12" />
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Automated Roadmap</h3>
                <p className="text-zinc-400 text-lg">Stop guessing what to build next. HireLens gives you an actionable, prioritized roadmap based on your weakest engineering dimensions to boost your readiness level rapidly.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
