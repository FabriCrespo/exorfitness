"use client";

import { useReducedMotion } from "motion/react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts";
import type { WorkoutSession } from "../_lib/types";
import { formatDate, formatNumber } from "../_lib/workout-data";

/** Volumen de las últimas sesiones; la más reciente va resaltada. */
export default function VolumeChart({ sessions }: { sessions: WorkoutSession[] }) {
  const reducedMotion = useReducedMotion();
  const data = sessions.map((session) => ({ id: session.id, label: formatDate(session.finishedAt), volume: session.volume }));
  const summary = data.map((item) => `${item.label}: ${formatNumber(item.volume)} kg·reps`).join("; ");

  return (
    <div className="chart-card" role="img" aria-label={`Volumen por sesión. ${summary}`}>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={data} margin={{ top: 20, right: 4, bottom: 0, left: 4 }} barCategoryGap="22%">
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--quiet)", fontSize: 10 }} interval={0} />
          <Bar dataKey="volume" radius={[7, 7, 7, 7]} isAnimationActive={!reducedMotion} animationDuration={500}>
            {data.map((item, index) => <Cell key={item.id} fill="var(--accent)" fillOpacity={index === data.length - 1 ? 1 : 0.4} />)}
            <LabelList dataKey="volume" position="top" formatter={(value) => formatNumber(Number(value))} fill="var(--muted)" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
