"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { MathUtils, type Group } from "three";
import { EXERCISE_GEAR, type Gear } from "../_lib/exercise-gear";
import { EXERCISE_MOTIONS, STAND, type ExerciseMotion, type Pose, type Side } from "../_lib/exercise-poses";
import ExerciseGear, { GOLD, HandHold, PAD, STEEL_DARK } from "./ExerciseGear";

const BODY = "#e9dfca";
const SUIT = "#2b2620";
const UPPER_ARM = 0.3;
const FOREARM = 0.28;
const THIGH = 0.45;
const SHIN = 0.45;
const rad = MathUtils.degToRad;

type LimbRefs = { upper: Group | null; fore: Group | null; thigh: Group | null; shin: Group | null };

/** Miembro cónico: más ancho en la articulación de arriba que en la de abajo. */
function Limb({ length, top, bottom, color = BODY }: { length: number; top: number; bottom: number; color?: string }) {
  return (
    <mesh position={[0, -length / 2, 0]} castShadow>
      <cylinderGeometry args={[top, bottom, length, 16]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
    </mesh>
  );
}

function Joint({ r, color = GOLD }: { r: number; color?: string }) {
  return (
    <mesh castShadow>
      <sphereGeometry args={[r, 18, 18]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
    </mesh>
  );
}

function sideValue(pose: Pose, side: "l" | "r", key: keyof Side, fallback: number) {
  return pose[side]?.[key] ?? pose[key] ?? fallback;
}

function blend(motion: ExerciseMotion, side: "l" | "r" | "root", key: keyof Pose | keyof Side, t: number) {
  const base = (STAND as Record<string, number>)[key] ?? 0;
  const read = (pose: Pose) => (side === "root" ? ((pose as Record<string, unknown>)[key] as number | undefined) ?? base : sideValue(pose, side, key as keyof Side, base));
  return MathUtils.lerp(read(motion.a), read(motion.b), t);
}

function Figure({ motion, gear, still, phase }: { motion: ExerciseMotion; gear: Gear; still: boolean; phase?: number }) {
  const root = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const limbs = useRef<Record<"l" | "r", LimbRefs>>({ l: { upper: null, fore: null, thigh: null, shin: null }, r: { upper: null, fore: null, thigh: null, shin: null } });
  const handL = useRef<Group>(null);
  const handR = useRef<Group>(null);
  const clock = useRef(0);

  useFrame((_, delta) => {
    if (!still && phase === undefined) clock.current += delta * (motion.speed ?? 0.9);
    const t = phase ?? (still ? 0.5 : (1 - Math.cos(clock.current * Math.PI)) / 2);
    if (root.current) {
      root.current.position.set(0, blend(motion, "root", "y", t), blend(motion, "root", "z", t));
      root.current.rotation.x = rad(blend(motion, "root", "rx", t));
    }
    if (torso.current) torso.current.rotation.x = rad(blend(motion, "root", "torso", t));
    (["l", "r"] as const).forEach((side) => {
      const sign = side === "l" ? 1 : -1;
      const g = limbs.current[side];
      const v = (key: keyof Side) => blend(motion, side, key, t);
      if (g.upper) g.upper.rotation.set(rad(-v("armF")), 0, rad(sign * v("armAb")));
      if (g.fore) g.fore.rotation.x = rad(-v("elbow"));
      if (g.thigh) g.thigh.rotation.set(rad(-v("hipF")), 0, rad(sign * v("hipAb")));
      if (g.shin) g.shin.rotation.x = rad(v("knee"));
    });
  });

  const arm = (side: "l" | "r") => {
    const sign = side === "l" ? 1 : -1;
    return (
      <group key={`arm-${side}`} position={[sign * 0.21, 0.5, 0]} ref={(node) => { limbs.current[side].upper = node; }}>
        <Joint r={0.065} />
        <Limb length={UPPER_ARM} top={0.05} bottom={0.04} />
        <group position={[0, -UPPER_ARM, 0]} ref={(node) => { limbs.current[side].fore = node; }}>
          <Joint r={0.045} />
          <Limb length={FOREARM} top={0.042} bottom={0.03} />
          <group position={[0, -FOREARM, 0]} ref={side === "l" ? handL : handR}>
            <mesh castShadow><sphereGeometry args={[0.04, 14, 14]} /><meshStandardMaterial color={BODY} roughness={0.5} /></mesh>
            {gear.hold && gear.hold !== "bar" && gear.hold !== "pullbar" && gear.hold !== "pelvisBar" && <HandHold hold={gear.hold} side={sign} />}
          </group>
        </group>
      </group>
    );
  };

  const leg = (side: "l" | "r") => {
    const sign = side === "l" ? 1 : -1;
    return (
      <group key={`leg-${side}`} position={[sign * 0.1, 0, 0]} ref={(node) => { limbs.current[side].thigh = node; }}>
        <Joint r={0.075} />
        <Limb length={THIGH} top={0.085} bottom={0.058} />
        {gear.pad === "knee" && <mesh position={[sign * 0.11, -0.28, 0]} castShadow><boxGeometry args={[0.06, 0.2, 0.14]} /><meshStandardMaterial color={PAD} roughness={0.8} /></mesh>}
        <group position={[0, -THIGH, 0]} ref={(node) => { limbs.current[side].shin = node; }}>
          <Joint r={0.06} />
          <Limb length={SHIN} top={0.058} bottom={0.04} />
          <mesh position={[0, -SHIN, 0.06]} castShadow><boxGeometry args={[0.1, 0.06, 0.26]} /><meshStandardMaterial color={GOLD} roughness={0.4} metalness={0.5} /></mesh>
          {gear.pad === "shin-back" && <mesh position={[0, -SHIN + 0.1, -0.07]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.22, 14]} /><meshStandardMaterial color={PAD} roughness={0.8} /></mesh>}
          {gear.pad === "shin-front" && <mesh position={[0, -SHIN + 0.12, 0.07]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.22, 14]} /><meshStandardMaterial color={PAD} roughness={0.8} /></mesh>}
          {gear.frame === "legpress" && <mesh position={[0, -SHIN - 0.02, 0.1]} castShadow><boxGeometry args={[0.5, 0.04, 0.36]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.7} roughness={0.4} /></mesh>}
          {gear.frame === "elliptical" && <mesh position={[0, -SHIN - 0.03, 0.04]} castShadow><boxGeometry args={[0.16, 0.03, 0.4]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.7} roughness={0.4} /></mesh>}
        </group>
      </group>
    );
  };

  return (
    <>
      <group ref={root}>
        <mesh castShadow><boxGeometry args={[0.34, 0.16, 0.2]} /><meshStandardMaterial color={SUIT} roughness={0.6} /></mesh>
        {leg("l")}{leg("r")}
        <group ref={torso}>
          <mesh position={[0, 0.17, 0]} castShadow><capsuleGeometry args={[0.13, 0.12, 6, 18]} /><meshStandardMaterial color={SUIT} roughness={0.6} /></mesh>
          <mesh position={[0, 0.4, 0]} scale={[1.12, 1, 0.8]} castShadow><capsuleGeometry args={[0.15, 0.2, 6, 20]} /><meshStandardMaterial color={BODY} roughness={0.55} metalness={0.1} /></mesh>
          <mesh position={[0, 0.4, 0.02]} scale={[1.14, 0.5, 0.84]}><capsuleGeometry args={[0.152, 0.2, 6, 20]} /><meshStandardMaterial color={SUIT} roughness={0.5} /></mesh>
          <mesh position={[0, 0.59, 0]}><cylinderGeometry args={[0.04, 0.05, 0.1, 12]} /><meshStandardMaterial color={BODY} roughness={0.5} /></mesh>
          <mesh position={[0, 0.72, 0]} castShadow><sphereGeometry args={[0.105, 22, 22]} /><meshStandardMaterial color={BODY} roughness={0.45} /></mesh>
          <mesh position={[0, 0.725, 0.07]} scale={[1.1, 0.35, 0.6]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.7} /></mesh>
          {arm("l")}{arm("r")}
        </group>
        {gear.hold === "pelvisBar" && (
          <group position={[0, 0.02, 0.17]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow><cylinderGeometry args={[0.016, 0.016, 1.5, 12]} /><meshStandardMaterial color="#cfc6b0" metalness={0.8} roughness={0.35} /></mesh>
            {[0.68, -0.68].flatMap((y) => [0, 1, 2].map((i) => (
              <mesh key={`${y}-${i}`} position={[0, y + Math.sign(y) * i * 0.035, 0]} castShadow><cylinderGeometry args={[0.17 - i * 0.02, 0.17 - i * 0.02, 0.03, 24]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.6} roughness={0.4} /></mesh>
            )))}
          </group>
        )}
      </group>
      <ExerciseGear gear={gear} hands={{ l: handL, r: handR }} />
    </>
  );
}

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <circleGeometry args={[1.8, 64]} />
        <meshStandardMaterial color="#241f17" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[1.76, 1.8, 96]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[1.0, 1.012, 96]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

/** Cámara con un vaivén lento alrededor del ejercicio. */
function CameraRig({ still, angle }: { still: boolean; angle?: number }) {
  useFrame(({ camera, clock }) => {
    const swing = angle ?? (still ? 0.55 : 0.55 + Math.sin(clock.elapsedTime * 0.28) * 0.5);
    camera.position.set(Math.sin(swing) * 3.7, 1.5, Math.cos(swing) * 3.7);
    camera.lookAt(0, 0.72, 0);
  });
  return null;
}

type Props = { exerciseId: string; label: string; compact?: boolean; phase?: number; angle?: number };

export default function ExerciseModel3D({ exerciseId, label, compact = false, phase, angle }: Props) {
  const reduced = useReducedMotion() ?? false;
  const holder = useRef<HTMLDivElement>(null);
  const inView = useInView(holder, { margin: "120px" });
  const motion = EXERCISE_MOTIONS[exerciseId];
  if (!motion) return null;
  const gear = EXERCISE_GEAR[exerciseId] ?? {};

  return (
    <div ref={holder} className={`exercise-model-3d ${compact ? "is-compact" : ""}`} role="img" aria-label={`Modelo 3D animado: ${label}`}>
      <Canvas shadows frameloop={inView ? "always" : "never"} camera={{ position: [2.2, 1.7, 3.4], fov: compact ? 46 : 38 }} dpr={[1, 2]}>
        <color attach="background" args={["#0d0b09"]} />
        <fog attach="fog" args={["#0d0b09", 6, 12]} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 5, 3]} intensity={2.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
        <pointLight position={[-3, 1.5, -2]} intensity={2.2} color="#c9a45c" />
        <pointLight position={[2, 0.5, -3]} intensity={0.8} color="#8fb4e0" />
        <CameraRig still={reduced} angle={angle} />
        <Floor />
        <Figure motion={motion} gear={gear} still={reduced} phase={phase} />
      </Canvas>
      {!compact && <p className="image-credit">{label}</p>}
    </div>
  );
}
