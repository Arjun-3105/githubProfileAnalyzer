"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  xMove: number;
  yMove: number;
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate a sparse number of particles
    const count = 400;
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // viewport width %
      y: Math.random() * 100, // viewport height %
      size: Math.random() * 4 + 1, // 1px to 5px
      duration: Math.random() * 15 + 10, // 10s to 25s for much faster movement
      delay: Math.random() * 10,
      // Massive drift ranges, always drifting upwards
      xMove: (Math.random() - 0.5) * 400,
      yMove: -(Math.random() * 500 + 200),
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-brand-light opacity-[0.2] blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            x: [0, p.xMove],
            y: [0, p.yMove],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
