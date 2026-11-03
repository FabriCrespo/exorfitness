"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { Group } from "three";

type Props = { done: number; total: number; volumes: number[] };

function Scene({ done, total, volumes, still }: Props & { still: boolean }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current && !still) group.current.rotation.y += delta * 0.45;
  });
  const max = Math.max(1, ...volumes);
  const ringCount = Math.max(1, total);
  return (
    <group ref={group} rotation={[0.35, 0, 0]}>
      {Array.from({ length: ringCount }, (_, i) => (
        <mesh key={`ring-${i}`} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1 + i * 0.28}>
          <torusGeometry args={[1, 0.045, 16, 72]} />
          <meshStandardMaterial color={i < done ? "#2563eb" : "#c5cfdc"} emissive={i < done ? "#2563eb" : "#000000"} emissiveIntensity={0.5} metalness={0.6} roughness={0.3} transparent opacity={i < done ? 1 : 0.35} />
        </mesh>
      ))}
      {volumes.map((volume, i) => {
        const height = 0.25 + (volume / max) * 1.4;
        const angle = (i / Math.max(1, volumes.length)) * Math.PI * 2;
        return (
          <mesh key={`bar-${i}`} position={[Math.cos(angle) * 0.55, height / 2 - 0.5, Math.sin(angle) * 0.55]}>
            <boxGeometry args={[0.2, height, 0.2]} />
            <meshStandardMaterial color="#60a5fa" metalness={0.5} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ProgressScene3D(props: Props) {
  const reduced = useReducedMotion() ?? false;
  return (
    <div className="progress-3d" role="img" aria-label={`Anillos 3D: ${props.done} de ${props.total} días de entrenamiento completados esta semana`}>
      <Canvas camera={{ position: [0, 1.2, 4.6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <pointLight position={[-3, -1, 2]} intensity={1.2} color="#60a5fa" />
        <Scene {...props} still={reduced} />
      </Canvas>
    </div>
  );
}
