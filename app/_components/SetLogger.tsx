import type { RoutineExercise, SetEntry } from "../_lib/types";

type Props = {
  exercise: RoutineExercise;
  sets: SetEntry[];
  onUpdate: (setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: () => void;
};

type SetCheckProps = { complete: boolean; disabled: boolean; label: string; onClick: () => void };

function SetCheck({ complete, disabled, label, onClick }: SetCheckProps) {
  return <button className={`set-check ${complete ? "is-done" : ""}`} onClick={onClick} disabled={disabled} aria-label={label}>{complete ? "✓" : "OK"}</button>;
}

const setNumber = (index: number) => String(index + 1).padStart(2, "0");

export default function SetLogger({ exercise, sets, onUpdate, onAddSet }: Props) {
  const isTimed = exercise.trackingMode === "minutes";
  const repsPlaceholder = exercise.targetReps.split(/[–-]/)[0].trim().split(" ")[0];

  return (
    <>
      {sets.length > 0 && (
        <p className={`set-header ${isTimed ? "duration-header" : ""}`} aria-hidden="true">
          {isTimed ? <><span>Bloque</span><span>Minutos</span><span /></> : <><span>Serie</span><span>kg</span><span>reps</span><span>Fallo</span><span /></>}
        </p>
      )}

      <ol className={`set-list ${isTimed ? "duration-list" : ""}`}>
        {sets.map((set, index) => {
          const done = set.complete ? "set-done" : "";

          if (isTimed) {
            const canSave = Number(set.durationMinutes) > 0;
            return (
              <li className={`set-row duration-row ${done}`} key={set.id}>
                <span className="set-number">{setNumber(index)}</span>
                <label className="number-field">
                  <span className="sr-only">Minutos de cardio</span>
                  <input type="number" min="1" step="1" inputMode="numeric" placeholder="25" value={set.durationMinutes ?? ""} onChange={(event) => onUpdate(set.id, { durationMinutes: event.target.value, complete: false })} />
                </label>
                <SetCheck complete={set.complete} disabled={!canSave} onClick={() => onUpdate(set.id, { complete: !set.complete })} label={set.complete ? "Editar minutos de cardio" : "Guardar minutos de cardio"} />
              </li>
            );
          }

          const canSave = Boolean(set.weightKg) && Number(set.reps) > 0;
          return (
            <li className={`set-row ${done}`} key={set.id}>
              <span className="set-number">{setNumber(index)}</span>
              <label className="number-field">
                <span className="sr-only">Peso en kg, serie {index + 1}</span>
                <input type="number" min="0" step="0.5" inputMode="decimal" placeholder="0" value={set.weightKg} onChange={(event) => onUpdate(set.id, { weightKg: event.target.value, complete: false })} />
              </label>
              <label className="number-field">
                <span className="sr-only">Repeticiones, serie {index + 1}</span>
                <input type="number" min="1" step="1" inputMode="numeric" placeholder={repsPlaceholder} value={set.reps} onChange={(event) => onUpdate(set.id, { reps: event.target.value, complete: false })} />
              </label>
              <button className={`failure-toggle ${set.toFailure ? "is-on" : ""}`} onClick={() => onUpdate(set.id, { toFailure: !set.toFailure })} aria-pressed={set.toFailure} aria-label={`Serie ${index + 1} al fallo`}>F</button>
              <SetCheck complete={set.complete} disabled={!canSave} onClick={() => onUpdate(set.id, { complete: !set.complete })} label={set.complete ? `Editar serie ${index + 1}` : `Guardar serie ${index + 1}`} />
            </li>
          );
        })}
      </ol>

      {!isTimed && (
        <button className="add-set-button" onClick={onAddSet}>
          <span>{sets.length === 0 ? "Añadir primera serie" : "Añadir serie"}</span>
          <small>{sets.length + 1} de {exercise.targetSets}</small>
        </button>
      )}
    </>
  );
}
