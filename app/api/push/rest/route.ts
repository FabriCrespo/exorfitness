import { after, NextResponse } from "next/server";
import { sendPush } from "../../../_lib/push-send";
import { getRecord, hasFlag, recordId, setFlag } from "../../../_lib/push-store";

// El servidor espera a que termine el descanso y entonces envía el aviso.
export const maxDuration = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { action?: string; endpoint?: string; id?: string; seconds?: number } | null;
  if (!body?.endpoint || typeof body.id !== "string" || body.id.length > 64) return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  const key = `rest:${body.id}`;

  if (body.action === "cancel") {
    await setFlag(key, 600);
    return NextResponse.json({ ok: true });
  }

  const seconds = Number(body.seconds);
  if (!Number.isFinite(seconds) || seconds < 5 || seconds > 280) return NextResponse.json({ error: "Duración no válida." }, { status: 400 });
  const record = await getRecord(recordId(body.endpoint));
  if (!record?.kinds.rest) return NextResponse.json({ ok: false });

  after(async () => {
    await sleep(seconds * 1000);
    if (await hasFlag(key)) return;
    await sendPush(record, { title: "Descanso terminado", body: "Es hora de la siguiente serie.", tag: "rest-end" }).catch(() => undefined);
  });
  return NextResponse.json({ ok: true });
}
