import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kodara · Générateur de QR code",
    short_name: "Kodara",
    description: "Crée et personnalise ton QR code gratuitement.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6EE",
    theme_color: "#1B1A3A",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
