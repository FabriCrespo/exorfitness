"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import AppHeader from "./_components/AppHeader";
import AppNavigation from "./_components/AppNavigation";
import DataScreen from "./_components/DataScreen";
import ExerciseDialog from "./_components/ExerciseDialog";
import ExerciseSessionCard from "./_components/ExerciseSessionCard";
import ProgressScreen from "./_components/ProgressScreen";
import RoutineExerciseRow from "./_components/RoutineExerciseRow";
import WeekSelector from "./_components/WeekSelector";
import type { ActiveSession, AppData, LoggedExercise, Measurement, SetEntry, Tab } from "./_lib/types";
import { blankSets, CHEST_ROUTINE, currentDayIndex, defaultData, EXERCISE_ANIMATIONS, formatDate, formatNumber, isAppData, makeId, normalizeData, planExercise, startOfLocalWeek, STORAGE_KEY, THEME_KEY, volumeOf } from "./_lib/workout-data";
export default function Home() {
  const [data, setData] = useState<AppData>(defaultData);
  const [tab, setTab] = useState<Tab>("routine");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [storageMessage, setStorageMessage] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseEquipment, setExerciseEquipment] = useState("");
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [measurementArea, setMeasurementArea] = useState("");
  const [measurementValue, setMeasurementValue] = useState("");
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedTheme = window.localStorage.getItem(THEME_KEY);
        const initialTheme = savedTheme === "dark" ? "dark" : "light";
        setTheme(initialTheme);
        document.documentElement.dataset.theme = initialTheme;
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (isAppData(parsed)) setData(normalizeData(parsed));
        } else setData((current) => ({ ...current, selectedDay: currentDayIndex() }));
      } catch {
        setStorageMessage("No se pudo leer el registro guardado.");
      }
      setWeekStart(startOfLocalWeek());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setStorageMessage("Guardado en este dispositivo.");
      } catch {
        setStorageMessage("No se pudo guardar. Descarga un respaldo JSON.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data, hydrated]);

  const selectedDay = data.days[data.selectedDay] ?? data.days[0];
  const activeForDay = data.activeSession?.dayIndex === data.selectedDay ? data.activeSession : null;
  const daySessions = [...data.sessions].reverse().filter((session) => session.dayIndex === data.selectedDay);
  const lastDaySession = daySessions[0];
  const previousDaySession = daySessions[1];
  const activeVolume = activeForDay?.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.complete).reduce((subtotal, set) => subtotal + (Number(set.weightKg) || 0) * (Number(set.reps) || 0), 0), 0) ?? 0;
  const cardioDay = selectedDay.exercises.some((exercise) => exercise.trackingMode === "minutes");
  const activeCardioMinutes = activeForDay?.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.complete).reduce((subtotal, set) => subtotal + (Number(set.durationMinutes) || 0), 0), 0) ?? 0;
  const dayVolume = activeForDay ? activeVolume : lastDaySession?.volume ?? 0;
  const dayCardioMinutes = activeForDay ? activeCardioMinutes : lastDaySession?.cardioMinutes ?? 0;
  const activeSetCount = activeForDay?.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.complete).length, 0) ?? 0;
  const lastSetCount = lastDaySession?.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0) ?? 0;
  const completedSets = activeForDay ? activeSetCount : lastSetCount;
  const comparableVolume = activeForDay ? activeForDay.exercises.reduce((total, activeExercise) => {
    const lastExercise = [...data.sessions].reverse().flatMap((session) => session.exercises).find((exercise) => exercise.exerciseId === activeExercise.exerciseId);
    return total + activeExercise.sets.reduce((sum, set, index) => {
      const previousSet = lastExercise?.sets[index];
      return set.complete && previousSet ? sum + previousSet.weightKg * previousSet.reps : sum;
    }, 0);
  }, 0) : null;
  const comparison = cardioDay
    ? null
    : activeForDay && comparableVolume !== null && completedSets > 0
      ? activeVolume - comparableVolume
      : !activeForDay && lastDaySession && previousDaySession
        ? lastDaySession.volume - previousDaySession.volume
        : null;
  const allTimeVolume = data.sessions.reduce((sum, session) => sum + session.volume, 0);
  const allTimeCardioMinutes = data.sessions.reduce((sum, session) => sum + (session.cardioMinutes ?? 0), 0);
  const latestSessions = [...data.sessions].reverse();
  const recentSessions = latestSessions.filter((session) => session.volume > 0).slice(0, 6);
  const maxVolume = Math.max(1, ...recentSessions.map((session) => session.volume));
  const sessionsThisWeek = weekStart ? data.sessions.filter((session) => new Date(session.finishedAt) >= weekStart) : [];
  const trainingDayCount = data.days.filter((day) => !day.flexible).length;
  const fixedDaysDone = data.days.filter((day, index) => !day.flexible && sessionsThisWeek.some((session) => session.dayIndex === index)).length;
  const missingFixedDay = data.days.findIndex((day, index) => !day.flexible && !sessionsThisWeek.some((session) => session.dayIndex === index));
  const chestDoneThisWeek = sessionsThisWeek.some((session) => session.exercises.some((exercise) => exercise.group === "pecho"));
  const flexSource = missingFixedDay >= 0
    ? { day: data.days[missingFixedDay], dayIndex: missingFixedDay, reason: `No aparece una sesión del ${data.days[missingFixedDay].label.toLowerCase()} en tu registro de esta semana.` }
    : !chestDoneThisWeek
      ? { day: { label: "Pecho", short: "", focus: "Pecho", flexible: true, exercises: CHEST_ROUTINE }, dayIndex: -1, reason: "Pecho forma parte de tu rutina y aún no aparece en tu registro de esta semana." }
      : null;
  const measurementsByArea = useMemo(() => {
    const grouped = new Map<string, Measurement[]>();
    for (const item of [...data.measurements].reverse()) {
      const list = grouped.get(item.area) ?? [];
      list.push(item);
      grouped.set(item.area, list);
    }
    return Array.from(grouped.entries());
  }, [data.measurements]);

  function changeData(update: (current: AppData) => AppData) {
    setData((current) => update(current));
  }

  function selectDay(index: number) {
    if (data.activeSession && data.activeSession.dayIndex !== index) {
      setStorageMessage("Termina la sesión abierta antes de cambiar de día.");
      return;
    }
    changeData((current) => ({ ...current, selectedDay: index }));
  }

  function addExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = exerciseName.trim();
    if (!name || !selectedDay) return;
    const exercise = planExercise(makeId(), name, exerciseEquipment.trim() || "Por elegir", 3, "8–12", "Anota una pista que te ayude a repetir el movimiento.");
    changeData((current) => ({
      ...current,
      days: current.days.map((day, index) => index === current.selectedDay ? { ...day, exercises: [...day.exercises, exercise] } : day),
      activeSession: current.activeSession?.dayIndex === current.selectedDay
        ? { ...current.activeSession, exercises: [...current.activeSession.exercises, { exerciseId: exercise.id, sets: [] }] }
        : current.activeSession,
    }));
    setExerciseName("");
    setExerciseEquipment("");
    setShowExerciseForm(false);
  }

  function removeExercise(exerciseId: string) {
    const exercise = selectedDay.exercises.find((item) => item.id === exerciseId);
    if (!exercise || !window.confirm(`¿Quitar “${exercise.name}” de ${selectedDay.label}?`)) return;
    changeData((current) => ({
      ...current,
      days: current.days.map((day, index) => index === current.selectedDay ? { ...day, exercises: day.exercises.filter((item) => item.id !== exerciseId) } : day),
      activeSession: current.activeSession?.dayIndex === current.selectedDay
        ? { ...current.activeSession, exercises: current.activeSession.exercises.filter((item) => item.exerciseId !== exerciseId) }
        : current.activeSession,
    }));
  }

  function applyFlexRoutine() {
    if (!selectedDay.flexible || !flexSource) return;
    if (selectedDay.exercises.length && !window.confirm(`¿Reemplazar la rutina flexible del ${selectedDay.label.toLowerCase()}?`)) return;
    changeData((current) => ({
      ...current,
      days: current.days.map((day, index) => index === current.selectedDay ? { ...day, focus: flexSource.day.focus, exercises: flexSource.day.exercises } : day),
    }));
  }

  function startWorkout() {
    if (data.activeSession || !selectedDay?.exercises.length) return;
    const session: ActiveSession = {
      id: makeId(), dayIndex: data.selectedDay, startedAt: new Date().toISOString(),
      exercises: selectedDay.exercises.map((exercise) => {
        return { exerciseId: exercise.id, sets: exercise.trackingMode === "minutes" ? blankSets(1) : [] };
      }),
    };
    changeData((current) => ({ ...current, activeSession: session }));
  }

  function updateSet(exerciseId: string, setId: string, patch: Partial<SetEntry>) {
    changeData((current) => ({
      ...current,
      activeSession: current.activeSession ? {
        ...current.activeSession,
        exercises: current.activeSession.exercises.map((exercise) => exercise.exerciseId !== exerciseId ? exercise : {
          ...exercise,
          sets: exercise.sets.map((set) => set.id === setId ? { ...set, ...patch } : set),
        }),
      } : null,
    }));
  }

  function addSet(exerciseId: string) {
    changeData((current) => ({
      ...current,
      activeSession: current.activeSession ? {
        ...current.activeSession,
        exercises: current.activeSession.exercises.map((exercise) => exercise.exerciseId === exerciseId ? { ...exercise, sets: [...exercise.sets, ...blankSets(1)] } : exercise),
      } : null,
    }));
  }

  function finishWorkout() {
    const session = data.activeSession;
    if (!session || completedSets === 0) return;
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
    const volume = exercises.reduce((total, exercise) => total + volumeOf(exercise.sets), 0);
    changeData((current) => ({
      ...current,
      sessions: [...current.sessions, {
        id: session.id,
        dayIndex: session.dayIndex,
        startedAt: session.startedAt,
        finishedAt: new Date().toISOString(),
        exercises,
        volume,
        cardioMinutes: exercises.flatMap((exercise) => exercise.sets).reduce((total, set) => total + (set.durationMinutes ?? 0), 0),
      }],
      activeSession: null,
    }));
  }

  function cancelWorkout() {
    if (!data.activeSession) return;
    const hasRecordedWork = data.activeSession.exercises.some((exercise) => exercise.sets.some((set) => set.complete || set.weightKg || set.reps || set.toFailure));
    const message = hasRecordedWork
      ? "¿Cancelar la sesión y descartar las series registradas hoy? Tus sesiones anteriores no cambiarán."
      : "¿Cancelar esta sesión? No se guardará en tu historial.";
    if (!window.confirm(message)) return;
    changeData((current) => ({ ...current, activeSession: null }));
  }

  function addMeasurement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const area = measurementArea.trim();
    const value = Number(measurementValue);
    if (!area || !Number.isFinite(value) || value <= 0) return;
    changeData((current) => ({ ...current, measurements: [...current.measurements, { id: makeId(), area, value, unit: "cm", recordedAt: new Date().toISOString() }] }));
    setMeasurementArea("");
    setMeasurementValue("");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `exorfitness-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStorageMessage("Respaldo descargado.");
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportMessage("");
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isAppData(parsed)) throw new Error("Formato no válido");
      if (!window.confirm("Importar este respaldo reemplazará tus datos actuales en este dispositivo. ¿Continuar?")) return;
      setData(normalizeData(parsed));
      setImportMessage("Listo. Tus datos ya están en este navegador.");
    } catch {
      setImportMessage("No pudimos abrir ese archivo. Elige un respaldo JSON de ExorFitness.");
    } finally {
      event.target.value = "";
    }
  }

  if (!hydrated) return <main className="loading-screen"><div className="wordmark">exor<span>fitness</span></div><p>Abriendo tu rutina</p></main>;

  const lastSessionForExercise = (exerciseId: string) => [...data.sessions].reverse().flatMap((session) => session.exercises).find((exercise) => exercise.exerciseId === exerciseId);
  const lastWorkoutForExercise = (exerciseId: string) => [...data.sessions].reverse().find((session) => session.exercises.some((exercise) => exercise.exerciseId === exerciseId));
  const dayCompletedThisWeek = (index: number) => sessionsThisWeek.some((session) => session.dayIndex === index);
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_KEY, nextTheme);
  };

  return <main className="app-frame mx-auto min-h-screen w-full max-w-[1280px] px-4 pb-28 md:px-10 md:pb-12 lg:px-[60px]">
    <AppHeader theme={theme} storageMessage={storageMessage} onHome={() => setTab("routine")} onToggleTheme={toggleTheme} />
    <div className="desktop-nav-wrap"><AppNavigation tab={tab} onChange={setTab} /></div>

    {tab === "routine" && <section className="page-content" aria-labelledby="page-title">
      <WeekSelector days={data.days} selectedIndex={data.selectedDay} completedCount={fixedDaysDone} isComplete={dayCompletedThisWeek} onSelect={selectDay} />
      <div className="content-heading">
        <div><p className="date-line">{selectedDay.label} · {selectedDay.flexible ? "elige tu foco" : "tu plan"}</p><h1 id="page-title">{activeForDay ? "Sesión en curso" : selectedDay.focus}</h1></div>
        {activeForDay && <span className="live-pill"><i />En curso</span>}
      </div>

      {!activeForDay && !selectedDay.flexible && <div className="return-note">
        <p>{cardioDay ? "Mantén el tramo vivo exigente pero controlado: deberías poder hablar en frases cortas. Ajusta las rondas según cómo te sientas." : selectedDay.focus === "Full body" ? "Al volver después de la pausa, usa cargas cómodas y deja 2–3 repeticiones en reserva. Si te recuperas bien durante un par de semanas, subimos poco a poco." : data.sessions.length ? "Usa el último registro como referencia y ajusta el peso a cómo te sientes hoy." : "Primera sesión después de la pausa. Registra cómo te sientes hoy; ese será tu nuevo punto de referencia."}</p>
      </div>}

      {selectedDay.flexible && !activeForDay && <section className="flex-day-panel">
        {selectedDay.exercises.length === 0 ? <>
          <p className="date-line">VIERNES Y SÁBADO SON TUYOS</p>
          <h2>{flexSource ? `Una idea para ${selectedDay.label.toLowerCase()}` : "Esta semana está al día"}</h2>
          <p className="flex-reason">{flexSource?.reason ?? "Tus cuatro días fijos ya tienen registro. Puedes repetir un foco o tomarte el día libre."}</p>
          {flexSource && <div className="suggested-focus"><div><span>PROPUESTA</span><strong>{flexSource.day.focus}</strong><small>{flexSource.day.exercises.map((exercise) => exercise.name).slice(0, 3).join(" · ")}</small></div><button className="primary-button" onClick={applyFlexRoutine}>Usar esta rutina</button></div>}
        </> : <><p className="date-line">RUTINA FLEXIBLE</p><h2>{selectedDay.focus}</h2><p className="flex-reason">Puedes cambiar estos ejercicios antes de empezar.</p></>}
      </section>}

      {!activeForDay && selectedDay.exercises.length > 0 && <>
        <div className="section-bar"><div><h2>Lo que toca</h2><p>{cardioDay ? "Anota los minutos que completes." : "El peso real lo apuntas durante la sesión."}</p></div><button className="quiet-button" onClick={() => setShowExerciseForm(true)}>+ Añadir</button></div>
        <div className="routine-list">{selectedDay.exercises.map((exercise, index) => <RoutineExerciseRow key={`${exercise.id}-${index}`} exercise={exercise} index={index} onRemove={removeExercise} animation={EXERCISE_ANIMATIONS[exercise.id]} />)}</div>
        {selectedDay.exercises.some((exercise) => EXERCISE_ANIMATIONS[exercise.id]) && <p className="animation-note">Demostraciones animadas creadas para ExorFitness.</p>}
        {!selectedDay.flexible && !data.sessions.length && <p className="reference-caption">{cardioDay ? "Haz el bloque vivo a un ritmo exigente pero controlado, sin sprints." : "Usa las series y repeticiones como guía inicial. Ajusta el peso a cómo te sientes hoy."}</p>}
        <button className="primary-button start-button" onClick={startWorkout}>Empezar sesión <span>{selectedDay.exercises.length} ejercicios</span></button>
      </>}

      {activeForDay && <>
        <div className="session-toolbar"><div><p>{selectedDay.label} · empezaste {new Date(activeForDay.startedAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}</p><span>{data.sessions.length ? "Si repites un ejercicio, verás tu último registro como referencia." : "Anota lo que hagas hoy; esta sesión será tu primera referencia."}</span></div><div className="session-actions"><button className="quiet-button" onClick={() => setShowExerciseForm(true)}>+ Ejercicio</button><button className="cancel-session-button" onClick={cancelWorkout} aria-label="Cancelar y descartar esta sesión">Cancelar</button></div></div>
        <div className="exercise-stack">{activeForDay.exercises.map((activeExercise, exerciseIndex) => {
          const definition = selectedDay.exercises.find((exercise) => exercise.id === activeExercise.exerciseId);
          if (!definition) return null;
          return <ExerciseSessionCard key={`${definition.id}-${exerciseIndex}`} exercise={definition} activeExercise={activeExercise} index={exerciseIndex} previous={lastSessionForExercise(definition.id)} previousWorkout={lastWorkoutForExercise(definition.id)} animation={EXERCISE_ANIMATIONS[definition.id]} onUpdateSet={updateSet} onAddSet={addSet} />;
        })}</div>
        {activeForDay.exercises.length === 0 && <div className="empty-inline"><p>Agrega el primer ejercicio de la sesión.</p><button className="quiet-button" onClick={() => setShowExerciseForm(true)}>+ Añadir ejercicio</button></div>}
        <div className="finish-panel"><div><span>{cardioDay ? "Tiempo registrado" : "Series guardadas"}</span><strong>{cardioDay ? <>{formatNumber(activeCardioMinutes)} <small>min de cardio</small></> : <>{completedSets} <small>· {formatNumber(activeVolume)} kg·reps</small></>}</strong></div><button className="finish-button" disabled={completedSets === 0} onClick={finishWorkout}>Terminar sesión</button></div>
      </>}

      <aside className="workout-aside">
        <div className="volume-panel"><div className="volume-panel-head"><span>{activeForDay || !lastDaySession ? "Hoy" : "Última sesión"}</span>{comparison !== null && <span className={comparison >= 0 ? "compare-up" : "compare-down"}>{comparison > 0 ? "+" : ""}{formatNumber(comparison)} vs. anterior</span>}</div><strong>{formatNumber(cardioDay ? dayCardioMinutes : dayVolume)}<small>{cardioDay ? "min" : "kg·reps"}</small></strong><p>{cardioDay ? "de cardio registrado" : `${completedSets} ${completedSets === 1 ? "serie registrada" : "series registradas"}`}</p></div>
        <div className="recent-panel"><div className="recent-heading"><h2>Sesiones recientes</h2><button onClick={() => setTab("progress")}>Abrir historial</button></div>{latestSessions.length === 0 ? <p className="recent-empty">Cuando termines una sesión, quedará aquí.</p> : <div className="recent-list">{latestSessions.slice(0, 3).map((session) => <div className="recent-row" key={session.id}><span>{formatDate(session.finishedAt)}</span><strong>{data.days[session.dayIndex]?.focus ?? "Sesión"}</strong><b>{session.cardioMinutes ? `${formatNumber(session.cardioMinutes)} min` : `${formatNumber(session.volume)} kg·reps`}</b></div>)}</div>}</div>
      </aside>
    </section>}

    {tab === "progress" && <ProgressScreen sessions={data.sessions} days={data.days} recentSessions={recentSessions} maxVolume={maxVolume} allTimeVolume={allTimeVolume} allTimeCardioMinutes={allTimeCardioMinutes} fixedDaysDone={fixedDaysDone} trainingDayCount={trainingDayCount} measurementsByArea={measurementsByArea} measurementArea={measurementArea} measurementValue={measurementValue} onAreaChange={setMeasurementArea} onValueChange={setMeasurementValue} onAddMeasurement={addMeasurement} />}
    {tab === "data" && <DataScreen days={data.days} sessions={data.sessions} measurements={data.measurements} storageMessage={storageMessage} importMessage={importMessage} onExport={exportData} onImport={importData} />}
    <AppNavigation tab={tab} onChange={setTab} />
    {showExerciseForm && <ExerciseDialog dayLabel={selectedDay.label} name={exerciseName} equipment={exerciseEquipment} onNameChange={setExerciseName} onEquipmentChange={setExerciseEquipment} onClose={() => setShowExerciseForm(false)} onSubmit={addExercise} />}
    <div className="sr-only" aria-live="polite">{storageMessage}</div>
  </main>;
}
