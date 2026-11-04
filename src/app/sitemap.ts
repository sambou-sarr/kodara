import type { MetadataRoute } from "next";
import { QR_PAGES } from "@/content/qrPages";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...QR_PAGES.map(p => ({
      url: absoluteUrl(`/qr-code/${p.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/confidentialite"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
