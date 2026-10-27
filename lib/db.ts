import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seed } from "./seed";

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "nastrani.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS parties (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#888888',
  description TEXT
);

CREATE TABLE IF NOT EXISTS persons (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_norm TEXT NOT NULL,
  aliases TEXT,                -- dodatni oblici imena (ćirilica, nadimci), odvojeni zarezom
  search_norm TEXT NOT NULL DEFAULT '',  -- normalizovano ime + aliasi, za pretragu
  role TEXT,                   -- trenutna funkcija / zanimanje
  city TEXT,
  born TEXT,
  summary TEXT,
  biography TEXT,
  net_worth TEXT,              -- slobodan tekst, npr. "oko 2,4 mil. EUR"
  net_worth_source TEXT,       -- URL ili opis izvora (npr. ACAS imovinska karta)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  is_demo INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (date('now'))
);
CREATE INDEX IF NOT EXISTS persons_norm ON persons(name_norm);

CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  period_from TEXT,
  period_to TEXT,
  source_url TEXT NOT NULL,    -- svaka veza mora imati izvor
  source_label TEXT
);

CREATE TABLE IF NOT EXISTS timeline (
  id INTEGER PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  source_url TEXT
);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'novi' CHECK (kind IN ('novi','ispravka')),
  subject_name TEXT NOT NULL,
  public_role TEXT NOT NULL,
  details TEXT,
  sources TEXT,
  contact TEXT,
  person_slug TEXT,
  status TEXT NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo','u_istrazi','objavljeno','odbijeno')),
  note TEXT,
  code TEXT UNIQUE,            -- šifra za praćenje statusa zahteva
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

declare global {
  // eslint-disable-next-line no-var
  var __nastraniDb: DatabaseSync | undefined;
}

export function db(): DatabaseSync {
  if (!globalThis.__nastraniDb) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const d = new DatabaseSync(DB_PATH);
    d.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    d.exec(SCHEMA);
    const { n } = d.prepare("SELECT COUNT(*) AS n FROM parties").get() as { n: number };
    if (n === 0) seed(d);
    globalThis.__nastraniDb = d;
  }
  return globalThis.__nastraniDb;
}
