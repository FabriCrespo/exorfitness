import dynamic from "next/dynamic";
import type { ActiveExercise, LoggedExercise, RoutineExercise, SetEntry, WorkoutSession } from "../_lib/types";
import { EXERCISE_MOTIONS } from "../_lib/exercise-poses";
import { daysAgo, formatDate, formatNumber, volumeOf } from "../_lib/workout-data";
import CardioProtocol from "./CardioProtocol";
import ExerciseTrendChart from "./ExerciseTrendChart";
import SetLogger from "./SetLogger";
import SetSavedFeedback from "./SetSavedFeedback";

const ExerciseModel3D = dynamic(() => import("./ExerciseModel3D"), { ssr: false, loading: () => <div className="exercise-model-3d" /> });

type Props = {
  exercise: RoutineExercise;
  activeExercise: ActiveExercise;
  index: number;
  previous?: LoggedExercise;
  previousWorkout?: WorkoutSession;
  sessions: WorkoutSession[];
  onUpdateSet: (exerciseId: string, setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: (exerciseId: string) => void;
};

export default function ExerciseSessionCard({ exercise, activeExercise, index, previous, previousWorkout, sessions, onUpdateSet, onAddSet }: Props) {
  const isTimed = exercise.trackingMode === "minutes";
  const target = isTimed ? exercise.targetReps : `${exercise.targetSets} × ${exercise.targetReps}`;
  const completedCount = activeExercise.sets.filter((set) => set.complete).length;
  const savedSets = isTimed ? [] : activeExercise.sets.filter((set) => set.complete).map((set) => ({
    weightKg: Number(set.weightKg) || 0,
    reps: Number(set.reps) || 0,
    toFailure: set.toFailure,
  }));

  const previousSummary = previous && previousWorkout && (
    isTimed
      ? `${formatNumber(previous.sets.reduce((sum, set) => sum + (set.durationMinutes ?? 0), 0))} min`
      : `${formatNumber(volumeOf(previous.sets))} kg·reps`
  );

  return (
    <article className="exercise-card">
      <header className="exercise-heading">
        <div className="exercise-title">
          <span className="exercise-index">{String(index + 1).padStart(2, "0")}</span>
          <h2>{exercise.name}</h2>
          <p>{exercise.equipment} <b>·</b> {target}</p>
        </div>
        {!isTimed && <p className="exercise-progress">{activeExercise.sets.length}/{exercise.targetSets} series</p>}
        <details className="cue-details">
          <summary aria-label={`Ver pista para ${exercise.name}`}>Pista</summary>
          <p>{exercise.cue}</p>
        </details>
      </header>

      {EXERCISE_MOTIONS[exercise.id] && <ExerciseModel3D exerciseId={exercise.id} label={exercise.name} />}
      {isTimed && <CardioProtocol />}

      {previousWorkout && previousSummary && (
        <p className="previous-line">
          Última vez · <time dateTime={previousWorkout.finishedAt}>{formatDate(previousWorkout.finishedAt, { day: "numeric", month: "short" })}</time> · {previousSummary}
          {daysAgo(previousWorkout.finishedAt) > 21 && " · hace más de 3 semanas"}
        </p>
      )}

      {!isTimed && (
        <section className="session-progress-wrap" aria-label="Tu progreso en este ejercicio">
          <ExerciseTrendChart sessions={sessions} exerciseId={exercise.id} metric="maxWeight" currentSets={savedSets} compact />
          <SetSavedFeedback completedCount={completedCount} targetSets={exercise.targetSets} />
        </section>
      )}

      <section className="set-logger" aria-label="Registro de series">
        <SetLogger exercise={exercise} sets={activeExercise.sets} onUpdate={(setId, patch) => onUpdateSet(exercise.id, setId, patch)} onAddSet={() => onAddSet(exercise.id)} />
      </section>
    </article>
  );
}
