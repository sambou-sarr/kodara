import { describe, expect, it } from "vitest";
import {
  buildStats,
  isBot,
  normalizePath,
  parseUserAgent,
  referrerSource,
  visitorHash,
  type StatEvent,
} from "./analytics.pure";

const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

describe("détection des robots et des appareils", () => {
  it("filtre les robots et les user-agents vides", () => {
    expect(isBot("")).toBe(true);
    expect(isBot("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
    expect(isBot("curl/8.0")).toBe(true);
    expect(isBot(CHROME_WIN)).toBe(false);
  });

  it("reconnaît appareil, système et navigateur", () => {
    expect(parseUserAgent(CHROME_WIN)).toEqual({ device: "desktop", os: "Windows", browser: "Chrome" });
    expect(parseUserAgent(IPHONE)).toEqual({ device: "mobile", os: "iOS", browser: "Safari" });
    expect(parseUserAgent(ANDROID)).toEqual({ device: "mobile", os: "Android", browser: "Chrome" });
  });
});

describe("sources de trafic", () => {
  it("classe direct, moteurs, réseaux sociaux, interne et autres sites", () => {
    expect(referrerSource(undefined, "kodara.app")).toBe("Direct");
    expect(referrerSource("https://www.google.com/", "kodara.app")).toBe("Google");
    expect(referrerSource("https://www.google.sn/search?q=qr", "kodara.app")).toBe("Google");
    expect(referrerSource("https://l.facebook.com/", "kodara.app")).toBe("Facebook");
    expect(referrerSource("https://kodara.app/qr-code/wifi", "kodara.app:3000")).toBe("interne");
    expect(referrerSource("https://blog.exemple.sn/post", "kodara.app")).toBe("blog.exemple.sn");
    expect(referrerSource("pas une url", "kodara.app")).toBe("Direct");
  });
});

describe("visiteur anonyme et chemins", () => {
  it("le hash change avec le jour et le sel", () => {
    const a = visitorHash("1.2.3.4", "ua", "2026-11-03", "sel");
    expect(a).toHaveLength(16);
    expect(a).toBe(visitorHash("1.2.3.4", "ua", "2026-11-03", "sel"));
    expect(a).not.toBe(visitorHash("1.2.3.4", "ua", "2026-11-04", "sel"));
    expect(a).not.toBe(visitorHash("1.2.3.4", "ua", "2026-11-03", "autre"));
  });

  it("normalise les chemins", () => {
    expect(normalizePath("/qr-code/wifi/?utm=1#x")).toBe("/qr-code/wifi");
    expect(normalizePath("//a//b")).toBe("/a/b");
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("http://evil")).toBeNull();
  });
});

const ev = (over: Partial<StatEvent>): StatEvent => ({
  createdAt: new Date("2026-11-03T10:00:00Z"),
  type: "pageview",
  path: "/",
  visitorId: "v1",
  source: null,
  country: "SN",
  device: "mobile",
  browser: "Chrome",
  os: "Android",
  meta: null,
  ...over,
});

describe("buildStats", () => {
  const now = new Date("2026-11-03T18:00:00Z");

  it("compte visiteurs uniques par jour, pages vues, pubs et téléchargements", () => {
    const s = buildStats(
      [
        ev({ visitorId: "v1", source: "Google" }),
        ev({ visitorId: "v1", path: "/qr-code/wifi" }),
        ev({ visitorId: "v2", source: "interne" }),
        ev({ visitorId: "v3", createdAt: new Date("2026-11-02T09:00:00Z"), source: "Direct" }),
        ev({ type: "banner_view" }),
        ev({ type: "banner_view" }),
        ev({ type: "ad_start" }),
        ev({ type: "ad_start" }),
        ev({ type: "ad_complete" }),
        ev({ type: "download", meta: "png" }),
        ev({ type: "download", meta: "svg" }),
        ev({ type: "download", meta: "png" }),
      ],
      3,
      now
    );
    expect(s.totals).toEqual({
      visitors: 3,
      pageviews: 4,
      bannerViews: 2,
      adStarts: 2,
      adCompletes: 1,
      downloads: 3,
    });
    expect(s.daily.map(d => d.date)).toEqual(["2026-11-01", "2026-11-02", "2026-11-03"]);
    expect(s.daily.map(d => d.visitors)).toEqual([0, 1, 2]);
    expect(s.rates.adCompletionPct).toBe(50);
    expect(s.formats).toEqual([
      { label: "PNG", count: 2 },
      { label: "SVG", count: 1 },
    ]);
    // « interne » exclu des sources
    expect(s.sources).toEqual([
      { label: "Direct", count: 1 },
      { label: "Google", count: 1 },
    ]);
    expect(s.topPages[0]).toEqual({ label: "/", count: 3 });
  });

  it("ignore les événements hors période et gère l'absence de données", () => {
    const s = buildStats([ev({ createdAt: new Date("2026-10-01T10:00:00Z") })], 7, now);
    expect(s.totals.pageviews).toBe(0);
    expect(s.rates).toEqual({ adCompletionPct: 0, downloadPerVisitorPct: 0 });
    expect(s.daily).toHaveLength(7);
  });
});
