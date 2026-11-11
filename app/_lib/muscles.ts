import { CATALOG_BY_ID } from "./exercise-catalog";
import type { Group, RoutineExercise, WorkoutSession } from "./types";
import { daysAgo } from "./workout-data";

export type MuscleId =
  | "pecho" | "hombros" | "trapecio" | "espalda" | "biceps" | "triceps" | "antebrazos"
  | "abdomen" | "lumbar" | "gluteos" | "cuadriceps" | "isquios" | "gemelos";

export const MUSCLES: { id: MuscleId; label: string }[] = [
  { id: "pecho", label: "Pecho" },
  { id: "hombros", label: "Hombros" },
  { id: "trapecio", label: "Trapecio" },
  { id: "espalda", label: "Espalda" },
  { id: "biceps", label: "Bíceps" },
  { id: "triceps", label: "Tríceps" },
  { id: "antebrazos", label: "Antebrazos" },
  { id: "abdomen", label: "Abdomen" },
  { id: "lumbar", label: "Lumbar" },
  { id: "gluteos", label: "Glúteos" },
  { id: "cuadriceps", label: "Cuádriceps" },
  { id: "isquios", label: "Isquios" },
  { id: "gemelos", label: "Pantorrillas" },
];

export const muscleLabel = (id: MuscleId) => MUSCLES.find((muscle) => muscle.id === id)?.label ?? id;

const BY_EXERCISE: Record<string, MuscleId[]> = {
  "hip-thrust": ["gluteos", "isquios"],
  "romanian-deadlift": ["isquios", "gluteos", "lumbar"],
  "leg-curl": ["isquios"],
  abductor: ["gluteos"],
  "leg-press": ["cuadriceps", "gluteos"],
  "bulgarian-split-squat": ["cuadriceps", "gluteos"],
  "leg-extension": ["cuadriceps"],
  "glute-kickback": ["gluteos"],
  "lat-pulldown": ["espalda", "biceps"],
  "seated-row": ["espalda", "trapecio", "biceps"],
  "chest-supported-row": ["espalda", "trapecio"],
  "face-pull": ["hombros", "trapecio"],
  "bicep-curl": ["biceps", "antebrazos"],
  "chest-press": ["pecho", "triceps", "hombros"],
  "lateral-raise": ["hombros"],
  "shoulder-press": ["hombros", "triceps"],
  "triceps-pushdown": ["triceps"],
  "ab-machine": ["abdomen"],
  "assisted-pullup": ["espalda", "biceps"],
  "single-arm-row": ["espalda", "biceps"],
  "cable-pullover": ["espalda"],
  "reverse-pec-deck": ["hombros", "trapecio"],
};

const BY_GROUP: Partial<Record<Group, MuscleId[]>> = {
  gluteos: ["gluteos"], espalda: ["espalda"], hombros: ["hombros"], biceps: ["biceps"], triceps: ["triceps"], pecho: ["pecho"],
};

/** Músculos que trabaja un ejercicio: tabla conocida o, para los que añadiste tú, su grupo. */
export function musclesOf(exercise: { id?: string; exerciseId?: string; group: Group }): MuscleId[] {
  const id = exercise.id ?? exercise.exerciseId ?? "";
  return BY_EXERCISE[id] ?? CATALOG_BY_ID.get(id)?.muscles ?? BY_GROUP[exercise.group] ?? [];
}

/** Días desde que se trabajó cada músculo por última vez (0 = hoy). Falta la clave si nunca. */
export function lastWorked(sessions: WorkoutSession[]) {
  const result: Partial<Record<MuscleId, number>> = {};
  for (const session of sessions) {
    const days = daysAgo(session.finishedAt);
    for (const exercise of session.exercises) {
      for (const muscle of musclesOf(exercise)) {
        if (result[muscle] === undefined || days < result[muscle]!) result[muscle] = days;
      }
    }
  }
  return result;
}

export const agoLabel = (days: number | undefined) =>
  days === undefined ? "sin registro" : days === 0 ? "hoy" : days === 1 ? "ayer" : `hace ${days} días`;

/** Ejercicios que trabajan al menos uno de los músculos elegidos, primero los que cubren más. */
export function exercisesFor(library: RoutineExercise[], selected: Set<MuscleId>) {
  return library
    .filter((exercise) => exercise.trackingMode !== "minutes")
    .map((exercise) => ({ exercise, muscles: musclesOf(exercise), hits: musclesOf(exercise).filter((muscle) => selected.has(muscle)).length }))
    .filter((item) => item.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.exercise.name.localeCompare(b.exercise.name));
}
