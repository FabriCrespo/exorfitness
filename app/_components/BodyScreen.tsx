"use client";

import { useMemo, useState } from "react";
import { agoLabel, exercisesFor, lastWorked, type MuscleId, MUSCLES, muscleLabel } from "../_lib/muscles";
import type { AppData, RoutineExercise } from "../_lib/types";
import { daysAgo, formatNumber } from "../_lib/workout-data";
import BodyMap, { type BodyView } from "./BodyMap";
import ExerciseSheet from "./ExerciseSheet";

type Props = {
  data: AppData;
  library: RoutineExercise[];
  onStartCustom: (exercises: RoutineExercise[], title: string) => void;
};

const MAX_DEFAULT = 6;

export default function BodyScreen({ data, library, onStartCustom }: Props) {
  const [view, setView] = useState<BodyView>("front");
  const [selected, setSelected] = useState<Set<MuscleId>>(new Set());
  const [open, setOpen] = useState<RoutineExercise | null>(null);
  const worked = useMemo(() => lastWorked(data.sessions), [data.sessions]);
  const matches = useMemo(() => exercisesFor(library, selected), [library, selected]);
  const hasActive = Boolean(data.activeSession);

  const chosen = matches.slice(0, MAX_DEFAULT);

  const toggleMuscle = (id: MuscleId) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const lastTime = (exerciseId: string) => {
    for (const session of [...data.sessions].reverse()) {
      const found = session.exercises.find((item) => item.exerciseId === exerciseId);
      if (found?.sets.length) {
        const top = found.sets.reduce((best, set) => (set.weightKg >= best.weightKg ? set : best));
        return `${formatNumber(top.weightKg, 1)} kg × ${top.reps} · ${agoLabel(daysAgo(session.finishedAt))}`;
      }
    }
    return null;
  };

  const titleFor = () => `Sesión libre · ${[...selected].slice(0, 3).map(muscleLabel).join(", ")}${selected.size > 3 ? "…" : ""}`;

  return (
    <article className="page-content body-screen" aria-labelledby="page-title">
      <header className="content-heading">
        <hgroup><p className="date-line">EXPLORA POR MÚSCULO</p><h1 id="page-title">Cuerpo</h1></hgroup>
      </header>

      <section className="card body-card" aria-label="Mapa muscular">
        <div className="segmented share-scope" role="group" aria-label="Vista del cuerpo">
          <button type="button" className={view === "front" ? "is-active" : undefined} aria-pressed={view === "front"} onClick={() => setView("front")}>Frente</button>
          <button type="button" className={view === "back" ? "is-active" : undefined} aria-pressed={view === "back"} onClick={() => setView("back")}>Espalda</button>
        </div>
        <BodyMap view={view} selected={selected} worked={worked} onToggle={toggleMuscle} />
        <ul className="body-legend" aria-label="Leyenda">
          <li><i className="is-selected" />Elegido</li>
          <li><i className="is-recovering" />Trabajado hace menos de 48 h</li>
        </ul>
      </section>

      <section aria-labelledby="muscles-title" className="body-chips-block">
        <h2 id="muscles-title" className="list-title">Músculos</h2>
        <ul className="muscle-chips">
          {MUSCLES.map((muscle) => (
            <li key={muscle.id}>
              <button type="button" className={selected.has(muscle.id) ? "is-active" : undefined} aria-pressed={selected.has(muscle.id)} onClick={() => toggleMuscle(muscle.id)}>
                {muscle.label}<small>{agoLabel(worked[muscle.id])}</small>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="match-title" className="body-match">
        <h2 id="match-title" className="list-title">Qué puedes hacer</h2>
        {selected.size === 0 ? (
          <p className="empty-state">Toca un músculo en el cuerpo o en la lista para ver qué ejercicios lo trabajan.</p>
        ) : matches.length === 0 ? (
          <p className="empty-state">Aún no tienes ejercicios para esos músculos. Puedes añadir uno desde la rutina.</p>
        ) : (
          <ol className="grouped-list match-list">
            {matches.map(({ exercise, muscles }) => (
              <li key={exercise.id}>
                <button type="button" className="match-row" onClick={() => setOpen(exercise)}>
                  <span className="match-copy">
                    <strong>{exercise.name}</strong>
                    <small>{exercise.equipment}</small>
                    <small>{muscles.map(muscleLabel).join(" · ")}</small>
                    <small>{lastTime(exercise.id) ? `Última vez · ${lastTime(exercise.id)}` : "Sin registro aún"}</small>
                  </span>
                  <i aria-hidden="true">›</i>
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {selected.size > 0 && chosen.length > 0 && !hasActive && (
        <button className="text-button block" onClick={() => onStartCustom(chosen.map((item) => item.exercise), titleFor())}>
          Armar una sesión con estos ejercicios ({chosen.length})
        </button>
      )}

      {open && <ExerciseSheet exercise={open} last={lastTime(open.id)} onClose={() => setOpen(null)} />}
    </article>
  );
}
