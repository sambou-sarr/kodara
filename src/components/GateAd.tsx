"use client";

// Pub de l'écran de téléchargement (le « portail »).
//
// IMPORTANT : ne mets PAS Google AdSense ici. Ses règles interdisent de demander aux visiteurs de
// regarder les pubs ; AdSense est réservé aux bannières passives (voir AdBanner.tsx).
//
// Pour brancher une régie qui autorise les pubs « à regarder » (vidéo récompensée, interstitiel…),
// remplace le contenu de ce composant par le code fourni par la régie. Le reste du parcours
// (chronomètre serveur, jeton à usage unique, comptage des téléchargements) ne change pas.
// Mets ensuite NEXT_PUBLIC_GATE_AD_PROVIDER au nom de la régie (simple étiquette de suivi).
export function GateAd() {
  return (
    <div className="ad-house" aria-label="Espace publicitaire">
      <strong>Ton annonce ici</strong>
      <span className="muted">Espace publicitaire disponible</span>
    </div>
  );
}
