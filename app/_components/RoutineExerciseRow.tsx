import dynamic from "next/dynamic";
import type { RoutineExercise } from "../_lib/types";
import { EXERCISE_MOTIONS } from "../_lib/exercise-poses";
import EquipmentMark from "./EquipmentMark";

const ExerciseModel3D = dynamic(() => import("./ExerciseModel3D"), { ssr: false, loading: () => <span className="exercise-model-3d is-compact" /> });

type Props = {
  exercise: RoutineExercise;
  index: number;
  /** null = todavía no hay sesión; la fila es solo informativa. */
  status: "pending" | "done" | null;
  onOpen: () => void;
};

export default function RoutineExerciseRow({ exercise, index, status, onOpen }: Props) {
  const target = exercise.trackingMode === "minutes" ? exercise.targetReps : `${exercise.targetSets} × ${exercise.targetReps}`;
  const content = (
    <>
      <span className="routine-index">{String(index + 1).padStart(2, "0")}</span>
      {EXERCISE_MOTIONS[exercise.id]
        ? <ExerciseModel3D exerciseId={exercise.id} label={exercise.name} compact />
        : <EquipmentMark equipment={exercise.equipment} />}
      <span className="routine-copy">
        <strong>{exercise.name}</strong>
        <small>{exercise.equipment}</small>
        <span className="chip">{target}</span>
      </span>
      {status && <span className={`status-dot ${status === "done" ? "is-done" : ""}`} role="img" aria-label={status === "done" ? "Completado" : "Pendiente"} />}
    </>
  );

  return (
    <li>
      {status
        ? <button className="routine-row" onClick={onOpen}>{content}</button>
        : <div className="routine-row">{content}</div>}
    </li>
  );
}
