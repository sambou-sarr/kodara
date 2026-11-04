// Statistiques de trafic : fonctions pures (aucun accès base), testées isolément.
import { createHash } from "node:crypto";

const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|httpclient|axios|node-fetch|go-http/i;

export const isBot = (ua: string) => !ua || BOT_RE.test(ua);

export function parseUserAgent(ua: string) {
  const s = ua || "";
  const device =
    /iPad|Tablet|PlayBook|Silk/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s))
      ? "tablet"
      : /Mobi|iPhone|iPod|Android|Windows Phone/i.test(s)
        ? "mobile"
        : "desktop";
  const os = /Windows Phone/i.test(s)
    ? "Windows Phone"
    : /Windows/i.test(s)
      ? "Windows"
      : /Android/i.test(s)
        ? "Android"
        : /iPhone|iPad|iPod/i.test(s)
          ? "iOS"
          : /Mac OS X|Macintosh/i.test(s)
            ? "macOS"
            : /CrOS/i.test(s)
              ? "ChromeOS"
              : /Linux/i.test(s)
                ? "Linux"
                : "Autre";
  const browser = /Edg(e|A|iOS)?\//.test(s)
    ? "Edge"
    : /OPR\/|Opera/.test(s)
      ? "Opera"
      : /SamsungBrowser/.test(s)
        ? "Samsung Internet"
        : /Firefox|FxiOS/.test(s)
          ? "Firefox"
          : /Chrome|CriOS/.test(s)
            ? "Chrome"
            : /Safari/.test(s)
              ? "Safari"
              : "Autre";
  return { device, os, browser };
}

const KNOWN_SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)(facebook|fb)\.com$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)reddit\.com$/, "Reddit"],
];

// "interne" = même domaine (rechargement, navigation) : exclu du classement des sources.
export function referrerSource(referrer: string | undefined, selfHost: string): string {
  if (!referrer) return "Direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
  const self = selfHost.split(":")[0].replace(/^www\./, "");
  if (host === self) return "interne";
  for (const [re, name] of KNOWN_SOURCES) if (re.test(host)) return name;
  return host;
}

// Visiteur anonyme : non réversible, et différent chaque jour (le sel inclut la date).
export const visitorHash = (ip: string, ua: string, day: string, salt: string) =>
  createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 16);

export function normalizePath(raw: string): string | null {
  let p = raw.trim();
  const q = p.search(/[?#]/);
  if (q >= 0) p = p.slice(0, q);
  if (!p.startsWith("/")) return null;
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/$/, "");
  return p.slice(0, 200);
}

export type StatEvent = {
  createdAt: Date;
  type: string;
  path: string | null;
  visitorId: string;
  source: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  meta: string | null;
};

export const dayKey = (d: Date) => d.toISOString().slice(0, 10);

// Début de la période : minuit UTC, `days` jours glissants (aujourd'hui inclus).
export const rangeStart = (days: number, now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));

const inc = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
const top = (m: Map<string, number>, limit = 10) =>
  [...m.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
const pct = (num: number, den: number) => (den ? Math.round((num / den) * 1000) / 10 : 0);

export function buildStats(events: StatEvent[], days: number, now = new Date()) {
  const start = rangeStart(days, now);
  const daily = new Map<
    string,
    { visitors: Set<string>; pageviews: number; adCompletes: number; downloads: number }
  >();
  for (let i = 0; i < days; i++)
    daily.set(dayKey(new Date(start.getTime() + i * 86_400_000)), {
      visitors: new Set(),
      pageviews: 0,
      adCompletes: 0,
      downloads: 0,
    });

  let pageviews = 0;
  let bannerViews = 0;
  let adStarts = 0;
  let adCompletes = 0;
  let downloads = 0;
  const pages = new Map<string, number>();
  const sources = new Map<string, number>();
  const countries = new Map<string, number>();
  const devices = new Map<string, number>();
  const browsers = new Map<string, number>();
  const formats = new Map<string, number>();

  for (const e of events) {
    if (e.createdAt < start || e.createdAt > now) continue;
    const day = daily.get(dayKey(e.createdAt));
    if (!day) continue;
    switch (e.type) {
      case "pageview":
        pageviews++;
        day.pageviews++;
        day.visitors.add(e.visitorId);
        inc(pages, e.path ?? "/");
        inc(countries, e.country ?? "Inconnu");
        inc(devices, e.device ?? "Inconnu");
        inc(browsers, e.browser ?? "Inconnu");
        if (e.source && e.source !== "interne") inc(sources, e.source);
        break;
      case "banner_view":
        bannerViews++;
        break;
      case "ad_start":
        adStarts++;
        break;
      case "ad_complete":
        adCompletes++;
        day.adCompletes++;
        break;
      case "download":
        downloads++;
        day.downloads++;
        inc(formats, (e.meta ?? "inconnu").toUpperCase());
        break;
    }
  }

  const series = [...daily.entries()].map(([date, d]) => ({
    date,
    visitors: d.visitors.size,
    pageviews: d.pageviews,
    adCompletes: d.adCompletes,
    downloads: d.downloads,
  }));
  // Visiteurs = somme des visiteurs uniques de chaque jour (l'identifiant change chaque jour par design).
  const visitors = series.reduce((n, d) => n + d.visitors, 0);

  return {
    days,
    from: dayKey(start),
    to: dayKey(now),
    totals: { visitors, pageviews, bannerViews, adStarts, adCompletes, downloads },
    rates: {
      adCompletionPct: pct(adCompletes, adStarts),
      downloadPerVisitorPct: pct(downloads, visitors),
    },
    daily: series,
    topPages: top(pages),
    sources: top(sources),
    countries: top(countries),
    devices: top(devices),
    browsers: top(browsers),
    formats: top(formats),
  };
}

export type Stats = ReturnType<typeof buildStats>;
