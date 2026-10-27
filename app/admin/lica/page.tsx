import Link from "next/link";
import { adminListPersons } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — lica" };

export default function AdminPersons() {
  const people = adminListPersons();
  return (
    <div className="page">
      <div className="page-head">
        <h1>Lica</h1>
        <Link href="/admin/lica/novo" className="btn">+ Novo lice</Link>
      </div>
      <ul className="list">
        {people.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/lica/${p.id}`}>
              <span className="n">
                {p.name}
                {p.is_demo === 1 && <span className="tag" style={{ marginLeft: 8 }}>demo</span>}
                <span className="m-inline">{p.role}</span>
              </span>
              <span className="m">
                <span className={`tag st-${p.status}`}>{p.status === "published" ? "Objavljeno" : "Nacrt"}</span>
                {p.connections} veza · {p.updated_at}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
