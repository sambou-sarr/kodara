// Aides de design du QR code : contraste, correction d'erreur, thèmes prêts à l'emploi.
export type Rgb = [number, number, number];

export function parseHex(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, c => c + c) : m[1];
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

// Luminance relative WCAG
export function luminance([r, g, b]: Rgb): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a: string, b: string): number | null {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return null;
  const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Un QR code doit rester lisible : contraste suffisant, motif plus sombre que le fond.
export function readabilityWarning(fg: string, bg: string): string | null {
  const ratio = contrastRatio(fg, bg);
  if (ratio === null) return null;
  if (ratio < 3) return "Contraste trop faible : ton QR code risque de ne pas être scanné.";
  const a = parseHex(fg)!;
  const b = parseHex(bg)!;
  if (luminance(a) > luminance(b))
    return "Motif plus clair que le fond : certains lecteurs ne scannent pas les QR codes inversés.";
  return null;
}

// Avec un logo, on monte la correction d'erreur au maximum (30 %) pour compenser la zone masquée.
export const recommendedEcl = (hasLogo: boolean) => (hasLogo ? "H" : "M");

export type Theme = { id: string; label: string; fg: string; bg: string; fg2?: string };
export const THEMES: Theme[] = [
  { id: "classique", label: "Classique", fg: "#111111", bg: "#FFFFFF" },
  { id: "encre", label: "Encre", fg: "#1B1A3A", bg: "#FBF6EE" },
  { id: "safran", label: "Safran", fg: "#1B1A3A", bg: "#FFE3B8", fg2: "#C2570C" },
  { id: "foret", label: "Forêt", fg: "#0F5132", bg: "#F1FAF4" },
  { id: "ocean", label: "Océan", fg: "#0B3C8C", bg: "#EAF3FF", fg2: "#0891B2" },
  { id: "rose", label: "Rose", fg: "#9D174D", bg: "#FFF1F5" },
];

export const DOT_STYLES = [
  ["square", "Carré"],
  ["dots", "Points"],
  ["rounded", "Arrondi"],
  ["extra-rounded", "Très arrondi"],
  ["classy", "Élégant"],
  ["classy-rounded", "Élégant arrondi"],
] as const;

export const CORNER_SQUARE_STYLES = [
  ["square", "Carré"],
  ["extra-rounded", "Arrondi"],
  ["dot", "Cercle"],
] as const;

export const CORNER_DOT_STYLES = [
  ["square", "Carré"],
  ["dot", "Cercle"],
] as const;
