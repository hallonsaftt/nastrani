import Link from "next/link";
import PersonList from "@/components/PersonList";
import { CONNECTION_TYPES, listParties, listPersons } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sva lica" };

type Props = { searchParams: Promise<{ stranka?: string; tip?: string; sort?: string }> };

export default async function PeoplePage({ searchParams }: Props) {
  const sp = await searchParams;
  const parties = listParties();
  const party = parties.some((p) => p.slug === sp.stranka) ? sp.stranka : undefined;
  const type = sp.tip && sp.tip in CONNECTION_TYPES ? sp.tip : undefined;
  const sort = sp.sort === "novo" ? "novo" : "ime";
  const people = listPersons({ party, type, sort });

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const next = { stranka: party, tip: type, sort: sort === "novo" ? "novo" : undefined, ...patch };
    for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/lica?${s}` : "/lica";
  };

  return (
    <div className="wrap page">
      <h1>Sva lica</h1>
      <p className="lede">{people.length} {people.length === 1 ? "profil" : "profila"}</p>

      <div className="filters" role="group" aria-label="Stranka">
        <Link href={href({ stranka: undefined })} className="pill" aria-current={!party ? "true" : undefined}>
          Sve stranke
        </Link>
        {parties.map((p) => (
          <Link key={p.slug} href={href({ stranka: p.slug })} className="pill" aria-current={party === p.slug ? "true" : undefined}>
            <i style={{ background: p.color }} />
            {p.short}
          </Link>
        ))}
      </div>
      <div className="filters" role="group" aria-label="Tip veze">
        <Link href={href({ tip: undefined })} className="pill" aria-current={!type ? "true" : undefined}>
          Sve veze
        </Link>
        {Object.entries(CONNECTION_TYPES).map(([k, v]) => (
          <Link key={k} href={href({ tip: k })} className="pill" aria-current={type === k ? "true" : undefined}>
            {v}
          </Link>
        ))}
      </div>
      <div className="sort">
        Redosled:{" "}
        <Link href={href({ sort: undefined })} aria-current={sort === "ime" ? "true" : undefined}>po imenu</Link>
        {" · "}
        <Link href={href({ sort: "novo" })} aria-current={sort === "novo" ? "true" : undefined}>najnovije</Link>
      </div>

      <PersonList people={people} empty="Nema lica za izabrane filtere." />
    </div>
  );
}
