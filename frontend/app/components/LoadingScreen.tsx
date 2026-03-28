"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// GitHub's actual contribution levels
const GH_GREENS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

const MESSAGES = [
  "git init hirelens-ai",
  "Cloning contribution history...",
  "Scanning repository architectures...",
  "Building 3D contribution graph...",
  "Ready.",
];

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Pre-generate stable random levels so they don't flicker on re-render
  const gridLevels = useMemo(
    () => Array.from({ length: 49 }, () => Math.floor(Math.random() * 5)),
    []
  );

  useEffect(() => {
    const t1 = setInterval(() => {
      setMsgIdx((p) => Math.min(p + 1, MESSAGES.length - 1));
    }, 500);
    const t2 = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 18 + 6, 100));
    }, 350);
    const done = setTimeout(() => setIsLoading(false), 2600);
    setMounted(true);
    return () => { clearInterval(t1); clearInterval(t2); clearTimeout(done); };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-[#0d1117] flex flex-col items-center justify-center gap-6"
        >
          {/* Mini GitHub contribution grid */}
          <div className="grid grid-cols-7 gap-[3px]">
            {gridLevels.map((level, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.025, type: "spring", stiffness: 400, damping: 20 }}
                className="w-[14px] h-[14px] rounded-[3px]"
                style={{ backgroundColor: GH_GREENS[level] }}
              />
            ))}
          </div>

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black text-sm font-bold">
              HL
            </div>
            <span className="text-lg font-bold tracking-tight text-white">HireLens AI</span>
          </div>

          {/* Terminal output */}
          <div className="font-mono text-[11px] text-[#8b949e] space-y-0.5 w-64">
            {MESSAGES.slice(0, msgIdx + 1).map((msg, i) => (
              <motion.div
                key={msg}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: i === msgIdx ? 1 : 0.35, x: 0 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-[#39d353]">❯</span>
                <span>{msg}</span>
                {i === msgIdx && i < MESSAGES.length - 1 && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-[#39d353] ml-0.5"
                  >▊</motion.span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-64 h-[3px] bg-[#21262d] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#39d353]"
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
