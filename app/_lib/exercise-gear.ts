// Equipo que aparece en la demostración 3D de cada ejercicio (coordenadas del mundo: +z al frente, +y arriba).
export type Frame = "seat" | "bench" | "incline" | "legpress" | "pullup" | "elliptical" | "rearBench" | "calf";
export type Hold = "dumbbell" | "bar" | "pullbar" | "handle" | "rope" | "pelvisBar";
export type Pad = "shin-back" | "shin-front" | "knee" | "shoulders";

export type Gear = {
  frame?: Frame;
  /** Lo que sostienen las manos. */
  hold?: Hold;
  /** Punto de la polea desde donde sale el cable hacia las manos. */
  cable?: [number, number, number];
  /** Solo la mano izquierda (la cercana a la cámara) usa el cable. */
  singleArm?: boolean;
  /** Posición (x, z) de la torre de poleas con su pila de pesas. */
  tower?: [number, number];
  pad?: Pad;
};

export const EXERCISE_GEAR: Record<string, Gear> = {
  "hip-thrust": { frame: "bench", hold: "pelvisBar" },
  "romanian-deadlift": { hold: "bar" },
  "leg-curl": { frame: "seat", pad: "shin-back" },
  abductor: { frame: "seat", pad: "knee" },
  "lat-pulldown": { frame: "seat", hold: "pullbar", cable: [0, 2.45, 0.25], tower: [0, -0.55] },
  "seated-row": { frame: "seat", hold: "handle", cable: [0, 0.6, 1.5], tower: [0, 1.5] },
  "chest-supported-row": { frame: "incline", hold: "dumbbell" },
  "face-pull": { hold: "rope", cable: [0, 1.6, 1.4], tower: [0, 1.4] },
  "bicep-curl": { hold: "dumbbell" },
  "chest-press": { frame: "seat", hold: "handle" },
  "lateral-raise": { hold: "dumbbell" },
  "shoulder-press": { frame: "seat", hold: "handle" },
  "triceps-pushdown": { hold: "rope", cable: [0, 2.2, 0.45], tower: [0, 0.45] },
  "ab-machine": { frame: "seat" },
  "leg-press": { frame: "legpress" },
  "bulgarian-split-squat": { frame: "rearBench", hold: "dumbbell" },
  "leg-extension": { frame: "seat", pad: "shin-front" },
  "glute-kickback": { tower: [0, 0.9] },
  "assisted-pullup": { frame: "pullup", hold: "pullbar" },
  "single-arm-row": { hold: "handle", cable: [0, 0.5, 1.3], singleArm: true, tower: [0, 1.3] },
  "cable-pullover": { hold: "rope", cable: [0, 2.4, 0.95], tower: [0, 0.95] },
  "reverse-pec-deck": { frame: "seat", hold: "handle" },
  elliptical: { frame: "elliptical", hold: "handle" },
  "calf-raise": { frame: "calf", pad: "shoulders" },
};

/** Ejercicios del catálogo que se demuestran con el movimiento de uno parecido (la demostración es aproximada). */
const DEMO_ALIAS: Record<string, string> = {
  "glute-bridge": "hip-thrust",
  "sumo-deadlift": "romanian-deadlift",
  "lying-leg-curl": "leg-curl",
  "hack-squat": "leg-press",
  "cable-hip-abduction": "glute-kickback",
  "machine-row": "seated-row",
  "t-bar-row": "seated-row",
  "close-grip-pulldown": "lat-pulldown",
  "straight-arm-pulldown": "cable-pullover",
  "dumbbell-row": "chest-supported-row",
  "dumbbell-bench-press": "chest-press",
  "incline-dumbbell-press": "chest-press",
  "arnold-press": "shoulder-press",
  "front-raise": "lateral-raise",
  "cable-lateral-raise": "lateral-raise",
  "rear-delt-fly": "reverse-pec-deck",
  "hammer-curl": "bicep-curl",
  "cable-curl": "bicep-curl",
  "preacher-curl": "bicep-curl",
  "overhead-triceps": "triceps-pushdown",
  "cable-crunch": "ab-machine",
};

/** Id con el que se dibuja el 3D de un ejercicio y si es el movimiento exacto. Null si no hay demostración. */
export function demoFor(exerciseId: string, motions: Record<string, unknown>) {
  if (motions[exerciseId]) return { id: exerciseId, exact: true };
  const alias = DEMO_ALIAS[exerciseId];
  return alias && motions[alias] ? { id: alias, exact: false } : null;
}

/** Máquinas de la sala (asiento con pila, polea, prensa, elíptica): todas son Technogym en el gimnasio de Fabricio. */
export function isTechnogym(gear: Gear) {
  return Boolean(gear.tower || (gear.frame && ["seat", "legpress", "pullup", "elliptical", "calf"].includes(gear.frame)));
}
