import { CATALOG } from "./exercise-catalog";
import { type MuscleId, musclesOf } from "./muscles";
import type { RoutineExercise } from "./types";

export type SimilarItem = { exercise: RoutineExercise; shared: MuscleId[]; score: number; fromRoutine: boolean };

/** Todos los ejercicios conocidos: los de tu rutina primero y después el catálogo, sin repetir. */
export function exercisePool(days: { exercises: RoutineExercise[] }[]) {
  const pool = new Map<string, { exercise: RoutineExercise; fromRoutine: boolean }>();
  for (const day of days) for (const exercise of day.exercises) if (!pool.has(exercise.id)) pool.set(exercise.id, { exercise, fromRoutine: true });
  for (const exercise of CATALOG) if (!pool.has(exercise.id)) pool.set(exercise.id, { exercise, fromRoutine: false });
  return [...pool.values()];
}

/**
 * Ejercicios parecidos al actual: comparten el músculo principal (puntúa más) o músculos secundarios.
 * `exclude` son los que ya están en la sesión, para no ofrecerte lo que ya vas a hacer.
 */
export function similarExercises(current: RoutineExercise, pool: { exercise: RoutineExercise; fromRoutine: boolean }[], exclude: Set<string>, limit = 8): SimilarItem[] {
  const target = musclesOf(current);
  if (target.length === 0 || current.trackingMode === "minutes") return [];
  const [primary] = target;
  return pool
    .filter(({ exercise }) => exercise.id !== current.id && !exclude.has(exercise.id) && exercise.trackingMode !== "minutes")
    .map(({ exercise, fromRoutine }) => {
      const muscles = musclesOf(exercise);
      const shared = muscles.filter((muscle) => target.includes(muscle));
      // Mismo músculo principal pesa más; ser también el principal del candidato suma un poco más.
      const score = (muscles.includes(primary) ? 3 : 0) + (muscles[0] === primary ? 2 : 0) + shared.length;
      return { exercise, shared, score, fromRoutine };
    })
    .filter((item) => item.shared.length > 0)
    .sort((a, b) => b.score - a.score || Number(b.fromRoutine) - Number(a.fromRoutine) || a.exercise.name.localeCompare(b.exercise.name))
    .slice(0, limit);
}
