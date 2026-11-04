# Kodara — SaaS de QR codes avec pub avant téléchargement

Le client dessine son QR code (couleurs, dégradé, formes, logo), regarde une courte pub, puis télécharge en PNG, JPEG, WEBP ou SVG. Sans compte. Un espace admin affiche le trafic.

Stack : Next.js (App Router, rendu serveur pour le SEO) · Prisma (SQLite en local) · Zod · qr-code-styling (côté navigateur).

## Démarrage

```bash
npm install
cp .env.example .env        # puis remplis SESSION_SECRET et ADMIN_PASSWORD_HASH
npm run admin:hash -- "ton-mot-de-passe-solide"   # colle la ligne affichée dans .env
npm run db:push             # crée la base
npm run dev                 # http://localhost:3000   ·  admin : /admin
npm test                    # tests (logique pure)
npm run typecheck && npm run build
```

## Architecture (même découpage que le module paramètres)

```
src/modules/<module>/
  <module>.schemas.ts      validation Zod
  <module>.controller.ts   handlers de routes (route() = asyncHandler)
  <module>.service.ts      logique métier + Prisma
  <module>.pure.ts|tokens  fonctions pures, testées
src/app/api/**/route.ts    routes fines : export const POST = XController.action
```

| Module | Rôle |
|---|---|
| `ads` | portail pub : `start` → `complete` → `download` |
| `analytics` | mesure d'audience anonyme + agrégation des stats |
| `admin` | mot de passe (scrypt), session signée, login/logout |
| `qr` | contenu encodé (url, wifi, whatsapp, vCard…) et aides de design |

## Parcours pub → téléchargement

> **Portail pub en pause par défaut** : `ADS_GATE_ENABLED="false"` (ou vide) = téléchargement libre, les téléchargements restent comptés dans l'admin. Passe la valeur à `"true"` pour réactiver le portail ci-dessous, puis redémarre / rebuild (les pages et leurs textes sont générés au build).


1. `POST /api/ads/start` : le serveur crée une vue et démarre le chronomètre.
2. Le client affiche l'emplacement pub et un compte à rebours (`AD_MIN_SECONDS`, 8 s par défaut).
3. `POST /api/ads/complete` : le serveur vérifie que la durée est écoulée (c'est lui qui tient l'horloge) et délivre un jeton signé, valable 10 min.
4. `POST /api/downloads` : le jeton est consommé une seule fois, le téléchargement est compté, puis le fichier est généré.

**Limite à connaître** : le QR code est dessiné dans le navigateur (le contenu ne quitte jamais l'appareil, c'est un argument vie privée). Un utilisateur technique peut donc contourner l'écran pub en appelant la librairie depuis la console. Le jeton empêche de fabriquer de fausses statistiques, pas de contourner le portail. Pour un verrou strict, il faudrait générer le fichier côté serveur après vérification du jeton.

**Pubs, deux emplacements distincts :**
- *Écran de téléchargement* (`GateAd.tsx`) : emplacement « maison » par défaut. Pour une pub à regarder, brancher une régie qui l'autorise (vidéo récompensée, interstitiel) en remplaçant uniquement ce composant. **Pas AdSense** : ses règles interdisent de demander aux visiteurs de regarder les pubs.
- *Pages du site* (`AdBanner.tsx`) : bannières AdSense passives, sans texte qui invite à les regarder, loin des boutons de téléchargement. Activées par `NEXT_PUBLIC_ADSENSE_CLIENT` et `NEXT_PUBLIC_ADSENSE_SLOT_BANNER`. `/ads.txt` est généré automatiquement (`ADS_TXT_EXTRA` pour une autre régie). L'admin affiche une estimation des bannières vues ; les chiffres officiels restent ceux d'AdSense.

## SEO

- Rendu serveur de toutes les pages publiques, `lang="fr"`, titres et descriptions uniques, canonical par page.
- Pages thématiques `/qr-code/[slug]` (lien, wifi, whatsapp, vcard, e-mail, sms, texte) : contenu, étapes, usages, FAQ. À enrichir dans `src/content/qrPages.ts`.
- JSON-LD : WebApplication, Organization, FAQPage, HowTo, BreadcrumbList.
- `sitemap.xml`, `robots.txt`, manifest, image Open Graph générée, icône SVG.
- `/admin` et `/api` : `noindex` (en-têtes) et exclus de `robots.txt`.

Après mise en ligne : définis `NEXT_PUBLIC_SITE_URL`, ajoute le site dans Google Search Console (`GOOGLE_SITE_VERIFICATION`), soumets `/sitemap.xml`, vérifie les Core Web Vitals.

## Admin

`/admin` : visiteurs (uniques par jour), pages vues, pubs lancées/terminées, téléchargements, courbe journalière, pages, sources, pays, formats, appareils, navigateurs (7/30/90 jours). Limite de 5 tentatives de connexion / 15 min / IP.

Mesure d'audience sans cookie : identifiant = hash(sel + jour + IP + user-agent), IP non conservée, robots exclus. Le pays n'est connu que derrière Vercel ou Cloudflare.

## Avant la production

- Passer Prisma sur PostgreSQL (`provider = "postgresql"`) : SQLite ne convient pas à un hébergement serverless.
- Les limiteurs de débit sont en mémoire : sur plusieurs instances, utiliser Redis/Upstash.
- `stats()` agrège en JavaScript sur la période : au-delà de quelques centaines de milliers d'événements, passer à des `groupBy` SQL.
- Régie pub : vérifier les obligations de consentement (cookies) de ton pays et de ton audience.
- Remplacer les textes de `src/content/` par les tiens et relire la page confidentialité.
