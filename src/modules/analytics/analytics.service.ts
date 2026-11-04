import { analyticsSalt } from "../../lib/env";
import { prisma } from "../../lib/prisma";
import type { ClientContext } from "../../lib/request";
import {
  buildStats,
  dayKey,
  isBot,
  normalizePath,
  parseUserAgent,
  rangeStart,
  referrerSource,
  visitorHash,
} from "./analytics.pure";
import type { TrackInput } from "./analytics.schemas";

export type EventType = "pageview" | "banner_view" | "ad_start" | "ad_complete" | "download";

export const AnalyticsService = {
  // Enregistre un événement anonyme. Les robots ne sont jamais comptés.
  async record(
    type: EventType,
    ctx: ClientContext,
    data: { path?: string | null; source?: string | null; meta?: string | null } = {}
  ) {
    if (isBot(ctx.ua)) return false;
    const ua = parseUserAgent(ctx.ua);
    await prisma.event.create({
      data: {
        type,
        path: data.path ?? null,
        visitorId: visitorHash(ctx.ip, ctx.ua, dayKey(new Date()), analyticsSalt()),
        source: data.source ?? null,
        country: ctx.country,
        device: ua.device,
        browser: ua.browser,
        os: ua.os,
        meta: data.meta ?? null,
      },
    });
    return true;
  },

  async track(input: TrackInput, ctx: ClientContext) {
    const path = normalizePath(input.path);
    if (!path || path.startsWith("/admin") || path.startsWith("/api")) return { tracked: false };
    if (input.event === "banner_view")
      return { tracked: await AnalyticsService.record("banner_view", ctx, { path }) };
    const source = input.entry ? referrerSource(input.referrer, ctx.host) : null;
    return { tracked: await AnalyticsService.record("pageview", ctx, { path, source }) };
  },

  async stats(days: number) {
    const events = await prisma.event.findMany({
      where: { createdAt: { gte: rangeStart(days) } },
      select: {
        createdAt: true,
        type: true,
        path: true,
        visitorId: true,
        source: true,
        country: true,
        device: true,
        browser: true,
        os: true,
        meta: true,
      },
    });
    return buildStats(events, days);
  },
};
