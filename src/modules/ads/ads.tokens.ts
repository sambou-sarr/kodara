// Règles du « portail pub » : fonctions pures, testables sans base de données.
import { signPayload, verifyPayload } from "../../lib/signed";

export const DOWNLOAD_TOKEN_TTL_MS = 10 * 60 * 1000; // jeton valable 10 min
export const AD_VIEW_MAX_AGE_MS = 30 * 60 * 1000; // une vue de pub non validée expire après 30 min
const PURPOSE = "download";

// Le chronomètre est tenu par le SERVEUR (startedAt) : le client ne peut pas le raccourcir.
// Petite tolérance pour la latence réseau.
export const isWatchComplete = (
  startedAt: number,
  now: number,
  minSeconds: number,
  toleranceMs = 750
) => now - startedAt >= minSeconds * 1000 - toleranceMs;

export const secondsLeft = (startedAt: number, now: number, minSeconds: number) =>
  Math.max(0, Math.ceil((startedAt + minSeconds * 1000 - now) / 1000));

export const isViewExpired = (startedAt: number, now: number) =>
  now - startedAt > AD_VIEW_MAX_AGE_MS;

export const createDownloadToken = (viewId: string, secret: string, now = Date.now()) =>
  signPayload({ vid: viewId, exp: now + DOWNLOAD_TOKEN_TTL_MS }, secret, PURPOSE);

export const readDownloadToken = (token: string, secret: string, now = Date.now()) =>
  verifyPayload<{ vid: string; exp: number }>(token, secret, PURPOSE, now)?.vid ?? null;
