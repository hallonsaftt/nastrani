import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthHeader } from "@/lib/auth";

// /admin je zaštićen HTTP Basic Auth-om (ADMIN_USER / ADMIN_PASSWORD iz .env).
// Ako lozinka nije podešena, admin je potpuno zaključan.
export function middleware(req: NextRequest) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
    return new NextResponse("Admin nije podešen (ADMIN_USER / ADMIN_PASSWORD).", { status: 503 });
  }
  if (isAdminAuthHeader(req.headers.get("authorization"))) return NextResponse.next();
  return new NextResponse("Potrebna prijava.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="nastrani admin"' },
  });
}

export const config = { matcher: ["/admin/:path*"] };
