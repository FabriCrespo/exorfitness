import type { FormEvent } from "react";
import type { Measurement, RoutineDay, WorkoutSession } from "../_lib/types";
import { formatDate, formatNumber } from "../_lib/workout-data";

type Props = {
  sessions: WorkoutSession[];
  days: RoutineDay[];
  recentSessions: WorkoutSession[];
  maxVolume: number;
  allTimeVolume: number;
  allTimeCardioMinutes: number;
  fixedDaysDone: number;
  trainingDayCount: number;
  measurementsByArea: [string, Measurement[]][];
  measurementArea: string;
  measurementValue: string;
  onAreaChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onAddMeasurement: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ProgressScreen({ sessions, days, recentSessions, maxVolume, allTimeVolume, allTimeCardioMinutes, fixedDaysDone, trainingDayCount, measurementsByArea, measurementArea, measurementValue, onAreaChange, onValueChange, onAddMeasurement }: Props) {
  return (
    <section className="page-content" aria-labelledby="page-title">
      <div className="content-heading"><div><p className="date-line">TUS REGISTROS</p><h1 id="page-title">Progreso</h1></div></div>
      <div className="progress-stats">
        <article><span>Sesiones</span><strong>{sessions.length}</strong></article>
        <article><span>Volumen</span><strong>{formatNumber(allTimeVolume)}<small>kg·reps</small></strong></article>
        <article><span>Cardio</span><strong>{formatNumber(allTimeCardioMinutes)}<small>min</small></strong></article>
        <article><span>Días</span><strong>{fixedDaysDone}<small> / {trainingDayCount} sem.</small></strong></article>
      </div>
      <section className="content-section">
        <div className="section-bar"><div><h2>Volumen por sesión</h2><p>Peso × repeticiones completadas; cardio se cuenta en minutos.</p></div></div>
        {recentSessions.length === 0 ? <div className="empty-state"><p>Cuando registres sesiones de fuerza, verás aquí cómo cambia tu volumen.</p></div> : (
          <div className="chart-panel"><div className="bar-chart">{[...recentSessions].reverse().map((session) => (
            <div className="bar-column" key={session.id}><span className="bar-value">{formatNumber(session.volume)}</span><div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(4, (session.volume / maxVolume) * 100)}%` }} /></div><small>{formatDate(session.finishedAt)}</small></div>
          ))}</div></div>
        )}
      </section>
      <section className="content-section">
        <div className="section-bar"><div><h2>Medidas</h2><p>Guarda centímetros con fecha para compararlos después.</p></div></div>
        <form className="measurement-form" onSubmit={onAddMeasurement}>
          <label><span>Zona</span><input value={measurementArea} onChange={(event) => onAreaChange(event.target.value)} placeholder="Brazo, cintura…" maxLength={32} required /></label>
          <label><span>cm</span><input type="number" value={measurementValue} onChange={(event) => onValueChange(event.target.value)} placeholder="0" min="0.1" step="0.1" inputMode="decimal" required /></label>
          <button className="primary-button" type="submit">Guardar medida</button>
        </form>
        {measurementsByArea.length ? <div className="measurement-list">{measurementsByArea.map(([area, entries]) => (
          <article className="measurement-row" key={area}><div><strong>{area}</strong><span>Última medida · {formatDate(entries[0].recordedAt)}</span></div><b>{entries[0].value} <small>cm</small></b>{entries[1] && <span className="measurement-change">{entries[0].value - entries[1].value > 0 ? "+" : ""}{(entries[0].value - entries[1].value).toFixed(1)} cm</span>}</article>
        ))}</div> : <div className="empty-state"><p>Aquí aparecerán las medidas que quieras seguir. No hace falta registrar peso ni altura.</p></div>}
      </section>
      <section className="content-section">
        <div className="section-bar"><div><h2>Historial</h2><p>La fecha te ayuda a poner cada sesión en contexto.</p></div></div>
        {sessions.length ? <div className="history-list">{[...sessions].reverse().map((session) => (
          <article className="history-row" key={session.id}><div><strong>{days[session.dayIndex]?.label ?? "Sesión"} · {days[session.dayIndex]?.focus ?? ""}</strong><span>{formatDate(session.finishedAt, { weekday: "long", day: "numeric", month: "long" })} · {session.exercises.length} ejercicios</span></div><b>{session.cardioMinutes ? <>{formatNumber(session.cardioMinutes)} <small>min cardio</small></> : <>{formatNumber(session.volume)} <small>kg·reps</small></>}</b></article>
        ))}</div> : <div className="empty-state"><p>Tus sesiones terminadas aparecerán aquí.</p></div>}
      </section>
    </section>
  );
}
