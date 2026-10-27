import Link from "next/link";
import { REQUEST_STATUSES } from "@/lib/data";
import { listRequests, requestCounts } from "@/lib/admin";
import { profileFromRequest, saveRequest } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — zahtevi" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminRequests({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = status && status in REQUEST_STATUSES ? status : undefined;
  const requests = listRequests(filter);
  const counts = requestCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="page">
      <h1>Zahtevi</h1>
      <div className="filters" role="group" aria-label="Status">
        <Link href="/admin" className="pill" aria-current={!filter ? "true" : undefined}>
          Svi <span>{total}</span>
        </Link>
        {Object.entries(REQUEST_STATUSES).map(([k, v]) => (
          <Link key={k} href={`/admin?status=${k}`} className="pill" aria-current={filter === k ? "true" : undefined}>
            {v} <span>{counts[k] ?? 0}</span>
          </Link>
        ))}
      </div>

      {requests.length === 0 && <p className="sub">Nema zahteva.</p>}
      {requests.map((r) => (
        <div key={r.id} className="req-card">
          <div className="req-head">
            <h3>{r.subject_name}</h3>
            <div>
              <span className="tag">{r.kind === "ispravka" ? "Ispravka" : "Novo lice"}</span>
              <span className={`tag st-${r.status}`}>{REQUEST_STATUSES[r.status]}</span>
            </div>
          </div>
          <div className="meta">
            {r.code} · {r.created_at}
            {r.public_role && ` · ${r.public_role}`}
            {r.contact && ` · ${r.contact}`}
          </div>
          {r.details && <pre>{r.details}</pre>}
          {r.sources && <pre className="muted">{r.sources}</pre>}
          <div className="req-actions">
            <form action={saveRequest}>
              <input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status} aria-label="Status">
                {Object.entries(REQUEST_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <input name="note" defaultValue={r.note ?? ""} placeholder="Interna beleška" aria-label="Beleška" />
              <button>Sačuvaj</button>
            </form>
            {r.person_slug ? (
              <Link className="btn-ghost" href={`/osoba/${r.person_slug}`}>Profil →</Link>
            ) : (
              r.kind === "novi" && (
                <form action={profileFromRequest}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="btn-ghost">Napravi nacrt profila</button>
                </form>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
