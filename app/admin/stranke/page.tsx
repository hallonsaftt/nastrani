import { adminListParties } from "@/lib/admin";
import { deletePartyAction, savePartyAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — stranke" };

export default function AdminParties() {
  const parties = adminListParties();
  return (
    <div className="page">
      <h1>Stranke</h1>
      {parties.map((p) => (
        <div key={p.id} className="req-card">
          <form action={savePartyAction} className="party-form">
            <input type="hidden" name="id" value={p.id} />
            <input type="color" name="color" defaultValue={p.color} aria-label="Boja" />
            <input name="short" defaultValue={p.short} aria-label="Skraćenica" className="w-short" />
            <input name="name" defaultValue={p.name} aria-label="Naziv" />
            <button>Sačuvaj</button>
          </form>
          <div className="meta" style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{p.connections} veza · /stranka/{p.slug}</span>
            {p.connections === 0 && (
              <form action={deletePartyAction}>
                <input type="hidden" name="id" value={p.id} />
                <button className="btn-link">Obriši</button>
              </form>
            )}
          </div>
        </div>
      ))}

      <div className="section">
        <h2>Nova stranka</h2>
        <form action={savePartyAction} className="party-form">
          <input type="color" name="color" defaultValue="#888888" aria-label="Boja" />
          <input name="short" required placeholder="Skraćenica" aria-label="Skraćenica" className="w-short" />
          <input name="name" required placeholder="Pun naziv stranke" aria-label="Naziv" />
          <button>Dodaj</button>
        </form>
      </div>
    </div>
  );
}
