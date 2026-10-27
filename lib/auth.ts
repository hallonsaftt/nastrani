// HTTP Basic Auth za admin. Koristi se i u middleware-u (Edge) i u server akcijama,
// jer se server akcije mogu pozvati POST-om na bilo koju rutu, ne samo na /admin.

export function isAdminAuthHeader(header: string | null): boolean {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass || !header) return false;
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }
  const i = decoded.indexOf(":");
  return i > 0 && decoded.slice(0, i) === user && decoded.slice(i + 1) === pass;
}
