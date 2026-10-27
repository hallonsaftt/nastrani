import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONNECTION_TYPES, getPerson, relatedPersons } from "@/lib/data";
import PersonList, { Initials } from "@/components/PersonList";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = getPerson((await params).slug);
  if (!data) return { title: "Nije pronađeno" };
  return { title: data.person.name, description: data.person.summary ?? undefined };
}

function period(from: string | null, to: string | null) {
  if (!from && !to) return "—";
  if (from && to && from === to) return from;
  return `${from ?? "?"} – ${to ?? "danas"}`;
}

function Source({ url, label }: { url: string | null; label: string | null }) {
  if (!url && !label) return null;
  const isLink = url && /^https?:\/\//.test(url);
  return (
    <div className="src">
      Izvor:{" "}
      {isLink ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {label || new URL(url).hostname}
        </a>
      ) : (
        label || url
      )}
    </div>
  );
}

export default async function PersonPage({ params }: Props) {
  const data = getPerson((await params).slug);
  if (!data) notFound();
  const { person, connections, timeline } = data;
  const related = relatedPersons(person.id);

  const parties = Array.from(
    new Map(connections.map((c) => [c.party_slug, c])).values()
  );
  const sub = [person.role, person.city, person.born && `rođ. ${person.born}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="wrap profile">
      <div className="profile-top">
        <Link href="/" className="back">← Pretraga</Link>
        <ShareButton title={person.name} />
      </div>

      {person.is_demo === 1 && (
        <div className="demo">PRIMER — izmišljena osoba i podaci, samo za prikaz izgleda sajta.</div>
      )}

      <header className="profile-head">
        <Initials name={person.name} size={64} />
        <div>
          <h1>{person.name}</h1>
          {sub && <p className="sub">{sub}</p>}
        </div>
      </header>
      {parties.length > 0 && (
        <div className="chips">
          {parties.map((p) => (
            <Link key={p.party_slug} href={`/stranka/${p.party_slug}`} className="chip">
              <i style={{ background: p.party_color }} />
              {p.party_name}
            </Link>
          ))}
        </div>
      )}
      {person.summary && <p className="summary">{person.summary}</p>}

      <section className="section">
        <h2>Veze sa strankama</h2>
        {connections.length === 0 ? (
          <p className="sub">Nisu utvrđene veze sa strankama.</p>
        ) : (
          connections.map((c) => (
            <div key={c.id} className="conn">
              <div className="period">{period(c.period_from, c.period_to)}</div>
              <div className="what">
                <span className="type">{CONNECTION_TYPES[c.type] ?? c.type}</span>
                <span className="chip">
                  <i style={{ background: c.party_color }} />
                  {c.party_short}
                </span>
              </div>
              {c.description && <div className="desc">{c.description}</div>}
              <Source url={c.source_url} label={c.source_label} />
            </div>
          ))
        )}
      </section>

      {person.biography && (
        <section className="section prose">
          <h2>Biografija</h2>
          {person.biography.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}

      {person.net_worth && (
        <section className="section worth">
          <h2>Imovina</h2>
          <div className="amount">{person.net_worth}</div>
          <Source url={person.net_worth_source} label={person.net_worth_source} />
        </section>
      )}

      {timeline.length > 0 && (
        <section className="section">
          <h2>Hronologija</h2>
          <ol className="timeline">
            {timeline.map((t, i) => (
              <li key={i}>
                <span className="date">{t.date}</span>
                <span>{t.text}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <h2>Povezana lica</h2>
          <PersonList people={related} />
        </section>
      )}

      <div className="meta-foot">
        <span>Poslednje ažuriranje: {person.updated_at}</span>
        <Link href={`/prijava?tip=ispravka&osoba=${person.slug}&ime=${encodeURIComponent(person.name)}`}>
          Prijavi grešku ili zatraži pravo na odgovor
        </Link>
      </div>
    </article>
  );
}
