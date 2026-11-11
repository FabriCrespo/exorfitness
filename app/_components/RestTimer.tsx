"use client";

import { useEffect, useRef, useState } from "react";
import { scheduleRestPush } from "../_lib/push-client";

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
  const cancelPush = useRef<() => void>(() => undefined);
  const endsAtRef = useRef(endsAt);
  useEffect(() => { endsAtRef.current = endsAt; });

  // Aviso en segundo plano: el servidor lo envía cuando acaba el descanso aunque bloquees el teléfono.
  useEffect(() => {
    let cancelled = false;
    scheduleRestPush(Math.max(5, (endsAtRef.current - Date.now()) / 1000)).then((cancel) => {
      if (cancelled) cancel(); else cancelPush.current = cancel;
    });
    return () => { cancelled = true; cancelPush.current(); };
  }, []);

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
    // El aviso programado quedó corto: se cancela y se programa uno nuevo con el tiempo restante.
    cancelPush.current();
    scheduleRestPush(Math.max(5, (endsAtRef.current + 15_000 - Date.now()) / 1000)).then((cancel) => { cancelPush.current = cancel; });
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
