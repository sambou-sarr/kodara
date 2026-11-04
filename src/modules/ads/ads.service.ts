import { adMinSeconds, adProvider, adsGateEnabled, analyticsSalt, sessionSecret } from "../../lib/env";
import { notFound, tooMany, unauthorized, unprocessable } from "../../lib/httpError";
import { prisma } from "../../lib/prisma";
import { createRateLimiter } from "../../lib/rateLimit";
import type { ClientContext } from "../../lib/request";
import { dayKey, visitorHash } from "../analytics/analytics.pure";
import { AnalyticsService } from "../analytics/analytics.service";
import {
  createDownloadToken,
  isViewExpired,
  isWatchComplete,
  readDownloadToken,
  secondsLeft,
} from "./ads.tokens";
import type { CompleteInput, DownloadInput } from "./ads.schemas";

// 30 pubs lancées / heure / visiteur : évite de fabriquer des vues en masse.
const startLimiter = createRateLimiter({ max: 30, windowMs: 60 * 60 * 1000 });
// Portail désactivé : 60 téléchargements comptés / heure / visiteur (évite de gonfler les statistiques).
const freeLimiter = createRateLimiter({ max: 60, windowMs: 60 * 60 * 1000 });

const PORTAIL_DESACTIVE = () =>
  unprocessable("PORTAIL_DESACTIVE", "Le portail publicitaire est désactivé : le téléchargement est libre");

export const AdsService = {
  // 1) Le client ouvre l'écran pub : le serveur démarre le chronomètre.
  async start(ctx: ClientContext) {
    if (!adsGateEnabled()) throw PORTAIL_DESACTIVE();
    const visitorId = visitorHash(ctx.ip, ctx.ua, dayKey(new Date()), analyticsSalt());
    const rl = startLimiter.hit(visitorId);
    if (!rl.allowed) throw tooMany(rl.retryAfterMs);

    const provider = adProvider();
    const view = await prisma.adView.create({ data: { visitorId, provider } });
    await AnalyticsService.record("ad_start", ctx);
    return { viewId: view.id, minSeconds: adMinSeconds(), provider };
  },

  // 2) Après la durée minimale (vérifiée côté serveur), on délivre un jeton à usage unique.
  async complete(input: CompleteInput, ctx: ClientContext) {
    if (!adsGateEnabled()) throw PORTAIL_DESACTIVE();
    const view = await prisma.adView.findUnique({ where: { id: input.viewId } });
    if (!view) throw notFound("VUE_INTROUVABLE", "Session publicitaire introuvable");
    const now = Date.now();
    const started = view.startedAt.getTime();
    if (view.completedAt)
      throw unprocessable("VUE_DEJA_VALIDEE", "Cette publicité a déjà été validée");
    if (isViewExpired(started, now))
      throw unprocessable("VUE_EXPIREE", "Session expirée, relance la publicité");
    if (!isWatchComplete(started, now, adMinSeconds()))
      throw unprocessable("PUB_TROP_COURTE", "La publicité n'est pas terminée", {
        secondsLeft: secondsLeft(started, now, adMinSeconds()),
      });

    // Validation atomique : une seule requête peut passer de « non validée » à « validée ».
    const { count } = await prisma.adView.updateMany({
      where: { id: view.id, completedAt: null },
      data: { completedAt: new Date(now) },
    });
    if (count === 0) throw unprocessable("VUE_DEJA_VALIDEE", "Cette publicité a déjà été validée");

    await AnalyticsService.record("ad_complete", ctx);
    return { token: createDownloadToken(view.id, sessionSecret(), now) };
  },

  // 3) Le jeton est consommé (une seule fois) et le téléchargement est comptabilisé.
  async download(input: DownloadInput, ctx: ClientContext) {
    if (!adsGateEnabled()) {
      // Téléchargement libre : on ne fait que le compter.
      const visitorId = visitorHash(ctx.ip, ctx.ua, dayKey(new Date()), analyticsSalt());
      const rl = freeLimiter.hit(visitorId);
      if (!rl.allowed) throw tooMany(rl.retryAfterMs);
      await AnalyticsService.record("download", ctx, { meta: input.format });
      return { ok: true };
    }

    if (!input.token) throw unauthorized("JETON_REQUIS", "Regarde d'abord la publicité");
    const viewId = readDownloadToken(input.token, sessionSecret());
    if (!viewId) throw unauthorized("JETON_INVALIDE", "Jeton invalide ou expiré");

    const { count } = await prisma.adView.updateMany({
      where: { id: viewId, completedAt: { not: null }, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (count === 0)
      throw unprocessable("JETON_DEJA_UTILISE", "Ce jeton a déjà servi : regarde une nouvelle pub");

    await AnalyticsService.record("download", ctx, { meta: input.format });
    return { ok: true };
  },
};
