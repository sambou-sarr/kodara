import { adsGateEnabled } from "../lib/env";
import type { Faq } from "../lib/seo";

export const HOME_FAQ: Faq[] = [
  {
    q: "Kodara est-il vraiment gratuit ?",
    a: adsGateEnabled()
      ? "Oui, sans inscription ni abonnement. En échange, tu regardes une courte publicité (quelques secondes) avant chaque téléchargement. Cela finance le service."
      : "Oui, sans inscription ni abonnement, et le téléchargement est libre. Le service peut afficher des bannières publicitaires discrètes sur certaines pages pour couvrir ses coûts.",
  },
  {
    q: "Mon QR code va-t-il expirer ?",
    a: "Non. Les QR codes créés avec Kodara sont statiques : l'information est inscrite directement dans le code. Il ne dépend ni de nos serveurs ni d'un abonnement et fonctionnera tant que ta destination existe.",
  },
  {
    q: "Quel format de fichier choisir : PNG, JPEG, WEBP ou SVG ?",
    a: "Le SVG est un format vectoriel : idéal pour l'impression grand format (affiches, bâches, packaging) car il ne perd jamais en netteté. Le PNG convient au web et aux petits supports. JPEG et WEBP sont des formats légers pour le web.",
  },
  {
    q: "Puis-je ajouter mon logo au milieu du QR code ?",
    a: "Oui. Importe ton logo : Kodara active automatiquement la correction d'erreur maximale (30 %) pour que le QR code reste lisible. Garde un logo de taille raisonnable et teste toujours le scan avant d'imprimer.",
  },
  {
    q: "Mes informations sont-elles enregistrées ?",
    a: "Non. Le QR code est généré dans ton navigateur : le lien, le mot de passe Wi-Fi ou les coordonnées ne sont jamais envoyés à nos serveurs. Nous mesurons seulement des statistiques anonymes (pages vues, format téléchargé).",
  },
  {
    q: "Comment être sûr que mon QR code sera bien scanné ?",
    a: "Garde un bon contraste entre le motif et le fond, un motif plus foncé que le fond, une marge autour du code et une taille d'impression d'au moins 2 cm. Teste avec plusieurs téléphones avant l'impression finale.",
  },
];
