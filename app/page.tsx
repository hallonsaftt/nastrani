import Link from "next/link";
import Search from "@/components/Search";
import PersonList from "@/components/PersonList";
import { countPublished, listParties, listRecent } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Home() {
  const people = countPublished();
  const parties = listParties();
  const recent = listRecent(5);
  return (
    <div className="wrap">
      <section className="hero">
        <h1>Ko je na čijoj strani.</h1>
        <p className="lede">
          Ukucaj ime i proveri da li je osoba povezana sa nekom političkom strankom — članstvo,
          funkcije, imenovanja, donacije. Uz svaku vezu stoji izvor.
        </p>
        <Search />
        <p className="stats">
          <Link href="/lica">{people} objavljenih profila</Link> ·{" "}
          <Link href="/stranka">{parties.length} stranaka</Link> ·{" "}
          <Link href="/prijava">Podnesi zahtev</Link>
        </p>
      </section>

      {recent.length > 0 && (
        <section className="section home-recent">
          <h2>Nedavno ažurirano</h2>
          <PersonList people={recent} />
          <Link href="/lica?sort=novo" className="more">Sva lica →</Link>
        </section>
      )}
    </div>
  );
}
