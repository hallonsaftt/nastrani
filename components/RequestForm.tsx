"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  initialKind: "novi" | "ispravka";
  initialName: string;
  personSlug: string | null;
};

export default function RequestForm({ initialKind, initialName, personSlug }: Props) {
  const [kind, setKind] = useState(initialKind);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/zahtev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        subject_name: f.get("subject_name"),
        public_role: f.get("public_role") ?? "",
        details: f.get("details"),
        sources: f.get("sources"),
        contact: f.get("contact"),
        person_slug: personSlug,
        confirm: f.get("confirm") === "on",
        website: f.get("website"),
      }),
    }).catch(() => null);
    if (res?.ok) {
      const data = await res.json().catch(() => null);
      setCode(data?.code ?? null);
      setState("done");
      return;
    }
    const data = await res?.json().catch(() => null);
    setError(data?.error ?? "Slanje nije uspelo. Pokušajte ponovo.");
    setState("idle");
  }

  if (state === "done") {
    return (
      <div className="success">
        <p style={{ marginTop: 0 }}>
          <strong>Zahtev je primljen.</strong>
        </p>
        {code && (
          <>
            <p>Šifra vašeg zahteva — sačuvajte je da biste pratili status:</p>
            <p className="code">{code}</p>
            <p>
              <Link href={`/status?sifra=${code}`}>Proveri status →</Link>
            </p>
          </>
        )}
        <p style={{ marginBottom: 0 }} className="muted">
          Redakcija će ga razmotriti. Profil se objavljuje tek kada su sve tvrdnje potvrđene javnim
          izvorima.
        </p>
      </div>
    );
  }

  return (
    <form className="req" onSubmit={onSubmit}>
      <div className="seg" role="group" aria-label="Vrsta zahteva">
        <button type="button" aria-pressed={kind === "novi"} onClick={() => setKind("novi")}>
          Novo lice
        </button>
        <button type="button" aria-pressed={kind === "ispravka"} onClick={() => setKind("ispravka")}>
          Ispravka / pravo na odgovor
        </button>
      </div>

      <div className="field">
        <label htmlFor="subject_name">Ime i prezime lica</label>
        <input id="subject_name" name="subject_name" required minLength={3} maxLength={120} defaultValue={initialName} />
      </div>

      {kind === "novi" && (
        <div className="field">
          <label htmlFor="public_role">Javna funkcija ili uloga</label>
          <input id="public_role" name="public_role" required minLength={3} maxLength={300} placeholder="npr. direktor JP, odbornik, član upravnog odbora…" />
          <div className="hint">Istražujemo samo lica sa javnom funkcijom ili javnom ulogom.</div>
        </div>
      )}

      <div className="field">
        <label htmlFor="details">{kind === "novi" ? "Šta znate o vezi sa strankom?" : "Šta je netačno i kako treba da glasi?"}</label>
        <textarea id="details" name="details" maxLength={5000} required={kind === "ispravka"} />
      </div>

      <div className="field">
        <label htmlFor="sources">Izvori (linkovi, dokumenti)</label>
        <textarea id="sources" name="sources" maxLength={3000} style={{ minHeight: 80 }} placeholder="Jedan link po redu" />
      </div>

      <div className="field">
        <label htmlFor="contact">Vaš kontakt (opciono)</label>
        <input id="contact" name="contact" type="email" maxLength={200} placeholder="email — samo ako želite da vas kontaktiramo" />
        <div className="hint">Kontakt se ne objavljuje.</div>
      </div>

      <div className="hp" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {kind === "novi" && (
        <label className="check">
          <input type="checkbox" name="confirm" required />
          <span>
            Potvrđujem da lice ima javnu funkciju ili ulogu i da zahtev ne podnosim radi
            uznemiravanja privatnog lica.
          </span>
        </label>
      )}

      {error && <div className="error">{error}</div>}
      <button className="btn" disabled={state === "sending"}>
        {state === "sending" ? "Šaljem…" : "Pošalji zahtev"}
      </button>
    </form>
  );
}
