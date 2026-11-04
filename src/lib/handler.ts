import { ZodError, type ZodType } from "zod";
import { HttpError, badRequest } from "./httpError";

// Équivalent d'asyncHandler pour les route handlers Next.js :
// transforme les erreurs métier / de validation en réponses JSON homogènes.
export function route(fn: (req: Request) => Promise<Response | unknown>) {
  return async (req: Request): Promise<Response> => {
    try {
      const out = await fn(req);
      return out instanceof Response ? out : Response.json(out);
    } catch (e) {
      if (e instanceof HttpError)
        return Response.json(
          { error: { code: e.code, message: e.message, details: e.details } },
          { status: e.status, headers: e.headers }
        );
      if (e instanceof ZodError)
        return Response.json(
          { error: { code: "VALIDATION", message: "Données invalides", details: e.flatten() } },
          { status: 400 }
        );
      console.error(e);
      return Response.json(
        { error: { code: "INTERNE", message: "Erreur interne" } },
        { status: 500 }
      );
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodType<T, any, any>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest("JSON_INVALIDE", "Corps JSON invalide");
  }
  return schema.parse(raw);
}
