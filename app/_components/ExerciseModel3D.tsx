"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";
import { useInView } from "motion/react";
import { MathUtils, type Group } from "three";
import { EXERCISE_MOTIONS, STAND, type ExerciseMotion, type Pose, type Side } from "../_lib/exercise-poses";

const BODY = "#eef3fb";
const ACCENT = "#2563eb";
const UPPER_ARM = 0.3;
const FOREARM = 0.28;
const THIGH = 0.45;
const SHIN = 0.45;
const rad = MathUtils.degToRad;

type Limbs = { upper: Group | null; fore: Group | null; thigh: Group | null; shin: Group | null };

function Segment({ length, radius, color = BODY }: { length: number; radius: number; color?: string }) {
  return <mesh position={[0, -length / 2, 0]}><capsuleGeometry args={[radius, Math.max(0.01, length - radius * 2), 6, 14]} /><meshStandardMaterial color={color} roughness={0.45} metalness={0.15} /></mesh>;
}

function Joint({ r, color = ACCENT }: { r: number; color?: string }) {
  return <mesh><sphereGeometry args={[r, 16, 16]} /><meshStandardMaterial color={color} roughness={0.35} metalness={0.4} /></mesh>;
}

function sideValue(pose: Pose, side: "l" | "r", key: keyof Side, fallback: number) {
  return pose[side]?.[key] ?? pose[key] ?? fallback;
}

function blend(motion: ExerciseMotion, side: "l" | "r" | "root", key: keyof Pose | keyof Side, t: number) {
  const base = (STAND as Record<string, number>)[key] ?? 0;
  const read = (pose: Pose) => (side === "root" ? ((pose as Record<string, unknown>)[key] as number | undefined) ?? base : sideValue(pose, side, key as keyof Side, base));
  return MathUtils.lerp(read(motion.a), read(motion.b), t);
}

function Figure({ motion, still }: { motion: ExerciseMotion; still: boolean }) {
  const root = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const limbs = useRef<Record<"l" | "r", Limbs>>({ l: { upper: null, fore: null, thigh: null, shin: null }, r: { upper: null, fore: null, thigh: null, shin: null } });
  const clock = useRef(0);

  useFrame((_, delta) => {
    if (!still) clock.current += delta * (motion.speed ?? 0.9);
    const t = still ? 0.5 : (1 - Math.cos(clock.current * Math.PI)) / 2;
    if (root.current) {
      root.current.position.set(0, blend(motion, "root", "y", t), blend(motion, "root", "z", t));
      root.current.rotation.x = rad(blend(motion, "root", "rx", t));
    }
    if (torso.current) torso.current.rotation.x = rad(blend(motion, "root", "torso", t));
    (["l", "r"] as const).forEach((side) => {
      const sign = side === "l" ? 1 : -1;
      const g = limbs.current[side];
      const v = (key: keyof Side) => blend(motion, side, key, t);
      if (g.upper) { g.upper.rotation.set(rad(-v("armF")), 0, rad(sign * v("armAb"))); }
      if (g.fore) g.fore.rotation.x = rad(-v("elbow"));
      if (g.thigh) g.thigh.rotation.set(rad(-v("hipF")), 0, rad(sign * v("hipAb")));
      if (g.shin) g.shin.rotation.x = rad(v("knee"));
    });
  });

  const arm = (side: "l" | "r") => {
    const sign = side === "l" ? 1 : -1;
    return <group key={`arm-${side}`} position={[sign * 0.22, 0.5, 0]} ref={(node) => { limbs.current[side].upper = node; }}>
      <Joint r={0.06} /><Segment length={UPPER_ARM} radius={0.045} />
      <group position={[0, -UPPER_ARM, 0]} ref={(node) => { limbs.current[side].fore = node; }}>
        <Joint r={0.045} /><Segment length={FOREARM} radius={0.04} />
        <mesh position={[0, -FOREARM, 0]}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color={ACCENT} /></mesh>
      </group>
    </group>;
  };

  const leg = (side: "l" | "r") => {
    const sign = side === "l" ? 1 : -1;
    return <group key={`leg-${side}`} position={[sign * 0.1, 0, 0]} ref={(node) => { limbs.current[side].thigh = node; }}>
      <Joint r={0.07} /><Segment length={THIGH} radius={0.075} />
      <group position={[0, -THIGH, 0]} ref={(node) => { limbs.current[side].shin = node; }}>
        <Joint r={0.06} /><Segment length={SHIN} radius={0.06} />
        <mesh position={[0, -SHIN, 0.07]}><boxGeometry args={[0.1, 0.06, 0.24]} /><meshStandardMaterial color={ACCENT} roughness={0.5} /></mesh>
      </group>
    </group>;
  };

  return <group ref={root}>
    <mesh position={[0, 0, 0]}><boxGeometry args={[0.32, 0.18, 0.18]} /><meshStandardMaterial color={BODY} roughness={0.45} /></mesh>
    {leg("l")}{leg("r")}
    <group ref={torso}>
      <mesh position={[0, 0.3, 0]}><capsuleGeometry args={[0.15, 0.3, 6, 16]} /><meshStandardMaterial color={BODY} roughness={0.45} metalness={0.15} /></mesh>
      <mesh position={[0, 0.3, 0]} scale={[1.02, 0.5, 1.02]}><capsuleGeometry args={[0.152, 0.3, 6, 16]} /><meshStandardMaterial color={ACCENT} roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, 0.72, 0]}><sphereGeometry args={[0.115, 20, 20]} /><meshStandardMaterial color={BODY} roughness={0.4} /></mesh>
      {arm("l")}{arm("r")}
    </group>
  </group>;
}

function Floor({ seat }: { seat: boolean }) {
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}><circleGeometry args={[1.5, 48]} /><meshStandardMaterial color="#dbe4f0" roughness={0.8} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><ringGeometry args={[1.45, 1.5, 64]} /><meshBasicMaterial color={ACCENT} /></mesh>
    {seat && <mesh position={[0, 0.17, -0.1]}><boxGeometry args={[0.45, 0.06, 0.9]} /><meshStandardMaterial color="#9aa8b8" roughness={0.7} /></mesh>}
  </>;
}

export default function ExerciseModel3D({ exerciseId, label, compact = false }: { exerciseId: string; label: string; compact?: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const holder = useRef<HTMLDivElement>(null);
  const inView = useInView(holder, { margin: "120px" });
  const motion = EXERCISE_MOTIONS[exerciseId];
  if (!motion) return null;
  return <div ref={holder} className={`exercise-model-3d ${compact ? "is-compact" : ""}`} role="img" aria-label={`Modelo 3D animado: ${label}`}>
    <Canvas frameloop={inView ? "always" : "never"} camera={{ position: [3.1, 1.6, 2.6], fov: 38 }} dpr={[1, 2]} onCreated={({ camera }) => camera.lookAt(0, 0.75, 0)}>
      <color attach="background" args={["#e8eef7"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <pointLight position={[-3, 1, -2]} intensity={1.2} color="#60a5fa" />
      <Floor seat={Boolean(motion.seat)} />
      <Figure motion={motion} still={reduced} />
    </Canvas>
    {!compact && <p className="image-credit">{label}</p>}
  </div>;
}
