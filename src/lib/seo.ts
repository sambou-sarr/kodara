// Données structurées JSON-LD (schema.org) : fonctions pures.
import { siteUrl } from "./env";

export const SITE_NAME = "Kodara";
export const SITE_TAGLINE = "Générateur de QR code gratuit et personnalisable";

export const absoluteUrl = (path = "/", base = siteUrl) =>
  `${base}${path.startsWith("/") ? path : `/${path}`}`;

export type Faq = { q: string; a: string };

export function faqLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(i => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[], base = siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absoluteUrl(t.path, base),
    })),
  };
}

export function webAppLd(base = siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: base,
    description:
      "Crée et personnalise un QR code (couleurs, formes, logo) puis télécharge-le en PNG, JPEG, WEBP ou SVG.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    inLanguage: "fr",
    offers: { "@type": "Offer", price: "0", priceCurrency: "XOF" },
  };
}

export function organizationLd(base = siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: base,
    logo: absoluteUrl("/icon.svg", base),
  };
}

export function howToLd(name: string, steps: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
  };
}
