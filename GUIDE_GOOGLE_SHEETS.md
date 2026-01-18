# 🎯 GUIDE COMPLET : UTILISER GOOGLE SHEETS POUR GÉRER VOS TICKETS

Ce guide vous explique comment connecter votre site à Google Sheets pour gérer vos événements et tickets en temps réel !

---

## ✅ ÉTAPE 1 : Créer votre Google Sheet

1. **Allez sur** : https://sheets.google.com
2. **Créez un nouveau Sheet** (Fichier > Nouveau)
3. **Nommez-le** : "TicketHub - Événements"

---

## ✅ ÉTAPE 2 : Copier le Template

1. **Ouvrez le fichier** `GOOGLE_SHEETS_TEMPLATE.txt`
2. **Copiez tout le contenu** (à partir de la ligne avec les en-têtes)
3. **Collez dans votre Sheet** (cellule A1)
4. Les données devraient s'organiser automatiquement en colonnes

**Votre Sheet doit ressembler à ça :**

| event_id | event_name | category | venue | city | date | time | image_url | league | trending | section | row | seats | price |
|----------|-----------|----------|-------|------|------|------|-----------|--------|----------|---------|-----|-------|-------|
| drake-paris-2026 | Drake | Concert | Accor Arena | Paris | 2026-03-15 | 20:00 | https://... | | TRUE | Carré Or | A | 12-13 | 350 |

---

## ✅ ÉTAPE 3 : Publier votre Sheet en CSV

1. Dans votre Google Sheet, cliquez sur **Fichier > Partager > Publier sur le Web**
2. **Onglet "Lien"** :
   - Sélectionnez **"Feuille 1"** (ou le nom de votre feuille)
   - Format : **CSV**
3. Cochez **"Publier automatiquement à chaque modification"**
4. Cliquez sur **"Publier"**
5. **Copiez l'URL générée** (elle ressemble à : `https://docs.google.com/spreadsheets/d/e/...../pub?output=csv`)

---

## ✅ ÉTAPE 4 : Connecter votre Sheet au Site

1. **Ouvrez le fichier** `sheets-loader.js`
2. **Trouvez la ligne 10** :
   ```javascript
   const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_SHEET_CSV_URL_HERE';
   ```
3. **Remplacez** `YOUR_GOOGLE_SHEET_CSV_URL_HERE` par l'URL que vous avez copiée
4. **Exemple** :
   ```javascript
   const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxxx.../pub?output=csv';
   ```
5. **Sauvegardez** le fichier

---

## ✅ ÉTAPE 5 : Modifier les Fichiers HTML

**Dans CHAQUE fichier HTML** (`index.html`, `concerts.html`, `sports.html`, `event.html`), remplacez :

```html
<script src="events-data.js"></script>
```

**PAR :**

```html
<script src="sheets-loader.js"></script>
```

---

## ✅ ÉTAPE 6 : Upload sur GitHub

Uploadez ces fichiers sur votre repo GitHub :

1. ✅ `sheets-loader.js` (nouveau fichier)
2. ✅ `index.html` (modifié)
3. ✅ `concerts.html` (modifié)
4. ✅ `sports.html` (modifié)
5. ✅ `event.html` (modifié)
6. ✅ Tous les autres fichiers existants

⚠️ **Note** : Vous pouvez garder `events-data.js` comme backup, mais il ne sera plus utilisé.

---

## 🎉 ÉTAPE 7 : Test !

1. Attendez 2-3 minutes que Cloudflare déploie
2. Visitez votre site
3. Vos événements devraient apparaître !

---

## 📝 COMMENT AJOUTER/MODIFIER DES ÉVÉNEMENTS

### ➕ Ajouter un Nouvel Événement :

**Exemple : Ajouter un concert de Taylor Swift**

1. Ouvrez votre Google Sheet
2. Ajoutez une nouvelle ligne pour CHAQUE ticket :

```
taylor-swift-paris-2026,Taylor Swift,Concert,Stade de France,Paris,2026-05-15,20:00,https://unsplash.com/photo-xxx,,TRUE,VIP,A,1-2,500
taylor-swift-paris-2026,Taylor Swift,Concert,Stade de France,Paris,2026-05-15,20:00,https://unsplash.com/photo-xxx,,TRUE,Tribune,K,12-13-14,180
taylor-swift-paris-2026,Taylor Swift,Concert,Stade de France,Paris,2026-05-15,20:00,https://unsplash.com/photo-xxx,,TRUE,Pelouse,GA,5,95
```

3. **Sauvegardez** (automatique dans Google Sheets)
4. **Rafraîchissez votre site** → Taylor Swift apparaît ! ✨

### ✏️ Modifier un Prix :

1. Trouvez la ligne du ticket dans le Sheet
2. Changez le prix dans la colonne `price`
3. Sauvegardez
4. Rafraîchissez le site → Prix mis à jour !

### 🗑️ Supprimer un Ticket Vendu :

1. Supprimez la ligne correspondante dans le Sheet
2. Sauvegardez
3. Le ticket disparaît du site !

---

## 📋 EXPLICATION DES COLONNES

| Colonne | Description | Exemple | Obligatoire |
|---------|-------------|---------|-------------|
| **event_id** | ID unique de l'événement (même ID pour tous les tickets d'un événement) | `drake-paris-2026` | ✅ Oui |
| **event_name** | Nom affiché | `Drake` | ✅ Oui |
| **category** | Type d'événement | `Concert` ou `Sport` | ✅ Oui |
| **venue** | Lieu | `Accor Arena` | ✅ Oui |
| **city** | Ville | `Paris` | ✅ Oui |
| **date** | Date | `2026-03-15` (format YYYY-MM-DD) | ✅ Oui |
| **time** | Heure | `20:00` (format HH:MM) | ✅ Oui |
| **image_url** | URL de l'image | `https://...` | ✅ Oui |
| **league** | Compétition (Sport seulement) | `Ligue 1`, `Champions League` | ❌ Non |
| **trending** | Afficher en "Dernières places" ? | `TRUE` ou `FALSE` | ✅ Oui |
| **section** | Section du ticket | `VIP`, `Parterre`, `Tribune` | ✅ Oui |
| **row** | Rangée | `A`, `K`, `GA` | ✅ Oui |
| **seats** | Sièges | `12-13`, `1-2-3-4` | ✅ Oui |
| **price** | Prix en euros | `350`, `89` (sans symbole €) | ✅ Oui |

---

## 💡 CONSEILS PRO

### ✨ Pour un Même Événement :
- Utilisez le **même event_id** pour tous les tickets
- Le système regroupera automatiquement les tickets
- Le prix minimum sera calculé automatiquement

### 🔥 Trending / Dernières Places :
- Mettez `TRUE` pour afficher en haut de la page
- Limitez à 4-6 événements max
- Badge "🔥 Dernières places" apparaîtra automatiquement

### 🖼️ Images :
- Utilisez Unsplash (gratuit) : https://unsplash.com
- Ou uploadez dans votre repo GitHub dans un dossier `images/`
- Format recommandé : 800x600px minimum

### ⚡ Actualisation :
- Changements visibles en **30 secondes maximum**
- Pas besoin de redéployer le site
- Juste refresh la page !

---

## 🆘 DÉPANNAGE

### ❌ "Les événements ne s'affichent pas"
- Vérifiez que l'URL CSV est correcte dans `sheets-loader.js`
- Vérifiez que le Sheet est bien publié (Fichier > Partager > Publier sur le Web)
- Regardez la console du navigateur (F12) pour voir les erreurs

### ❌ "Certains événements manquent"
- Vérifiez que toutes les colonnes obligatoires sont remplies
- Vérifiez le format de la date (YYYY-MM-DD)
- Vérifiez que `category` est soit "Concert" soit "Sport"

### ❌ "Le site utilise toujours les anciennes données"
- Videz le cache du navigateur (Ctrl+F5)
- Vérifiez que vous avez bien remplacé `events-data.js` par `sheets-loader.js` dans les HTML

---

## 🎊 FÉLICITATIONS !

Vous pouvez maintenant gérer votre site de tickets **directement depuis Google Sheets** !

Plus besoin de toucher au code, tout se fait depuis votre tableur ! 🚀

---

**Besoin d'aide ?** Contactez le support ou consultez la documentation complète.
