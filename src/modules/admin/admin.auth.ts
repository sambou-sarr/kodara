// Authentification admin : fonctions pures (mot de passe haché avec scrypt, session signée HMAC).
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { signPayload, verifyPayload } from "../../lib/signed";

export const SESSION_COOKIE = "kodara_admin";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const PURPOSE = "admin-session";

// Format : scrypt:<sel base64url>:<hash base64url>  (voir scripts/hash-password.mjs)
// Séparateur « : » et non « $ » : Next.js interprète $VAR dans les fichiers .env.
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("base64url")}:${scryptSync(password, salt, 64).toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split(":");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const given = scryptSync(password, Buffer.from(saltB64, "base64url"), expected.length);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const createSessionToken = (secret: string, now = Date.now(), ttlMs = SESSION_TTL_MS) =>
  signPayload({ sub: "admin", exp: now + ttlMs }, secret, PURPOSE);

export const isValidSession = (token: string | undefined, secret: string, now = Date.now()) =>
  !!token && verifyPayload<{ sub: string; exp: number }>(token, secret, PURPOSE, now)?.sub === "admin";
