import Link from "next/link";
import { notFound } from "next/navigation";
import PersonList from "@/components/PersonList";
import { getParty } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const data = getParty((await params).slug);
  return { title: data?.party.name ?? "Nije pronađeno" };
}

export default async function PartyPage({ params }: Props) {
  const data = getParty((await params).slug);
  if (!data) notFound();
  const { party, people } = data;
  return (
    <div className="wrap page">
      <Link href="/stranka" className="back">← Stranke</Link>
      <h1 className="party-title">
        <span className="party-dot" style={{ background: party.color }} />
        {party.name}
      </h1>
      <p className="lede">
        {party.short} · {people.length} {people.length === 1 ? "povezano lice" : "povezanih lica"} ·{" "}
        <Link href={`/lica?stranka=${party.slug}`}>filtriraj po tipu veze</Link>
      </p>
      {party.description && <p>{party.description}</p>}
      <PersonList people={people} empty="Još nema objavljenih profila povezanih sa ovom strankom." />
    </div>
  );
}
