# Audit technique rapide — TicketHub

## 1) État actuel du projet

Le dépôt est un **site statique multi-pages** (HTML/CSS/JS vanilla) avec :
- une page d’accueil (`index.html`),
- des listes d’événements (`concerts.html`, `sports.html`),
- une page détail événement (`event.html`),
- une page de regroupement (`group.html`),
- un service worker pour usage PWA (`sw.js`).

La donnée est chargée côté client via `sheets-loader.js` :
- tentative de lecture Google Sheets (CSV publié),
- fallback local embarqué (grand tableau d’événements) si indisponible.

## 2) Architecture fonctionnelle observée

### Front-end
- **Style global unique**: `styles.css`.
- **Fonctions transverses**: 
  - mode sombre: `dark-mode.js`,
  - i18n FR/EN: `language.js`,
  - shell PWA + thème meta: `app.js`,
  - gestion images responsive: `image-utils.js`.
- **Rendu dynamique des cartes** directement dans les pages via scripts inline.

### Données
- `sheets-loader.js` maintient un `eventsData` global (`concerts`, `sports`).
- Tri par date + calcul de `minPrice`.
- Déclenchement d’un événement custom `eventsLoaded` utilisé par les pages pour déclencher le rendu.

### Conversion / commande
- `checkout-handler.js` contient le flux de demande/commande (construction d’un récapitulatif et messages).
- CTA principaux via WhatsApp / email (liens pré-remplis).

## 3) Points forts

- Base déjà exploitable pour un lancement rapide (landing + catalogue + détail).
- UX utile: dark mode, bilingue, CTA immédiats, trending badges.
- Résilience des données grâce au fallback local.
- Support PWA basique via service worker.

## 4) Risques et dettes techniques prioritaires

1. **Configuration Google Sheets non finalisée**
   - `GOOGLE_SHEET_URL` est encore sur une valeur placeholder.
   - Tant que non remplacé, l’app fonctionne surtout sur fallback local.

2. **CSV parsing fragile**
   - parseur basé sur `split(',')`, insuffisant si des champs contiennent des virgules entre guillemets.
   - risque de corruption silencieuse des lignes importées.

3. **Duplication de scripts/pages**
   - présence de fichiers `concerts (1).html`, `sports (1).html`, `sheets-loader (1).js`.
   - risque de confusion de maintenance / déploiement.

4. **Logique UI directement inline dans les pages**
   - le JS de rendu est volumineux dans les fichiers HTML.
   - complexifie les évolutions (filtres, tri, pagination, SEO dynamique).

5. **Service worker cache-first global**
   - peut servir des versions obsolètes si la stratégie de versioning n’est pas rigoureuse.

## 5) Plan de travail recommandé (MVP solide)

### Sprint 1 — Stabilisation
- Remplacer l’URL Google Sheets par la vraie publication CSV.
- Remplacer le parseur CSV maison par un parseur robuste.
- Supprimer/archiver les fichiers dupliqués `(1)`.
- Externaliser les scripts inline des pages vers modules dédiés (`pages/home.js`, `pages/concerts.js`, etc.).

### Sprint 2 — Produit
- Ajouter filtres (ville, date, catégorie, budget).
- Ajouter tri (prix, date, popularité).
- Ajouter états vides et skeleton loading.
- Uniformiser les messages FR/EN (fichiers de traduction centralisés).

### Sprint 3 — Fiabilité / SEO / conversion
- Génération d’URL canoniques + metadata page détail par événement.
- Tracking conversion (clic WhatsApp, envoi demande).
- Validation simple côté client du formulaire de demande.
- Mise en place d’un mini back-office data (même si via Google Sheets au début).

## 6) Proposition d’organisation pour "créer le site" ensemble

Je te propose qu’on avance de manière incrémentale :

1. **Cadrage produit** (30-60 min)
   - tes objectifs business,
   - ton tunnel de conversion,
   - ton positionnement (premium / last minute / niche).

2. **Hardening technique immédiat**
   - je nettoie la base et sécurise le chargement des données.

3. **Construction des fonctionnalités prioritaires**
   - filtres + recherche,
   - pages événement plus orientées conversion,
   - instrumentation analytics claire.

4. **Préparation déploiement**
   - checklist performance, SEO et PWA,
   - procédure de mise à jour des tickets (Google Sheets ou API).

## 7) Next step concret

Si tu veux, je peux enchaîner dès maintenant avec un **lot technique #1**:
- nettoyage des fichiers dupliqués,
- durcissement du parsing CSV,
- extraction des scripts inline les plus critiques,
- et un mini plan de tests manuels.

