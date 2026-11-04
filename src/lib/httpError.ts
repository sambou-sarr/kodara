// Même esprit que lib/httpError du projet Support Connecté.
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public headers?: Record<string, string>
  ) {
    super(message);
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new HttpError(400, code, message, details);
export const unauthorized = (code = "NON_AUTHENTIFIE", message = "Authentification requise") =>
  new HttpError(401, code, message);
export const notFound = (code: string, message: string) => new HttpError(404, code, message);
export const unprocessable = (code: string, message: string, details?: unknown) =>
  new HttpError(422, code, message, details);
export const tooMany = (retryAfterMs: number) =>
  new HttpError(429, "TROP_DE_REQUETES", "Trop de tentatives, réessaie plus tard", undefined, {
    "Retry-After": String(Math.max(1, Math.ceil(retryAfterMs / 1000))),
  });
export const unavailable = (code: string, message: string) => new HttpError(503, code, message);
