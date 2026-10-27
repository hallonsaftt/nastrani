import Link from "next/link";
import { notFound } from "next/navigation";
import { CONNECTION_TYPES, getPersonDetails } from "@/lib/data";
import { adminListParties, getPersonById } from "@/lib/admin";
import {
  addConnectionAction,
  addTimelineAction,
  deleteConnectionAction,
  deletePersonAction,
  deleteTimelineAction,
  savePersonAction,
} from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — uređivanje" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sacuvano?: string; greska?: string }>;
};

export default async function EditPerson({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "novo";
  const person = isNew ? null : getPersonById(Number(id));
  if (!isNew && !person) notFound();
  const details = person ? getPersonDetails(person.id) : null;
  const parties = adminListParties();

  return (
    <div className="page editor">
      <Link href="/admin/lica" className="back">← Sva lica</Link>
      <div className="page-head">
        <h1>{person?.name ?? "Novo lice"}</h1>
        {person?.status === "published" && (
          <Link href={`/osoba/${person.slug}`} className="btn-ghost" target="_blank">Javni profil ↗</Link>
        )}
      </div>
      {sp.sacuvano && <div className="notice ok">Sačuvano.</div>}

      <form action={savePersonAction} className="req">
        <input type="hidden" name="id" value={person?.id ?? ""} />
        <div className="grid2">
          <div className="field">
            <label htmlFor="name">Ime i prezime</label>
            <input id="name" name="name" required minLength={3} defaultValue={person?.name} />
          </div>
          <div className="field">
            <label htmlFor="aliases">Drugi oblici imena</label>
            <input id="aliases" name="aliases" defaultValue={person?.aliases ?? ""} placeholder="ćirilica, nadimak…" />
            <div className="hint">Odvojeni zarezom. Koriste se samo za pretragu.</div>
          </div>
          <div className="field">
            <label htmlFor="role">Funkcija / uloga</label>
            <input id="role" name="role" defaultValue={person?.role ?? ""} />
          </div>
          <div className="field grid2-inner">
            <div>
              <label htmlFor="city">Grad</label>
              <input id="city" name="city" defaultValue={person?.city ?? ""} />
            </div>
            <div>
              <label htmlFor="born">Godina rođenja</label>
              <input id="born" name="born" inputMode="numeric" defaultValue={person?.born ?? ""} />
            </div>
          </div>
        </div>
        <div className="field">
          <label htmlFor="summary">Kratak opis</label>
          <textarea id="summary" name="summary" maxLength={600} style={{ minHeight: 70 }} defaultValue={person?.summary ?? ""} />
          <div className="hint">Jedna-dve rečenice. Prikazuje se ispod imena.</div>
        </div>
        <div className="field">
          <label htmlFor="biography">Biografija</label>
          <textarea id="biography" name="biography" style={{ minHeight: 180 }} defaultValue={person?.biography ?? ""} />
          <div className="hint">Prazan red = novi pasus.</div>
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="net_worth">Imovina</label>
            <input id="net_worth" name="net_worth" defaultValue={person?.net_worth ?? ""} placeholder="npr. oko 250.000 EUR" />
          </div>
          <div className="field">
            <label htmlFor="net_worth_source">Izvor za imovinu</label>
            <input id="net_worth_source" name="net_worth_source" defaultValue={person?.net_worth_source ?? ""} placeholder="link ka imovinskoj karti" />
          </div>
        </div>
        <div className="save-bar">
          <select name="status" defaultValue={person?.status ?? "draft"} aria-label="Status">
            <option value="draft">Nacrt (nije javno)</option>
            <option value="published">Objavljeno</option>
          </select>
          <button className="btn">{isNew ? "Napravi" : "Sačuvaj"}</button>
        </div>
      </form>

      {person && details && (
        <>
          <section className="section" id="veze">
            <h2>Veze sa strankama</h2>
            {sp.greska === "veza" && (
              <div className="notice err">Veza nije dodata: izaberite tip i unesite ispravan link izvora (https://…).</div>
            )}
            {details.connections.map((c) => (
              <div key={c.id} className="row-item">
                <div>
                  <span className="chip"><i style={{ background: c.party_color }} />{c.party_short}</span>{" "}
                  <strong>{CONNECTION_TYPES[c.type] ?? c.type}</strong>
                  {c.description && ` — ${c.description}`}
                  <div className="meta">
                    {c.period_from ?? "?"} – {c.period_to ?? "danas"} ·{" "}
                    <a href={c.source_url} target="_blank" rel="noopener noreferrer">{c.source_label || c.source_url}</a>
                  </div>
                </div>
                <form action={deleteConnectionAction}>
                  <input type="hidden" name="person_id" value={person.id} />
                  <input type="hidden" name="id" value={c.id} />
                  <button className="btn-x" aria-label="Obriši vezu">×</button>
                </form>
              </div>
            ))}
            <form action={addConnectionAction} className="add-box">
              <input type="hidden" name="person_id" value={person.id} />
              <div className="grid3">
                <div className="field">
                  <label htmlFor="c_party">Stranka</label>
                  <select id="c_party" name="party_id" required>
                    {parties.map((p) => <option key={p.id} value={p.id}>{p.short} — {p.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="c_type">Tip veze</label>
                  <select id="c_type" name="type" required>
                    {Object.entries(CONNECTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="field grid2-inner">
                  <div><label htmlFor="c_from">Od</label><input id="c_from" name="period_from" placeholder="2019" /></div>
                  <div><label htmlFor="c_to">Do</label><input id="c_to" name="period_to" placeholder="prazno = danas" /></div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="c_desc">Opis</label>
                <input id="c_desc" name="description" placeholder="npr. Odbornik u Skupštini grada" />
              </div>
              <div className="grid2">
                <div className="field">
                  <label htmlFor="c_url">Link izvora (obavezno)</label>
                  <input id="c_url" name="source_url" type="url" required placeholder="https://" />
                </div>
                <div className="field">
                  <label htmlFor="c_label">Naziv izvora</label>
                  <input id="c_label" name="source_label" placeholder="npr. Službeni glasnik RS 45/2019" />
                </div>
              </div>
              <button className="btn">Dodaj vezu</button>
            </form>
          </section>

          <section className="section" id="hronologija">
            <h2>Hronologija</h2>
            {details.timeline.map((t) => (
              <div key={t.id} className="row-item">
                <div><span className="muted">{t.date}</span> &nbsp; {t.text}</div>
                <form action={deleteTimelineAction}>
                  <input type="hidden" name="person_id" value={person.id} />
                  <input type="hidden" name="id" value={t.id} />
                  <button className="btn-x" aria-label="Obriši stavku">×</button>
                </form>
              </div>
            ))}
            <form action={addTimelineAction} className="add-box inline-add">
              <input type="hidden" name="person_id" value={person.id} />
              <input name="date" required placeholder="2021" aria-label="Datum" className="w-date" />
              <input name="text" required placeholder="Šta se desilo" aria-label="Događaj" />
              <input name="source_url" type="url" placeholder="Izvor (opciono)" aria-label="Izvor" />
              <button className="btn">Dodaj</button>
            </form>
          </section>

          <section className="section danger">
            <h2>Brisanje</h2>
            <form action={deletePersonAction} className="inline-add">
              <input type="hidden" name="id" value={person.id} />
              <label className="check"><input type="checkbox" name="confirm" required /> Trajno obriši ovaj profil</label>
              <button className="btn btn-danger">Obriši</button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
