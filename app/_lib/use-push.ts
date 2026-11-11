"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { currentSubscription, DEFAULT_PREFS, isIosBrowser, type PushPrefs, pushSupported, readPrefs, savePrefs, subscribeToPush, syncSubscription, unsubscribeFromPush } from "./push-client";
import type { AppData } from "./types";

export type PushState = "checking" | "unsupported" | "needs-install" | "off" | "on" | "blocked";

/** Estado de las notificaciones y acciones para activarlas, ajustarlas o apagarlas. */
export function usePush(data: AppData) {
  const [state, setState] = useState<PushState>("checking");
  const [prefs, setPrefs] = useState<PushPrefs>(DEFAULT_PREFS);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; });

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setPrefs(readPrefs());
      if (!pushSupported()) return setState(isIosBrowser() ? "needs-install" : "unsupported");
      if (Notification.permission === "denied") return setState("blocked");
      const subscription = await currentSubscription().catch(() => null);
      setState(subscription && Notification.permission === "granted" ? "on" : "off");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Mantiene al servidor al día con tus sesiones para no avisarte de un día que ya entrenaste.
  useEffect(() => {
    if (state !== "on") return;
    const timer = window.setTimeout(async () => {
      const subscription = await currentSubscription().catch(() => null);
      if (subscription) await syncSubscription(subscription, prefs, data).catch(() => undefined);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [state, prefs, data.sessions, data.days]); // eslint-disable-line react-hooks/exhaustive-deps

  const enable = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const subscription = await subscribeToPush();
      await syncSubscription(subscription, prefs, dataRef.current);
      setState("on");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo activar.");
      if (typeof Notification !== "undefined" && Notification.permission === "denied") setState("blocked");
    } finally {
      setBusy(false);
    }
  }, [prefs]);

  const disable = useCallback(async () => {
    setBusy(true);
    await unsubscribeFromPush().catch(() => undefined);
    setState("off");
    setBusy(false);
  }, []);

  const updatePrefs = useCallback((patch: Partial<PushPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  return { state, prefs, busy, message, enable, disable, updatePrefs };
}
