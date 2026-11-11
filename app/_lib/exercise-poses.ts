// Ángulos en grados. Flexión hacia adelante positiva.
// armF: hombro adelante · armAb: hombro hacia el lado · elbow: codo · hipF: cadera adelante · hipAb: cadera hacia el lado · knee: rodilla · ankle: tobillo (positivo = puntas hacia abajo)
export type Side = { armF?: number; armAb?: number; elbow?: number; hipF?: number; hipAb?: number; knee?: number; ankle?: number };
export type Pose = Side & { y?: number; z?: number; rx?: number; torso?: number; l?: Side; r?: Side };
export type ExerciseMotion = { a: Pose; b: Pose; seat?: boolean; speed?: number };

export const STAND: Required<Omit<Pose, "l" | "r">> = { y: 0.9, z: 0, rx: 0, torso: 0, armF: 0, armAb: 0, elbow: 0, hipF: 0, hipAb: 0, knee: 0, ankle: 0 };

const SIT: Pose = { y: 0.5, hipF: 90, knee: 90 };

export const EXERCISE_MOTIONS: Record<string, ExerciseMotion> = {
  "calf-raise": {
    a: { y: 0.9, armF: 55, elbow: 115, ankle: -8 },
    b: { y: 0.99, armF: 55, elbow: 115, ankle: 42 },
    speed: 0.8,
  },
  "hip-thrust": {
    a: { y: 0.25, rx: -65, hipF: 70, knee: 100, armF: 20 },
    b: { y: 0.6, rx: -100, hipF: -5, knee: 90, armF: 20 },
    seat: true,
  },
  "romanian-deadlift": {
    a: { y: 0.9, torso: 0, knee: 10 },
    b: { y: 0.82, z: -0.3, torso: 80, knee: 18, armF: -80 },
  },
  "leg-curl": {
    a: { ...SIT, knee: 5, armF: 30, elbow: 40 },
    b: { ...SIT, knee: 105, armF: 30, elbow: 40 },
    seat: true,
  },
  abductor: {
    a: { ...SIT, hipF: 80, hipAb: 5, armF: 30, elbow: 40 },
    b: { ...SIT, hipF: 80, hipAb: 35, armF: 30, elbow: 40 },
    seat: true,
  },
  "lat-pulldown": {
    a: { ...SIT, armF: 170, elbow: 5 },
    b: { ...SIT, torso: -10, armF: 55, armAb: 25, elbow: 100 },
    seat: true,
  },
  "seated-row": {
    a: { ...SIT, hipF: 80, knee: 25, torso: 10, armF: 75, elbow: 5 },
    b: { ...SIT, hipF: 80, knee: 25, torso: -5, armF: -15, elbow: 95 },
    seat: true,
  },
  "chest-supported-row": {
    a: { y: 0.7, z: -0.1, torso: 55, hipF: 55, knee: 80, armF: -55, elbow: 5 },
    b: { y: 0.7, z: -0.1, torso: 55, hipF: 55, knee: 80, armF: -105, elbow: 95 },
    seat: true,
  },
  "face-pull": {
    a: { armF: 90, elbow: 5 },
    b: { armF: 70, armAb: 55, elbow: 115 },
  },
  "bicep-curl": {
    a: { armF: 0, elbow: 5 },
    b: { armF: 0, elbow: 140 },
  },
  "chest-press": {
    a: { ...SIT, armF: 70, armAb: 20, elbow: 110 },
    b: { ...SIT, armF: 90, armAb: 10, elbow: 5 },
    seat: true,
  },
  "lateral-raise": {
    a: { armAb: 6, elbow: 15 },
    b: { armAb: 85, elbow: 15 },
  },
  "shoulder-press": {
    a: { ...SIT, armF: 20, armAb: 60, elbow: 110 },
    b: { ...SIT, armF: 170, armAb: 10, elbow: 10 },
    seat: true,
  },
  "triceps-pushdown": {
    a: { torso: 10, armF: 15, elbow: 110 },
    b: { torso: 10, armF: 15, elbow: 5 },
  },
  "ab-machine": {
    a: { ...SIT, torso: -5, armF: 60, elbow: 100 },
    b: { ...SIT, torso: 40, armF: 60, elbow: 100 },
    seat: true,
  },
  "leg-press": {
    a: { y: 0.4, rx: -50, hipF: 75, knee: 115, armF: 20, elbow: 60 },
    b: { y: 0.4, rx: -50, hipF: 35, knee: 5, armF: 20, elbow: 60 },
    seat: true,
  },
  "bulgarian-split-squat": {
    a: { y: 0.8, torso: 8, armF: 0, l: { hipF: 20, knee: 20 }, r: { hipF: -35, knee: 95 } },
    b: { y: 0.55, torso: 18, armF: 0, l: { hipF: 75, knee: 105 }, r: { hipF: -35, knee: 95 } },
    seat: true,
  },
  "leg-extension": {
    a: { ...SIT, knee: 105, armF: 30, elbow: 40 },
    b: { ...SIT, knee: 2, armF: 30, elbow: 40 },
    seat: true,
  },
  "glute-kickback": {
    a: { torso: 25, armF: -5, elbow: 30, l: { hipF: 8, knee: 5 }, r: { hipF: 35, knee: 45 } },
    b: { torso: 25, armF: -5, elbow: 30, l: { hipF: 8, knee: 5 }, r: { hipF: -35, knee: 5 } },
  },
  "assisted-pullup": {
    a: { y: 0.45, armF: 175, elbow: 5, knee: 90 },
    b: { y: 0.95, armF: 120, armAb: 20, elbow: 85, knee: 90 },
  },
  "single-arm-row": {
    a: { y: 0.85, z: -0.25, torso: 60, knee: 20, hipF: 0, l: { armF: -60, elbow: 5 }, r: { armF: -60, elbow: 5 } },
    b: { y: 0.85, z: -0.25, torso: 60, knee: 20, hipF: 0, l: { armF: -105, elbow: 95 }, r: { armF: -60, elbow: 5 } },
  },
  "cable-pullover": {
    a: { torso: 15, armF: 160, elbow: 15 },
    b: { torso: 15, armF: 25, elbow: 15 },
  },
  "reverse-pec-deck": {
    a: { ...SIT, torso: 5, armF: 85, armAb: 4, elbow: 15 },
    b: { ...SIT, torso: 5, armF: 85, armAb: 80, elbow: 15 },
    seat: true,
  },
  elliptical: {
    a: { torso: 4, l: { hipF: 28, knee: 25, armF: 35, elbow: 70 }, r: { hipF: -22, knee: 8, armF: -25, elbow: 70 } },
    b: { torso: 4, l: { hipF: -22, knee: 8, armF: -25, elbow: 70 }, r: { hipF: 28, knee: 25, armF: 35, elbow: 70 } },
    speed: 1.6,
  },
};
