// Equipo que aparece en la demostración 3D de cada ejercicio (coordenadas del mundo: +z al frente, +y arriba).
export type Frame = "seat" | "bench" | "incline" | "legpress" | "pullup" | "elliptical" | "rearBench";
export type Hold = "dumbbell" | "bar" | "pullbar" | "handle" | "rope" | "pelvisBar";
export type Pad = "shin-back" | "shin-front" | "knee";

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
};
