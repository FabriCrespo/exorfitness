"use client";

import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import type { RoutineExercise } from "../_lib/types";

export type ExerciseChoice = { name: string; equipment: string; source?: RoutineExercise; persist: boolean };

type Props = {
  dayLabel: string;
  /** Ejercicios que ya conoces (de cualquier día) para reutilizarlos y conservar su historial. */
  library: RoutineExercise[];
  sessionActive: boolean;
  onClose: () => void;
  onSubmit: (choice: ExerciseChoice) => void;
};

export default function ExerciseDialog({ dayLabel, library, sessionActive, onClose, onSubmit }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [libraryId, setLibraryId] = useState("");
  const [name, setName] = useState("");
  const [equipment, setEquipment] = useState("");
  const [persist, setPersist] = useState(false);
  const source = library.find((item) => item.id === libraryId);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  // Cierra al tocar fuera de la tarjeta (el <dialog> ocupa su propia caja, así que se compara con sus bordes).
  const closeOnBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) event.currentTarget.close();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = (source?.name ?? name).trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, equipment: (source?.equipment ?? equipment).trim(), source, persist: persist || !sessionActive });
    dialog.current?.close();
  };

  return (
    <dialog ref={dialog} className="exercise-modal" aria-labelledby="exercise-dialog-title" onClose={onClose} onClick={closeOnBackdropClick}>
      <header className="modal-heading">
        <hgroup>
          <p className="date-line">{dayLabel}</p>
          <h2 id="exercise-dialog-title">Añadir ejercicio</h2>
        </hgroup>
        <button className="close-button" type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar">×</button>
      </header>
      <form onSubmit={submit}>
        {library.length > 0 && (
          <label className="field-label library-pick">Elegir de tus ejercicios
            <select value={libraryId} onChange={(event) => setLibraryId(event.target.value)}>
              <option value="">Uno nuevo…</option>
              {library.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        )}
        {!source && (
          <>
            <label className="field-label">Nombre
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. puente de glúteos" maxLength={60} required />
            </label>
            <label className="field-label">Máquina o equipo
              <input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="Ej. barra, polea…" maxLength={60} />
            </label>
          </>
        )}
        {sessionActive ? (
          <label className="check-row">
            <input type="checkbox" checked={persist} onChange={(event) => setPersist(event.target.checked)} />
            <span>Guardarlo también en la rutina de {dayLabel}. Si no, solo cuenta para esta sesión.</span>
          </label>
        ) : (
          <p className="modal-hint">Se añade a la rutina de {dayLabel}. Después puedes anotar las series y repeticiones que hagas.</p>
        )}
        <button className="primary-button" type="submit">Añadir ejercicio</button>
      </form>
    </dialog>
  );
}
