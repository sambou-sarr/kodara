"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

// Bannière Google AdSense PASSIVE : aucun texte n'invite à la regarder ou à cliquer (règle AdSense).
// Rien ne s'affiche tant que NEXT_PUBLIC_ADSENSE_CLIENT et NEXT_PUBLIC_ADSENSE_SLOT_BANNER sont vides.
// À placer entre deux sections de contenu, loin des boutons de téléchargement
// (évite les clics accidentels, que Google sanctionne).
// Une « vue » est comptée quand la bannière est visible à 50 % pendant 1 s : estimation indicative,
// les chiffres officiels restent ceux de ton compte AdSense.
export function AdBanner() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER;
  const enabled = Boolean(client && slot);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      /* bloqueur de pub ou script pas encore chargé */
    }

    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            obs.disconnect();
            try {
              const body = JSON.stringify({
                event: "banner_view",
                path: window.location.pathname,
              });
              navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
            } catch {
              /* mesure facultative */
            }
          }, 1000);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside ref={box} className="banner" aria-label="Publicité">
      <Script
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        crossOrigin="anonymous"
      />
      <span className="banner-label">Publicité</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
