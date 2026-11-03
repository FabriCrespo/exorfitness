"use client";

import { useEffect, useState } from "react";

type Props = {
  kanji: string;
  label: string;
  focus: string;
  summary: string;
  onDone: () => void;
};

const COUNTDOWN = 3;

/** Pantalla de arranque de la sesión: foco del día y cuenta atrás 3-2-1. */
export default function SessionIntro({ kanji, label, focus, summary, onDone }: Props) {
  const [count, setCount] = useState(COUNTDOWN);

  useEffect(() => {
    if (count === 0) {
      navigator.vibrate?.(40);
      onDone();
      return;
    }
    navigator.vibrate?.(10);
    const id = window.setTimeout(() => setCount((value) => value - 1), 900);
    return () => window.clearTimeout(id);
  }, [count, onDone]);

  return (
    <div className="session-intro" role="dialog" aria-modal="true" aria-label="Empieza la sesión">
      <p className="intro-kanji" aria-hidden="true">{kanji}</p>
      <p className="intro-label">{label}</p>
      <h2>{focus}</h2>
      <p className="intro-summary">{summary}</p>
      <p className="intro-count" key={count} aria-live="assertive">{count > 0 ? count : "¡Vamos!"}</p>
      <button className="text-button" onClick={onDone}>Empezar ya</button>
    </div>
  );
}
