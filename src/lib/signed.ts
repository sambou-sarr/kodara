// Jetons signés HMAC-SHA256 (fonctions pures, node:crypto uniquement).
// `purpose` sépare les usages : un jeton de téléchargement n'est jamais valable comme session admin.
import { createHmac, timingSafeEqual } from "node:crypto";

function mac(data: string, secret: string, purpose: string): Buffer {
  const key = createHmac("sha256", secret).update(purpose).digest();
  return createHmac("sha256", key).update(data).digest();
}

export function signPayload<T extends { exp: number }>(
  payload: T,
  secret: string,
  purpose: string
): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(body, secret, purpose).toString("base64url")}`;
}

// `exp` en millisecondes. Retourne null si signature fausse, format invalide ou expiré.
export function verifyPayload<T extends { exp: number }>(
  token: string,
  secret: string,
  purpose: string,
  now = Date.now()
): T | null {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [body, sig] = parts;
  const expected = mac(body, secret, purpose);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    return typeof payload.exp === "number" && payload.exp > now ? payload : null;
  } catch {
    return null;
  }
}
