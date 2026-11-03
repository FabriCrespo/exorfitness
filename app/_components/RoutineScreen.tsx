"use client";

import { useState } from "react";
import type { ActiveExercise, AppData, SetEntry } from "../_lib/types";
import type { WorkoutStats } from "../_lib/workout-stats";
import { estimateMinutes, formatNumber } from "../_lib/workout-data";
import ExerciseDetail from "./ExerciseDetail";
import RoutineExerciseRow from "./RoutineExerciseRow";
import ScreenHeader from "./ScreenHeader";

type Props = {
  data: AppData;
  stats: WorkoutStats;
  onBack: () => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onUpdateSet: (exerciseId: string, setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: (exerciseId: string) => void;
  onAdjustWeight: (exerciseId: string, delta: number) => void;
  onSetNotes: (exerciseId: string, notes: string) => void;
  onCompleteExercise: (exerciseId: string) => void;
};

const isExerciseDone = (exercise?: ActiveExercise) =>
  Boolean(exercise && (exercise.done || (exercise.sets.length > 0 && exercise.sets.every((set) => set.complete))));

export default function RoutineScreen({ data, stats, onBack, onAddExercise, onRemoveExercise, onStart, onFinish, onCancel, onUpdateSet, onAddSet, onAdjustWeight, onSetNotes, onCompleteExercise }: Props) {
  const { selectedDay, activeSession, isCardioDay, newestFirst } = stats;
  const [openId, setOpenId] = useState<string | null>(null);

  const lastLogged = (exerciseId: string) => {
    const workout = newestFirst.find((session) => session.exercises.some((exercise) => exercise.exerciseId === exerciseId));
    return { workout, exercise: workout?.exercises.find((item) => item.exerciseId === exerciseId) };
  };

  const openDefinition = activeSession && openId ? selectedDay.exercises.find((exercise) => exercise.id === openId) : undefined;
  const openActive = activeSession?.exercises.find((exercise) => exercise.exerciseId === openId);

  if (openDefinition && openActive) {
    const { workout, exercise } = lastLogged(openDefinition.id);
    return (
      <ExerciseDetail
        key={openDefinition.id}
        exercise={openDefinition}
        activeExercise={openActive}
        previous={exercise}
        previousWorkout={workout}
        sessions={data.sessions}
        onBack={() => setOpenId(null)}
        onUpdateSet={(setId, patch) => onUpdateSet(openDefinition.id, setId, patch)}
        onAddSet={() => onAddSet(openDefinition.id)}
        onAdjustWeight={(delta) => onAdjustWeight(openDefinition.id, delta)}
        onSetNotes={(notes) => onSetNotes(openDefinition.id, notes)}
        onComplete={() => { onCompleteExercise(openDefinition.id); setOpenId(null); }}
        onRemove={() => { onRemoveExercise(openDefinition.id); setOpenId(null); }}
      />
    );
  }

  const doneCount = activeSession ? activeSession.exercises.filter(isExerciseDone).length : 0;
  const total = selectedDay.exercises.length;

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

      <section className="day-banner" aria-label={selectedDay.focus}>
        <p className="date-line">{selectedDay.label.toUpperCase()}</p>
        <h2>{selectedDay.focus}</h2>
        <p>{total} {total === 1 ? "ejercicio" : "ejercicios"} · ~{estimateMinutes(selectedDay)} min{activeSession && ` · ${doneCount}/${total} hechos`}</p>
      </section>

      {total === 0 ? (
        <p className="empty-state">Este día aún no tiene ejercicios.</p>
      ) : (
        <ol className="routine-list">
          {selectedDay.exercises.map((exercise, index) => {
            const active = activeSession?.exercises.find((item) => item.exerciseId === exercise.id);
            const status = activeSession && active ? (isExerciseDone(active) ? "done" : "pending") : null;
            return <RoutineExerciseRow key={`${exercise.id}-${index}`} exercise={exercise} index={index} status={status} onOpen={() => setOpenId(exercise.id)} />;
          })}
        </ol>
      )}

      {!activeSession && total > 0 && !isCardioDay && !data.sessions.length && (
        <p className="reference-caption">Usa las series y repeticiones como guía. Ajusta el peso a cómo te sientes hoy y deja 2–3 repeticiones en reserva.</p>
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
          <button className="primary-button" disabled={total === 0} onClick={onStart}>▶ Iniciar entrenamiento</button>
        )}
      </footer>
    </article>
  );
}
