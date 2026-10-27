import RequestForm from "@/components/RequestForm";

export const metadata = { title: "Podnesi zahtev" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function RequestPage({ searchParams }: Props) {
  const sp = await searchParams;
  const kind = sp.tip === "ispravka" ? "ispravka" : "novi";
  return (
    <div className="wrap page">
      <h1>Podnesi zahtev</h1>
      <p className="lede">
        Predložite lice za istraživanje ili zatražite ispravku postojećeg profila. Ništa se ne
        objavljuje bez provere.
      </p>
      <RequestForm
        key={kind}
        initialKind={kind}
        initialName={sp.ime?.slice(0, 120) ?? ""}
        personSlug={sp.osoba?.slice(0, 120) ?? null}
      />
    </div>
  );
}
