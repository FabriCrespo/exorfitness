"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import { Quaternion, Vector3, type Group } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Frame, Gear } from "../_lib/exercise-gear";

// Paleta de máquinas Technogym: grafito mate, carcasas plateadas, guías cromadas, tapicería negra y selector rojo.
export const GRAPHITE = "#23262b";
export const GRAPHITE_LIGHT = "#363b42";
export const SILVER = "#c4c9d0";
export const CHROME = "#e9ecf1";
export const UPHOLSTERY = "#141518";
export const RED = "#d92632";
export const GOLD = "#c9a45c";
// Alias que usa el resto del modelo.
export const STEEL_DARK = GRAPHITE;
export const PAD = UPHOLSTERY;

const UP = new Vector3(0, 1, 0);

type Vec3 = [number, number, number];
type HandRefs = { l: RefObject<Group | null>; r: RefObject<Group | null> };
type Finish = "frame" | "shroud" | "pad" | "chrome" | "plate" | "red" | "gold";

const FINISH: Record<Finish, { color: string; metalness: number; roughness: number; emissive?: string }> = {
  frame: { color: GRAPHITE, metalness: 0.55, roughness: 0.42 },
  shroud: { color: SILVER, metalness: 0.45, roughness: 0.32 },
  pad: { color: UPHOLSTERY, metalness: 0, roughness: 0.78 },
  chrome: { color: CHROME, metalness: 1, roughness: 0.12 },
  plate: { color: GRAPHITE_LIGHT, metalness: 0.7, roughness: 0.34 },
  red: { color: RED, metalness: 0.2, roughness: 0.4, emissive: "#5a0a10" },
  gold: { color: GOLD, metalness: 0.9, roughness: 0.25 },
};

function Mat({ finish }: { finish: Finish }) {
  const spec = FINISH[finish];
  return <meshStandardMaterial color={spec.color} metalness={spec.metalness} roughness={spec.roughness} emissive={spec.emissive ?? "#000000"} emissiveIntensity={spec.emissive ? 0.6 : 0} />;
}

/** Caja de esquinas suaves, como las carcasas y tapicerías de una máquina real. */
function Block({ position, size, finish = "frame", rotation, radius }: { position: Vec3; size: Vec3; finish?: Finish; rotation?: Vec3; radius?: number }) {
  const geometry = useMemo(() => {
    const r = Math.min(radius ?? Math.min(...size) * 0.3, 0.05, Math.min(...size) / 2 - 0.001);
    return new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.max(0.002, r));
  }, [size, radius]);
  return (
    <mesh position={position} rotation={rotation} geometry={geometry} castShadow receiveShadow>
      <Mat finish={finish} />
    </mesh>
  );
}

function Post({ position, height, radius = 0.025, finish = "frame" }: { position: Vec3; height: number; radius?: number; finish?: Finish }) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} castShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <Mat finish={finish} />
    </mesh>
  );
}

function Plate({ position, radius, thickness = 0.03 }: { position: Vec3; radius: number; thickness?: number }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, thickness, 32]} />
        <Mat finish="plate" />
      </mesh>
      <mesh position={[0, thickness / 2 + 0.0005, 0]}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, 0.002, 24]} />
        <Mat finish="chrome" />
      </mesh>
    </group>
  );
}

/** Varilla estirada entre dos puntos que se mueven (barra con discos, barra de dominadas o cable). */
function Rod({ from, to, radius, finish, extend = 0, plates = 0 }: { from: () => Vector3 | null; to: () => Vector3 | null; radius: number; finish: Finish; extend?: number; plates?: number }) {
  const group = useRef<Group>(null);
  const rod = useRef<Group>(null);
  const end1 = useRef<Group>(null);
  const end2 = useRef<Group>(null);
  const dir = useMemo(() => new Vector3(), []);
  const mid = useMemo(() => new Vector3(), []);
  const quat = useMemo(() => new Quaternion(), []);

  useFrame(() => {
    const a = from();
    const b = to();
    if (!a || !b || !group.current || !rod.current) return;
    dir.subVectors(b, a);
    const length = dir.length();
    if (length < 0.001) return;
    dir.normalize();
    mid.addVectors(a, b).multiplyScalar(0.5);
    group.current.position.copy(mid);
    group.current.quaternion.copy(quat.setFromUnitVectors(UP, dir));
    rod.current.scale.set(1, length + extend, 1);
    if (end1.current) end1.current.position.y = (length + extend) / 2 - 0.05;
    if (end2.current) end2.current.position.y = -(length + extend) / 2 + 0.05;
  });

  return (
    <group ref={group}>
      <group ref={rod}>
        <mesh castShadow>
          <cylinderGeometry args={[radius, radius, 1, 12]} />
          <Mat finish={finish} />
        </mesh>
      </group>
      {plates > 0 && (
        <>
          <group ref={end1}>{Array.from({ length: plates }, (_, i) => <Plate key={i} position={[0, -i * 0.035, 0]} radius={0.17 - i * 0.02} />)}</group>
          <group ref={end2}>{Array.from({ length: plates }, (_, i) => <Plate key={i} position={[0, i * 0.035, 0]} radius={0.17 - i * 0.02} />)}</group>
        </>
      )}
    </group>
  );
}

/** Pila de pesas Technogym: placas de acero entre dos guías cromadas, con la clavija roja en una de ellas. */
function WeightStack({ position, plates = 10, pin = 4, height = 0.1 }: { position: Vec3; plates?: number; pin?: number; height?: number }) {
  const top = plates * height;
  return (
    <group position={position}>
      {Array.from({ length: plates }, (_, i) => (
        <Block key={i} position={[0, 0.1 + i * height, 0]} size={[0.34, height * 0.82, 0.26]} finish="plate" radius={0.01} />
      ))}
      <Block position={[0.215, 0.1 + pin * height, 0]} size={[0.07, 0.035, 0.05]} finish="red" radius={0.01} />
      <Post position={[-0.14, 0, 0.1]} height={top + 0.25} radius={0.009} finish="chrome" />
      <Post position={[0.14, 0, 0.1]} height={top + 0.25} radius={0.009} finish="chrome" />
      <Block position={[0, top + 0.18, 0]} size={[0.42, 0.06, 0.34]} finish="shroud" />
    </group>
  );
}

/** Torre de poleas: la pila queda detrás del cable, lejos del usuario, y un brazo superior llega hasta la polea. */
function Tower({ x, z, anchor }: { x: number; z: number; anchor?: Vec3 }) {
  const away = z >= 0 ? 1 : -1;
  const armLength = anchor ? Math.abs(anchor[2] - z) : 0;
  return (
    <group position={[x, 0, z]}>
      <Post position={[-0.26, 0, away * 0.3]} height={2.5} />
      <Post position={[0.26, 0, away * 0.3]} height={2.5} />
      <Block position={[0, 2.54, away * 0.3]} size={[0.62, 0.1, 0.16]} finish="shroud" />
      <Block position={[0, 0.04, away * 0.3]} size={[0.7, 0.08, 0.54]} finish="frame" />
      <Block position={[0, 1.6, away * 0.46]} size={[0.5, 1.9, 0.04]} finish="shroud" />
      <WeightStack position={[0, 0.05, away * 0.28]} />
      {anchor && armLength > 0.05 && <Block position={[0, 2.5, (anchor[2] - z) / 2 * 0.6]} size={[0.1, 0.1, armLength * 0.6 + 0.3]} finish="shroud" />}
      <mesh position={[0, 2.45, away * 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.05, 28]} />
        <Mat finish="chrome" />
      </mesh>
    </group>
  );
}

function SeatFrame() {
  return (
    <group>
      <Block position={[0, 0.4, -0.02]} size={[0.46, 0.1, 0.5]} finish="pad" radius={0.04} />
      <Block position={[0, 0.9, -0.3]} size={[0.44, 0.82, 0.1]} finish="pad" rotation={[-0.1, 0, 0]} radius={0.04} />
      <Block position={[0, 0.03, -0.05]} size={[0.64, 0.06, 1.3]} finish="frame" />
      <Post position={[-0.23, 0, -0.38]} height={1.4} />
      <Post position={[0.23, 0, -0.38]} height={1.4} />
      <Block position={[0, 0.25, -0.12]} size={[0.1, 0.26, 0.12]} finish="shroud" />
      <WeightStack position={[0, 0.05, -0.78]} plates={9} pin={3} />
      <Block position={[0, 1.05, -0.99]} size={[0.52, 1.25, 0.06]} finish="shroud" />
    </group>
  );
}

function BenchFrame({ at, length = 1.0 }: { at: Vec3; length?: number }) {
  return (
    <group position={at}>
      <Block position={[0, 0, 0]} size={[length, 0.1, 0.34]} finish="pad" radius={0.04} />
      <Block position={[-length / 2 + 0.1, -0.2, 0]} size={[0.07, 0.4, 0.3]} finish="frame" />
      <Block position={[length / 2 - 0.1, -0.2, 0]} size={[0.07, 0.4, 0.3]} finish="frame" />
      <Block position={[0, -0.36, 0]} size={[length - 0.1, 0.04, 0.06]} finish="shroud" />
    </group>
  );
}

function Frames({ frame }: { frame: Frame }) {
  switch (frame) {
    case "seat":
      return <SeatFrame />;
    case "bench":
      return <BenchFrame at={[0, 0.4, -0.55]} />;
    case "incline":
      return (
        <group>
          <Block position={[0, 0.85, 0.42]} size={[0.5, 0.1, 0.95]} finish="pad" rotation={[-0.62, 0, 0]} radius={0.04} />
          <Post position={[-0.2, 0, 0.5]} height={0.8} />
          <Post position={[0.2, 0, 0.5]} height={0.8} />
          <Block position={[0, 0.02, 0.4]} size={[0.6, 0.04, 0.9]} finish="frame" />
        </group>
      );
    case "legpress":
      return (
        <group>
          <Block position={[0, 0.3, -0.35]} size={[0.52, 0.12, 0.65]} finish="pad" rotation={[0.3, 0, 0]} radius={0.04} />
          <Block position={[0, 0.7, -0.62]} size={[0.52, 0.72, 0.1]} finish="pad" rotation={[-0.7, 0, 0]} radius={0.04} />
          <Block position={[-0.44, 0.6, 0.5]} size={[0.07, 0.07, 1.2]} finish="shroud" rotation={[-0.62, 0, 0]} />
          <Block position={[0.44, 0.6, 0.5]} size={[0.07, 0.07, 1.2]} finish="shroud" rotation={[-0.62, 0, 0]} />
          <Block position={[0, 0.03, 0.2]} size={[0.86, 0.06, 2.0]} finish="frame" />
          <WeightStack position={[0, 0.05, 1.45]} plates={8} pin={3} />
        </group>
      );
    case "pullup":
      return (
        <group>
          <Post position={[-0.62, 0, -0.1]} height={2.6} />
          <Post position={[0.62, 0, -0.1]} height={2.6} />
          <Block position={[0, 2.64, -0.1]} size={[1.4, 0.1, 0.12]} finish="shroud" />
          <Block position={[0, 0.04, -0.1]} size={[1.5, 0.08, 0.54]} finish="frame" />
          <Block position={[0, 0.4, 0.28]} size={[0.34, 0.08, 0.3]} finish="pad" radius={0.03} />
        </group>
      );
    case "elliptical":
      return (
        <group>
          <Block position={[0, 0.07, -0.05]} size={[0.74, 0.12, 1.5]} finish="frame" />
          <Block position={[0, 0.25, -0.6]} size={[0.5, 0.3, 0.3]} finish="shroud" />
          <Post position={[-0.3, 0, 0.55]} height={1.3} />
          <Post position={[0.3, 0, 0.55]} height={1.3} />
          <Block position={[0, 1.36, 0.58]} size={[0.62, 0.3, 0.12]} finish="frame" rotation={[-0.45, 0, 0]} />
          <mesh position={[0, 1.37, 0.65]} rotation={[-0.45, 0, 0]}>
            <planeGeometry args={[0.5, 0.2]} />
            <meshBasicMaterial color="#5fc8ff" />
          </mesh>
        </group>
      );
    case "rearBench":
      return <BenchFrame at={[0, 0.3, -0.7]} length={0.5} />;
    case "calf":
      // Standing Calf: plataforma para las puntas, columna trasera con la pila y palanca hasta los hombros.
      return (
        <group>
          <Block position={[0, 0.06, 0.08]} size={[0.62, 0.12, 0.55]} finish="frame" />
          <Block position={[0, 0.125, 0.3]} size={[0.62, 0.02, 0.06]} finish="chrome" radius={0.008} />
          <Block position={[0, 0.03, -0.45]} size={[0.8, 0.06, 0.9]} finish="frame" />
          <Post position={[-0.26, 0, -0.5]} height={1.6} />
          <Post position={[0.26, 0, -0.5]} height={1.6} />
          <Block position={[0, 1.62, -0.5]} size={[0.66, 0.1, 0.16]} finish="shroud" />
          <Block position={[0, 1.4, -0.28]} size={[0.12, 0.12, 0.5]} finish="shroud" />
          <WeightStack position={[0, 0.05, -0.78]} plates={8} pin={3} />
        </group>
      );
  }
}

/** Objeto que sostiene cada mano, en el sistema de coordenadas del antebrazo. */
function HandHold({ hold, side }: { hold: NonNullable<Gear["hold"]>; side: 1 | -1 }) {
  if (hold === "dumbbell") {
    return (
      <group position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow><cylinderGeometry args={[0.014, 0.014, 0.16, 12]} /><Mat finish="chrome" /></mesh>
        {[0.075, -0.075].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 6]} />
            <Mat finish="frame" />
          </mesh>
        ))}
      </group>
    );
  }
  if (hold === "handle" || hold === "rope") {
    return (
      <mesh position={[0, -0.01, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.017, 0.017, hold === "rope" ? 0.1 : 0.14, 14]} />
        <Mat finish={hold === "rope" ? "gold" : "chrome"} />
      </mesh>
    );
  }
  void side;
  return null;
}

type Props = { gear: Gear; hands: HandRefs };

/** Equipo fijo (banco, máquina, torre) y accesorios que siguen a las manos (barra, cables). */
export default function ExerciseGear({ gear, hands }: Props) {
  const handL = useMemo(() => new Vector3(), []);
  const handR = useMemo(() => new Vector3(), []);
  const anchor = useMemo(() => (gear.cable ? new Vector3(...gear.cable) : null), [gear.cable]);
  const getL = () => (hands.l.current ? hands.l.current.getWorldPosition(handL) : null);
  const getR = () => (hands.r.current ? hands.r.current.getWorldPosition(handR) : null);
  const getAnchor = () => anchor;

  return (
    <group>
      {gear.frame && <Frames frame={gear.frame} />}
      {gear.tower && <Tower x={gear.tower[0]} z={gear.tower[1]} anchor={gear.cable} />}
      {gear.hold === "bar" && <Rod from={getL} to={getR} radius={0.014} finish="chrome" extend={0.55} plates={3} />}
      {gear.hold === "pullbar" && <Rod from={getL} to={getR} radius={0.017} finish="chrome" extend={0.3} />}
      {anchor && <Rod from={getL} to={getAnchor} radius={0.004} finish="chrome" />}
      {anchor && !gear.singleArm && <Rod from={getR} to={getAnchor} radius={0.004} finish="chrome" />}
    </group>
  );
}

export { HandHold, Mat };
