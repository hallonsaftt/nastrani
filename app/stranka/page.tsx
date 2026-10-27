import Link from "next/link";
import { listParties } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stranke" };

export default function PartiesPage() {
  const parties = listParties();
  return (
    <div className="wrap page">
      <h1>Stranke</h1>
      <p className="lede">Stranke koje pratimo i broj objavljenih profila povezanih sa svakom.</p>
      <ul className="list">
        {parties.map((p) => (
          <li key={p.slug}>
            <Link href={`/stranka/${p.slug}`}>
              <span className="n">
                <span className="chip" style={{ marginRight: 10 }}>
                  <i style={{ background: p.color }} />
                  {p.short}
                </span>
                {p.name}
              </span>
              <span className="m">{p.people} profila</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
