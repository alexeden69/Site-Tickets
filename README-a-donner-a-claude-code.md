# Comment utiliser ce fichier avec Claude Code

`TicketDashboard.jsx` est un composant de référence, fonctionnel et visuel, à donner tel quel à Claude Code comme base pour le nouveau dashboard.

## Dépendances à installer
```
npm install recharts
```

## Polices utilisées (à ajouter dans le layout Next.js)
- Oswald (titres)
- Inter (corps de texte)
- IBM Plex Mono (chiffres, données)

Via Google Fonts ou `next/font/google`.

## Ce que fait ce composant
- Cartes de statistiques (billets achetés, vendus, en stock, recettes, bénéfice net, ROI)
- 3 graphiques (recharts) : coût vs recette par événement, répartition du statut des billets, bénéfice par événement
- Table de détail de toutes les opérations

## Ce qu'il reste à brancher
- Remplacer `SAMPLE_TICKETS` par les données réelles venant de Supabase (table `tickets`, voir le brief `brief-dashboard-billetterie.md`)
- Ajouter le formulaire d'ajout de billet, la vente inline, et le changement de statut (déjà présents dans le prototype `dashboard-billets.html` fourni séparément — reprendre cette logique et la connecter à Supabase au lieu du stockage local)
- Ajouter l'authentification à 2 comptes (Supabase Auth)

## Message à donner à Claude Code
"Utilise le fichier TicketDashboard.jsx comme référence exacte du design et de la structure visuelle du dashboard. Garde ce style (couleurs, cartes, graphiques, table) et branche les données sur Supabase selon le brief. Reprends aussi la logique métier du fichier dashboard-billets.html (ajout de billet, vente, changement de statut, alertes d'échéance) en la connectant à la vraie base de données."
