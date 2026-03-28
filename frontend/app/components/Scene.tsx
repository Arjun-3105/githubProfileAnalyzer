"use client";

import { useRef, useMemo, useState, useCallback, useLayoutEffect } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { MotionValue } from "framer-motion";

// GitHub's exact contribution graph color levels
const GH_COLORS = [
  new THREE.Color("#161b22"), // level 0 — empty
  new THREE.Color("#0e4429"), // level 1
  new THREE.Color("#006d32"), // level 2
  new THREE.Color("#26a641"), // level 3
  new THREE.Color("#39d353"), // level 4 — max
];
const RED_COLOR = new THREE.Color("#da3633");
const CLICK_COLOR = new THREE.Color("#56d364");

const ROWS = 7;   // days of week
const COLS = 20;   // weeks
const COUNT = ROWS * COLS;
const GAP = 0.12;
const CUBE_SIZE = 0.38;
const CELL = CUBE_SIZE + GAP;

interface CubeState {
  pos: THREE.Vector3;
  scale: THREE.Vector3;
  color: THREE.Color;
}

function ContributionGraph({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const clickedSet = useRef<Set<number>>(new Set());
  const flashMap = useRef<Map<number, number>>(new Map());
  const hoveredId = useRef<number | null>(null);

  // Deterministic contribution levels
  const contributions = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const x = Math.abs(Math.sin(42 * (i + 1) * 9301 + 49297) % 1);
      return x > 0.55 ? Math.min(Math.floor(x * 5), 4) : 0;
    });
  }, []);

  const cubeStates = useMemo(() => {
    const states: CubeState[][] = [];
    const gridW = COLS * CELL;
    const gridH = ROWS * CELL;

    for (let i = 0; i < COUNT; i++) {
      const col = Math.floor(i / ROWS); // week
      const row = i % ROWS;              // day
      const level = contributions[i];

      // XY plane: x = columns (weeks), y = rows (days) — FACING CAMERA
      const x = col * CELL - gridW / 2 + CELL / 2;
      const y = -(row * CELL - gridH / 2 + CELL / 2); // flip so Mon is top
      const depth = level * 0.08; // subtle Z depth per level

      const st: CubeState[] = [];

      // ---- STATE 0: Flat contribution graph facing camera ----
      st.push({
        pos: new THREE.Vector3(x, y, depth),
        scale: new THREE.Vector3(CUBE_SIZE, CUBE_SIZE, 0.15 + level * 0.06),
        color: GH_COLORS[level].clone(),
      });

      // ---- STATE 1: Bars extrude toward camera (Z axis) ----
      const barDepth = level === 0 ? 0.15 : level * 0.8 + 0.4;
      st.push({
        pos: new THREE.Vector3(x, y, barDepth / 2),
        scale: new THREE.Vector3(CUBE_SIZE, CUBE_SIZE, barDepth),
        color: GH_COLORS[Math.min(level, 4)].clone(),
      });

      // ---- STATE 2: Exaggerated Data Towers (No Red Flags) ----
      const deeperDepth = level === 0 ? 0.2 : level * 1.2 + 0.6;
      st.push({
        pos: new THREE.Vector3(x, y, deeperDepth / 2),
        scale: new THREE.Vector3(CUBE_SIZE, CUBE_SIZE, deeperDepth),
        color: GH_COLORS[Math.min(level, 4)].clone(),
      });

      // ---- STATE 3: Spiral roadmap ----
      const t = i / COUNT;
      const angle = t * Math.PI * 4;
      const radius = 1 + t * 3;
      st.push({
        pos: new THREE.Vector3(Math.sin(angle) * radius, Math.cos(angle) * radius * 0.5, -t * 12),
        scale: new THREE.Vector3(0.25, 0.25, 0.1),
        color: GH_COLORS[4].clone().lerp(GH_COLORS[0], t),
      });

      states.push(st);
    }
    return states;
  }, [contributions]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpCol = useMemo(() => new THREE.Color(), []);

  // Click handler
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id !== undefined) {
      clickedSet.current.add(id);
      flashMap.current.set(id, performance.now());
    }
  }, []);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      if (hoveredId.current !== e.instanceId) {
        hoveredId.current = e.instanceId;
        document.body.style.cursor = 'pointer';
      }
    }
  }, []);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoveredId.current = null;
    document.body.style.cursor = 'auto';
  }, []);

  // Force initialize the colors and recompile the shader so Three.js acknowledges USE_INSTANCING_COLOR
  useLayoutEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < COUNT; i++) {
        meshRef.current.setColorAt(i, cubeStates[i][0].color);
      }
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
      // Force material recompile now that instanceColor buffer exists
      if (meshRef.current.material) {
        (meshRef.current.material as THREE.Material).needsUpdate = true;
      }
    }
  }, [cubeStates]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const raw = scrollProgress.get();
    const p = raw * 3;
    let phase = Math.floor(p);
    let t = p - phase;
    if (phase >= 3) { phase = 2; t = 1; }
    if (phase < 0) { phase = 0; t = 0; }
    const next = Math.min(phase + 1, 3);
    const ease = t * t * (3 - 2 * t);

    const now = performance.now();

    for (let i = 0; i < COUNT; i++) {
      const a = cubeStates[i][phase];
      const b = cubeStates[i][next];

      dummy.position.lerpVectors(a.pos, b.pos, ease);
      dummy.scale.lerpVectors(a.scale, b.scale, ease);

      // Subtle wave on the flat grid
      if (phase === 0) {
        const col = Math.floor(i / ROWS);
        const row = i % ROWS;
        dummy.position.z += Math.sin(col * 0.4 + row * 0.3 + now / 1000) * 0.03;
      }

      // Click flash pulse
      const ft = flashMap.current.get(i);
      if (ft) {
        const elapsed = (now - ft) / 1000;
        if (elapsed < 0.35) {
          const pulse = 1 + Math.sin(elapsed * Math.PI / 0.35) * 0.4;
          dummy.scale.z *= pulse;
        }
      } else if (hoveredId.current === i) {
        // Subtle hover scale
        dummy.scale.x *= 1.15;
        dummy.scale.y *= 1.15;
        dummy.scale.z *= 1.05;
      }

      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Color
      if (clickedSet.current.has(i) || hoveredId.current === i) {
        tmpCol.copy(CLICK_COLOR);
      } else {
        tmpCol.copy(a.color).lerp(b.color, ease);
      }
      mesh.setColorAt(i, tmpCol);
    }

    mesh.instanceMatrix.needsUpdate = true;
    // Orientation: strictly parallel to the text (facing camera) when at the top of the page.
    const targetRotX = raw < 0.15 ? 0 : raw > 0.75 ? 0.2 : -0.15;
    const targetRotY = raw < 0.15 ? 0 : raw > 0.75 ? -0.4 : 0.15;

    mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRotX, 0.04);
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotY, 0.04);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, COUNT]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.2}
        metalness={0.6}
        emissive="#56d364"
        emissiveIntensity={0.08}
      />
    </instancedMesh>
  );
}

export default function Scene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 10], fov: 45 }}
      style={{ background: "transparent" }}
      eventPrefix="client"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 10]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-5, 5, -3]} intensity={0.6} color="#8b949e" />
      <pointLight position={[0, 0, 5]} intensity={1.0} color="#ffffff" distance={20} />
      <ContributionGraph scrollProgress={scrollProgress} />
    </Canvas>
  );
}
