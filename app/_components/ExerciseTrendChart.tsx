"use client";

import { useReducedMotion } from "motion/react";
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  const gradientId = `exercise-fill-${useId().replaceAll(":", "")}`;
  const points = exerciseProgressPoints(sessions, exerciseId, metric, currentSets);
  const historic = points.filter((point) => point.sessionId !== "today");
  const latest = points.at(-1);
  const previous = latest?.sessionId === "today" ? historic.at(-1) : historic.at(-2);
  const difference = latest && previous ? latest.value - previous.value : null;
  const unit = exerciseMetricUnit(metric);

  return <section className={`exercise-trend ${compact ? "is-compact" : ""}`} aria-label={`Progreso del ejercicio: ${exerciseMetricLabel(metric)}`}>
    <div className="exercise-trend-heading">
      <div><h3>{compact ? "Tu progreso" : exerciseMetricLabel(metric)}</h3>{compact && <span>{exerciseMetricLabel(metric)}</span>}</div>
      {latest && <strong>{formatNumber(latest.value, 1)} <small>{unit}</small></strong>}
    </div>
    {points.length === 0 ? <p className="exercise-trend-empty">Guarda una serie para crear tu primera referencia.</p> : <>
      <div className="exercise-trend-plot" role="img" aria-label={`${exerciseMetricLabel(metric)}: ${points.map((point) => `${point.label}, ${formatNumber(point.value, 1)} ${unit}`).join("; ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 7, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line-soft)" strokeDasharray="3 5" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--quiet)", fontSize: compact ? 9 : 10 }} interval="preserveStartEnd" minTickGap={22} />
            <YAxis domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} axisLine={false} tick={{ fill: "var(--quiet)", fontSize: 9 }} tickCount={3} width={35} />
            <Tooltip
              cursor={{ stroke: "var(--line-strong)", strokeDasharray: "3 3" }}
              contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--line)", borderRadius: 10, color: "var(--ink)", fontSize: 11 }}
              formatter={(value) => [`${formatNumber(Number(value), 1)} ${unit}`, exerciseMetricLabel(metric)]}
              labelStyle={{ color: "var(--muted)" }}
            />
            <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} fill={`url(#${gradientId})`} activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }} dot={{ r: 3, fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: 2 }} isAnimationActive={!reducedMotion} animationDuration={500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {difference !== null && <p className={`exercise-trend-change ${difference >= 0 ? "is-up" : "is-down"}`}>
        <span aria-hidden="true">{difference > 0 ? "+" : ""}{formatNumber(difference, 1)} {unit}</span>
        <span>{latest?.sessionId === "today" ? "respecto a la última sesión" : "respecto a la sesión anterior"}</span>
      </p>}
    </>}
  </section>;
}

