"use client";

import { useEffect, useState } from "react";

/** Tiempo transcurrido desde `startIso`, formateado como m:ss o h:mm:ss, actualizado cada segundo. */
export function useElapsed(startIso: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const total = Math.max(0, Math.floor((now - new Date(startIso).getTime()) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** Segundos de descanso indicados en la pista del ejercicio ("Descanso: 90 s." o "Descanso: 2 min."). */
export function restSecondsFor(cue: string, fallback = 90) {
  const match = cue.match(/Descanso:\s*(\d+)\s*(min|s)/i);
  if (!match) return fallback;
  return match[2].toLowerCase() === "min" ? Number(match[1]) * 60 : Number(match[1]);
}
