import type { AppData } from "./types";
import type { PushKinds } from "./push-store";

export type PushPrefs = PushKinds & { reminderTime: string };

export const PUSH_PREFS_KEY = "exorfitness.push";
export const DEFAULT_PREFS: PushPrefs = { daily: true, rest: true, missed: true, reminderTime: "18:00" };

export const vapidKey = () => process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function readPrefs(): PushPrefs {
  try {
    const raw = window.localStorage.getItem(PUSH_PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<PushPrefs>) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: PushPrefs) {
  try {
    window.localStorage.setItem(PUSH_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Sin almacenamiento: los ajustes se quedan solo en memoria.
  }
}

export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/** En iPhone las notificaciones solo existen si la app está instalada en la pantalla de inicio. */
export const isIosBrowser = () =>
  typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator as Navigator & { standalone?: boolean }).standalone && !window.matchMedia("(display-mode: standalone)").matches;

function urlBase64ToBytes(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=").replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export async function currentSubscription() {
  if (!pushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/** Pide permiso y crea la suscripción. Lanza un Error con un mensaje legible si algo falla. */
export async function subscribeToPush() {
  if (!pushSupported()) throw new Error("Este navegador no admite notificaciones.");
  if (!vapidKey()) throw new Error("Faltan las claves de notificaciones en el servidor.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permiso denegado. Actívalo en los ajustes del navegador o del teléfono.");
  const registration = await navigator.serviceWorker.ready;
  return (await registration.pushManager.getSubscription()) ?? registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToBytes(vapidKey()) });
}

export async function unsubscribeFromPush() {
  const subscription = await currentSubscription();
  if (!subscription) return;
  await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) }).catch(() => undefined);
  await subscription.unsubscribe();
}

const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Envía al servidor lo mínimo que necesita para avisarte: horario, rutina del día y días con sesión. */
export async function syncSubscription(subscription: PushSubscription, prefs: PushPrefs, data: AppData) {
  const json = subscription.toJSON();
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: { endpoint: json.endpoint, keys: json.keys },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      reminderTime: prefs.reminderTime,
      kinds: { daily: prefs.daily, rest: prefs.rest, missed: prefs.missed },
      schedule: data.days.map((day) => ({ label: day.label, focus: day.focus })),
      doneDates: [...new Set(data.sessions.map((session) => localDate(new Date(session.finishedAt))))].slice(-60),
    }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "No se pudo guardar en el servidor.");
  }
}

/** Pide al servidor una notificación de prueba para este dispositivo. */
export async function sendTestPush() {
  const subscription = await currentSubscription();
  if (!subscription) throw new Error("Este dispositivo no está suscrito. Activa las notificaciones primero.");
  const response = await fetch("/api/push/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "No se pudo enviar la prueba.");
  }
}

/** Programa el aviso de fin de descanso en el servidor. Devuelve una función para cancelarlo. */
export async function scheduleRestPush(seconds: number) {
  const prefs = readPrefs();
  if (!prefs.rest || !pushSupported() || Notification.permission !== "granted") return () => undefined;
  const subscription = await currentSubscription().catch(() => null);
  if (!subscription) return () => undefined;
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const post = (body: object) => fetch("/api/push/rest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint, id, ...body }), keepalive: true }).catch(() => undefined);
  void post({ action: "start", seconds: Math.round(seconds) });
  return () => void post({ action: "cancel" });
}
