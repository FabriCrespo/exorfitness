import type { AppData, Group, LoggedExercise, WorkoutSession } from "./types";
import { startOfLocalWeek } from "./workout-data";

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

function activeVolumeOf(data: AppData) {
  const exercises = data.activeSession?.exercises ?? [];
  return sum(exercises.flatMap((exercise) => exercise.sets.filter((set) => set.complete).map((set) => (Number(set.weightKg) || 0) * (Number(set.reps) || 0))));
}

function activeMinutesOf(data: AppData) {
  const exercises = data.activeSession?.exercises ?? [];
  return sum(exercises.flatMap((exercise) => exercise.sets.filter((set) => set.complete).map((set) => Number(set.durationMinutes) || 0)));
}

/** Volumen de la última vez que se hizo cada ejercicio activo, serie por serie, para comparar la sesión en curso. */
function comparableVolumeOf(data: AppData, newestFirst: WorkoutSession[]) {
  const loggedExercises = newestFirst.flatMap((session) => session.exercises);
  return sum((data.activeSession?.exercises ?? []).map((activeExercise) => {
    const last = loggedExercises.find((exercise) => exercise.exerciseId === activeExercise.exerciseId);
    return sum(activeExercise.sets.map((set, index) => {
      const previousSet = last?.sets[index];
      return set.complete && previousSet ? previousSet.weightKg * previousSet.reps : 0;
    }));
  }));
}

export function deriveWorkoutStats(data: AppData, weekStart: Date | null) {
  const baseDay = data.days[data.selectedDay] ?? data.days[0];
  const activeSession = data.activeSession?.dayIndex === data.selectedDay ? data.activeSession : null;
  // Los ejercicios añadidos solo a la sesión en curso se muestran junto a los del día.
  const selectedDay = activeSession?.extras?.length ? { ...baseDay, exercises: [...baseDay.exercises, ...activeSession.extras] } : baseDay;
  const newestFirst = [...data.sessions].reverse();
  const [lastDaySession, previousDaySession] = newestFirst.filter((session) => session.dayIndex === data.selectedDay);

  const isCardioDay = selectedDay.exercises.some((exercise) => exercise.trackingMode === "minutes");
  const activeVolume = activeVolumeOf(data);
  const activeMinutes = activeMinutesOf(data);
  const completedSets = activeSession
    ? sum(activeSession.exercises.map((exercise) => exercise.sets.filter((set) => set.complete).length))
    : sum((lastDaySession?.exercises ?? []).map((exercise: LoggedExercise) => exercise.sets.length));

  let comparison: number | null = null;
  if (!isCardioDay) {
    if (activeSession && completedSets > 0) comparison = activeVolume - comparableVolumeOf(data, newestFirst);
    else if (!activeSession && lastDaySession && previousDaySession) comparison = lastDaySession.volume - previousDaySession.volume;
  }

  const recentSessions = newestFirst.filter((session) => session.volume > 0).slice(0, 6);
  const sessionsThisWeek = weekStart ? data.sessions.filter((session) => new Date(session.finishedAt) >= weekStart) : [];
  const doneDays = new Set(sessionsThisWeek.map((session) => session.dayIndex));
  const fixedDays = data.days.filter((day) => !day.flexible);
  // Lunes = 0 … domingo = 6. Un día fijo anterior a hoy, sin sesión esta semana, cuenta como "no fui".
  const todayRank = (new Date().getDay() + 6) % 7;
  const isMissed = (index: number) => Boolean(weekStart) && !data.days[index]?.flexible && index < todayRank && !doneDays.has(index);
  const missedDays = data.days.map((_, index) => index).filter(isMissed);

  const groupGoal = (label: string, group: Group) => {
    const planned = data.days.map((day, index) => ({ day, index })).filter(({ day }) => !day.flexible && day.exercises.some((exercise) => exercise.group === group));
    const done = planned.filter(({ index }) => doneDays.has(index)).length;
    return { label, done, target: planned.length, percent: planned.length ? Math.round((done / planned.length) * 100) : 0 };
  };
  const consistency = fixedDays.length ? Math.round((fixedDays.filter((day) => doneDays.has(data.days.indexOf(day))).length / fixedDays.length) * 100) : 0;
  const goals = [
    groupGoal("Glúteos", "gluteos"),
    groupGoal("Espalda", "espalda"),
    { label: "Constancia", done: doneDays.size, target: fixedDays.length, percent: consistency },
  ];
  const firstSession = data.sessions[0];
  const weekNumber = firstSession && weekStart
    ? Math.floor((weekStart.getTime() - startOfLocalWeek(new Date(firstSession.startedAt)).getTime()) / (7 * 86_400_000)) + 1
    : 1;

  return {
    selectedDay,
    activeSession,
    newestFirst,
    lastDaySession,
    isCardioDay,
    activeVolume,
    activeMinutes,
    completedSets,
    comparison,
    dayVolume: activeSession ? activeVolume : lastDaySession?.volume ?? 0,
    dayMinutes: activeSession ? activeMinutes : lastDaySession?.cardioMinutes ?? 0,
    allTimeVolume: sum(data.sessions.map((session) => session.volume)),
    allTimeMinutes: sum(data.sessions.map((session) => session.cardioMinutes ?? 0)),
    recentSessions,
    goals,
    weekNumber,
    maxVolume: Math.max(1, ...recentSessions.map((session) => session.volume)),
    trainingDayCount: fixedDays.length,
    fixedDaysDone: data.days.filter((day, index) => !day.flexible && doneDays.has(index)).length,
    isDayDone: (index: number) => doneDays.has(index),
    isMissed,
    missedDays,
    todayRank,
  };
}

export type WorkoutStats = ReturnType<typeof deriveWorkoutStats>;
