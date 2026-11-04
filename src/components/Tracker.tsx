"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Mesure d'audience first-party : aucun cookie, aucun identifiant stocké dans le navigateur.
// `entry` n'est vrai que pour la première page de l'onglet (sert aux « sources de trafic »).
export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    let entry = false;
    try {
      if (!sessionStorage.getItem("kodara:visit")) {
        sessionStorage.setItem("kodara:visit", "1");
        entry = true;
      }
    } catch {
      /* stockage indisponible : on compte quand même la page vue */
    }
    const body = JSON.stringify({
      path: pathname,
      entry,
      ...(entry && document.referrer ? { referrer: document.referrer } : {}),
    });
    try {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } catch {
      /* mesure d'audience facultative */
    }
  }, [pathname]);

  return null;
}
