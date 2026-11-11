import { NextResponse } from "next/server";
import { sendPush } from "../../../_lib/push-send";
import { getRecord, recordId } from "../../../_lib/push-store";

// Envía una notificación de prueba al dispositivo que la pide.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  if (!body?.endpoint) return NextResponse.json({ error: "Falta el endpoint." }, { status: 400 });
  const record = await getRecord(recordId(body.endpoint));
  if (!record) return NextResponse.json({ error: "Este dispositivo no está registrado en el servidor. Desactiva y vuelve a activar las notificaciones." }, { status: 404 });
  try {
    const delivered = await sendPush(record, { title: "Notificación de prueba", body: "Si ves esto, los avisos de ExorFitness funcionan.", tag: "test" });
    if (!delivered) return NextResponse.json({ error: "La suscripción expiró. Vuelve a activar las notificaciones." }, { status: 410 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo enviar." }, { status: 502 });
  }
}
