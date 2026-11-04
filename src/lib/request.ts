export type ClientContext = {
  ip: string;
  ua: string;
  country: string | null;
  host: string;
};

// Pays fourni par l'hébergeur (Vercel, Cloudflare). Absent en local → null.
function readCountry(h: Headers): string | null {
  const raw = h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry");
  return raw && /^[A-Za-z]{2}$/.test(raw) && raw.toUpperCase() !== "XX" ? raw.toUpperCase() : null;
}

export function clientContext(req: Request): ClientContext {
  const h = req.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
  return {
    ip,
    ua: h.get("user-agent") ?? "",
    country: readCountry(h),
    host: h.get("host") ?? "",
  };
}
