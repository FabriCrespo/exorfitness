import type { LoggedSet, RoutineExercise } from "./types";

export type SetSuggestion = { weightKg: number; reps: number };

/** Lee el rango de repeticiones del plan: "8–12", "12–15 / lado", "10". */
export function repRange(targetReps: string) {
  const numbers = (targetReps.match(/\d+/g) ?? []).map(Number);
  const min = numbers[0] ?? 8;
  const max = numbers[1] ?? numbers[0] ?? 12;
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

const plateStep = (weightKg: number) => (weightKg >= 50 ? 5 : 2.5);

/**
 * Doble progresión: si en la última vez llegaste al tope de repeticiones en todas las series,
 * sube la carga y vuelve al mínimo del rango; si no, mantiene el peso e intenta una repetición más.
 */
export function suggestSets(exercise: RoutineExercise, previous: LoggedSet[] | undefined, count: number) {
  if (exercise.trackingMode === "minutes" || !previous?.length) return { sets: [] as SetSuggestion[], reason: "" };
  const { min, max } = repRange(exercise.targetReps);
  const worked = previous.filter((set) => set.reps > 0);
  if (worked.length === 0) return { sets: [] as SetSuggestion[], reason: "" };
  const reachedTop = worked.every((set) => set.reps >= max);
  const sets = Array.from({ length: count }, (_, index) => {
    const before = worked[index] ?? worked[worked.length - 1];
    if (reachedTop) return { weightKg: before.weightKg + plateStep(before.weightKg), reps: min };
    return { weightKg: before.weightKg, reps: Math.min(max, Math.max(min, before.reps + (before.reps < max ? 1 : 0))) };
  });
  const top = Math.max(...worked.map((set) => set.weightKg));
  const reason = reachedTop
    ? `Llegaste a ${max} repeticiones en todas las series con ${top} kg: toca subir un poco la carga.`
    : "Mantén el peso e intenta una repetición más que la última vez.";
  return { sets, reason };
}
