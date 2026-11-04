import { z } from "zod";

// POST /api/track   { "path": "/qr-code/wifi", "referrer": "https://google.com/", "entry": true }
// `banner_view` = une bannière AdSense est restée visible (estimation de nos propres affichages).
// `entry` = première page de la visite : seule celle-ci alimente les « sources de trafic ».
export const trackSchema = z
  .object({
    event: z.enum(["pageview", "banner_view"]).default("pageview"),
    path: z.string().min(1).max(300),
    referrer: z.string().max(500).optional(),
    entry: z.boolean().default(false),
  })
  .strict();

// GET /api/admin/stats?days=30
export const statsQuery = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export type TrackInput = z.infer<typeof trackSchema>;
export type StatsQuery = z.infer<typeof statsQuery>;
