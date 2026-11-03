import type { LoggedSet, WorkoutSession } from "./types";

export type ExerciseMetric = "maxWeight" | "volume" | "maxReps";

export type ExerciseProgressPoint = {
  sessionId: string;
  label: string;
  value: number;
  weightKg: number;
  reps: number;
};

function summarizeSets(sets: LoggedSet[], metric: ExerciseMetric, sessionId: string, label: string): ExerciseProgressPoint | null {
  if (!sets.length) return null;
  const heaviest = sets.reduce((best, set) => set.weightKg > best.weightKg ? set : best, sets[0]);
  const value = metric === "maxWeight"
    ? heaviest.weightKg
    : metric === "maxReps"
      ? Math.max(...sets.map((set) => set.reps))
      : sets.reduce((total, set) => total + set.weightKg * set.reps, 0);

  return { sessionId, label, value, weightKg: heaviest.weightKg, reps: heaviest.reps };
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString("es-BO", { day: "numeric", month: "short" });
}

export function exerciseProgressPoints(
  sessions: WorkoutSession[],
  exerciseId: string,
  metric: ExerciseMetric,
  currentSets: LoggedSet[] = [],
): ExerciseProgressPoint[] {
  const points = sessions.flatMap((session) => {
    const exercise = session.exercises.find((entry) => entry.exerciseId === exerciseId);
    const point = exercise ? summarizeSets(exercise.sets, metric, session.id, shortDate(session.finishedAt)) : null;
    return point ? [point] : [];
  }).slice(-8);

  if (currentSets.length) {
    const current = summarizeSets(currentSets, metric, "today", "Hoy");
    if (current) points.push(current);
  }

  return points;
}

export function exerciseMetricLabel(metric: ExerciseMetric) {
  if (metric === "maxWeight") return "Peso máximo";
  if (metric === "maxReps") return "Repeticiones máximas";
  return "Volumen";
}

export function exerciseMetricUnit(metric: ExerciseMetric) {
  if (metric === "maxWeight") return "kg";
  if (metric === "maxReps") return "reps";
  return "kg·reps";
}

