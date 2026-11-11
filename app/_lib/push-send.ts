import { sendNotification, setVapidDetails } from "web-push";
import { type PushRecord, removeRecord } from "./push-store";

export type PushMessage = { title: string; body: string; tag?: string; url?: string };

let configured = false;
function configure() {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:admin@example.com", publicKey, privateKey);
  configured = true;
  return true;
}

/** Envía un aviso. Devuelve false si la suscripción ya no existe (y la borra). */
export async function sendPush(record: PushRecord, message: PushMessage) {
  if (!configure()) throw new Error("Faltan las claves VAPID");
  try {
    await sendNotification(record.subscription, JSON.stringify(message), { TTL: 3600, urgency: "high" });
    return true;
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await removeRecord(record.id);
      return false;
    }
    throw error;
  }
}
