"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import { Quaternion, Vector3, type Group } from "three";
import type { Frame, Gear } from "../_lib/exercise-gear";

export const STEEL = "#8a8270";
export const STEEL_DARK = "#575044";
export const PAD = "#46402f";
export const GOLD = "#c9a45c";

const UP = new Vector3(0, 1, 0);

type Vec3 = [number, number, number];
type HandRefs = { l: RefObject<Group | null>; r: RefObject<Group | null> };

function Block({ position, size, color = STEEL, rotation, metal = 0.15 }: { position: Vec3; size: Vec3; color?: string; rotation?: Vec3; metal?: number }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={metal} />
    </mesh>
  );
}

function Post({ position, height, radius = 0.025, color = STEEL }: { position: Vec3; height: number; radius?: number; color?: string }) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} castShadow>
      <cylinderGeometry args={[radius, radius, height, 12]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.25} />
    </mesh>
  );
}

function Plate({ position, radius, thickness = 0.03 }: { position: Vec3; radius: number; thickness?: number }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[radius, radius, thickness, 24]} />
      <meshStandardMaterial color="#575044" roughness={0.45} metalness={0.2} />
    </mesh>
  );
}

/** Varilla estirada entre dos puntos que se mueven (barra con discos, barra de dominadas o cable). */
function Rod({ from, to, radius, color, extend = 0, plates = 0 }: { from: () => Vector3 | null; to: () => Vector3 | null; radius: number; color: string; extend?: number; plates?: number }) {
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
          <cylinderGeometry args={[radius, radius, 1, 10]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.25} />
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

/** Torre de poleas: la pila queda detrás del cable, lejos del usuario, y un brazo superior llega hasta la polea. */
function Tower({ x, z, anchor }: { x: number; z: number; anchor?: Vec3 }) {
  const away = z >= 0 ? 1 : -1;
  const armLength = anchor ? Math.abs(anchor[2] - z) : 0;
  return (
    <group position={[x, 0, z]}>
      <Post position={[-0.24, 0, away * 0.3]} height={2.5} />
      <Post position={[0.24, 0, away * 0.3]} height={2.5} />
      <Block position={[0, 2.52, away * 0.3]} size={[0.54, 0.06, 0.1]} />
      <Block position={[0, 0.03, away * 0.3]} size={[0.62, 0.06, 0.5]} color={STEEL_DARK} />
      {Array.from({ length: 10 }, (_, i) => <Block key={i} position={[0, 0.2 + i * 0.1, away * 0.3]} size={[0.34, 0.07, 0.26]} color={i === 4 ? GOLD : STEEL_DARK} />)}
      {anchor && armLength > 0.05 && <Block position={[0, 2.5, (anchor[2] - z) / 2 * 0.6]} size={[0.08, 0.08, armLength * 0.6 + 0.3]} color={STEEL} />}
      <mesh position={[0, 2.45, away * 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 20]} />
        <meshStandardMaterial color={GOLD} roughness={0.35} metalness={0.5} />
      </mesh>
    </group>
  );
}

function SeatFrame() {
  return (
    <group>
      <Block position={[0, 0.4, -0.02]} size={[0.44, 0.08, 0.5]} color={PAD} metal={0.1} />
      <Block position={[0, 0.9, -0.3]} size={[0.42, 0.8, 0.09]} color={PAD} metal={0.1} rotation={[-0.1, 0, 0]} />
      <Block position={[0, 0.02, -0.05]} size={[0.62, 0.05, 1.3]} color={STEEL_DARK} />
      <Post position={[-0.22, 0, -0.38]} height={1.4} />
      <Post position={[0.22, 0, -0.38]} height={1.4} />
      {Array.from({ length: 9 }, (_, i) => <Block key={i} position={[0, 0.15 + i * 0.1, -0.78]} size={[0.36, 0.07, 0.3]} color={i === 3 ? GOLD : STEEL_DARK} />)}
      <Block position={[0, 1.05, -0.78]} size={[0.5, 1.2, 0.06]} color={STEEL_DARK} />
    </group>
  );
}

function BenchFrame({ at, length = 1.0 }: { at: Vec3; length?: number }) {
  return (
    <group position={at}>
      <Block position={[0, 0, 0]} size={[length, 0.1, 0.32]} color={PAD} metal={0.1} />
      <Block position={[-length / 2 + 0.1, -0.2, 0]} size={[0.06, 0.4, 0.3]} color={STEEL_DARK} />
      <Block position={[length / 2 - 0.1, -0.2, 0]} size={[0.06, 0.4, 0.3]} color={STEEL_DARK} />
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
          <Block position={[0, 0.85, 0.42]} size={[0.5, 0.08, 0.95]} color={PAD} metal={0.1} rotation={[-0.62, 0, 0]} />
          <Post position={[-0.2, 0, 0.5]} height={0.8} />
          <Post position={[0.2, 0, 0.5]} height={0.8} />
          <Block position={[0, 0.02, 0.4]} size={[0.6, 0.04, 0.9]} color={STEEL_DARK} />
        </group>
      );
    case "legpress":
      return (
        <group>
          <Block position={[0, 0.3, -0.35]} size={[0.5, 0.1, 0.65]} color={PAD} metal={0.1} rotation={[0.3, 0, 0]} />
          <Block position={[0, 0.7, -0.62]} size={[0.5, 0.7, 0.09]} color={PAD} metal={0.1} rotation={[-0.7, 0, 0]} />
          <Block position={[-0.42, 0.6, 0.5]} size={[0.06, 0.06, 1.2]} color={STEEL} rotation={[-0.62, 0, 0]} />
          <Block position={[0.42, 0.6, 0.5]} size={[0.06, 0.06, 1.2]} color={STEEL} rotation={[-0.62, 0, 0]} />
          <Block position={[0, 0.02, 0.2]} size={[0.8, 0.05, 2.0]} color={STEEL_DARK} />
        </group>
      );
    case "pullup":
      return (
        <group>
          <Post position={[-0.62, 0, -0.1]} height={2.6} />
          <Post position={[0.62, 0, -0.1]} height={2.6} />
          <Block position={[0, 2.62, -0.1]} size={[1.3, 0.06, 0.08]} />
          <Block position={[0, 0.03, -0.1]} size={[1.4, 0.06, 0.5]} color={STEEL_DARK} />
        </group>
      );
    case "elliptical":
      return (
        <group>
          <Block position={[0, 0.06, -0.05]} size={[0.7, 0.1, 1.5]} color={STEEL_DARK} />
          <Post position={[-0.3, 0, 0.55]} height={1.3} />
          <Post position={[0.3, 0, 0.55]} height={1.3} />
          <Block position={[0, 1.32, 0.55]} size={[0.6, 0.12, 0.1]} color={GOLD} />
        </group>
      );
    case "rearBench":
      return <BenchFrame at={[0, 0.3, -0.7]} length={0.5} />;
  }
}

/** Objeto que sostiene cada mano, en el sistema de coordenadas del antebrazo. */
function HandHold({ hold, side }: { hold: NonNullable<Gear["hold"]>; side: 1 | -1 }) {
  if (hold === "dumbbell") {
    return (
      <group position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow><cylinderGeometry args={[0.014, 0.014, 0.16, 10]} /><meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.35} /></mesh>
        <Plate position={[0, 0.07, 0]} radius={0.065} thickness={0.04} />
        <Plate position={[0, -0.07, 0]} radius={0.065} thickness={0.04} />
      </group>
    );
  }
  if (hold === "handle" || hold === "rope") {
    return (
      <mesh position={[0, -0.01, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, hold === "rope" ? 0.1 : 0.13, 10]} />
        <meshStandardMaterial color={hold === "rope" ? GOLD : STEEL_DARK} metalness={0.5} roughness={0.5} />
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
      {gear.hold === "bar" && <Rod from={getL} to={getR} radius={0.014} color="#cfc6b0" extend={0.55} plates={3} />}
      {gear.hold === "pullbar" && <Rod from={getL} to={getR} radius={0.016} color="#cfc6b0" extend={0.3} />}
      {anchor && <Rod from={getL} to={getAnchor} radius={0.004} color="#b8b09a" />}
      {anchor && !gear.singleArm && <Rod from={getR} to={getAnchor} radius={0.004} color="#b8b09a" />}
    </group>
  );
}

export { HandHold };
