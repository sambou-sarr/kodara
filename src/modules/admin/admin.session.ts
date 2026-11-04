import { cookies } from "next/headers";
import { sessionSecret } from "../../lib/env";
import { unauthorized } from "../../lib/httpError";
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionToken, isValidSession } from "./admin.auth";

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return isValidSession(token, sessionSecret());
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw unauthorized();
}

export async function openSession() {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(sessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function closeSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
