import { NextResponse } from "next/server";
import { searchPersons } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return NextResponse.json({ results: searchPersons(q.slice(0, 80)) });
}
