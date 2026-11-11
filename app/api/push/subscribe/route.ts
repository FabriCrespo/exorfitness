import { NextResponse } from "next/server";
import { getRecord, putRecord, recordId, removeRecord, storeIsConfigured, type PushRecord } from "../../../_lib/push-store";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function parse(body: unknown): Omit<PushRecord, "id" | "lastSent"> | null {
  const item = body as Partial<PushRecord> | null;
  const sub = item?.subscription;
  if (!sub || typeof sub.endpoint !== "string" || !sub.endpoint.startsWith("https://") || typeof sub.keys?.p256dh !== "string" || typeof sub.keys?.auth !== "string") return null;
  if (typeof item?.timezone !== "string" || !TIME.test(item.reminderTime ?? "")) return null;
  const kinds = item.kinds;
  if (!kinds || typeof kinds.daily !== "boolean" || typeof kinds.rest !== "boolean" || typeof kinds.missed !== "boolean") return null;
  const schedule = Array.isArray(item.schedule) ? item.schedule.slice(0, 7).map((day) => ({ label: String(day?.label ?? "").slice(0, 40), focus: String(day?.focus ?? "").slice(0, 80) })) : [];
  const doneDates = Array.isArray(item.doneDates) ? item.doneDates.filter((date) => typeof date === "string" && DATE.test(date)).slice(-60) : [];
  return { subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, timezone: item.timezone, reminderTime: item.reminderTime!, kinds, schedule, doneDates };
}

export async function POST(request: Request) {
  if (!storeIsConfigured()) return NextResponse.json({ error: "Falta conectar Upstash Redis en Vercel." }, { status: 503 });
  const parsed = parse(await request.json().catch(() => null));
  if (!parsed) return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  const id = recordId(parsed.subscription.endpoint);
  const previous = await getRecord(id);
  await putRecord({ ...parsed, id, lastSent: previous?.lastSent ?? {} });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  if (!body?.endpoint) return NextResponse.json({ error: "Falta el endpoint." }, { status: 400 });
  await removeRecord(recordId(body.endpoint));
  return NextResponse.json({ ok: true });
}
