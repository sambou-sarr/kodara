import { parseBody, route } from "../../lib/handler";
import { clientContext } from "../../lib/request";
import { requireAdmin } from "../admin/admin.session";
import { statsQuery, trackSchema } from "./analytics.schemas";
import { AnalyticsService } from "./analytics.service";

export const AnalyticsController = {
  // Appelé par navigator.sendBeacon : la réponse est ignorée par le navigateur.
  track: route(async req => {
    const body = await parseBody(req, trackSchema);
    await AnalyticsService.track(body, clientContext(req));
    return new Response(null, { status: 204 });
  }),

  // Réservé à l'admin (utile pour brancher un outil externe).
  stats: route(async req => {
    await requireAdmin();
    const { days } = statsQuery.parse(Object.fromEntries(new URL(req.url).searchParams));
    return AnalyticsService.stats(days);
  }),
};
