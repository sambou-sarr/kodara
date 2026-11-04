import Link from "next/link";

// Marque Kodara : un QR code dont le dernier module est une étincelle safran.
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Logo Kodara"
      className="logo-mark"
    >
      <rect width="48" height="48" rx="12" fill="var(--logo-bg)" />
      <g fill="var(--logo-fg)">
        <rect x="8" y="8" width="13" height="13" rx="3.5" />
        <rect x="27" y="8" width="13" height="13" rx="3.5" />
        <rect x="8" y="27" width="13" height="13" rx="3.5" />
        <rect x="27" y="27" width="5" height="5" rx="1.5" />
        <rect x="34" y="27" width="5" height="5" rx="1.5" />
        <rect x="27" y="34" width="5" height="5" rx="1.5" />
      </g>
      <g fill="var(--logo-bg)">
        <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
        <rect x="30.5" y="11.5" width="6" height="6" rx="1.5" />
        <rect x="11.5" y="30.5" width="6" height="6" rx="1.5" />
      </g>
      <rect x="34" y="34" width="6" height="6" rx="2.5" fill="#FF9A1F" />
    </svg>
  );
}

export function Logo({ href = "/", size = 36 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="logo" aria-label="Kodara, accueil">
      <LogoMark size={size} />
      <span className="logo-word">
        kodara<span className="logo-dot">.</span>
      </span>
    </Link>
  );
}
