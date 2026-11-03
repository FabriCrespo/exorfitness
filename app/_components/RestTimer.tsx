"use client";

import { useEffect, useState } from "react";

type Props = {
  seconds: number;
  nextLabel: string;
  onDone: () => void;
};

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Cuenta atrás de descanso entre series, con anillo de progreso. */
export default function RestTimer({ seconds, nextLabel, onDone }: Props) {
  const [total, setTotal] = useState(seconds);
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining > 0) return;
    navigator.vibrate?.([30, 60, 30]);
    onDone();
  }, [remaining, onDone]);

  const addTime = () => {
    setEndsAt((current) => current + 15_000);
    setTotal((current) => current + 15);
  };
  const progress = total > 0 ? remaining / total : 0;
  const minutes = Math.floor(remaining / 60);
  const secs = String(remaining % 60).padStart(2, "0");

  return (
    <section className="rest-timer" aria-label="Descanso" role="timer">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--fill)" strokeWidth="5" />
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${CIRCUMFERENCE * progress} ${CIRCUMFERENCE}`} transform="rotate(-90 50 50)" />
      </svg>
      <div className="rest-copy">
        <p className="eyebrow">Descanso</p>
        <strong>{minutes}:{secs}</strong>
        <p>Siguiente · {nextLabel}</p>
      </div>
      <div className="rest-actions">
        <button className="quiet-button" onClick={addTime}>+15 s</button>
        <button className="primary-button" onClick={onDone}>Saltar</button>
      </div>
    </section>
  );
}
