"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminAuthHeader } from "@/lib/auth";
import { CONNECTION_TYPES, REQUEST_STATUSES } from "@/lib/data";
import * as admin from "@/lib/admin";

async function requireAdmin() {
  if (!isAdminAuthHeader((await headers()).get("authorization"))) {
    throw new Error("Nije dozvoljeno.");
  }
}

const field = (f: FormData, key: string, max = 5000) =>
  String(f.get(key) ?? "").trim().slice(0, max);

const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);

function refreshPublic() {
  revalidatePath("/", "layout");
}

// --- Zahtevi ---

export async function saveRequest(f: FormData) {
  await requireAdmin();
  const status = field(f, "status");
  if (!(status in REQUEST_STATUSES)) return;
  admin.updateRequest(Number(f.get("id")), status, field(f, "note", 2000));
  revalidatePath("/admin");
}

// Napravi nacrt profila iz zahteva i poveži zahtev sa njim.
export async function profileFromRequest(f: FormData) {
  await requireAdmin();
  const req = admin.getRequest(Number(f.get("id")));
  if (!req) return;
  const { id, slug } = admin.savePerson(null, {
    name: req.subject_name,
    aliases: "",
    role: req.public_role,
    city: "",
    born: "",
    summary: "",
    biography: "",
    net_worth: "",
    net_worth_source: "",
    status: "draft",
  });
  admin.linkRequestToPerson(req.id, slug);
  if (req.status === "novo") admin.updateRequest(req.id, "u_istrazi", req.note ?? "");
  redirect(`/admin/lica/${id}`);
}

// --- Lica ---

export async function savePersonAction(f: FormData) {
  await requireAdmin();
  const idRaw = Number(f.get("id"));
  const name = field(f, "name", 120);
  if (name.length < 3) throw new Error("Ime je obavezno.");
  const { id } = admin.savePerson(idRaw || null, {
    name,
    aliases: field(f, "aliases", 500),
    role: field(f, "role", 200),
    city: field(f, "city", 100),
    born: field(f, "born", 20),
    summary: field(f, "summary", 600),
    biography: field(f, "biography", 20000),
    net_worth: field(f, "net_worth", 200),
    net_worth_source: field(f, "net_worth_source", 500),
    status: f.get("status") === "published" ? "published" : "draft",
  });
  refreshPublic();
  redirect(`/admin/lica/${id}?sacuvano=1`);
}

export async function deletePersonAction(f: FormData) {
  await requireAdmin();
  if (f.get("confirm") !== "on") return;
  admin.deletePerson(Number(f.get("id")));
  refreshPublic();
  redirect("/admin/lica");
}

export async function addConnectionAction(f: FormData) {
  await requireAdmin();
  const personId = Number(f.get("person_id"));
  const type = field(f, "type");
  const source_url = field(f, "source_url", 1000);
  if (!(type in CONNECTION_TYPES) || !isUrl(source_url)) {
    redirect(`/admin/lica/${personId}?greska=veza#veze`);
  }
  admin.addConnection(personId, {
    party_id: Number(f.get("party_id")),
    type,
    description: field(f, "description", 500),
    period_from: field(f, "period_from", 20),
    period_to: field(f, "period_to", 20),
    source_url,
    source_label: field(f, "source_label", 200),
  });
  refreshPublic();
  redirect(`/admin/lica/${personId}#veze`);
}

export async function deleteConnectionAction(f: FormData) {
  await requireAdmin();
  const personId = Number(f.get("person_id"));
  admin.deleteConnection(personId, Number(f.get("id")));
  refreshPublic();
  redirect(`/admin/lica/${personId}#veze`);
}

export async function addTimelineAction(f: FormData) {
  await requireAdmin();
  const personId = Number(f.get("person_id"));
  const date = field(f, "date", 20);
  const text = field(f, "text", 500);
  const source_url = field(f, "source_url", 1000);
  if (date && text && (!source_url || isUrl(source_url))) {
    admin.addTimeline(personId, date, text, source_url);
    refreshPublic();
  }
  redirect(`/admin/lica/${personId}#hronologija`);
}

export async function deleteTimelineAction(f: FormData) {
  await requireAdmin();
  const personId = Number(f.get("person_id"));
  admin.deleteTimeline(personId, Number(f.get("id")));
  refreshPublic();
  redirect(`/admin/lica/${personId}#hronologija`);
}

// --- Stranke ---

export async function savePartyAction(f: FormData) {
  await requireAdmin();
  const name = field(f, "name", 150);
  const short = field(f, "short", 20);
  const color = /^#[0-9a-f]{6}$/i.test(field(f, "color")) ? field(f, "color") : "#888888";
  if (name.length < 2 || short.length < 1) return;
  admin.saveParty(Number(f.get("id")) || null, {
    name,
    short,
    color,
    description: field(f, "description", 1000),
  });
  refreshPublic();
  revalidatePath("/admin/stranke");
}

export async function deletePartyAction(f: FormData) {
  await requireAdmin();
  admin.deleteParty(Number(f.get("id")));
  refreshPublic();
  revalidatePath("/admin/stranke");
}
