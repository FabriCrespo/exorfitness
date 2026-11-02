import type { RoutineExercise } from "../_lib/types";
import { EXERCISE_IMAGES } from "../_lib/workout-data";
import EquipmentMark from "./EquipmentMark";
import ExerciseVisual from "./ExerciseVisual";

type Props = { exercise: RoutineExercise; index: number; onRemove: (id: string) => void; animation?: { src: string; label: string } };

export default function RoutineExerciseRow({ exercise, index, onRemove, animation }: Props) {
  return (
    <article className="routine-row" key={`${exercise.id}-${index}`}>
      <span className="routine-index">{String(index + 1).padStart(2, "0")}</span>
      {EXERCISE_IMAGES[exercise.id] ? <ExerciseVisual exercise={exercise} localSrc={EXERCISE_IMAGES[exercise.id]} animation={animation} variant="routine" /> : <EquipmentMark equipment={exercise.equipment} />}
      <div className="routine-copy">
        <strong>{exercise.name}</strong>
        <span>{exercise.trackingMode === "minutes" ? exercise.targetReps : `${exercise.targetSets} × ${exercise.targetReps}`}</span>
        <small>{exercise.equipment}</small>
      </div>
      <details className="cue-details"><summary aria-label={`Ver pista para ${exercise.name}`}>Pista</summary><p>{exercise.cue}</p></details>
      <button className="remove-button" onClick={() => onRemove(exercise.id)} aria-label={`Quitar ${exercise.name}`}>×</button>
    </article>
  );
}
