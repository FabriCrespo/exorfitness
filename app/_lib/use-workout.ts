"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveSession, AppData, LoggedExercise, SetEntry, Theme, WorkoutSession } from "./types";
import { isExternalWorkout, sessionFromExternal, blankSets, currentDayIndex, defaultData, isAppData, makeId, normalizeData, planExercise, startOfLocalWeek, STORAGE_KEY, THEME_KEY, volumeOf } from "./workout-data";

const BACKUP_KEY = `${STORAGE_KEY}:backup`;

const confirmAction = (message: string) => window.confirm(message);

/** Estado de la app: lectura y guardado en localStorage, tema y todas las acciones sobre la rutina. */
export function useWorkout() {
  const [data, setData] = useState<AppData>(defaultData);
  const [theme, setTheme] = useState<Theme>("dark");
  const [hydrated, setHydrated] = useState(false);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [storageMessage, setStorageMessage] = useState("");
  const latestData = useRef(data);
  const canPersist = useRef(false);

  // Lectura inicial. Se difiere un tick para no hidratar con datos distintos a los del servidor.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedTheme = window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
        setTheme(savedTheme);
        document.documentElement.dataset.theme = savedTheme;

        const saved = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(BACKUP_KEY);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (isAppData(parsed)) {
            setData(normalizeData(parsed));
            if (parsed.activeSession) setStorageMessage("Recuperamos tu sesión en curso.");
          }
        } else {
          setData((current) => ({ ...current, selectedDay: currentDayIndex() }));
        }
      } catch {
        setStorageMessage("No se pudo leer el registro guardado.");
      }
      setWeekStart(startOfLocalWeek());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Cada cambio se guarda al instante: si cierras el navegador a mitad de entreno no se pierde nada.
  useEffect(() => {
    latestData.current = data;
    if (!hydrated) return;
    canPersist.current = true;
    let message = "Guardado en este dispositivo.";
    try {
      const json = JSON.stringify(data);
      window.localStorage.setItem(STORAGE_KEY, json);
      window.localStorage.setItem(BACKUP_KEY, json);
    } catch {
      message = "No se pudo guardar. Descarga un respaldo JSON.";
    }
    const timer = window.setTimeout(() => setStorageMessage(message), 0);
    return () => window.clearTimeout(timer);
  }, [data, hydrated]);

  // Último guardado forzado cuando la pestaña se oculta o se cierra.
  useEffect(() => {
    const flush = () => {
      if (!canPersist.current) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(latestData.current));
      } catch {
        /* sin espacio: el respaldo manual sigue disponible */
      }
    };
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flushWhenHidden);
    navigator.storage?.persist?.().catch(() => undefined);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", flushWhenHidden);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(THEME_KEY, next);
  }, [theme]);

  const selectDay = (index: number) => {
    if (data.activeSession && data.activeSession.dayIndex !== index) {
      setStorageMessage("Termina la sesión abierta antes de cambiar de día.");
      return;
    }
    setData((current) => ({ ...current, selectedDay: index }));
  };

  const addExercise = (name: string, equipment: string) => {
    const exercise = planExercise(makeId(), name, equipment || "Por elegir", 3, "8–12", "Anota una pista que te ayude a repetir el movimiento.");
    setData((current) => ({
      ...current,
      days: current.days.map((day, index) => (index === current.selectedDay ? { ...day, exercises: [...day.exercises, exercise] } : day)),
      activeSession: current.activeSession?.dayIndex === current.selectedDay
        ? { ...current.activeSession, exercises: [...current.activeSession.exercises, { exerciseId: exercise.id, sets: [] }] }
        : current.activeSession,
    }));
  };

  const removeExercise = (exerciseId: string) => {
    const day = data.days[data.selectedDay];
    const exercise = day?.exercises.find((item) => item.id === exerciseId);
    if (!exercise || !confirmAction(`¿Quitar “${exercise.name}” de ${day.label}?`)) return;
    setData((current) => ({
      ...current,
      days: current.days.map((item, index) => (index === current.selectedDay ? { ...item, exercises: item.exercises.filter((entry) => entry.id !== exerciseId) } : item)),
      activeSession: current.activeSession?.dayIndex === current.selectedDay
        ? { ...current.activeSession, exercises: current.activeSession.exercises.filter((item) => item.exerciseId !== exerciseId) }
        : current.activeSession,
    }));
  };

  const startWorkout = () => {
    const day = data.days[data.selectedDay];
    if (data.activeSession || !day?.exercises.length) return;
    const lastSets = (exerciseId: string) =>
      [...data.sessions].reverse().flatMap((item) => item.exercises).find((exercise) => exercise.exerciseId === exerciseId)?.sets ?? [];
    const session: ActiveSession = {
      id: makeId(),
      dayIndex: data.selectedDay,
      startedAt: new Date().toISOString(),
      exercises: day.exercises.map((exercise) => {
        if (exercise.trackingMode === "minutes") return { exerciseId: exercise.id, sets: blankSets(1) };
        // Series ya preparadas; si ya hiciste el ejercicio, arrancan con el peso de la última vez.
        const previous = lastSets(exercise.id);
        const sets = blankSets(exercise.targetSets).map((set, index) => {
          const before = previous[index] ?? previous.at(-1);
          return before ? { ...set, weightKg: String(before.weightKg || ""), reps: String(before.reps || "") } : set;
        });
        return { exerciseId: exercise.id, sets };
      }),
    };
    setData((current) => ({ ...current, activeSession: session }));
  };

  const withActiveSession = (update: (session: ActiveSession) => ActiveSession) =>
    setData((current) => ({ ...current, activeSession: current.activeSession ? update(current.activeSession) : null }));

  const updateSet = (exerciseId: string, setId: string, patch: Partial<SetEntry>) =>
    withActiveSession((session) => ({
      ...session,
      exercises: session.exercises.map((exercise) => exercise.exerciseId !== exerciseId ? exercise : {
        ...exercise,
        sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
      }),
    }));

  const addSet = (exerciseId: string) =>
    withActiveSession((session) => ({
      ...session,
      exercises: session.exercises.map((exercise) => (exercise.exerciseId === exerciseId ? { ...exercise, sets: [...exercise.sets, ...blankSets(1)] } : exercise)),
    }));

  const setNotes = (exerciseId: string, notes: string) =>
    withActiveSession((session) => ({
      ...session,
      exercises: session.exercises.map((exercise) => (exercise.exerciseId === exerciseId ? { ...exercise, notes } : exercise)),
    }));

  /** Guarda las series que ya tienen peso y repeticiones, y marca el ejercicio como hecho. */
  const completeExercise = (exerciseId: string) =>
    withActiveSession((session) => ({
      ...session,
      exercises: session.exercises.map((exercise) => exercise.exerciseId !== exerciseId ? exercise : {
        ...exercise,
        done: true,
        sets: exercise.sets.map((set) => {
          const timed = Number(set.durationMinutes) > 0;
          const strength = Boolean(set.weightKg) && Number(set.reps) > 0;
          return timed || strength ? { ...set, complete: true } : set;
        }),
      }),
    }));

  /** Cardio opcional al final de una sesión de fuerza. */
  const setExtraCardio = (minutes: string) => withActiveSession((session) => ({ ...session, extraCardioMinutes: minutes }));

  const finishWorkout = () => {
    const session = data.activeSession;
    if (!session) return;
    const exercises: LoggedExercise[] = session.exercises.flatMap((activeExercise) => {
      const definition = data.days[session.dayIndex]?.exercises.find((exercise) => exercise.id === activeExercise.exerciseId);
      if (!definition) return [];
      const sets = activeExercise.sets.filter((set) => set.complete).map((set) => ({
        weightKg: Number(set.weightKg) || 0,
        reps: Number(set.reps) || 0,
        ...(definition.trackingMode === "minutes" ? { durationMinutes: Number(set.durationMinutes) || 0 } : {}),
        toFailure: set.toFailure,
      }));
      return sets.length ? [{ exerciseId: definition.id, name: definition.name, group: definition.group, sets, ...(activeExercise.notes ? { notes: activeExercise.notes } : {}) }] : [];
    });
    const extraCardio = Number(session.extraCardioMinutes) || 0;
    if (extraCardio > 0) exercises.push({ exerciseId: "cardio-extra", name: "Cardio al final", group: "cardio", sets: [{ weightKg: 0, reps: 0, durationMinutes: extraCardio, toFailure: false }] });
    if (exercises.length === 0) return;
    const finished = {
      id: session.id,
      dayIndex: session.dayIndex,
      startedAt: session.startedAt,
      finishedAt: new Date().toISOString(),
      exercises,
      volume: exercises.reduce((total, exercise) => total + volumeOf(exercise.sets), 0),
      cardioMinutes: exercises.flatMap((exercise) => exercise.sets).reduce((total, set) => total + (set.durationMinutes ?? 0), 0),
    };
    setData((current) => ({ ...current, sessions: [...current.sessions, finished], activeSession: null }));
  };

  /** Corrige una sesión ya guardada (series, cardio al final, fecha). */
  const updateSession = (session: WorkoutSession) =>
    setData((current) => ({ ...current, sessions: current.sessions.map((item) => (item.id === session.id ? session : item)).sort((a, b) => a.finishedAt.localeCompare(b.finishedAt)) }));

  const deleteSession = (sessionId: string) =>
    setData((current) => ({ ...current, sessions: current.sessions.filter((item) => item.id !== sessionId) }));

  const cancelWorkout = () => {
    if (!data.activeSession) return;
    const hasRecordedWork = data.activeSession.exercises.some((exercise) => exercise.sets.some((set) => set.complete || set.weightKg || set.reps || set.toFailure));
    const message = hasRecordedWork
      ? "¿Cancelar la sesión y descartar las series registradas hoy? Tus sesiones anteriores no cambiarán."
      : "¿Cancelar esta sesión? No se guardará en tu historial.";
    if (confirmAction(message)) setData((current) => ({ ...current, activeSession: null }));
  };

  const addMeasurement = (area: string, value: number) =>
    setData((current) => ({ ...current, measurements: [...current.measurements, { id: makeId(), area, value, unit: "cm", recordedAt: new Date().toISOString() }] }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exorfitness-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStorageMessage("Respaldo descargado.");
  };

  /** Devuelve el mensaje para mostrar al usuario, o null si canceló la importación. */
  const importData = async (file: File): Promise<string | null> => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const list: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
      const external = list.filter(isExternalWorkout);
      if (external.length > 0 && external.length === list.length) {
        const sessions = external.map((workout) => sessionFromExternal(workout, data.days));
        const ids = new Set(sessions.map((item) => item.id));
        setData((current) => ({ ...current, sessions: [...current.sessions.filter((item) => !ids.has(item.id)), ...sessions].sort((x, y) => x.finishedAt.localeCompare(y.finishedAt)) }));
        return sessions.length === 1 ? "Sesión importada y añadida a tu historial." : `${sessions.length} sesiones importadas y añadidas a tu historial.`;
      }
      if (!isAppData(parsed)) throw new Error("Formato no válido");
      if (!confirmAction("Importar este respaldo reemplazará tus datos actuales en este dispositivo. ¿Continuar?")) return null;
      setData(normalizeData(parsed));
      return "Listo. Tus datos ya están en este navegador.";
    } catch {
      return "No pudimos abrir ese archivo. Elige un respaldo JSON de ExorFitness.";
    }
  };

  return {
    data, theme, hydrated, weekStart, storageMessage,
    toggleTheme, selectDay, addExercise, removeExercise,
    startWorkout, updateSet, addSet, setNotes, completeExercise, setExtraCardio, finishWorkout, updateSession, deleteSession, cancelWorkout,
    addMeasurement, exportData, importData,
  };
}
