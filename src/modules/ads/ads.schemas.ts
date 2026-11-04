import { z } from "zod";
import { EXPORT_FORMATS, QR_TYPES } from "../qr/qr.payloads";

// POST /api/ads/complete   { "viewId": "..." }
export const completeSchema = z.object({ viewId: z.string().min(10).max(64) }).strict();

// POST /api/downloads   { "token": "...", "format": "png", "type": "url" }
// Portail désactivé : { "format": "png", "type": "url" } suffit (simple comptage du téléchargement).
// Le contenu du QR code n'est JAMAIS envoyé au serveur : on ne mesure que le format et le type.
export const downloadSchema = z
  .object({
    token: z.string().min(20).max(600).optional(), // obligatoire seulement si le portail est actif
    format: z.enum(EXPORT_FORMATS),
    type: z.enum(QR_TYPES),
  })
  .strict();

export type CompleteInput = z.infer<typeof completeSchema>;
export type DownloadInput = z.infer<typeof downloadSchema>;
