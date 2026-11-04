import { NextResponse } from "next/server";
import { parseBody, route } from "../../lib/handler";
import { HttpError, tooMany, unauthorized } from "../../lib/httpError";
import { createRateLimiter } from "../../lib/rateLimit";
import { clientContext } from "../../lib/request";
import { verifyPassword } from "./admin.auth";
import { loginSchema } from "./admin.schemas";
import { closeSession, openSession } from "./admin.session";

// 5 essais / 15 min / IP
const limiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

export const AdminController = {
  login: route(async req => {
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash)
      throw new HttpError(
        503,
        "ADMIN_NON_CONFIGURE",
        "ADMIN_PASSWORD_HASH n'est pas défini (npm run admin:hash)"
      );
    const { ip } = clientContext(req);
    const rl = limiter.hit(ip);
    if (!rl.allowed) throw tooMany(rl.retryAfterMs);

    const { password } = await parseBody(req, loginSchema);
    if (!verifyPassword(password, hash))
      throw unauthorized("MOT_DE_PASSE_INCORRECT", "Mot de passe incorrect");

    limiter.reset(ip);
    await openSession();
    return { ok: true };
  }),

  logout: route(async req => {
    await closeSession();
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }),
};
