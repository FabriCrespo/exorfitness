"use client";

import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import type { LoggedExercise, WorkoutSession } from "../_lib/types";
import { volumeOf } from "../_lib/workout-data";

type Props = {
  session: WorkoutSession;
  dayTitle: string;
  onClose: () => void;
  onSave: (session: WorkoutSession) => void;
  onDelete: (sessionId: string) => void;
};

type DraftSet = { weightKg: string; reps: string; durationMinutes: string; toFailure: boolean; timed: boolean };

const EXTRA_CARDIO_ID = "cardio-extra";
const localDate = (iso: string) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function SessionEditor({ session, dayTitle, onClose, onSave, onDelete }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const strength = session.exercises.filter((exercise) => exercise.exerciseId !== EXTRA_CARDIO_ID);
  const extra = session.exercises.find((exercise) => exercise.exerciseId === EXTRA_CARDIO_ID);

  const [date, setDate] = useState(localDate(session.finishedAt));
  const [cardio, setCardio] = useState(String(extra?.sets.reduce((sum, set) => sum + (set.durationMinutes ?? 0), 0) || ""));
  const [drafts, setDrafts] = useState<DraftSet[][]>(() =>
    strength.map((exercise) => exercise.sets.map((set) => ({
      weightKg: String(set.weightKg), reps: String(set.reps), durationMinutes: String(set.durationMinutes ?? ""), toFailure: set.toFailure, timed: set.durationMinutes !== undefined,
    }))),
  );

  useEffect(() => { dialog.current?.showModal(); }, []);

  const closeOnBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) event.currentTarget.close();
  };

  const patch = (exerciseIndex: number, setIndex: number, change: Partial<DraftSet>) =>
    setDrafts((current) => current.map((sets, i) => (i !== exerciseIndex ? sets : sets.map((set, j) => (j === setIndex ? { ...set, ...change } : set)))));

  const removeSet = (exerciseIndex: number, setIndex: number) =>
    setDrafts((current) => current.map((sets, i) => (i !== exerciseIndex ? sets : sets.filter((_, j) => j !== setIndex))));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const exercises: LoggedExercise[] = strength.flatMap((exercise, index) => {
      const sets = drafts[index].flatMap((set) => {
        const minutes = Number(set.durationMinutes) || 0;
        if (set.timed) return minutes > 0 ? [{ weightKg: 0, reps: 0, durationMinutes: minutes, toFailure: false }] : [];
        const weightKg = Number(set.weightKg) || 0;
        const reps = Number(set.reps) || 0;
        return reps > 0 ? [{ weightKg, reps, toFailure: set.toFailure }] : [];
      });
      return sets.length ? [{ ...exercise, sets }] : [];
    });
    const extraMinutes = Number(cardio) || 0;
    if (extraMinutes > 0) exercises.push({ exerciseId: EXTRA_CARDIO_ID, name: "Cardio al final", group: "cardio", sets: [{ weightKg: 0, reps: 0, durationMinutes: extraMinutes, toFailure: false }] });
    if (exercises.length === 0) return;

    // Mantiene la hora original; solo cambia el día si lo editaste.
    const original = new Date(session.finishedAt);
    const [year, month, day] = date.split("-").map(Number);
    const finished = new Date(original);
    if (year) finished.setFullYear(year, month - 1, day);
    const shift = finished.getTime() - original.getTime();

    onSave({
      ...session,
      startedAt: new Date(new Date(session.startedAt).getTime() + shift).toISOString(),
      finishedAt: finished.toISOString(),
      exercises,
      volume: exercises.reduce((total, exercise) => total + volumeOf(exercise.sets), 0),
      cardioMinutes: exercises.flatMap((exercise) => exercise.sets).reduce((total, set) => total + (set.durationMinutes ?? 0), 0),
    });
    dialog.current?.close();
  };

  const remove = () => {
    if (!window.confirm("¿Borrar esta sesión del historial? No se puede deshacer.")) return;
    onDelete(session.id);
    dialog.current?.close();
  };

  return (
    <dialog ref={dialog} className="exercise-modal session-editor" aria-labelledby="session-editor-title" onClose={onClose} onClick={closeOnBackdropClick}>
      <header className="modal-heading">
        <hgroup>
          <p className="date-line">Editar sesión</p>
          <h2 id="session-editor-title">{dayTitle}</h2>
        </hgroup>
        <button className="close-button" type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar">×</button>
      </header>

      <form onSubmit={submit}>
        <label className="field-label">Fecha
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>

        <fieldset className="editor-cardio">
          <legend>Cardio al final</legend>
          <label className="extra-cardio-input">
            <input type="number" inputMode="numeric" min="0" max="240" placeholder="0" value={cardio} onChange={(event) => setCardio(event.target.value)} aria-label="Minutos de cardio al final" />
            <span>min</span>
          </label>
          <span className="editor-chips" role="group" aria-label="Minutos rápidos">
            {[10, 15, 20, 30].map((minutes) => (
              <button key={minutes} type="button" className={cardio === String(minutes) ? "is-active" : undefined} onClick={() => setCardio(cardio === String(minutes) ? "" : String(minutes))}>{minutes}</button>
            ))}
          </span>
        </fieldset>

        {strength.map((exercise, exerciseIndex) => (
          <fieldset className="editor-exercise" key={`${exercise.exerciseId}-${exerciseIndex}`}>
            <legend>{exercise.name}</legend>
            {drafts[exerciseIndex].length === 0 && <p className="modal-hint">Sin series. Se quitará al guardar.</p>}
            {drafts[exerciseIndex].map((set, setIndex) => (
              <div className="editor-set" key={setIndex}>
                <span className="editor-set-number">{setIndex + 1}</span>
                {set.timed ? (
                  <label><input type="number" inputMode="numeric" min="0" value={set.durationMinutes} onChange={(event) => patch(exerciseIndex, setIndex, { durationMinutes: event.target.value })} aria-label={`Minutos de la serie ${setIndex + 1}`} /><small>min</small></label>
                ) : (
                  <>
                    <label><input type="number" inputMode="decimal" min="0" step="0.5" value={set.weightKg} onChange={(event) => patch(exerciseIndex, setIndex, { weightKg: event.target.value })} aria-label={`Peso de la serie ${setIndex + 1}`} /><small>kg</small></label>
                    <label><input type="number" inputMode="numeric" min="0" value={set.reps} onChange={(event) => patch(exerciseIndex, setIndex, { reps: event.target.value })} aria-label={`Repeticiones de la serie ${setIndex + 1}`} /><small>reps</small></label>
                  </>
                )}
                <button type="button" className="editor-remove" onClick={() => removeSet(exerciseIndex, setIndex)} aria-label={`Quitar serie ${setIndex + 1}`}>×</button>
              </div>
            ))}
          </fieldset>
        ))}

        <button className="primary-button" type="submit">Guardar cambios</button>
        <button className="danger editor-delete" type="button" onClick={remove}>Borrar sesión</button>
      </form>
    </dialog>
  );
}
