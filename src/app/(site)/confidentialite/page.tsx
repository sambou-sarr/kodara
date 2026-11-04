import type { Metadata } from "next";
import { adsGateEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "Confidentialité et données",
  description:
    "Comment Kodara protège ta vie privée : QR codes générés dans ton navigateur, statistiques anonymes sans cookie, publicités.",
  alternates: { canonical: "/confidentialite" },
};

export default function PrivacyPage() {
  const gate = adsGateEnabled();
  return (
    <article className="hero prose">
      <h1>Confidentialité</h1>
      <h2>Ce que contient ton QR code</h2>
      <p>
        Ton lien, ton mot de passe Wi-Fi ou tes coordonnées sont encodés dans ton navigateur. Ils ne
        sont jamais envoyés à nos serveurs ni enregistrés.
      </p>
      <h2>Statistiques anonymes</h2>
      <p>
        Nous mesurons les pages vues, la source de la visite, le pays, le type d'appareil et le format
        téléchargé. Aucun cookie n'est déposé et ton adresse IP n'est pas conservée : elle sert
        uniquement à calculer un identifiant haché, non réversible et différent chaque jour.
      </p>
      <h2>Publicité</h2>
      <p>
        {gate
          ? "Une courte publicité s'affiche avant le téléchargement, et des bannières peuvent apparaître sur certaines pages. "
          : "Des bannières publicitaires peuvent apparaître sur certaines pages. "}
        Selon la régie utilisée, elle peut
        déposer ses propres cookies : renseigne-toi auprès de ton éditeur pour les obligations de
        consentement applicables dans ton pays.
      </p>
    </article>
  );
}
