"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveSession, AppData, LoggedExercise, RoutineDay, SetEntry, Theme } from "./types";
import { blankSets, currentDayIndex, defaultData, isAppData, makeId, normalizeData, planExercise, startOfLocalWeek, STORAGE_KEY, THEME_KEY, volumeOf } from "./workout-data";

const BACKUP_KEY = `${STORAGE_KEY}:backup`;

const confirmAction = (message: string) => window.confirm(message);

/** Estado de la app: lectura y guardado en localStorage, tema y todas las acciones sobre la rutina. */
export function useWorkout() {
  const [data, setData] = useState<AppData>(defaultData);
  const [theme, setTheme] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [storageMessage, setStorageMessage] = useState("");
  const latestData = useRef(data);
  const canPersist = useRef(false);

  // Lectura inicial. Se difiere un tick para no hidratar con datos distintos a los del servidor.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedTheme = window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
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

  const applyFlexRoutine = (source: RoutineDay) => {
    const day = data.days[data.selectedDay];
    if (!day.flexible) return;
    if (day.exercises.length && !confirmAction(`¿Reemplazar la rutina flexible del ${day.label.toLowerCase()}?`)) return;
    setData((current) => ({
      ...current,
      days: current.days.map((item, index) => (index === current.selectedDay ? { ...item, focus: source.focus, exercises: source.exercises } : item)),
    }));
  };

  const startWorkout = () => {
    const day = data.days[data.selectedDay];
    if (data.activeSession || !day?.exercises.length) return;
    const session: ActiveSession = {
      id: makeId(),
      dayIndex: data.selectedDay,
      startedAt: new Date().toISOString(),
      exercises: day.exercises.map((exercise) => ({ exerciseId: exercise.id, sets: exercise.trackingMode === "minutes" ? blankSets(1) : [] })),
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
      return sets.length ? [{ exerciseId: definition.id, name: definition.name, group: definition.group, sets }] : [];
    });
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
    toggleTheme, selectDay, addExercise, removeExercise, applyFlexRoutine,
    startWorkout, updateSet, addSet, finishWorkout, cancelWorkout,
    addMeasurement, exportData, importData,
  };
}
