import { db } from "./db";
import { normalize, slugify } from "./normalize";
import { plain, type Party, type Person, type NewRequest } from "./data";

export type RequestRow = NewRequest & {
  id: number;
  status: string;
  note: string | null;
  code: string | null;
  created_at: string;
};

export function listRequests(status?: string): RequestRow[] {
  const where = status ? "WHERE status = ?" : "";
  return db()
    .prepare(
      `SELECT * FROM requests ${where}
       ORDER BY CASE status WHEN 'novo' THEN 0 WHEN 'u_istrazi' THEN 1 ELSE 2 END, created_at DESC`
    )
    .all(...(status ? [status] : []))
    .map((r) => plain<RequestRow>(r));
}

export function getRequest(id: number) {
  const row = db().prepare("SELECT * FROM requests WHERE id = ?").get(id);
  return row ? plain<RequestRow>(row) : null;
}

export function updateRequest(id: number, status: string, note: string) {
  db().prepare("UPDATE requests SET status = ?, note = ? WHERE id = ?").run(status, note, id);
}

export function linkRequestToPerson(id: number, slug: string) {
  db().prepare("UPDATE requests SET person_slug = ? WHERE id = ?").run(slug, id);
}

export function requestCounts() {
  const rows = db().prepare("SELECT status, COUNT(*) AS n FROM requests GROUP BY status").all() as {
    status: string;
    n: number;
  }[];
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number>;
}

export function adminListPersons() {
  return db()
    .prepare(
      `SELECT pe.id, pe.slug, pe.name, pe.role, pe.status, pe.updated_at, pe.is_demo,
              (SELECT COUNT(*) FROM connections c WHERE c.person_id = pe.id) AS connections
       FROM persons pe ORDER BY pe.status = 'published', pe.updated_at DESC, pe.id DESC`
    )
    .all()
    .map((r) =>
      plain<Pick<Person, "id" | "slug" | "name" | "role" | "status" | "updated_at" | "is_demo"> & {
        connections: number;
      }>(r)
    );
}

export function getPersonById(id: number) {
  const row = db().prepare("SELECT * FROM persons WHERE id = ?").get(id);
  return row ? plain<Person>(row) : null;
}

function uniqueSlug(base: string, exceptId: number | null) {
  const taken = db().prepare("SELECT id FROM persons WHERE slug = ?");
  let slug = base || "osoba";
  for (let i = 2; ; i++) {
    const row = taken.get(slug) as { id: number } | undefined;
    if (!row || row.id === exceptId) return slug;
    slug = `${base}-${i}`;
  }
}

export type PersonInput = {
  name: string;
  aliases: string;
  role: string;
  city: string;
  born: string;
  summary: string;
  biography: string;
  net_worth: string;
  net_worth_source: string;
  status: "draft" | "published";
};

export function savePerson(id: number | null, p: PersonInput): { id: number; slug: string } {
  const name_norm = normalize(p.name);
  const search_norm = normalize(`${p.name} ${p.aliases}`);
  const slug = uniqueSlug(slugify(p.name), id);
  const values = [
    slug, p.name, name_norm, p.aliases, search_norm, p.role, p.city, p.born, p.summary,
    p.biography, p.net_worth, p.net_worth_source, p.status,
  ];
  if (id) {
    db()
      .prepare(
        `UPDATE persons SET slug=?, name=?, name_norm=?, aliases=?, search_norm=?, role=?, city=?,
           born=?, summary=?, biography=?, net_worth=?, net_worth_source=?, status=?,
           updated_at=date('now')
         WHERE id=?`
      )
      .run(...values, id);
    return { id, slug };
  }
  const res = db()
    .prepare(
      `INSERT INTO persons (slug, name, name_norm, aliases, search_norm, role, city, born, summary,
         biography, net_worth, net_worth_source, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(...values);
  return { id: Number(res.lastInsertRowid), slug };
}

export function touchPerson(id: number) {
  db().prepare("UPDATE persons SET updated_at = date('now') WHERE id = ?").run(id);
}

export function deletePerson(id: number) {
  db().prepare("DELETE FROM persons WHERE id = ?").run(id);
}

export function addConnection(
  personId: number,
  c: {
    party_id: number;
    type: string;
    description: string;
    period_from: string;
    period_to: string;
    source_url: string;
    source_label: string;
  }
) {
  db()
    .prepare(
      `INSERT INTO connections (person_id, party_id, type, description, period_from, period_to,
         source_url, source_label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      personId, c.party_id, c.type, c.description, c.period_from || null, c.period_to || null,
      c.source_url, c.source_label
    );
  touchPerson(personId);
}

export function deleteConnection(personId: number, id: number) {
  db().prepare("DELETE FROM connections WHERE id = ? AND person_id = ?").run(id, personId);
  touchPerson(personId);
}

export function addTimeline(personId: number, date: string, text: string, source_url: string) {
  db()
    .prepare("INSERT INTO timeline (person_id, date, text, source_url) VALUES (?, ?, ?, ?)")
    .run(personId, date, text, source_url || null);
  touchPerson(personId);
}

export function deleteTimeline(personId: number, id: number) {
  db().prepare("DELETE FROM timeline WHERE id = ? AND person_id = ?").run(id, personId);
  touchPerson(personId);
}

export function adminListParties() {
  return db()
    .prepare(
      `SELECT p.*, (SELECT COUNT(*) FROM connections c WHERE c.party_id = p.id) AS connections
       FROM parties p ORDER BY p.name`
    )
    .all()
    .map((r) => plain<Party & { connections: number }>(r));
}

export function saveParty(
  id: number | null,
  p: { name: string; short: string; color: string; description: string }
) {
  if (id) {
    db()
      .prepare("UPDATE parties SET name=?, short=?, color=?, description=? WHERE id=?")
      .run(p.name, p.short, p.color, p.description, id);
    return;
  }
  let slug = slugify(p.short) || slugify(p.name);
  const taken = db().prepare("SELECT 1 FROM parties WHERE slug = ?");
  for (let i = 2; taken.get(slug); i++) slug = `${slugify(p.short)}-${i}`;
  db()
    .prepare("INSERT INTO parties (slug, name, short, color, description) VALUES (?, ?, ?, ?, ?)")
    .run(slug, p.name, p.short, p.color, p.description);
}

// Briše se samo stranka bez veza, da se slučajno ne izgube istraženi podaci.
export function deleteParty(id: number): boolean {
  const { n } = db().prepare("SELECT COUNT(*) AS n FROM connections WHERE party_id = ?").get(id) as {
    n: number;
  };
  if (n > 0) return false;
  db().prepare("DELETE FROM parties WHERE id = ?").run(id);
  return true;
}
