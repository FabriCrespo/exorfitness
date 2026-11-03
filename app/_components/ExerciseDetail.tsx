"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ActiveExercise, LoggedExercise, RoutineExercise, SetEntry, WorkoutSession } from "../_lib/types";
import { daysAgo, formatDate, formatNumber, volumeOf } from "../_lib/workout-data";
import CardioProtocol from "./CardioProtocol";
import ExerciseTrendChart from "./ExerciseTrendChart";
import ScreenHeader from "./ScreenHeader";
import SetLogger from "./SetLogger";
import SetSavedFeedback from "./SetSavedFeedback";

const ExerciseModel3D = dynamic(() => import("./ExerciseModel3D"), { ssr: false, loading: () => <div className="exercise-model-3d" /> });

type Props = {
  exercise: RoutineExercise;
  activeExercise: ActiveExercise;
  previous?: LoggedExercise;
  previousWorkout?: WorkoutSession;
  sessions: WorkoutSession[];
  onBack: () => void;
  onUpdateSet: (setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: () => void;
  onAdjustWeight: (delta: number) => void;
  onSetNotes: (notes: string) => void;
  onComplete: () => void;
  onRemove: () => void;
};

const WEIGHT_STEPS = [-5, -2.5, 2.5, 5];
type DetailTab = "log" | "technique";

export default function ExerciseDetail({ exercise, activeExercise, previous, previousWorkout, sessions, onBack, onUpdateSet, onAddSet, onAdjustWeight, onSetNotes, onComplete, onRemove }: Props) {
  const [tab, setTab] = useState<DetailTab>("log");
  const isTimed = exercise.trackingMode === "minutes";
  const completedCount = activeExercise.sets.filter((set) => set.complete).length;
  const savedSets = isTimed ? [] : activeExercise.sets.filter((set) => set.complete).map((set) => ({
    weightKg: Number(set.weightKg) || 0,
    reps: Number(set.reps) || 0,
    toFailure: set.toFailure,
  }));
  const previousSummary = previous && (
    isTimed
      ? `${formatNumber(previous.sets.reduce((sum, set) => sum + (set.durationMinutes ?? 0), 0))} min`
      : `${formatNumber(volumeOf(previous.sets))} kg·reps`
  );

  return (
    <article className="page-content detail-screen" aria-labelledby="page-title">
      <ScreenHeader title={exercise.name} subtitle={exercise.equipment} onBack={onBack} />

      <ExerciseModel3D exerciseId={exercise.id} label={exercise.name} />

      <div className="segmented" role="tablist" aria-label="Secciones del ejercicio">
        <button role="tab" aria-selected={tab === "log"} className={tab === "log" ? "is-active" : ""} onClick={() => setTab("log")}>Registro</button>
        <button role="tab" aria-selected={tab === "technique"} className={tab === "technique" ? "is-active" : ""} onClick={() => setTab("technique")}>Técnica</button>
      </div>

      {tab === "log" ? (
        <>
          <section aria-labelledby="series-title" className="detail-section">
            <header className="section-row">
              <h2 id="series-title">{isTimed ? "Bloque" : `Series (${activeExercise.sets.length})`}</h2>
              <p>{isTimed ? exercise.targetReps : `Objetivo ${exercise.targetSets} × ${exercise.targetReps} · RIR 2–3`}</p>
            </header>
            {isTimed && <CardioProtocol />}
            {previousWorkout && previousSummary && (
              <p className="previous-line">
                Última vez · <time dateTime={previousWorkout.finishedAt}>{formatDate(previousWorkout.finishedAt, { day: "numeric", month: "short" })}</time> · {previousSummary}
                {daysAgo(previousWorkout.finishedAt) > 21 && " · hace más de 3 semanas"}
              </p>
            )}
            <SetLogger exercise={exercise} sets={activeExercise.sets} onUpdate={onUpdateSet} onAddSet={onAddSet} />
            {!isTimed && (
              <div className="weight-steps" role="group" aria-label="Ajustar el peso de las series pendientes">
                {WEIGHT_STEPS.map((step) => (
                  <button key={step} onClick={() => onAdjustWeight(step)}>{step > 0 ? `+${step}` : `−${Math.abs(step)}`}</button>
                ))}
              </div>
            )}
          </section>

          {!isTimed && (
            <section className="session-progress-wrap" aria-label="Tu progreso en este ejercicio">
              <ExerciseTrendChart sessions={sessions} exerciseId={exercise.id} metric="maxWeight" currentSets={savedSets} compact />
              <SetSavedFeedback completedCount={completedCount} targetSets={exercise.targetSets} />
            </section>
          )}

          <section aria-labelledby="notes-title" className="detail-section">
            <h2 id="notes-title">Notas</h2>
            <textarea className="notes-field" rows={3} value={activeExercise.notes ?? ""} onChange={(event) => onSetNotes(event.target.value)} placeholder="Cómo te sentiste, qué subir la próxima vez…" aria-labelledby="notes-title" />
          </section>
        </>
      ) : (
        <section className="detail-section technique" aria-label="Técnica">
          <h2>Cómo hacerlo</h2>
          <p>{exercise.cue}</p>
          <dl className="data-summary-list">
            <div><dt>Equipo</dt><dd><strong>{exercise.equipment}</strong></dd></div>
            <div><dt>Objetivo</dt><dd><strong>{isTimed ? exercise.targetReps : `${exercise.targetSets} × ${exercise.targetReps}`}</strong></dd></div>
            <div><dt>Esfuerzo</dt><dd><strong>Deja 2–3 repeticiones en reserva</strong></dd></div>
          </dl>
          <button className="quiet-button danger" onClick={onRemove}>Quitar de la rutina</button>
        </section>
      )}

      <footer className="action-bar">
        <button className="primary-button" onClick={onComplete}>✓ Completar ejercicio</button>
      </footer>
    </article>
  );
}
