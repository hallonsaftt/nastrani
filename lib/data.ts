import { randomBytes } from "node:crypto";
import { db } from "./db";
import { normalize } from "./normalize";

export const CONNECTION_TYPES: Record<string, string> = {
  clan: "Član",
  funkcioner: "Funkcioner",
  kandidat: "Kandidat na listi",
  imenovanje: "Partijsko imenovanje",
  donator: "Donator",
  poslovna: "Poslovna veza",
  srodnik: "Srodstvo sa funkcionerom",
};

export const REQUEST_STATUSES: Record<string, string> = {
  novo: "Primljen",
  u_istrazi: "U istrazi",
  objavljeno: "Objavljeno",
  odbijeno: "Odbijeno",
};

export type Party = {
  id: number;
  slug: string;
  name: string;
  short: string;
  color: string;
  description: string | null;
};

export type Person = {
  id: number;
  slug: string;
  name: string;
  aliases: string | null;
  role: string | null;
  city: string | null;
  born: string | null;
  summary: string | null;
  biography: string | null;
  net_worth: string | null;
  net_worth_source: string | null;
  status: "draft" | "published";
  is_demo: number;
  updated_at: string;
};

export type Connection = {
  id: number;
  type: string;
  description: string | null;
  period_from: string | null;
  period_to: string | null;
  source_url: string;
  source_label: string | null;
  party_id: number;
  party_slug: string;
  party_name: string;
  party_short: string;
  party_color: string;
};

export type TimelineEntry = { id: number; date: string; text: string; source_url: string | null };

export type PartyTag = { slug: string; short: string; color: string };

export type PersonCard = {
  slug: string;
  name: string;
  role: string | null;
  city: string | null;
  updated_at: string;
  parties: PartyTag[];
};

// Plain objekti: node:sqlite vraća redove bez prototipa, a React ih ne serijalizuje.
export const plain = <T,>(row: unknown): T => ({ ...(row as object) }) as T;

function withParties<T extends { id: number }>(rows: T[]): (Omit<T, "id"> & { parties: PartyTag[] })[] {
  const stmt = db().prepare(
    `SELECT DISTINCT p.slug, p.short, p.color FROM connections c
     JOIN parties p ON p.id = c.party_id WHERE c.person_id = ? ORDER BY p.short`
  );
  return rows.map(({ id, ...rest }) => ({
    ...rest,
    parties: stmt.all(id).map((p) => plain<PartyTag>(p)),
  }));
}

const CARD_COLS = "pe.id, pe.slug, pe.name, pe.role, pe.city, pe.updated_at";
type CardRow = { id: number; slug: string; name: string; role: string | null; city: string | null; updated_at: string };

export function searchPersons(query: string, limit = 8): PersonCard[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const rows = db()
    .prepare(
      `SELECT ${CARD_COLS},
         CASE
           WHEN pe.name_norm LIKE ? THEN 0         -- ime počinje upitom
           WHEN pe.name_norm LIKE ? THEN 1         -- neka reč imena počinje upitom
           ELSE 2                                  -- pogodak u sredini ili u aliasu
         END AS rank
       FROM persons pe
       WHERE pe.status = 'published' AND pe.search_norm LIKE ?
       ORDER BY rank, pe.name_norm
       LIMIT ?`
    )
    .all(`${q}%`, `% ${q}%`, `%${q}%`, limit)
    .map((r) => {
      const { rank: _rank, ...rest } = plain<CardRow & { rank: number }>(r);
      return rest;
    });
  return withParties(rows);
}

export function listPersons(opts: { party?: string; type?: string; sort?: "ime" | "novo" } = {}) {
  const where = ["pe.status = 'published'"];
  const args: string[] = [];
  if (opts.party || opts.type) {
    const sub = ["c.person_id = pe.id"];
    if (opts.party) {
      sub.push("p.slug = ?");
      args.push(opts.party);
    }
    if (opts.type) {
      sub.push("c.type = ?");
      args.push(opts.type);
    }
    where.push(
      `EXISTS (SELECT 1 FROM connections c JOIN parties p ON p.id = c.party_id WHERE ${sub.join(" AND ")})`
    );
  }
  const order = opts.sort === "novo" ? "pe.updated_at DESC, pe.id DESC" : "pe.name_norm";
  const rows = db()
    .prepare(`SELECT ${CARD_COLS} FROM persons pe WHERE ${where.join(" AND ")} ORDER BY ${order}`)
    .all(...args)
    .map((r) => plain<CardRow>(r));
  return withParties(rows);
}

export function listRecent(limit = 5) {
  const rows = db()
    .prepare(
      `SELECT ${CARD_COLS} FROM persons pe WHERE pe.status = 'published'
       ORDER BY pe.updated_at DESC, pe.id DESC LIMIT ?`
    )
    .all(limit)
    .map((r) => plain<CardRow>(r));
  return withParties(rows);
}

export function getPerson(slug: string) {
  const row = db()
    .prepare("SELECT * FROM persons WHERE slug = ? AND status = 'published'")
    .get(slug);
  if (!row) return null;
  const person = plain<Person>(row);
  return { person, ...getPersonDetails(person.id) };
}

export function getPersonDetails(personId: number) {
  const connections = db()
    .prepare(
      `SELECT c.*, p.slug AS party_slug, p.name AS party_name, p.short AS party_short,
              p.color AS party_color
       FROM connections c JOIN parties p ON p.id = c.party_id
       WHERE c.person_id = ?
       ORDER BY COALESCE(c.period_from, '') DESC`
    )
    .all(personId)
    .map((r) => plain<Connection>(r));
  const timeline = db()
    .prepare("SELECT id, date, text, source_url FROM timeline WHERE person_id = ? ORDER BY date, id")
    .all(personId)
    .map((r) => plain<TimelineEntry>(r));
  return { connections, timeline };
}

// Druga objavljena lica povezana sa istim strankama, najpre ona sa najviše zajedničkih stranaka.
export function relatedPersons(personId: number, limit = 4) {
  const rows = db()
    .prepare(
      `SELECT ${CARD_COLS}, COUNT(DISTINCT c2.party_id) AS shared
       FROM connections c1
       JOIN connections c2 ON c2.party_id = c1.party_id AND c2.person_id != c1.person_id
       JOIN persons pe ON pe.id = c2.person_id
       WHERE c1.person_id = ? AND pe.status = 'published'
       GROUP BY pe.id ORDER BY shared DESC, pe.updated_at DESC LIMIT ?`
    )
    .all(personId, limit)
    .map((r) => {
      const { shared: _s, ...rest } = plain<CardRow & { shared: number }>(r);
      return rest;
    });
  return withParties(rows);
}

export function getParty(slug: string) {
  const row = db().prepare("SELECT * FROM parties WHERE slug = ?").get(slug);
  if (!row) return null;
  const party = plain<Party>(row);
  return { party, people: listPersons({ party: slug }) };
}

export function listParties() {
  return db()
    .prepare(
      `SELECT p.*, (SELECT COUNT(DISTINCT c.person_id) FROM connections c
                    JOIN persons pe ON pe.id = c.person_id
                    WHERE c.party_id = p.id AND pe.status = 'published') AS people
       FROM parties p ORDER BY p.name`
    )
    .all()
    .map((r) => plain<Party & { people: number }>(r));
}

export function countPublished(): number {
  const r = db().prepare("SELECT COUNT(*) AS n FROM persons WHERE status = 'published'").get() as {
    n: number;
  };
  return r.n;
}

export type NewRequest = {
  kind: "novi" | "ispravka";
  subject_name: string;
  public_role: string;
  details: string;
  sources: string;
  contact: string;
  person_slug: string | null;
};

// Šifra bez slova koja se lako pobrkaju (0/O, 1/I/L).
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function newCode() {
  const bytes = randomBytes(8);
  let s = "";
  for (const b of bytes) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export function createRequest(r: NewRequest): string {
  const code = newCode();
  db()
    .prepare(
      `INSERT INTO requests (kind, subject_name, public_role, details, sources, contact, person_slug, code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(r.kind, r.subject_name, r.public_role, r.details, r.sources, r.contact, r.person_slug, code);
  return code;
}

export function getRequestByCode(code: string) {
  const row = db()
    .prepare(
      `SELECT r.kind, r.subject_name, r.status, r.created_at, r.person_slug,
              (SELECT 1 FROM persons p WHERE p.slug = r.person_slug AND p.status = 'published') AS has_profile
       FROM requests r WHERE r.code = ?`
    )
    .get(code.trim().toUpperCase());
  return row
    ? plain<{
        kind: string;
        subject_name: string;
        status: string;
        created_at: string;
        person_slug: string | null;
        has_profile: number | null;
      }>(row)
    : null;
}
