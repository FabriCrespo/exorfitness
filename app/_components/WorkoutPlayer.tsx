"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { ActiveExercise, LoggedExercise, RoutineExercise, SetEntry, WorkoutSession } from "../_lib/types";
import { musclesOf } from "../_lib/muscles";
import { suggestSets } from "../_lib/suggestions";
import { restSecondsFor, useElapsed } from "../_lib/use-elapsed";
import { daysAgo, formatDate, formatNumber, volumeOf } from "../_lib/workout-data";
import CardioProtocol from "./CardioProtocol";
import ExerciseTrendChart from "./ExerciseTrendChart";
import RestTimer from "./RestTimer";
import SimilarDialog from "./SimilarDialog";
import type { SimilarItem } from "../_lib/similar";
import ScreenHeader from "./ScreenHeader";

const ExerciseModel3D = dynamic(() => import("./ExerciseModel3D"), { ssr: false, loading: () => <div className="exercise-model-3d" /> });

type Props = {
  exercise: RoutineExercise;
  activeExercise: ActiveExercise;
  index: number;
  total: number;
  isLastExercise: boolean;
  startedAt: string;
  doneCount: number;
  previous?: LoggedExercise;
  similar: SimilarItem[];
  canChangeRoutine: boolean;
  onReplace: (next: RoutineExercise, persist: boolean) => void;
  previousWorkout?: WorkoutSession;
  sessions: WorkoutSession[];
  onBack: () => void;
  onUpdateSet: (setId: string, patch: Partial<SetEntry>) => void;
  onSaveSet: (setId: string) => void;
  onAddSet: () => void;
  onSetNotes: (notes: string) => void;
  onNext: () => void;
  onRemove: () => void;
};

type PlayerTab = "set" | "technique" | "notes";

type StepperProps = { label: string; value: string; unit: string; step: number; min?: number; onChange: (value: string) => void };

/** Campo numérico grande con botones − y +, pensado para usarse con el pulgar. */
function Stepper({ label, value, unit, step, min = 0, onChange }: StepperProps) {
  const adjust = (delta: number) => {
    const next = Math.max(min, (Number(value) || 0) + delta);
    onChange(String(Math.round(next * 100) / 100));
  };
  return (
    <label className="stepper">
      <span className="stepper-label">{label}</span>
      <span className="stepper-control">
        <button type="button" onClick={() => adjust(-step)} aria-label={`Restar ${step} ${unit}`}>−</button>
        <input type="number" inputMode="decimal" min={min} step={step} value={value} placeholder="0" onChange={(event) => onChange(event.target.value)} />
        <button type="button" onClick={() => adjust(step)} aria-label={`Sumar ${step} ${unit}`}>+</button>
      </span>
      <span className="stepper-unit">{unit}</span>
    </label>
  );
}

const describeSet = (set: SetEntry, isTimed: boolean) =>
  isTimed ? `${set.durationMinutes || 0} min` : `${set.weightKg || 0} kg × ${set.reps || 0}`;

export default function WorkoutPlayer({ exercise, activeExercise, index, total, isLastExercise, startedAt, doneCount, previous, similar, canChangeRoutine, onReplace, previousWorkout, sessions, onBack, onUpdateSet, onSaveSet, onAddSet, onSetNotes, onNext, onRemove }: Props) {
  const [tab, setTab] = useState<PlayerTab>("set");
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [showSimilar, setShowSimilar] = useState(false);
  const elapsed = useElapsed(startedAt);
  const endRest = useCallback(() => setRestSeconds(null), []);
  const isTimed = exercise.trackingMode === "minutes";
  const { sets } = activeExercise;
  const currentIndex = sets.findIndex((set) => !set.complete);
  const current = currentIndex >= 0 ? sets[currentIndex] : undefined;
  const upcoming = currentIndex >= 0 ? sets.slice(currentIndex + 1) : [];
  const finished = sets.filter((set) => set.complete);
  const canSave = current && (isTimed ? Number(current.durationMinutes) > 0 : current.weightKg !== "" && Number(current.reps) > 0);
  const previousSummary = previous && (isTimed
    ? `${formatNumber(previous.sets.reduce((sum, set) => sum + (set.durationMinutes ?? 0), 0))} min`
    : `${formatNumber(volumeOf(previous.sets))} kg·reps`);
  const handleSave = (setId: string) => {
    onSaveSet(setId);
    if (!isTimed && upcoming.length > 0) setRestSeconds(restSecondsFor(exercise.cue));
  };
  const { sets: suggested, reason } = suggestSets(exercise, previous?.sets, sets.length);
  const hint = !isTimed && currentIndex >= 0 ? suggested[currentIndex] : undefined;
  const hintApplied = hint && current && Number(current.weightKg) === hint.weightKg && Number(current.reps) === hint.reps;
  const savedSets = isTimed ? [] : finished.map((set) => ({ weightKg: Number(set.weightKg) || 0, reps: Number(set.reps) || 0, toFailure: set.toFailure }));

  return (
    <article className="page-content player" aria-labelledby="page-title">
      <ScreenHeader title={exercise.name} subtitle={`Ejercicio ${index + 1} de ${total} · ${elapsed}`} onBack={onBack} />
      <div className="session-bar" role="progressbar" aria-label="Ejercicios completados" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneCount}>
        <span style={{ width: `${(doneCount / Math.max(1, total)) * 100}%` }} />
      </div>

      <ExerciseModel3D exerciseId={exercise.id} label={exercise.name} muscles={musclesOf(exercise)} interactive />

      <div className="segmented" role="tablist" aria-label="Secciones del ejercicio">
        {([["set", "Serie"], ["technique", "Técnica"], ["notes", "Notas"]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "set" && (
        <>
          <ol className="set-dots" aria-label={`${finished.length} de ${sets.length} series hechas`}>
            {sets.map((set) => <li key={set.id} className={set.complete ? "is-done" : set.id === current?.id ? "is-current" : ""} />)}
          </ol>

          {current && restSeconds !== null ? (
            <RestTimer key={current.id} seconds={restSeconds} nextLabel={`Serie ${currentIndex + 1} · ${describeSet(current, isTimed)}`} onDone={endRest} />
          ) : current ? (
            <section className="current-set" aria-labelledby="current-set-title">
              <header>
                <h2 id="current-set-title">{isTimed ? "Bloque de cardio" : `Serie ${currentIndex + 1} de ${sets.length}`}</h2>
                <p>{isTimed ? exercise.targetReps : `Objetivo ${exercise.targetReps} · deja 2–3 en reserva`}</p>
              </header>
              {hint && (
                <p className="set-hint">
                  <span>Sugerido: <b>{hint.weightKg} kg × {hint.reps}</b><br />{reason}</span>
                  {!hintApplied && <button type="button" onClick={() => onUpdateSet(current.id, { weightKg: String(hint.weightKg), reps: String(hint.reps) })}>Usar</button>}
                </p>
              )}
              {isTimed ? (
                <Stepper label="Minutos" unit="min" step={5} min={0} value={current.durationMinutes ?? ""} onChange={(value) => onUpdateSet(current.id, { durationMinutes: value })} />
              ) : (
                <div className="stepper-pair">
                  <Stepper label="Peso" unit="kg" step={2.5} value={current.weightKg} onChange={(value) => onUpdateSet(current.id, { weightKg: value })} />
                  <Stepper label="Repeticiones" unit="reps" step={1} value={current.reps} onChange={(value) => onUpdateSet(current.id, { reps: value })} />
                </div>
              )}
              {!isTimed && (
                <label className="switch-row">
                  <span>Serie al fallo</span>
                  <input type="checkbox" role="switch" checked={current.toFailure} onChange={(event) => onUpdateSet(current.id, { toFailure: event.target.checked })} />
                </label>
              )}
              <button className="primary-button" disabled={!canSave} onClick={() => handleSave(current.id)}>
                {upcoming.length === 0 ? (isLastExercise ? "Guardar y terminar ejercicios" : "Guardar y pasar al siguiente") : "Guardar serie"}
              </button>
            </section>
          ) : (
            <section className="current-set is-complete" aria-label="Ejercicio completo">
              <h2>Ejercicio completo</h2>
              <p>Hiciste {finished.length} {finished.length === 1 ? "serie" : "series"}. Buen trabajo.</p>
              <button className="primary-button" onClick={onNext}>{isLastExercise ? "Ver resumen de la sesión" : "Siguiente ejercicio"}</button>
            </section>
          )}

          {upcoming.length > 0 && (
            <section aria-labelledby="next-title" className="list-section">
              <h2 id="next-title" className="list-title">Siguiente</h2>
              <ul className="grouped-list">
                {upcoming.map((set, offset) => (
                  <li key={set.id}><span>Serie {currentIndex + offset + 2}</span><b>{describeSet(set, isTimed)}</b></li>
                ))}
              </ul>
            </section>
          )}

          {finished.length > 0 && (
            <section aria-labelledby="done-title" className="list-section">
              <h2 id="done-title" className="list-title">Hechas</h2>
              <ul className="grouped-list">
                {sets.map((set, position) => set.complete && (
                  <li key={set.id}>
                    <span>Serie {position + 1}</span>
                    <b>{describeSet(set, isTimed)}{set.toFailure && " · fallo"}</b>
                    <button className="text-button" onClick={() => onUpdateSet(set.id, { complete: false })}>Editar</button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!isTimed && <button className="text-button block" onClick={onAddSet}>+ Añadir una serie extra</button>}
          {!isTimed && <button className="text-button block" onClick={() => setShowSimilar(true)}>¿Ocupado o no te convence? Ver similares</button>}

          {previousWorkout && previousSummary && (
            <p className="footnote">
              Última vez · <time dateTime={previousWorkout.finishedAt}>{formatDate(previousWorkout.finishedAt, { day: "numeric", month: "short" })}</time> · {previousSummary}
              {daysAgo(previousWorkout.finishedAt) > 21 && " · hace más de 3 semanas"}
            </p>
          )}
          {!isTimed && <ExerciseTrendChart sessions={sessions} exerciseId={exercise.id} metric="maxWeight" currentSets={savedSets} compact />}
        </>
      )}

      {tab === "technique" && (
        <section className="list-section" aria-label="Técnica">
          {isTimed && <CardioProtocol />}
          <p className="technique-text">{exercise.cue}</p>
          <ul className="grouped-list">
            <li><span>Equipo</span><b>{exercise.equipment}</b></li>
            <li><span>Objetivo</span><b>{isTimed ? exercise.targetReps : `${exercise.targetSets} × ${exercise.targetReps}`}</b></li>
            <li><span>Esfuerzo</span><b>2–3 repeticiones en reserva</b></li>
          </ul>
          {!isTimed && <button className="text-button block" onClick={() => setShowSimilar(true)}>Cambiar por un ejercicio similar</button>}
          <button className="text-button block danger" onClick={onRemove}>Quitar de la rutina</button>
        </section>
      )}

      {tab === "notes" && (
        <section className="list-section" aria-label="Notas">
          <textarea className="notes-field" rows={5} value={activeExercise.notes ?? ""} onChange={(event) => onSetNotes(event.target.value)} placeholder="Cómo te sentiste, qué subir la próxima vez…" aria-label="Notas del ejercicio" />
        </section>
      )}
      {showSimilar && (
        <SimilarDialog
          current={exercise}
          items={similar}
          sessions={sessions}
          hasDoneSets={finished.length > 0}
          canChangeRoutine={canChangeRoutine}
          onPick={onReplace}
          onClose={() => setShowSimilar(false)}
        />
      )}
    </article>
  );
}
