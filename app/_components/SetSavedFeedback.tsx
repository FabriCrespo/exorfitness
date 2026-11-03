"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function SetSavedFeedback({ completedCount, targetSets }: { completedCount: number; targetSets: number }) {
  const reducedMotion = useReducedMotion();
  const previousCount = useRef(completedCount);
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  useEffect(() => {
    if (completedCount > previousCount.current) setVisibleCount(completedCount);
    if (completedCount < previousCount.current) setVisibleCount(null);
    previousCount.current = completedCount;
  }, [completedCount]);

  useEffect(() => {
    if (visibleCount === null) return;
    const timeout = window.setTimeout(() => setVisibleCount(null), 1700);
    return () => window.clearTimeout(timeout);
  }, [visibleCount]);

  return <div className="set-save-feedback" aria-live="polite" aria-atomic="true">
    <AnimatePresence initial={false}>
      {visibleCount !== null && <motion.div
        key={visibleCount}
        className="set-save-toast"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 7, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -3, scale: 0.98 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.2, ease: "easeOut" }}
      >
        <motion.span className="set-save-orb" aria-hidden="true" animate={reducedMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.88, 1, 0.88] }} transition={{ duration: 0.62, repeat: 2, ease: "easeInOut" }}><i /></motion.span>
        <span><strong>Serie guardada</strong><small>{visibleCount} de {targetSets} series completadas</small></span>
      </motion.div>}
    </AnimatePresence>
  </div>;
}

