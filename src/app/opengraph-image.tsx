import { ImageResponse } from "next/og";

export const alt = "Kodara · Générateur de QR code gratuit et personnalisable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image de partage (réseaux sociaux) générée au build, sans fichier à maintenir.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 80,
          background: "#FBF6EE",
          color: "#1B1A3A",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ fontSize: 40, fontWeight: 800, display: "flex" }}>
            kodara<span style={{ color: "#FF9A1F" }}>.</span>
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 28 }}>
            Crée ton QR code sur-mesure
          </div>
          <div style={{ fontSize: 32, marginTop: 24, color: "#5E5C7A" }}>
            Gratuit · Sans inscription · PNG, SVG, JPEG, WEBP
          </div>
        </div>
        <svg width="320" height="320" viewBox="0 0 48 48">
          <rect width="48" height="48" rx="12" fill="#1B1A3A" />
          <g fill="#FBF6EE">
            <rect x="8" y="8" width="13" height="13" rx="3.5" />
            <rect x="27" y="8" width="13" height="13" rx="3.5" />
            <rect x="8" y="27" width="13" height="13" rx="3.5" />
            <rect x="27" y="27" width="5" height="5" rx="1.5" />
            <rect x="34" y="27" width="5" height="5" rx="1.5" />
            <rect x="27" y="34" width="5" height="5" rx="1.5" />
          </g>
          <g fill="#1B1A3A">
            <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
            <rect x="30.5" y="11.5" width="6" height="6" rx="1.5" />
            <rect x="11.5" y="30.5" width="6" height="6" rx="1.5" />
          </g>
          <rect x="34" y="34" width="6" height="6" rx="2.5" fill="#FF9A1F" />
        </svg>
      </div>
    ),
    size
  );
}
