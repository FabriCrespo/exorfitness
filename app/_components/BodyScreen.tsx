"use client";

import { useMemo, useState } from "react";
import { agoLabel, exercisesFor, lastWorked, type MuscleId, MUSCLES, muscleLabel } from "../_lib/muscles";
import type { AppData, RoutineExercise } from "../_lib/types";
import { daysAgo, formatNumber } from "../_lib/workout-data";
import BodyMap, { type BodyView } from "./BodyMap";

type Props = {
  data: AppData;
  library: RoutineExercise[];
  onStartCustom: (exercises: RoutineExercise[], title: string) => void;
};

const MAX_DEFAULT = 6;

export default function BodyScreen({ data, library, onStartCustom }: Props) {
  const [view, setView] = useState<BodyView>("front");
  const [selected, setSelected] = useState<Set<MuscleId>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const worked = useMemo(() => lastWorked(data.sessions), [data.sessions]);
  const matches = useMemo(() => exercisesFor(library, selected), [library, selected]);
  const hasActive = Boolean(data.activeSession);

  // Por defecto entran los mejores ejercicios; puedes quitar o añadir los demás.
  const isChosen = (id: string, index: number) => (skipped.has(id) ? false : index < MAX_DEFAULT || skipped.has(`+${id}`));
  const chosen = matches.filter((item, index) => isChosen(item.exercise.id, index));

  const toggleMuscle = (id: MuscleId) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setSkipped(new Set());
  };

  const toggleExercise = (id: string, index: number) =>
    setSkipped((current) => {
      const next = new Set(current);
      if (isChosen(id, index)) { next.add(id); next.delete(`+${id}`); } else { next.delete(id); next.add(`+${id}`); }
      return next;
    });

  const lastTime = (exerciseId: string) => {
    for (const session of [...data.sessions].reverse()) {
      const found = session.exercises.find((item) => item.exerciseId === exerciseId);
      if (found?.sets.length) {
        const top = found.sets.reduce((best, set) => (set.weightKg >= best.weightKg ? set : best));
        return `${formatNumber(top.weightKg, 1)} kg × ${top.reps} · ${agoLabel(daysAgo(session.finishedAt))}`;
      }
    }
    return "Aún sin registro";
  };

  const titleFor = () => `Sesión libre · ${[...selected].slice(0, 3).map(muscleLabel).join(", ")}${selected.size > 3 ? "…" : ""}`;

  return (
    <article className="page-content body-screen" aria-labelledby="page-title">
      <header className="content-heading">
        <hgroup><p className="date-line">QUÉ PUEDO TRABAJAR</p><h1 id="page-title">Cuerpo</h1></hgroup>
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
        <h2 id="match-title" className="list-title">Ejercicios para esto</h2>
        {selected.size === 0 ? (
          <p className="empty-state">Toca un músculo en el cuerpo o en la lista para ver qué ejercicios lo trabajan.</p>
        ) : matches.length === 0 ? (
          <p className="empty-state">Aún no tienes ejercicios para esos músculos. Puedes añadir uno desde la rutina.</p>
        ) : (
          <ol className="grouped-list match-list">
            {matches.map(({ exercise, muscles }, index) => (
              <li key={exercise.id}>
                <label className="match-row">
                  <input type="checkbox" checked={isChosen(exercise.id, index)} onChange={() => toggleExercise(exercise.id, index)} />
                  <span className="match-copy">
                    <strong>{exercise.name}</strong>
                    <small>{muscles.map(muscleLabel).join(" · ")}</small>
                    <small>Última vez · {lastTime(exercise.id)}</small>
                  </span>
                </label>
              </li>
            ))}
          </ol>
        )}
      </section>

      {selected.size > 0 && chosen.length > 0 && (
        <footer className="action-bar">
          {hasActive ? (
            <p className="action-summary"><span>Hay una sesión abierta</span><strong>Termínala para armar otra</strong></p>
          ) : (
            <>
              <p className="action-summary"><span>Sesión libre</span><strong>{chosen.length} {chosen.length === 1 ? "ejercicio" : "ejercicios"}</strong></p>
              <button className="primary-button" onClick={() => onStartCustom(chosen.map((item) => item.exercise), titleFor())}>Entrenar esto</button>
            </>
          )}
        </footer>
      )}
    </article>
  );
}
