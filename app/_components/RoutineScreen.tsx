"use client";

import { useCallback, useState } from "react";
import { exercisePool, similarExercises } from "../_lib/similar";
import type { ActiveExercise, AppData, RoutineExercise, SetEntry } from "../_lib/types";
import type { WorkoutStats } from "../_lib/workout-stats";
import { DAY_ACCENTS, estimateMinutes, formatNumber } from "../_lib/workout-data";
import RoutineExerciseRow from "./RoutineExerciseRow";
import SessionIntro from "./SessionIntro";
import ScreenHeader from "./ScreenHeader";
import WorkoutPlayer from "./WorkoutPlayer";

type Props = {
  data: AppData;
  stats: WorkoutStats;
  onBack: () => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onStart: (date?: string) => void;
  onFinish: () => void;
  onCancel: () => void;
  onUpdateSet: (exerciseId: string, setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: (exerciseId: string) => void;
  onSetNotes: (exerciseId: string, notes: string) => void;
  onCompleteExercise: (exerciseId: string) => void;
  onSetExtraCardio: (minutes: string) => void;
  onReplaceExercise: (oldId: string, next: RoutineExercise, persist: boolean) => void;
};

const isExerciseDone = (exercise?: ActiveExercise) =>
  Boolean(exercise && (exercise.done || (exercise.sets.length > 0 && exercise.sets.every((set) => set.complete))));

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function RoutineScreen({ data, stats, onBack, onAddExercise, onRemoveExercise, onStart, onFinish, onCancel, onUpdateSet, onAddSet, onSetNotes, onCompleteExercise, onSetExtraCardio, onReplaceExercise }: Props) {
  const { selectedDay, activeSession, isCardioDay, newestFirst } = stats;
  const exercises = selectedDay.exercises;
  const total = exercises.length;

  // Si ya hay una sesión en curso (por ejemplo al volver a abrir la app), retoma en el primer ejercicio pendiente.
  const [showIntro, setShowIntro] = useState(false);
  const [sessionDate, setSessionDate] = useState(() => todayKey());
  const endIntro = useCallback(() => setShowIntro(false), []);
  const [openId, setOpenId] = useState<string | null>(() =>
    activeSession ? exercises.find((exercise) => !isExerciseDone(activeSession.exercises.find((item) => item.exerciseId === exercise.id)))?.id ?? null : null,
  );

  const lastLogged = (exerciseId: string) => {
    const workout = newestFirst.find((session) => session.exercises.some((exercise) => exercise.exerciseId === exerciseId));
    return { workout, exercise: workout?.exercises.find((item) => item.exerciseId === exerciseId) };
  };

  /** Abre el siguiente ejercicio sin terminar; si no queda ninguno, vuelve a la lista para cerrar la sesión. */
  const goToNextAfter = (exerciseId: string) => {
    const start = exercises.findIndex((exercise) => exercise.id === exerciseId);
    const ordered = [...exercises.slice(start + 1), ...exercises.slice(0, start)];
    const next = ordered.find((exercise) => !isExerciseDone(activeSession?.exercises.find((item) => item.exerciseId === exercise.id)));
    setOpenId(next?.id ?? null);
  };

  const saveSet = (exerciseId: string, setId: string) => {
    onUpdateSet(exerciseId, setId, { complete: true });
    navigator.vibrate?.(12);
    const active = activeSession?.exercises.find((item) => item.exerciseId === exerciseId);
    const pending = active?.sets.filter((set) => !set.complete && set.id !== setId).length ?? 0;
    if (pending === 0) {
      onCompleteExercise(exerciseId);
      goToNextAfter(exerciseId);
    }
  };

  const start = () => {
    onStart(sessionDate);
    setOpenId(exercises[0]?.id ?? null);
    setShowIntro(true);
  };

  const openDefinition = activeSession && openId ? exercises.find((exercise) => exercise.id === openId) : undefined;
  const openActive = activeSession?.exercises.find((exercise) => exercise.exerciseId === openId);

  if (activeSession && openDefinition && openActive) {
    const { workout, exercise } = lastLogged(openDefinition.id);
    const position = exercises.findIndex((item) => item.id === openDefinition.id);
    const othersPending = exercises.some((item) => item.id !== openDefinition.id && !isExerciseDone(activeSession?.exercises.find((entry) => entry.exerciseId === item.id)));
    const accentForIntro = DAY_ACCENTS[data.selectedDay] ?? DAY_ACCENTS[0];
    return (
      <>
        {showIntro && (
          <SessionIntro
            kanji={accentForIntro.kanji}
            label={accentForIntro.label}
            focus={selectedDay.focus}
            summary={`${total} ${total === 1 ? "ejercicio" : "ejercicios"} · ~${estimateMinutes(selectedDay)} min`}
            onDone={endIntro}
          />
        )}
      <WorkoutPlayer
        key={openDefinition.id}
        exercise={openDefinition}
        activeExercise={openActive}
        index={position}
        total={total}
        isLastExercise={!othersPending}
        startedAt={activeSession.startedAt}
        doneCount={activeSession.exercises.filter(isExerciseDone).length}
        previous={exercise}
        similar={similarExercises(openDefinition, exercisePool(data.days), new Set([...exercises.map((item) => item.id), ...(activeSession.extras ?? []).map((item) => item.id)]))}
        canChangeRoutine={!activeSession.custom}
        onReplace={(next, persist) => { onReplaceExercise(openDefinition.id, next, persist); setOpenId(next.id); }}
        previousWorkout={workout}
        sessions={data.sessions}
        onBack={() => setOpenId(null)}
        onUpdateSet={(setId, patch) => onUpdateSet(openDefinition.id, setId, patch)}
        onSaveSet={(setId) => saveSet(openDefinition.id, setId)}
        onAddSet={() => onAddSet(openDefinition.id)}
        onSetNotes={(notes) => onSetNotes(openDefinition.id, notes)}
        onNext={() => { onCompleteExercise(openDefinition.id); goToNextAfter(openDefinition.id); }}
        onRemove={() => { onRemoveExercise(openDefinition.id); setOpenId(null); }}
      />
      </>
    );
  }

  const accent = DAY_ACCENTS[data.selectedDay] ?? DAY_ACCENTS[0];
  const doneCount = activeSession ? activeSession.exercises.filter(isExerciseDone).length : 0;

  return (
    <article className="page-content routine-screen" aria-labelledby="page-title">
      <ScreenHeader
        title="Rutina del día"
        onBack={onBack}
        actions={
          <details className="more-menu">
            <summary aria-label="Más opciones">⋯</summary>
            <menu>
              <li><button onClick={onAddExercise}>Añadir ejercicio</button></li>
              {activeSession && <li><button className="danger" onClick={onCancel}>Cancelar sesión</button></li>}
            </menu>
          </details>
        }
      />

      <section className="day-banner has-sun has-waves" aria-label={selectedDay.focus}>
        <p className="day-kanji" aria-hidden="true"><b>{accent.kanji}</b><small>{accent.label}</small></p>
        <div className="day-banner-copy">
          <h2>{selectedDay.focus}</h2>
          <p>{total} {total === 1 ? "ejercicio" : "ejercicios"} · ~{estimateMinutes(selectedDay)} min</p>
          {activeSession && <p className="day-progress">{doneCount} de {total} hechos</p>}
        </div>
      </section>

      {total === 0 ? (
        <p className="empty-state">Este día aún no tiene ejercicios.</p>
      ) : (
        <ol className="grouped-list routine-list">
          {exercises.map((exercise, index) => {
            const active = activeSession?.exercises.find((item) => item.exerciseId === exercise.id);
            const status = activeSession && active ? (isExerciseDone(active) ? "done" : "pending") : null;
            return <RoutineExerciseRow key={`${exercise.id}-${index}`} exercise={exercise} index={index} status={status} onOpen={() => setOpenId(exercise.id)} />;
          })}
        </ol>
      )}

      {!activeSession && total > 0 && (
        <label className="card session-date">
          <span>¿Cuándo lo hiciste?<small>Cambia la fecha si lo vas a registrar de otro día.</small></span>
          <input type="date" value={sessionDate} max={todayKey()} onChange={(event) => setSessionDate(event.target.value || todayKey())} />
        </label>
      )}

      {activeSession && !isCardioDay && (
        <section className="card extra-cardio" aria-labelledby="extra-cardio-title">
          <header>
            <h2 id="extra-cardio-title" className="list-title">Cardio al final</h2>
            <p>Opcional. Suma los minutos que hiciste después de entrenar.</p>
          </header>
          <div className="extra-cardio-controls">
            <div className="extra-cardio-chips" role="group" aria-label="Minutos de cardio">
              {[10, 15, 20, 30].map((minutes) => {
                const active = activeSession.extraCardioMinutes === String(minutes);
                return <button key={minutes} type="button" className={active ? "is-active" : undefined} aria-pressed={active} onClick={() => onSetExtraCardio(active ? "" : String(minutes))}>{minutes}</button>;
              })}
            </div>
            <label className="extra-cardio-input">
              <input type="number" inputMode="numeric" min="0" max="240" placeholder="0" value={activeSession.extraCardioMinutes ?? ""} onChange={(event) => onSetExtraCardio(event.target.value)} aria-label="Minutos de cardio" />
              <span>min</span>
            </label>
          </div>
        </section>
      )}

      <footer className="action-bar">
        {activeSession ? (
          <>
            <p className="action-summary">
              <span>{isCardioDay ? "Tiempo registrado" : "Series guardadas"}</span>
              <strong>{isCardioDay ? `${formatNumber(stats.activeMinutes)} min` : `${stats.completedSets} · ${formatNumber(stats.activeVolume)} kg·reps`}</strong>
            </p>
            <button className="primary-button" disabled={stats.completedSets === 0} onClick={onFinish}>Terminar sesión</button>
          </>
        ) : (
          <button className="primary-button" disabled={total === 0} onClick={start}>Iniciar entrenamiento</button>
        )}
      </footer>
    </article>
  );
}
