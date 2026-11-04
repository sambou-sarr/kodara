// Construction du contenu encodé dans le QR code : fonctions pures (aucun accès DOM ni base).
export const QR_TYPES = ["url", "texte", "wifi", "whatsapp", "email", "sms", "vcard"] as const;
export type QrType = (typeof QR_TYPES)[number];
export type QrFields = Record<string, string | undefined>;

export const EXPORT_FORMATS = ["png", "jpeg", "webp", "svg"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

const SCHEME = /^(https?:\/\/|ftp:\/\/|mailto:|tel:|sms:|geo:)/i;

export const normalizeUrl = (input: string) => {
  const t = input.trim();
  if (!t) return "";
  return SCHEME.test(t) ? t : `https://${t}`;
};

// WIFI:T:WPA;S:réseau;P:motdepasse;H:false;;  → \ ; , : " doivent être échappés
export const escapeWifi = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

// vCard 3.0 : \ , ; et retours à la ligne échappés
export const escapeVCard = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

const t = (v: string | undefined) => (v ?? "").trim();

export function buildPayload(type: QrType, f: QrFields): string {
  switch (type) {
    case "url":
      return normalizeUrl(t(f.url));

    case "texte":
      return (f.texte ?? "").trim();

    case "wifi": {
      const ssid = t(f.ssid);
      if (!ssid) return "";
      const enc = f.encryption === "WEP" || f.encryption === "nopass" ? f.encryption : "WPA";
      const pass = enc === "nopass" ? "" : `P:${escapeWifi(f.password ?? "")};`;
      return `WIFI:T:${enc};S:${escapeWifi(ssid)};${pass}H:${f.hidden === "true" ? "true" : "false"};;`;
    }

    case "whatsapp": {
      const digits = t(f.phone).replace(/\D/g, "");
      if (!digits) return "";
      const msg = t(f.message);
      return `https://wa.me/${digits}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
    }

    case "email": {
      const to = t(f.to);
      if (!to) return "";
      const params = [
        t(f.subject) && `subject=${encodeURIComponent(t(f.subject))}`,
        t(f.body) && `body=${encodeURIComponent(t(f.body))}`,
      ].filter(Boolean);
      return `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`;
    }

    case "sms": {
      const phone = t(f.phone).replace(/\s/g, "");
      if (!phone) return "";
      return `SMSTO:${phone}:${t(f.message)}`;
    }

    case "vcard": {
      const prenom = t(f.prenom);
      const nom = t(f.nom);
      if (!prenom && !nom) return "";
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escapeVCard(nom)};${escapeVCard(prenom)};;;`,
        `FN:${escapeVCard([prenom, nom].filter(Boolean).join(" "))}`,
        t(f.org) && `ORG:${escapeVCard(t(f.org))}`,
        t(f.title) && `TITLE:${escapeVCard(t(f.title))}`,
        t(f.phone) && `TEL;TYPE=CELL:${escapeVCard(t(f.phone))}`,
        t(f.email) && `EMAIL:${escapeVCard(t(f.email))}`,
        t(f.url) && `URL:${escapeVCard(normalizeUrl(t(f.url)))}`,
        "END:VCARD",
      ].filter(Boolean);
      return lines.join("\r\n");
    }
  }
}
