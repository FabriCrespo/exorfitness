import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";

export type PushKinds = { daily: boolean; rest: boolean; missed: boolean };

export type PushRecord = {
  id: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  timezone: string;
  /** "HH:MM" en la hora local del usuario. */
  reminderTime: string;
  kinds: PushKinds;
  /** Etiqueta y enfoque de cada día de entreno, lunes a sábado. */
  schedule: { label: string; focus: string }[];
  /** Fechas locales (AAAA-MM-DD) con una sesión guardada. */
  doneDates: string[];
  /** Última fecha en la que se envió cada aviso, para no repetirlo. */
  lastSent: Partial<Record<"daily" | "missed", string>>;
};

export const recordId = (endpoint: string) => createHash("sha256").update(endpoint).digest("hex").slice(0, 32);

const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Sin Redis (desarrollo local) se guarda en un archivo; en Vercel el disco es de solo lectura.
const FILE = path.join(process.cwd(), "data", "push-subscriptions.json");
const memoryFlags = new Map<string, number>();

async function readFile() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Record<string, PushRecord>;
  } catch {
    return {};
  }
}

export const storeIsConfigured = () => Boolean(redis) || process.env.VERCEL !== "1";

export async function getAllRecords(): Promise<PushRecord[]> {
  if (redis) return Object.values((await redis.hgetall<Record<string, PushRecord>>("push:subs")) ?? {});
  return Object.values(await readFile());
}

export async function getRecord(id: string): Promise<PushRecord | null> {
  if (redis) return (await redis.hget<PushRecord>("push:subs", id)) ?? null;
  return (await readFile())[id] ?? null;
}

export async function putRecord(record: PushRecord) {
  if (redis) {
    await redis.hset("push:subs", { [record.id]: record });
    return;
  }
  const all = await readFile();
  all[record.id] = record;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

export async function removeRecord(id: string) {
  if (redis) {
    await redis.hdel("push:subs", id);
    return;
  }
  const all = await readFile();
  delete all[id];
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

/** Marcas de corta vida, por ejemplo "este descanso se canceló". */
export async function setFlag(key: string, seconds: number) {
  if (redis) await redis.set(`push:flag:${key}`, 1, { ex: seconds });
  else memoryFlags.set(key, Date.now() + seconds * 1000);
}

export async function hasFlag(key: string) {
  if (redis) return (await redis.get(`push:flag:${key}`)) !== null;
  const until = memoryFlags.get(key);
  return Boolean(until && until > Date.now());
}
