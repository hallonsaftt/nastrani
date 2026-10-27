import Link from "next/link";

export const metadata = { title: "Metodologija i ispravke" };

export default function Methodology() {
  return (
    <div className="wrap page prose">
      <h1>Metodologija i ispravke</h1>
      <p className="lede">Kako nastaje profil i šta radimo kada pogrešimo.</p>

      <div className="section">
        <h2>Koga istražujemo</h2>
        <p>
          Isključivo nosioce javnih funkcija, kandidate na izborima, direktore i članove organa
          javnih preduzeća i ustanova, i lica koja su javno finansirala stranke. Ne objavljujemo
          profile privatnih lica bez javne uloge, niti podatke o porodici, zdravlju ili adresi.
        </p>
      </div>

      <div className="section">
        <h2>Kako nastaje profil</h2>
        <p>
          Zahtev koji podnesete ne objavljuje se automatski. Redakcija proverava da li lice ima
          javnu ulogu, prikuplja podatke iz javnih izvora (službeni glasnici, izborne liste, odluke
          organa, imovinske karte Agencije za sprečavanje korupcije, finansijski izveštaji stranaka,
          APR) i objavljuje profil tek kada je svaka tvrdnja potkrepljena izvorom.
        </p>
      </div>

      <div className="section">
        <h2>Ispravke i pravo na odgovor</h2>
        <p>
          Svako lice o kome pišemo može zatražiti ispravku ili objavljivanje odgovora. Na dnu svakog
          profila nalazi se link za to, a zahtev možete podneti i{" "}
          <Link href="/prijava?tip=ispravka">ovde</Link>. Utvrđene greške ispravljamo i navodimo datum
          izmene.
        </p>
      </div>
    </div>
  );
}
