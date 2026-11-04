// Contenu éditorial des pages thématiques (une page = un mot-clé = un titre, une description et une FAQ uniques).
import { adsGateEnabled } from "../lib/env";
import type { Faq } from "../lib/seo";
import type { QrType } from "../modules/qr/qr.payloads";

// Texte avec pub si le portail est actif, version libre sinon.
const pub = (avecPub: string, libre: string) => (adsGateEnabled() ? avecPub : libre);

export type QrPage = {
  slug: string;
  type: QrType;
  label: string; // libellé court (navigation, onglets)
  title: string; // <title> (≤ 60 caractères idéalement)
  description: string; // meta description (≤ 155 caractères)
  h1: string;
  intro: string;
  steps: string[];
  uses: string[];
  faq: Faq[];
};

export const QR_PAGES: QrPage[] = [
  {
    slug: "lien-url",
    type: "url",
    label: "Lien / site web",
    title: "QR code lien et site web gratuit, personnalisable",
    description:
      "Transforme n'importe quel lien en QR code personnalisé : couleurs, formes, logo. Téléchargement PNG, SVG, JPEG ou WEBP, sans inscription.",
    h1: "Créer un QR code pour un lien ou un site web",
    intro:
      "Colle l'adresse de ton site, de ta page Facebook, de ton menu ou de ta boutique en ligne : Kodara génère un QR code que tes clients scannent avec l'appareil photo de leur téléphone, sans application.",
    steps: [
      "Colle ton lien dans le champ (le https:// est ajouté automatiquement).",
      "Personnalise les couleurs, la forme des modules et ajoute ton logo.",
      pub("Regarde une courte publicité, puis télécharge ton QR code en haute définition.", "Télécharge ton QR code en haute définition."),
    ],
    uses: [
      "Affiches, flyers et cartes de visite qui renvoient vers ton site",
      "Menus de restaurant et catalogues en ligne",
      "Vitrines et emballages pour ouvrir ta page Instagram ou Facebook",
      "Packagings produits avec lien vers le mode d'emploi",
    ],
    faq: [
      {
        q: "Le QR code de mon lien expire-t-il ?",
        a: "Non. Le QR code encode directement ton adresse : il fonctionne tant que la page de destination existe. Aucune redirection ni abonnement n'est nécessaire.",
      },
      {
        q: "Puis-je changer le lien après l'impression ?",
        a: "Non, un QR code statique est figé. Si ton adresse peut changer, fais pointer le QR code vers une page de ton site que tu peux modifier librement.",
      },
    ],
  },
  {
    slug: "wifi",
    type: "wifi",
    label: "Wi-Fi",
    title: "QR code Wi-Fi gratuit : partage ton réseau en un scan",
    description:
      "Génère un QR code Wi-Fi : tes invités se connectent sans taper le mot de passe. Compatible iPhone et Android, WPA, WEP ou réseau ouvert.",
    h1: "Créer un QR code Wi-Fi",
    intro:
      "Fini les mots de passe dictés à voix haute. Renseigne le nom du réseau et le mot de passe : un scan suffit pour que tes clients ou invités se connectent.",
    steps: [
      "Saisis le nom exact du réseau (SSID) et son mot de passe.",
      "Choisis le type de sécurité : WPA/WPA2 dans la grande majorité des cas.",
      pub("Personnalise le design, regarde la pub, télécharge et imprime-le.", "Personnalise le design, télécharge et imprime-le."),
    ],
    uses: [
      "Cafés, restaurants, hôtels et espaces de coworking",
      "Locations saisonnières et chambres d'hôtes",
      "Salles d'attente et salles de réunion",
      "Maison : un QR code collé près du routeur pour les invités",
    ],
    faq: [
      {
        q: "Mon mot de passe Wi-Fi est-il envoyé à vos serveurs ?",
        a: "Non. Le QR code est généré directement dans ton navigateur : le mot de passe n'est jamais transmis à Kodara. Nous ne mesurons que le format du fichier téléchargé.",
      },
      {
        q: "Le QR code Wi-Fi marche-t-il sur iPhone et Android ?",
        a: "Oui, l'appareil photo des iPhone (iOS 11 et plus) et de la plupart des Android reconnaît le format et propose de rejoindre le réseau.",
      },
      {
        q: "Que faire si je change le mot de passe ?",
        a: "Il faut générer un nouveau QR code : le mot de passe est inscrit à l'intérieur du code.",
      },
    ],
  },
  {
    slug: "whatsapp",
    type: "whatsapp",
    label: "WhatsApp",
    title: "QR code WhatsApp gratuit : ouvre une discussion en un scan",
    description:
      "Crée un QR code WhatsApp avec ton numéro et un message prérempli. Idéal pour commander, réserver ou contacter ton commerce.",
    h1: "Créer un QR code WhatsApp",
    intro:
      "Un client scanne, WhatsApp s'ouvre sur une conversation avec ton numéro, message prêt à envoyer. Parfait pour les commandes, les réservations et le service client.",
    steps: [
      "Entre ton numéro au format international (ex. +221 77 123 45 67).",
      "Ajoute si tu veux un message prérempli, par exemple « Bonjour, je souhaite commander ».",
      pub("Personnalise ton QR code, regarde la pub puis télécharge-le.", "Personnalise ton QR code, puis télécharge-le."),
    ],
    uses: [
      "Prise de commande sur affiche, vitrine ou emballage",
      "Réservation et prise de rendez-vous",
      "Support client et SAV",
      "Annonces immobilières et petites annonces",
    ],
    faq: [
      {
        q: "Faut-il un compte WhatsApp Business ?",
        a: "Non, un numéro WhatsApp classique suffit. WhatsApp Business reste conseillé pour un usage professionnel.",
      },
      {
        q: "Quel format de numéro utiliser ?",
        a: "Le format international avec l'indicatif du pays, par exemple +221 pour le Sénégal. Les espaces, tirets et le « + » sont gérés automatiquement.",
      },
    ],
  },
  {
    slug: "vcard",
    type: "vcard",
    label: "Carte de visite",
    title: "QR code carte de visite (vCard) gratuit",
    description:
      "Crée un QR code vCard : nom, téléphone, e-mail, entreprise et site. Un scan enregistre ton contact dans le répertoire du téléphone.",
    h1: "Créer un QR code de carte de visite (vCard)",
    intro:
      "Mets tes coordonnées dans un QR code : en le scannant, ton contact est proposé à l'enregistrement dans le répertoire, sans rien retaper.",
    steps: [
      "Renseigne ton nom, ton téléphone, ton e-mail et ton entreprise.",
      "Ajoute ton site web si tu en as un.",
      pub("Personnalise le QR code, regarde la pub puis télécharge-le pour ta carte ou ta signature.", "Personnalise le QR code, puis télécharge-le pour ta carte ou ta signature."),
    ],
    uses: [
      "Cartes de visite papier modernisées",
      "Badges de salons et conférences",
      "Signatures d'e-mail et profils professionnels",
      "Stands et supports commerciaux",
    ],
    faq: [
      {
        q: "Les informations sont-elles stockées chez vous ?",
        a: "Non. Tes coordonnées sont encodées dans le QR code, dans ton navigateur. Elles ne sont jamais envoyées à nos serveurs.",
      },
      {
        q: "Plus il y a d'informations, plus le QR code est dense ?",
        a: "Oui. Pour un QR code facile à scanner, garde les champs essentiels et imprime-le assez grand (au moins 2 cm de côté).",
      },
    ],
  },
  {
    slug: "email",
    type: "email",
    label: "E-mail",
    title: "QR code e-mail gratuit : message prérempli en un scan",
    description:
      "Génère un QR code qui ouvre un e-mail prérempli (destinataire, objet, message). Simple, rapide et personnalisable.",
    h1: "Créer un QR code e-mail",
    intro:
      "Un scan ouvre l'application de messagerie avec ton adresse, un objet et un message prêts à envoyer : plus aucune faute de frappe dans ton adresse.",
    steps: [
      "Saisis l'adresse du destinataire.",
      "Ajoute un objet et un message si tu le souhaites.",
      pub("Personnalise ton QR code, regarde la pub puis télécharge-le.", "Personnalise ton QR code, puis télécharge-le."),
    ],
    uses: [
      "Formulaires de contact sur supports imprimés",
      "Demandes de devis ou de renseignements",
      "Retours clients et avis",
      "Candidatures spontanées",
    ],
    faq: [
      {
        q: "Le message est-il modifiable par la personne qui scanne ?",
        a: "Oui. Le message s'ouvre dans son application de messagerie : elle peut le modifier avant d'envoyer.",
      },
    ],
  },
  {
    slug: "sms",
    type: "sms",
    label: "SMS",
    title: "QR code SMS gratuit : message prérempli en un scan",
    description:
      "Crée un QR code SMS avec numéro et message prérempli. Un scan ouvre l'application de messages, prête à envoyer.",
    h1: "Créer un QR code SMS",
    intro:
      "Le client scanne, son application de messages s'ouvre avec ton numéro et le texte que tu as choisi. Pratique pour les inscriptions, les jeux concours et les demandes de rappel.",
    steps: [
      "Entre le numéro de téléphone destinataire.",
      "Écris le message prérempli.",
      pub("Personnalise ton QR code, regarde la pub puis télécharge-le.", "Personnalise ton QR code, puis télécharge-le."),
    ],
    uses: [
      "Inscription à une liste ou à un service par SMS",
      "Jeux concours et votes",
      "Demande de rappel",
      "Services de transfert ou de paiement par code SMS",
    ],
    faq: [
      {
        q: "L'envoi du SMS est-il gratuit pour la personne qui scanne ?",
        a: "Il dépend de son forfait et de son opérateur : le QR code ne fait que préremplir le message dans son application.",
      },
    ],
  },
  {
    slug: "texte",
    type: "texte",
    label: "Texte libre",
    title: "QR code texte gratuit : encode n'importe quel message",
    description:
      "Génère un QR code à partir d'un texte libre : message, code, référence, énigme. Personnalisable et téléchargeable en haute définition.",
    h1: "Créer un QR code avec du texte",
    intro:
      "Encode un message, une référence produit, un code ou une énigme : le texte s'affiche directement sur le téléphone de celui qui scanne, sans connexion internet.",
    steps: [
      "Écris ou colle ton texte.",
      "Personnalise les couleurs, les formes et ajoute un logo.",
      pub("Regarde la pub, puis télécharge ton QR code.", "Télécharge ton QR code."),
    ],
    uses: [
      "Chasses au trésor et jeux",
      "Références produits et numéros de série",
      "Messages cachés dans une carte ou une invitation",
      "Instructions courtes sur un équipement",
    ],
    faq: [
      {
        q: "Quelle longueur de texte puis-je encoder ?",
        a: "Quelques centaines de caractères restent faciles à scanner. Au-delà, le QR code devient très dense : préfère un lien vers une page.",
      },
    ],
  },
];

export const getQrPage = (slug: string) => QR_PAGES.find(p => p.slug === slug);
