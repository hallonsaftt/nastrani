import Link from "next/link";
import type { PersonCard } from "@/lib/data";

export function Initials({ name, size = 40 }: { name: string; size?: number }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden>
      {letters}
    </span>
  );
}

export function PartyChips({ parties }: { parties: PersonCard["parties"] }) {
  return (
    <span className="chips">
      {parties.map((p) => (
        <span key={p.slug} className="chip">
          <i style={{ background: p.color }} />
          {p.short}
        </span>
      ))}
    </span>
  );
}

export default function PersonList({ people, empty }: { people: PersonCard[]; empty?: string }) {
  if (people.length === 0) return <p className="sub">{empty ?? "Nema rezultata."}</p>;
  return (
    <ul className="plist">
      {people.map((p) => (
        <li key={p.slug}>
          <Link href={`/osoba/${p.slug}`}>
            <Initials name={p.name} />
            <span className="plist-main">
              <span className="n">{p.name}</span>
              <span className="m">{[p.role, p.city].filter(Boolean).join(" · ")}</span>
            </span>
            <PartyChips parties={p.parties} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
