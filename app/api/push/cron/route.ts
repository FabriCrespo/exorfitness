import { NextResponse } from "next/server";
import { sendPush } from "../../../_lib/push-send";
import { getAllRecords, putRecord, type PushRecord } from "../../../_lib/push-store";


const MISSED_HOUR = 21;
const WINDOW_MINUTES = 30;

/** Fecha, día de la semana (lunes = 0) y minutos del día en la zona horaria del usuario. */
function localClock(timezone: string, now: Date) {
  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(now).map((part) => [part.type, part.value]),
    );
    const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday);
    return { date: `${parts.year}-${parts.month}-${parts.day}`, weekday, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
  } catch {
    return null;
  }
}

async function run(record: PushRecord, now: Date) {
  const clock = localClock(record.timezone, now);
  if (!clock || clock.weekday < 0 || clock.weekday > 5) return 0;
  const day = record.schedule[clock.weekday];
  const trainedToday = record.doneDates.includes(clock.date);
  const [hour, minute] = record.reminderTime.split(":").map(Number);
  const reminderAt = hour * 60 + minute;
  let sent = 0;

  if (record.kinds.daily && !trainedToday && record.lastSent.daily !== clock.date && clock.minutes >= reminderAt && clock.minutes < reminderAt + WINDOW_MINUTES) {
    const ok = await sendPush(record, { title: `Hoy toca ${day?.label ?? "entrenar"}`, body: day?.focus || "Abre tu rutina del día.", tag: "daily" });
    if (ok) { record.lastSent.daily = clock.date; sent++; }
  }
  if (record.kinds.missed && !trainedToday && record.lastSent.missed !== clock.date && clock.minutes >= MISSED_HOUR * 60 && clock.minutes < MISSED_HOUR * 60 + 60) {
    const ok = await sendPush(record, { title: "Hoy no registraste tu entreno", body: "Si fuiste, anótalo. Si no, puedes retomar la rutina mañana.", tag: "missed" });
    if (ok) { record.lastSent.missed = clock.date; sent++; }
  }
  if (sent > 0) await putRecord(record);
  return sent;
}

// Llámalo cada 15 minutos con `Authorization: Bearer <CRON_SECRET>`.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const now = new Date();
  let sent = 0;
  for (const record of await getAllRecords()) sent += await run(record, now).catch(() => 0);
  return NextResponse.json({ ok: true, sent });
}
