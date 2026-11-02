import type { ActiveExercise, LoggedExercise, RoutineExercise, SetEntry, WorkoutSession } from "../_lib/types";
import { daysAgo, formatDate, formatNumber, EXERCISE_IMAGES, volumeOf } from "../_lib/workout-data";
import CardioProtocol from "./CardioProtocol";
import ExerciseVisual from "./ExerciseVisual";
import SetLogger from "./SetLogger";

type Props = {
  exercise: RoutineExercise;
  activeExercise: ActiveExercise;
  index: number;
  previous?: LoggedExercise;
  previousWorkout?: WorkoutSession;
  animation?: { src: string; label: string };
  onUpdateSet: (exerciseId: string, setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: (exerciseId: string) => void;
};

export default function ExerciseSessionCard({ exercise, activeExercise, index, previous, previousWorkout, animation, onUpdateSet, onAddSet }: Props) {
  const isTimed = exercise.trackingMode === "minutes";
  const previousMinutes = previous?.sets.reduce((sum, set) => sum + (set.durationMinutes ?? 0), 0) ?? 0;

  return (
    <article className="exercise-card" style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
      <div className="exercise-heading">
        <div className="exercise-title"><span className="exercise-index">{String(index + 1).padStart(2, "0")}</span><h2>{exercise.name}</h2><p>{exercise.equipment} <b>·</b> {isTimed ? exercise.targetReps : `${exercise.targetSets} × ${exercise.targetReps}`}</p></div>
        {!isTimed && <span className="exercise-progress">{activeExercise.sets.length}/{exercise.targetSets} series</span>}
        <details className="cue-details"><summary aria-label={`Ver pista para ${exercise.name}`}>Pista</summary><p>{exercise.cue}</p></details>
      </div>
      {EXERCISE_IMAGES[exercise.id] && <details className="exercise-demo">
        <summary>Ver movimiento</summary>
        <ExerciseVisual exercise={exercise} localSrc={EXERCISE_IMAGES[exercise.id]} animation={animation} variant="session" />
      </details>}
      {isTimed && <CardioProtocol />}
      {previous && previousWorkout && <p className="previous-line">Última vez · {formatDate(previousWorkout.finishedAt, { day: "numeric", month: "short" })} · {isTimed ? `${formatNumber(previousMinutes)} min` : `${formatNumber(volumeOf(previous.sets))} kg·reps`}{daysAgo(previousWorkout.finishedAt) > 21 ? " · hace más de 3 semanas" : ""}</p>}
      <div className="set-logger"><SetLogger exercise={exercise} sets={activeExercise.sets} onUpdate={(setId, patch) => onUpdateSet(exercise.id, setId, patch)} onAddSet={() => onAddSet(exercise.id)} /></div>
    </article>
  );
}
