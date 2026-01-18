# TicketHub - Site de Revente de Tickets

Site moderne et professionnel pour la revente de tickets de concerts et événements sportifs, optimisé pour Cloudflare Pages.

## 🎯 Fonctionnalités

- ✅ Page d'accueil avec catégories (Concerts & Sports)
- ✅ Pages dédiées pour chaque catégorie
- ✅ Pages détaillées pour chaque événement avec liste des tickets
- ✅ **Système bilingue** (Français / Anglais) avec sélecteur de langue
- ✅ **Boutons de contact flottants** (WhatsApp & Email)
- ✅ Design moderne inspiré de Ticketmaster
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Animations fluides
- ✅ Prix "à partir de" affiché sur chaque événement

## 📁 Structure des Fichiers

```
├── index.html          # Page d'accueil
├── concerts.html       # Page des concerts
├── sports.html         # Page des sports
├── event.html          # Page détail d'un événement
├── events-data.js      # Base de données des événements
├── language.js         # Système de traduction
└── styles.css          # Styles CSS
```

## 🎨 Personnalisation

### Modifier les Couleurs

Dans `styles.css`, modifie les variables CSS à la ligne 1 :

```css
:root {
  --primary: #1a1a1a;        /* Couleur principale */
  --secondary: #ff006e;       /* Couleur secondaire (rose) */
  --accent: #fb5607;          /* Couleur accent (orange) */
}
```

### Personnaliser les Boutons de Contact

Dans **chaque page HTML** (index.html, concerts.html, sports.html, event.html), modifie les liens WhatsApp et Email :

```html
<!-- Contact Buttons -->
<div class="contact-buttons">
    <a href="https://wa.me/33612345678" target="_blank" class="contact-btn whatsapp-btn" title="WhatsApp">
        💬
    </a>
    <a href="mailto:contact@tickethub.com" class="contact-btn email-btn" title="Email">
        ✉️
    </a>
</div>
```

**Pour WhatsApp** : Remplace `33612345678` par ton numéro (format international sans +)
- France : `336XXXXXXXX`
- Belgique : `324XXXXXXXX`
- Suisse : `417XXXXXXXX`

**Pour Email** : Remplace `contact@tickethub.com` par ton adresse email

### Système de Traduction

Le site supporte le français et l'anglais. Les utilisateurs peuvent changer de langue avec le sélecteur en haut à droite. La langue est sauvegardée automatiquement dans leur navigateur.

Pour ajouter des traductions, modifie le fichier `language.js` :

### Ajouter/Modifier des Événements

Dans `events-data.js`, ajoute tes événements dans les tableaux `concerts` ou `sports` :

```javascript
{
  id: 'identifiant-unique',              // ID unique pour l'URL
  name: 'Nom de l\'artiste',             // Nom affiché
  venue: 'Nom de la salle',              // Lieu
  city: 'Ville',                         // Ville
  date: '2026-03-15',                    // Date (format YYYY-MM-DD)
  time: '20:00',                         // Heure
  image: 'URL_DE_L_IMAGE',               // URL de l'image
  minPrice: 89,                          // Prix minimum
  tickets: [                             // Liste des tickets disponibles
    { 
      section: 'Carré Or',               // Section
      row: 'A',                          // Rangée
      seats: '12-13',                    // Sièges
      price: 350                         // Prix
    },
    // ... autres tickets
  ]
}
```

### Images Recommandées

- Résolution : 800x600px minimum
- Format : JPG ou PNG
- Sources gratuites : Unsplash, Pexels, Pixabay

## 🚀 Déploiement sur Cloudflare Pages

1. **Connecte ton repo GitHub à Cloudflare Pages**
   - Va sur Cloudflare Dashboard > Pages
   - Clique sur "Create a project"
   - Connecte ton repo GitHub `Site-Tickets`

2. **Configuration du build**
   - Build command : (laisse vide)
   - Build output directory : `/`
   - Root directory : (laisse vide)

3. **Déploie !**
   - Cloudflare va automatiquement déployer ton site
   - Chaque push sur GitHub mettra à jour le site automatiquement

## 📝 Comment Ajouter un Nouvel Événement

1. Ouvre `events-data.js`
2. Trouve la section appropriée (`concerts` ou `sports`)
3. Copie un événement existant
4. Modifie les informations :
   - Change l'ID (unique et sans espaces)
   - Mets à jour le nom, lieu, date, etc.
   - Ajoute tes tickets avec leurs prix
5. Sauvegarde et push sur GitHub
6. Le site se mettra à jour automatiquement !

## 🎫 Format des Tickets

Chaque ticket doit avoir :
- `section` : Nom de la section (ex: "Carré Or", "Fosse", "Tribune")
- `row` : Rangée (ex: "A", "K", "GA" pour General Admission)
- `seats` : Numéros de sièges (ex: "12-13", "1-2-3-4")
- `price` : Prix en euros (nombre entier)

## 💡 Astuces

### Calculer le Prix Minimum
Le prix minimum (`minPrice`) est calculé automatiquement comme le prix le plus bas parmi tous les tickets de l'événement.

### Organiser les Événements
Les événements s'affichent dans l'ordre où ils sont listés dans `events-data.js`. Mets les plus importants en premier !

### Utiliser des Emojis
Les emojis (🎵, ⚽, 📍, etc.) fonctionnent parfaitement et ajoutent du style au site.

## 🔧 Support

Si tu as besoin d'ajouter des fonctionnalités :
- Système de paiement
- Compte utilisateur
- Panier d'achat
- Filtres de recherche
- etc.

Fais-moi signe et je t'aiderai à les intégrer !

## 📱 Responsive

Le site est optimisé pour :
- 📱 Mobile (< 480px)
- 📱 Tablette (480px - 768px)
- 💻 Desktop (> 768px)

## ⚡ Performance

- CSS optimisé avec animations performantes
- Images lazy-loaded via Unsplash
- Code JavaScript vanilla (pas de framework = super rapide)
- Compatible avec tous les navigateurs modernes

Bon courage avec ton site de tickets ! 🎉
