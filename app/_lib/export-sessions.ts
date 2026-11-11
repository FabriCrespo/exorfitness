import type { AppData, WorkoutSession } from "./types";
import { startOfLocalWeek } from "./workout-data";

const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Misma estructura que el formato `workout_id`, así lo exportado se puede volver a importar. */
export function sessionToExternal(session: WorkoutSession, data: AppData) {
  const day = data.days[session.dayIndex];
  const date = localDate(new Date(session.finishedAt));
  const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  return {
    workout_id: session.id.startsWith("exorfitness_") ? session.id : `exorfitness_${date}_${session.id.slice(0, 6)}`,
    date,
    day: session.custom ? "Libre" : day?.label ?? "",
    name: session.custom ? session.title ?? "Sesión libre" : day?.focus ?? "",
    started_at: session.startedAt,
    finished_at: session.finishedAt,
    exercises: session.exercises.map((exercise) => ({
      id: exercise.exerciseId,
      name: exercise.name,
      group: exercise.group,
      sets: exercise.sets.map((set, index) => ({
        set_number: index + 1,
        weight_kg: set.weightKg,
        reps: set.reps,
        ...(set.durationMinutes ? { duration_minutes: set.durationMinutes } : {}),
        to_failure: set.toFailure,
      })),
      notes: exercise.notes ?? null,
    })),
    summary: {
      total_exercises: session.exercises.length,
      total_sets: totalSets,
      volume_kg_reps: session.volume,
      cardio_minutes: session.cardioMinutes ?? 0,
    },
  };
}

export type ExportPeriod = { key: string; label: string; sessions: WorkoutSession[] };

function groupBy(sessions: WorkoutSession[], keyOf: (session: WorkoutSession) => string) {
  const groups = new Map<string, WorkoutSession[]>();
  for (const session of sessions) {
    const key = keyOf(session);
    groups.set(key, [...(groups.get(key) ?? []), session]);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}

/** Días con sesión, del más reciente al más antiguo. */
export function sessionDays(sessions: WorkoutSession[]): ExportPeriod[] {
  return groupBy(sessions, (session) => localDate(new Date(session.finishedAt))).map(([key, items]) => ({
    key,
    label: new Date(`${key}T12:00:00`).toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" }),
    sessions: items,
  }));
}

/** Semanas (lunes a domingo) con al menos una sesión. */
export function sessionWeeks(sessions: WorkoutSession[]): ExportPeriod[] {
  return groupBy(sessions, (session) => localDate(startOfLocalWeek(new Date(session.finishedAt)))).map(([key, items]) => {
    const start = new Date(`${key}T12:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("es-BO", { day: "numeric", month: "short" });
    return { key, label: `Semana del ${fmt(start)} al ${fmt(end)}`, sessions: items };
  });
}

export function periodPayload(period: ExportPeriod, scope: "day" | "week", data: AppData) {
  const workouts = period.sessions.map((session) => sessionToExternal(session, data));
  return scope === "day" && workouts.length === 1 ? workouts[0] : workouts;
}
