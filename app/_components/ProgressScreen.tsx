"use client";

import { type FormEvent, useMemo, useState } from "react";
import type { AppData, Measurement } from "../_lib/types";
import type { WorkoutStats } from "../_lib/workout-stats";
import { formatDate, formatNumber } from "../_lib/workout-data";
import ActivityRings from "./ActivityRings";
import ExerciseProgressPanel from "./ExerciseProgressPanel";
import VolumeChart from "./VolumeChart";

type Props = {
  data: AppData;
  stats: WorkoutStats;
  onAddMeasurement: (area: string, value: number) => void;
};

/** Agrupa las medidas por zona, de la más reciente a la más antigua. */
function groupByArea(measurements: Measurement[]) {
  const grouped = new Map<string, Measurement[]>();
  for (const item of [...measurements].reverse()) grouped.set(item.area, [...(grouped.get(item.area) ?? []), item]);
  return Array.from(grouped.entries());
}

function signed(value: number, digits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="section-bar">
      <hgroup><h2>{title}</h2><p>{description}</p></hgroup>
    </header>
  );
}

function MeasurementForm({ onAdd }: { onAdd: (area: string, value: number) => void }) {
  const [area, setArea] = useState("");
  const [value, setValue] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanArea = area.trim();
    const amount = Number(value);
    if (!cleanArea || !Number.isFinite(amount) || amount <= 0) return;
    onAdd(cleanArea, amount);
    setArea("");
    setValue("");
  };

  return (
    <form className="measurement-form" onSubmit={submit}>
      <label><span>Zona</span><input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Brazo, cintura…" maxLength={32} required /></label>
      <label><span>cm</span><input type="number" value={value} onChange={(event) => setValue(event.target.value)} placeholder="0" min="0.1" step="0.1" inputMode="decimal" required /></label>
      <button className="primary-button" type="submit">Guardar medida</button>
    </form>
  );
}

export default function ProgressScreen({ data, stats, onAddMeasurement }: Props) {
  const { sessions, days } = data;
  const volumes = [...stats.recentSessions].reverse();
  const measurementsByArea = useMemo(() => groupByArea(data.measurements), [data.measurements]);

  return (
    <article className="page-content" aria-labelledby="page-title">
      <header className="content-heading">
        <hgroup><p className="date-line">TUS REGISTROS</p><h1 id="page-title">Progreso</h1></hgroup>
      </header>

      <section className="card" aria-labelledby="rings-title">
        <h2 id="rings-title" className="list-title">Esta semana</h2>
        <ActivityRings rings={stats.goals.map((goal) => ({ label: goal.label, percent: goal.percent, detail: `${goal.done} de ${goal.target} días` }))} />
      </section>

      <dl className="progress-stats">
        <div><dt>Sesiones</dt><dd><strong>{sessions.length}</strong></dd></div>
        <div><dt>Volumen</dt><dd><strong>{formatNumber(stats.allTimeVolume)}<small>kg·reps</small></strong></dd></div>
        <div><dt>Cardio</dt><dd><strong>{formatNumber(stats.allTimeMinutes)}<small>min</small></strong></dd></div>
        <div><dt>Días</dt><dd><strong>{stats.fixedDaysDone}<small> / {stats.trainingDayCount} sem.</small></strong></dd></div>
      </dl>

      <ExerciseProgressPanel sessions={sessions} days={days} />

      <section className="content-section" aria-label="Volumen por sesión">
        <SectionHeading title="Volumen por sesión" description="Peso × repeticiones completadas; cardio se cuenta en minutos." />
        {volumes.length === 0 ? (
          <p className="empty-state">Cuando registres sesiones de fuerza, verás aquí cómo cambia tu volumen.</p>
        ) : (
          <VolumeChart sessions={volumes} />
        )}
      </section>

      <section className="content-section" aria-label="Medidas">
        <SectionHeading title="Medidas" description="Guarda centímetros con fecha para compararlos después." />
        <MeasurementForm onAdd={onAddMeasurement} />
        {measurementsByArea.length === 0 ? (
          <p className="empty-state">Aquí aparecerán las medidas que quieras seguir. No hace falta registrar peso ni altura.</p>
        ) : (
          <ul className="measurement-list">
            {measurementsByArea.map(([area, [latest, before]]) => (
              <li className="measurement-row" key={area}>
                <p><strong>{area}</strong><span>Última medida · <time dateTime={latest.recordedAt}>{formatDate(latest.recordedAt)}</time></span></p>
                <b>{latest.value} <small>cm</small></b>
                {before && <span className="measurement-change">{signed(latest.value - before.value)} cm</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="content-section" aria-label="Historial">
        <SectionHeading title="Historial" description="La fecha te ayuda a poner cada sesión en contexto." />
        {sessions.length === 0 ? (
          <p className="empty-state">Tus sesiones terminadas aparecerán aquí.</p>
        ) : (
          <ol className="history-list">
            {[...sessions].reverse().map((session) => {
              const day = days[session.dayIndex];
              return (
                <li className="history-row" key={session.id}>
                  <p>
                    <strong>{day?.label ?? "Sesión"} · {day?.focus ?? ""}</strong>
                    <span><time dateTime={session.finishedAt}>{formatDate(session.finishedAt, { weekday: "long", day: "numeric", month: "long" })}</time> · {session.exercises.length} ejercicios</span>
                  </p>
                  <b>{session.cardioMinutes ? <>{formatNumber(session.cardioMinutes)} <small>min cardio</small></> : <>{formatNumber(session.volume)} <small>kg·reps</small></>}</b>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </article>
  );
}
