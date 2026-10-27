import Link from "next/link";
import { getRequestByCode, REQUEST_STATUSES } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Status zahteva" };

const STEPS = ["novo", "u_istrazi", "objavljeno"] as const;

type Props = { searchParams: Promise<{ sifra?: string }> };

export default async function StatusPage({ searchParams }: Props) {
  const { sifra } = await searchParams;
  const code = sifra?.slice(0, 20) ?? "";
  const req = code ? getRequestByCode(code) : null;

  return (
    <div className="wrap page">
      <h1>Status zahteva</h1>
      <p className="lede">Upišite šifru koju ste dobili posle slanja zahteva.</p>
      <form className="status-form" action="/status">
        <input name="sifra" defaultValue={code} placeholder="XXXX-XXXX" aria-label="Šifra zahteva" autoCapitalize="characters" required />
        <button className="btn">Proveri</button>
      </form>

      {code && !req && <p className="error" style={{ marginTop: 20 }}>Zahtev sa tom šifrom ne postoji.</p>}

      {req && (
        <div className="success status-card">
          <div className="meta">
            {req.kind === "ispravka" ? "Ispravka" : "Zahtev za istraživanje"} · podnet {req.created_at.slice(0, 10)}
          </div>
          <h2 className="status-name">{req.subject_name}</h2>
          {req.status === "odbijeno" ? (
            <p>
              <strong className="error">Odbijeno.</strong> Zahtev ne ispunjava uslove (lice bez javne uloge
              ili nema dovoljno proverljivih izvora). Više u <Link href="/metodologija">metodologiji</Link>.
            </p>
          ) : (
            <ol className="steps">
              {STEPS.map((s, i) => {
                const reached = STEPS.indexOf(req.status as (typeof STEPS)[number]) >= i;
                return (
                  <li key={s} className={reached ? "done" : ""}>
                    <span className="dot" />
                    {REQUEST_STATUSES[s]}
                  </li>
                );
              })}
            </ol>
          )}
          {req.status === "objavljeno" && req.person_slug && req.has_profile && (
            <p style={{ marginBottom: 0 }}>
              <Link href={`/osoba/${req.person_slug}`}>Pogledaj profil →</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
