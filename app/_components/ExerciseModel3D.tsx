"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useInView, useReducedMotion } from "motion/react";
import { createContext, type PointerEvent, useContext, useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, BackSide, CanvasTexture, MathUtils, PMREMGenerator, type Group, type MeshStandardMaterial } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { demoFor, EXERCISE_GEAR, type Gear } from "../_lib/exercise-gear";
import { EXERCISE_MOTIONS, STAND, type ExerciseMotion, type Pose, type Side } from "../_lib/exercise-poses";
import type { MuscleId } from "../_lib/muscles";
import ExerciseGear, { GOLD, HandHold, Mat, PAD } from "./ExerciseGear";

const BODY = "#e9dfca";
const SUIT = "#25221d";
const GLOW = "#ff9a2e";
const UPPER_ARM = 0.3;
const FOREARM = 0.28;
const THIGH = 0.45;
const SHIN = 0.45;
const rad = MathUtils.degToRad;

type LimbRefs = { upper: Group | null; fore: Group | null; thigh: Group | null; shin: Group | null };
type Part = "hips" | "thigh" | "shin" | "chest" | "abs" | "upper" | "fore" | "shoulder";

const PARTS_BY_MUSCLE: Record<MuscleId, Part[]> = {
  gluteos: ["hips"], isquios: ["thigh", "hips"], cuadriceps: ["thigh"], gemelos: ["shin"],
  pecho: ["chest"], espalda: ["chest"], trapecio: ["chest"], lumbar: ["abs"], abdomen: ["abs"],
  hombros: ["shoulder"], biceps: ["upper"], triceps: ["upper"], antebrazos: ["fore"],
};

/** Valor de la fase actual (0–1) que comparten todas las piezas para pulsar con la contracción. */
const PulseContext = createContext<{ current: number }>({ current: 0 });

/** Material de piel: si el músculo trabaja, brilla en ámbar y pulsa al ritmo del movimiento. */
function Skin({ color, glow = false, roughness = 0.55, metalness = 0.1 }: { color: string; glow?: boolean; roughness?: number; metalness?: number }) {
  const ref = useRef<MeshStandardMaterial>(null);
  const pulse = useContext(PulseContext);
  useFrame(() => {
    if (glow && ref.current) ref.current.emissiveIntensity = 0.35 + 1.1 * pulse.current;
  });
  return <meshStandardMaterial ref={ref} color={color} roughness={roughness} metalness={metalness} emissive={glow ? GLOW : "#000000"} emissiveIntensity={glow ? 0.6 : 0} />;
}

/** Miembro cónico: más ancho en la articulación de arriba que en la de abajo. */
function Limb({ length, top, bottom, glow = false }: { length: number; top: number; bottom: number; glow?: boolean }) {
  return (
    <mesh position={[0, -length / 2, 0]} castShadow>
      <cylinderGeometry args={[top, bottom, length, 20]} />
      <Skin color={BODY} glow={glow} />
    </mesh>
  );
}

function Joint({ r, glow = false }: { r: number; glow?: boolean }) {
  return (
    <mesh castShadow>
      <sphereGeometry args={[r, 20, 20]} />
      <Skin color={glow ? "#f2c36b" : GOLD} glow={glow} roughness={0.3} metalness={0.85} />
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

function Figure({ motion, gear, still, phase, muscles }: { motion: ExerciseMotion; gear: Gear; still: boolean; phase?: number; muscles: MuscleId[] }) {
  const root = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const limbs = useRef<Record<"l" | "r", LimbRefs>>({ l: { upper: null, fore: null, thigh: null, shin: null }, r: { upper: null, fore: null, thigh: null, shin: null } });
  const handL = useRef<Group>(null);
  const handR = useRef<Group>(null);
  const clock = useRef(0);
  const pulse = useRef(0);
  const glowing = useMemo(() => new Set(muscles.flatMap((muscle) => PARTS_BY_MUSCLE[muscle] ?? [])), [muscles]);
  const on = (part: Part) => glowing.has(part);

  useFrame((_, delta) => {
    if (!still && phase === undefined) clock.current += delta * (motion.speed ?? 0.9);
    const t = phase ?? (still ? 0.5 : (1 - Math.cos(clock.current * Math.PI)) / 2);
    pulse.current = t;
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
        <Joint r={on("shoulder") ? 0.078 : 0.065} glow={on("shoulder")} />
        <Limb length={UPPER_ARM} top={0.05} bottom={0.04} glow={on("upper")} />
        <group position={[0, -UPPER_ARM, 0]} ref={(node) => { limbs.current[side].fore = node; }}>
          <Joint r={0.045} />
          <Limb length={FOREARM} top={0.042} bottom={0.03} glow={on("fore")} />
          <group position={[0, -FOREARM, 0]} ref={side === "l" ? handL : handR}>
            <mesh castShadow><sphereGeometry args={[0.04, 16, 16]} /><Skin color={BODY} roughness={0.5} /></mesh>
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
        <Limb length={THIGH} top={0.085} bottom={0.058} glow={on("thigh")} />
        {gear.pad === "knee" && <mesh position={[sign * 0.11, -0.28, 0]} castShadow><boxGeometry args={[0.06, 0.2, 0.14]} /><meshStandardMaterial color={PAD} roughness={0.8} /></mesh>}
        <group position={[0, -THIGH, 0]} ref={(node) => { limbs.current[side].shin = node; }}>
          <Joint r={0.06} />
          <Limb length={SHIN} top={0.058} bottom={0.04} glow={on("shin")} />
          <mesh position={[0, -SHIN, 0.06]} castShadow><boxGeometry args={[0.1, 0.06, 0.26]} /><meshStandardMaterial color="#e8eaee" roughness={0.35} metalness={0.3} /></mesh>
          {gear.pad === "shin-back" && <mesh position={[0, -SHIN + 0.1, -0.07]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.22, 16]} /><meshStandardMaterial color={PAD} roughness={0.8} /></mesh>}
          {gear.pad === "shin-front" && <mesh position={[0, -SHIN + 0.12, 0.07]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.22, 16]} /><meshStandardMaterial color={PAD} roughness={0.8} /></mesh>}
          {gear.frame === "legpress" && <mesh position={[0, -SHIN - 0.02, 0.1]} castShadow><boxGeometry args={[0.5, 0.04, 0.36]} /><Mat finish="chrome" /></mesh>}
          {gear.frame === "elliptical" && <mesh position={[0, -SHIN - 0.03, 0.04]} castShadow><boxGeometry args={[0.16, 0.03, 0.4]} /><Mat finish="frame" /></mesh>}
        </group>
      </group>
    );
  };

  return (
    <PulseContext.Provider value={pulse}>
      <group ref={root}>
        <mesh castShadow><boxGeometry args={[0.34, 0.16, 0.2]} /><Skin color={SUIT} glow={on("hips")} roughness={0.6} /></mesh>
        {leg("l")}{leg("r")}
        <group ref={torso}>
          <mesh position={[0, 0.17, 0]} castShadow><capsuleGeometry args={[0.13, 0.12, 8, 20]} /><Skin color={SUIT} glow={on("abs")} roughness={0.6} /></mesh>
          <mesh position={[0, 0.4, 0]} scale={[1.12, 1, 0.8]} castShadow><capsuleGeometry args={[0.15, 0.2, 8, 24]} /><Skin color={BODY} glow={on("chest")} roughness={0.55} metalness={0.1} /></mesh>
          <mesh position={[0, 0.4, 0.02]} scale={[1.14, 0.5, 0.84]}><capsuleGeometry args={[0.152, 0.2, 8, 24]} /><meshStandardMaterial color={SUIT} roughness={0.5} /></mesh>
          <mesh position={[0, 0.59, 0]}><cylinderGeometry args={[0.04, 0.05, 0.1, 14]} /><Skin color={BODY} roughness={0.5} /></mesh>
          <mesh position={[0, 0.72, 0]} castShadow><sphereGeometry args={[0.105, 26, 26]} /><Skin color={BODY} roughness={0.45} /></mesh>
          <mesh position={[0, 0.725, 0.07]} scale={[1.1, 0.35, 0.6]}><sphereGeometry args={[0.1, 18, 18]} /><meshStandardMaterial color={GOLD} roughness={0.25} metalness={0.9} /></mesh>
          {arm("l")}{arm("r")}
        </group>
        {gear.hold === "pelvisBar" && (
          <group position={[0, 0.02, 0.17]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow><cylinderGeometry args={[0.016, 0.016, 1.5, 14]} /><Mat finish="chrome" /></mesh>
            {[0.68, -0.68].flatMap((y) => [0, 1, 2].map((i) => (
              <mesh key={`${y}-${i}`} position={[0, y + Math.sign(y) * i * 0.035, 0]} castShadow><cylinderGeometry args={[0.17 - i * 0.02, 0.17 - i * 0.02, 0.03, 32]} /><Mat finish="plate" /></mesh>
            )))}
          </group>
        )}
      </group>
      <ExerciseGear gear={gear} hands={{ l: handL, r: handR }} />
    </PulseContext.Provider>
  );
}

/** Reflejos de estudio sin descargar nada: una sala procedural que hace brillar el cromo y el grafito. */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const target = generator.fromScene(new RoomEnvironment(), 0.04);
    /* eslint-disable react-hooks/immutability -- la escena de three.js es un objeto imperativo */
    scene.environment = target.texture;
    scene.environmentIntensity = 0.6;
    return () => {
      scene.environment = null;
      target.dispose();
      generator.dispose();
    };
    /* eslint-enable react-hooks/immutability */
  }, [gl, scene]);
  return null;
}

function Stage({ compact }: { compact: boolean }) {
  const glow = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(201,164,92,0.55)");
    gradient.addColorStop(0.55, "rgba(201,164,92,0.12)");
    gradient.addColorStop(1, "rgba(201,164,92,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new CanvasTexture(canvas);
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <circleGeometry args={[1.9, 72]} />
        <meshStandardMaterial color="#17140f" roughness={0.3} metalness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[1.7, 64]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.86, 1.9, 120]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.0, 1.01, 120]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.3} />
      </mesh>
      {!compact && (
        <>
          <mesh position={[0, 2.2, 0]} renderOrder={-1}>
            <coneGeometry args={[1.7, 4.4, 56, 1, true]} />
            <meshBasicMaterial color={GOLD} transparent opacity={0.045} side={BackSide} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
          <Dust />
        </>
      )}
    </group>
  );
}

/** Motas de luz que flotan despacio alrededor del ejercicio. */
function Dust() {
  const group = useRef<Group>(null);
  const positions = useMemo(() => {
    // Posiciones repartidas de forma determinista, sin estado mutable.
    const hash = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
    return new Float32Array(Array.from({ length: 70 }, (_, i) => {
      const angle = hash(i + 1) * Math.PI * 2;
      const radius = 0.5 + hash(i + 101) * 1.3;
      return [Math.cos(angle) * radius, 0.1 + hash(i + 201) * 2.6, Math.sin(angle) * radius];
    }).flat());
  }, []);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05;
  });
  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={GOLD} size={0.022} transparent opacity={0.65} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
      </points>
    </group>
  );
}

/** Cámara con un vaivén lento alrededor del ejercicio; se puede girar arrastrando. */
function CameraRig({ still, angle, drag }: { still: boolean; angle?: number; drag: { current: number } }) {
  useFrame(({ camera, clock }) => {
    const swing = (angle ?? (still ? 0.55 : 0.55 + Math.sin(clock.elapsedTime * 0.28) * 0.5)) + drag.current;
    camera.position.set(Math.sin(swing) * 3.7, 1.5, Math.cos(swing) * 3.7);
    camera.lookAt(0, 0.72, 0);
  });
  return null;
}

type Props = { exerciseId: string; label: string; compact?: boolean; phase?: number; angle?: number; muscles?: MuscleId[]; interactive?: boolean };

export default function ExerciseModel3D({ exerciseId, label, compact = false, phase, angle, muscles = [], interactive = false }: Props) {
  const reduced = useReducedMotion() ?? false;
  const holder = useRef<HTMLDivElement>(null);
  const inView = useInView(holder, { margin: "120px" });
  const drag = useRef(0);
  const pointer = useRef<{ x: number; base: number } | null>(null);
  const demo = demoFor(exerciseId, EXERCISE_MOTIONS);
  const motion = demo ? EXERCISE_MOTIONS[demo.id] : undefined;
  if (!demo || !motion) return null;
  const gear = EXERCISE_GEAR[demo.id] ?? {};

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    pointer.current = { x: event.clientX, base: drag.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current) drag.current = pointer.current.base - (event.clientX - pointer.current.x) * 0.012;
  };
  const up = () => { pointer.current = null; };

  return (
    <div
      ref={holder}
      className={`exercise-model-3d ${compact ? "is-compact" : ""} ${interactive ? "is-interactive" : ""}`}
      role="img"
      aria-label={`Modelo 3D animado: ${label}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <Canvas shadows frameloop={inView ? "always" : "never"} camera={{ position: [2.2, 1.7, 3.4], fov: compact ? 46 : 38 }} dpr={[1, 2]}>
        <color attach="background" args={["#0b0a08"]} />
        <fog attach="fog" args={["#0b0a08", 6, 12]} />
        <StudioEnvironment />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 3]} intensity={2.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
        <pointLight position={[-3, 1.5, -2]} intensity={2.4} color="#c9a45c" />
        <pointLight position={[2.5, 0.8, -3]} intensity={1.6} color="#7fb2ff" />
        <spotLight position={[0, 5.5, 0.5]} angle={0.5} penumbra={0.9} intensity={60} color="#fff1d6" />
        <CameraRig still={reduced} angle={angle} drag={drag} />
        <Stage compact={compact} />
        <Figure motion={motion} gear={gear} still={reduced} phase={phase} muscles={muscles} />
      </Canvas>
      {!compact && <p className="image-credit">{label}</p>}
    </div>
  );
}

