import { NextResponse } from "next/server";
import { createRequest } from "@/lib/data";

export const dynamic = "force-dynamic";

// Jednostavno ograničenje: najviše 5 zahteva po IP adresi na sat (u memoriji procesa).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  // Honeypot polje — ljudi ga ne vide, botovi ga popune.
  if (str(body.website, 200)) return NextResponse.json({ ok: true, code: null });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Previše zahteva. Pokušajte ponovo kasnije." }, { status: 429 });
  }

  const kind = body.kind === "ispravka" ? "ispravka" : "novi";
  const subject_name = str(body.subject_name, 120);
  const public_role = str(body.public_role, 300);
  const details = str(body.details, 5000);
  const sources = str(body.sources, 3000);
  const contact = str(body.contact, 200);
  const person_slug = str(body.person_slug, 120) || null;

  if (subject_name.length < 3) {
    return NextResponse.json({ error: "Upišite ime i prezime lica." }, { status: 400 });
  }
  if (kind === "novi" && public_role.length < 3) {
    return NextResponse.json({ error: "Navedite javnu funkciju ili ulogu lica." }, { status: 400 });
  }
  if (kind === "novi" && body.confirm !== true) {
    return NextResponse.json({ error: "Potvrdite da lice ima javnu ulogu." }, { status: 400 });
  }
  if (kind === "ispravka" && details.length < 10) {
    return NextResponse.json({ error: "Opišite šta treba ispraviti." }, { status: 400 });
  }

  const code = createRequest({ kind, subject_name, public_role, details, sources, contact, person_slug });
  return NextResponse.json({ ok: true, code });
}
