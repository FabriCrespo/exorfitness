"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { muscleLabel } from "../_lib/muscles";
import type { SimilarItem } from "../_lib/similar";
import type { RoutineExercise, WorkoutSession } from "../_lib/types";
import { formatNumber } from "../_lib/workout-data";

type Props = {
  current: RoutineExercise;
  items: SimilarItem[];
  sessions: WorkoutSession[];
  /** El ejercicio actual ya tiene series guardadas que se descartarían. */
  hasDoneSets: boolean;
  /** En una sesión libre no se toca la rutina. */
  canChangeRoutine: boolean;
  onPick: (exercise: RoutineExercise, persist: boolean) => void;
  onClose: () => void;
};

function lastTime(sessions: WorkoutSession[], exerciseId: string) {
  for (const session of [...sessions].reverse()) {
    const found = session.exercises.find((item) => item.exerciseId === exerciseId);
    if (found?.sets.length) {
      const top = found.sets.reduce((best, set) => (set.weightKg >= best.weightKg ? set : best));
      return `Última vez · ${formatNumber(top.weightKg, 1)} kg × ${top.reps}`;
    }
  }
  return null;
}

export default function SimilarDialog({ current, items, sessions, hasDoneSets, canChangeRoutine, onPick, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [persist, setPersist] = useState(true);

  useEffect(() => { dialog.current?.showModal(); }, []);

  const closeOnBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) event.currentTarget.close();
  };

  const pick = (exercise: RoutineExercise) => {
    onPick(exercise, canChangeRoutine && persist);
    dialog.current?.close();
  };

  return (
    <dialog ref={dialog} className="exercise-modal similar-dialog" aria-labelledby="similar-title" onClose={onClose} onClick={closeOnBackdropClick}>
      <header className="modal-heading">
        <hgroup>
          <p className="date-line">Cambiar ejercicio</p>
          <h2 id="similar-title">Similares a {current.name}</h2>
        </hgroup>
        <button className="close-button" type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar">×</button>
      </header>

      {items.length === 0 ? (
        <p className="modal-hint">No tengo suficientes datos de este ejercicio para sugerir alternativas. Puedes añadir uno distinto desde el menú de la rutina.</p>
      ) : (
        <>
          {canChangeRoutine && (
            <label className="check-row">
              <input type="checkbox" checked={persist} onChange={(event) => setPersist(event.target.checked)} />
              <span>Cambiarlo también en mi rutina. Si no, solo cambia en esta sesión.</span>
            </label>
          )}
          {hasDoneSets && <p className="modal-hint">Las series ya guardadas de {current.name} en esta sesión se descartarán.</p>}
          <ul className="similar-list">
            {items.map(({ exercise, shared, fromRoutine }) => {
              const last = lastTime(sessions, exercise.id);
              return (
                <li key={exercise.id}>
                  <button type="button" onClick={() => pick(exercise)}>
                    <span className="similar-copy">
                      <strong>{exercise.name}</strong>
                      <small>{exercise.equipment}</small>
                      <small>Trabaja · {shared.map(muscleLabel).join(", ")}</small>
                      <small>{last ?? (fromRoutine ? "En tu rutina, sin registro aún" : "Nuevo para ti")}</small>
                    </span>
                    <i aria-hidden="true">›</i>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </dialog>
  );
}
