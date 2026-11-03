"use client";

import { useReducedMotion } from "motion/react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LoggedSet, WorkoutSession } from "../_lib/types";
import { exerciseMetricLabel, exerciseMetricUnit, exerciseProgressPoints, type ExerciseMetric } from "../_lib/exercise-progress";
import { formatNumber } from "../_lib/workout-data";

type Props = {
  sessions: WorkoutSession[];
  exerciseId: string;
  metric: ExerciseMetric;
  currentSets?: LoggedSet[];
  compact?: boolean;
};

export default function ExerciseTrendChart({ sessions, exerciseId, metric, currentSets = [], compact = false }: Props) {
  const reducedMotion = useReducedMotion();
  const points = exerciseProgressPoints(sessions, exerciseId, metric, currentSets);
  const latest = points.at(-1);
  const previous = latest?.sessionId === "today" ? points.filter((point) => point.sessionId !== "today").at(-1) : points.at(-2);
  const difference = latest && previous ? latest.value - previous.value : null;
  const unit = exerciseMetricUnit(metric);
  const label = exerciseMetricLabel(metric);

  return (
    <section className={`trend-card ${compact ? "is-compact" : ""}`} aria-label={`Progreso del ejercicio: ${label}`}>
      <header>
        <h3>{compact ? "Tu progreso" : label}</h3>
        {latest && <p><strong>{formatNumber(latest.value, 1)}</strong> <small>{unit}</small></p>}
      </header>

      {points.length === 0 ? (
        <p className="trend-empty">Guarda una serie para crear tu primera referencia.</p>
      ) : (
        <>
          <div className="trend-plot" role="img" aria-label={`${label}: ${points.map((point) => `${point.label}, ${formatNumber(point.value, 1)} ${unit}`).join("; ")}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--separator)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--quiet)", fontSize: 10 }} interval="preserveStartEnd" minTickGap={24} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} axisLine={false} tick={{ fill: "var(--quiet)", fontSize: 10 }} tickCount={3} width={30} />
                <Tooltip
                  cursor={{ stroke: "var(--separator)" }}
                  contentStyle={{ background: "var(--surface-raised)", border: "none", borderRadius: 10, color: "var(--ink)", fontSize: 12, boxShadow: "0 6px 20px rgba(0,0,0,.25)" }}
                  formatter={(value) => [`${formatNumber(Number(value), 1)} ${unit}`, label]}
                  labelStyle={{ color: "var(--muted)" }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3.5, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={!reducedMotion} animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {difference !== null && (
            <p className={`trend-change ${difference >= 0 ? "is-up" : "is-down"}`}>
              {difference > 0 ? "+" : ""}{formatNumber(difference, 1)} {unit} <span>{latest?.sessionId === "today" ? "respecto a la última sesión" : "respecto a la sesión anterior"}</span>
            </p>
          )}
        </>
      )}
    </section>
  );
}
