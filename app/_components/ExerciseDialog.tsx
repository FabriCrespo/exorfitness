import type { FormEvent } from "react";

type Props = {
  dayLabel: string;
  name: string;
  equipment: string;
  onNameChange: (value: string) => void;
  onEquipmentChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ExerciseDialog({ dayLabel, name, equipment, onNameChange, onEquipmentChange, onClose, onSubmit }: Props) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="exercise-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-dialog-title">
        <div className="modal-heading"><div><p className="date-line">{dayLabel}</p><h2 id="exercise-dialog-title">Añadir ejercicio</h2></div><button className="close-button" onClick={onClose} aria-label="Cerrar">×</button></div>
        <form onSubmit={onSubmit}>
          <label className="field-label">Nombre<input autoFocus value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Ej. puente de glúteos" maxLength={60} required /></label>
          <label className="field-label">Máquina o equipo<input value={equipment} onChange={(event) => onEquipmentChange(event.target.value)} placeholder="Ej. barra, polea…" maxLength={60} /></label>
          <p className="modal-hint">Después puedes anotar las series y repeticiones que hagas.</p>
          <button className="primary-button" type="submit">Guardar ejercicio</button>
        </form>
      </section>
    </div>
  );
}
