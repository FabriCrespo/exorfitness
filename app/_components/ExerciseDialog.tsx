"use client";

import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from "react";

type Props = {
  dayLabel: string;
  onClose: () => void;
  onSubmit: (name: string, equipment: string) => void;
};

export default function ExerciseDialog({ dayLabel, onClose, onSubmit }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [equipment, setEquipment] = useState("");

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
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, equipment.trim());
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
        <label className="field-label">Nombre
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. puente de glúteos" maxLength={60} required />
        </label>
        <label className="field-label">Máquina o equipo
          <input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="Ej. barra, polea…" maxLength={60} />
        </label>
        <p className="modal-hint">Después puedes anotar las series y repeticiones que hagas.</p>
        <button className="primary-button" type="submit">Guardar ejercicio</button>
      </form>
    </dialog>
  );
}
