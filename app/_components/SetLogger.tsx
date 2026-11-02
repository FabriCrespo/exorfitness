import type { RoutineExercise, SetEntry } from "../_lib/types";

type Props = {
  exercise: RoutineExercise;
  sets: SetEntry[];
  onUpdate: (setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: () => void;
};

function SetCheck({ complete, disabled, label, onClick }: { complete: boolean; disabled: boolean; label: string; onClick: () => void }) {
  return <button className={`set-check ${complete ? "is-done" : ""}`} onClick={onClick} disabled={disabled} aria-label={label}>{complete ? "✓" : "OK"}</button>;
}

export default function SetLogger({ exercise, sets, onUpdate, onAddSet }: Props) {
  const isTimed = exercise.trackingMode === "minutes";

  return (
    <>
      {sets.length > 0 && <div className={`set-header ${isTimed ? "duration-header" : ""}`}>
        {isTimed ? <><span>Bloque</span><span>Minutos</span><span /></> : <><span>Serie</span><span>kg</span><span>reps</span><span>Fallo</span><span /></>}
      </div>}
      <div className={`set-list ${isTimed ? "duration-list" : ""}`}>
        {sets.map((set, index) => isTimed ? (
          <div className={`set-row duration-row ${set.complete ? "set-done" : ""}`} key={set.id}>
            <span className="set-number">{String(index + 1).padStart(2, "0")}</span>
            <label className="number-field"><span className="sr-only">Minutos de cardio</span><input type="number" min="1" step="1" inputMode="numeric" placeholder="25" value={set.durationMinutes ?? ""} onChange={(event) => onUpdate(set.id, { durationMinutes: event.target.value, complete: false })} /></label>
            <SetCheck complete={set.complete} disabled={!set.durationMinutes || Number(set.durationMinutes) <= 0} onClick={() => onUpdate(set.id, { complete: !set.complete })} label={set.complete ? "Editar minutos de cardio" : "Guardar minutos de cardio"} />
          </div>
        ) : (
          <div className={`set-row ${set.complete ? "set-done" : ""}`} key={set.id}>
            <span className="set-number">{String(index + 1).padStart(2, "0")}</span>
            <label className="number-field"><span className="sr-only">Peso en kg, serie {index + 1}</span><input type="number" min="0" step="0.5" inputMode="decimal" placeholder="0" value={set.weightKg} onChange={(event) => onUpdate(set.id, { weightKg: event.target.value, complete: false })} /></label>
            <label className="number-field"><span className="sr-only">Repeticiones, serie {index + 1}</span><input type="number" min="1" step="1" inputMode="numeric" placeholder={exercise.targetReps.split(/[–-]/)[0].trim().split(" ")[0]} value={set.reps} onChange={(event) => onUpdate(set.id, { reps: event.target.value, complete: false })} /></label>
            <button className={`failure-toggle ${set.toFailure ? "is-on" : ""}`} onClick={() => onUpdate(set.id, { toFailure: !set.toFailure })} aria-pressed={set.toFailure} aria-label={set.toFailure ? "Quitar marca de fallo" : "Marcar serie al fallo"}>F</button>
            <SetCheck complete={set.complete} disabled={!set.weightKg || !set.reps || Number(set.reps) <= 0} onClick={() => onUpdate(set.id, { complete: !set.complete })} label={set.complete ? `Editar serie ${index + 1}` : `Guardar serie ${index + 1}`} />
          </div>
        ))}
      </div>
      {!isTimed && <button className="add-set-button" onClick={onAddSet}>
        <span>{sets.length === 0 ? "Añadir primera serie" : "Añadir serie"}</span>
        <small>{sets.length + 1} de {exercise.targetSets}</small>
      </button>}
    </>
  );
}
