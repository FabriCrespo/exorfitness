import dynamic from "next/dynamic";
import type { RoutineExercise } from "../_lib/types";
import { EXERCISE_MOTIONS } from "../_lib/exercise-poses";
import EquipmentMark from "./EquipmentMark";

const ExerciseModel3D = dynamic(() => import("./ExerciseModel3D"), { ssr: false, loading: () => <span className="exercise-model-3d is-compact" /> });

type Props = {
  exercise: RoutineExercise;
  index: number;
  onRemove: (id: string) => void;
};

export default function RoutineExerciseRow({ exercise, index, onRemove }: Props) {
  const target = exercise.trackingMode === "minutes" ? exercise.targetReps : `${exercise.targetSets} × ${exercise.targetReps}`;

  return (
    <li className="routine-row">
      <span className="routine-index">{String(index + 1).padStart(2, "0")}</span>
      {EXERCISE_MOTIONS[exercise.id]
        ? <ExerciseModel3D exerciseId={exercise.id} label={exercise.name} compact />
        : <EquipmentMark equipment={exercise.equipment} />}
      <div className="routine-copy">
        <strong>{exercise.name}</strong>
        <span>{target}</span>
        <small>{exercise.equipment}</small>
      </div>
      <details className="cue-details">
        <summary aria-label={`Ver pista para ${exercise.name}`}>Pista</summary>
        <p>{exercise.cue}</p>
      </details>
      <button className="remove-button" onClick={() => onRemove(exercise.id)} aria-label={`Quitar ${exercise.name}`}>×</button>
    </li>
  );
}
