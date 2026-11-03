"use client";

import { useMemo, useState } from "react";
import type { RoutineDay, WorkoutSession } from "../_lib/types";
import type { ExerciseMetric } from "../_lib/exercise-progress";
import ExerciseTrendChart from "./ExerciseTrendChart";

type Props = { sessions: WorkoutSession[]; days: RoutineDay[] };

export default function ExerciseProgressPanel({ sessions, days }: Props) {
  const exercises = useMemo(() => {
    const known = new Map<string, string>();
    days.flatMap((day) => day.exercises).forEach((exercise) => {
      if (exercise.trackingMode !== "minutes") known.set(exercise.id, exercise.name);
    });
    sessions.flatMap((session) => session.exercises).forEach((exercise) => {
      if (!exercise.sets.some((set) => set.weightKg > 0 || set.reps > 0)) return;
      if (!known.has(exercise.exerciseId)) known.set(exercise.exerciseId, exercise.name);
    });
    return Array.from(known, ([id, name]) => ({ id, name }));
  }, [days, sessions]);

  const [selectedId, setSelectedId] = useState("");
  const [metric, setMetric] = useState<ExerciseMetric>("maxWeight");
  const mostRecentExerciseId = [...sessions].reverse().flatMap((session) => session.exercises)
    .find((exercise) => exercise.sets.some((set) => set.weightKg > 0 || set.reps > 0))?.exerciseId;
  const exerciseId = exercises.find((exercise) => exercise.id === selectedId)?.id
    ?? exercises.find((exercise) => exercise.id === mostRecentExerciseId)?.id
    ?? exercises[0]?.id
    ?? "";
  const selected = exercises.find((exercise) => exercise.id === exerciseId);

  return <section className="content-section exercise-progress-section" aria-labelledby="exercise-progress-title">
    <div className="section-bar"><div><h2 id="exercise-progress-title">Progreso por ejercicio</h2><p>Compara tus registros de una sesión a otra.</p></div></div>
    <div className="exercise-progress-controls">
      <label><span>Ejercicio</span><select value={exerciseId} onChange={(event) => setSelectedId(event.target.value)} aria-label="Elegir ejercicio">
        {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
      </select></label>
      <label><span>Medición</span><select value={metric} onChange={(event) => setMetric(event.target.value as ExerciseMetric)} aria-label="Elegir medición">
        <option value="maxWeight">Peso máximo</option><option value="volume">Volumen</option><option value="maxReps">Repeticiones máximas</option>
      </select></label>
    </div>
    {selected ? <ExerciseTrendChart sessions={sessions} exerciseId={exerciseId} metric={metric} /> : <p className="empty-state">Cuando guardes series, aparecerá aquí tu historial por ejercicio.</p>}
  </section>;
}

