import { HttpError } from "./httpError";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

// Lus à la demande : une variable manquante ne casse que la fonctionnalité concernée.
export function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16)
    throw new HttpError(
      503,
      "SECRET_MANQUANT",
      "SESSION_SECRET doit être défini (16 caractères minimum)"
    );
  return s;
}

export const analyticsSalt = () => process.env.ANALYTICS_SALT || sessionSecret();

export function adMinSeconds(): number {
  const n = Number(process.env.AD_MIN_SECONDS ?? 8);
  return Number.isFinite(n) ? Math.min(60, Math.max(3, Math.round(n))) : 8;
}

// Portail pub (compte à rebours + jeton avant téléchargement). Désactivé par défaut : téléchargement libre.
// Lu au démarrage / au build : redémarre le serveur (ou rebuild) après avoir changé la valeur.
export const adsGateEnabled = () => process.env.ADS_GATE_ENABLED === "true";

// Étiquette de suivi du fournisseur de pub de l'écran de téléchargement (jamais AdSense, voir GateAd.tsx).
export const adProvider = () => process.env.NEXT_PUBLIC_GATE_AD_PROVIDER || "house";
