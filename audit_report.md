# 🔍 Audit Complet — WT Tech-Tree Maker

> **Projet audité :** `Our-WT-TT-Maker`  
> **Date :** 25 Avril 2026  
> **Fichiers analysés :** `index.html`, `script.js` (2362 lignes), `style.css` (1245 lignes), `template.js`, `editorjs-credits-tool.js`, `config.json`, `css/index.css`, `css/deck_style.css`

---

## 📊 Résumé Exécutif

| Catégorie | Score | Détail |
|---|---|---|
| 🛡️ Sécurité | 🟡 **Amélioré** | XSS partiellement fixé, validation ajoutée, reste des améliorations |
| ⚡ Performance | ⚠️ **Moyen** | Fichier JS monolithique, redraws excessifs, pas de lazy loading |
| 🏗️ Architecture | � **Amélioré** | Tom Select remplace jQuery partiellement, code encore monolithique |
| 🎨 UI/UX | 🟢 **Bon** | Design moderne, modales améliorées, tooltips stylisés |
| ♿ Accessibilité | 🔴 **Faible** | Très peu de sémantique ARIA, pas de gestion clavier |
| 📱 Responsive | ⚠️ **Moyen** | Overflow gérée mais pas de breakpoints media queries |

---

## ✅ Ce qui est BIEN fait

### 🎨 1. Design System cohérent
- Excellente utilisation des **CSS custom properties** (`:root` variables) pour le thème
- Palette de couleurs harmonieuse (dark mode GitHub-like)
- Animations CSS modernes (`slideUp`, `fadeIn`, `cubic-bezier`)
- Scrollbar customisée élégante
- Hover effects subtils et professionnels (translate, brightness, scale)
- **Nouveau :** Tooltips modernisés avec animations et design cohérent
- **Nouveau :** Inputs et boutons stylisés avec padding, border-radius et transitions

### 🏗️ 2. Bonne organisation du code JS
- Utilisation de `'use strict'`
- Régions de code bien définies (`#region` / `#endregion`)
- ESLint configuré avec des règles strictes
- `init()` async pour l'initialisation propre
- **Nouveau :** Fonctions XSS prevention (`escapeHtml`, `escapeHtmlAttr`) ajoutées
- **Nouveau :** Validation de schéma pour véhicules et backups

### 🔧 3. Fonctionnalités solides
- Système de backup/restore JSON fonctionnel
- Clone depuis le wiki WT — fonctionnalité avancée bien pensée
- Système de crédits modulaire piloté par `config.json`
- Editor.js bien intégré avec support de types de blocs multiples
- Système de folders (groupes de véhicules) élaboré
- **Nouveau :** Swiper.js pour galerie d'images dans modales (remplace Galleria)
- **Nouveau :** Tom Select pour selects (remplace Select2/jQuery)
- **Nouveau :** Tri numérique des branches (fix bug >9)
- **Nouveau :** Branches premium toujours à droite des branches normales
- **Nouveau :** Flèches de connexion automatiques pour branches normales, manuelles pour premium

### 💾 4. Persistance des données
- Utilisation cohérente de `localStorage` pour la sauvegarde automatique
- Backup/restore via fichiers JSON téléchargeables
- Description tech tree sauvegardée en temps réel avec debounce
- **Nouveau :** Validation Editor.js blocks pour éviter warnings
- **Nouveau :** Compatibilité avec anciens formats de backup (yes/no/folder → connected/disconnected/foldered)

### 📦 5. Configuration externalisée
- `config.json` sépare bien la configuration métier du code
- Types de crédits, sections de description, et thème UI externalisés
- Fallback robuste si le config ne charge pas

### 🌐 6. Export HTML amélioré
- **Nouveau :** CSS inline inclus dans l'export (titre stylesheet corrigé)
- **Nouveau :** Description HTML correctement formatée (plus de `[object Object]`)
- **Nouveau :** Script Python `update_style.py` sécurisé pour ne pas casser les exports

---

## 🔴 Ce qui est MAL fait / À corriger

---

### 🛡️ SÉCURITÉ — Améliorations récentes mais reste du travail

#### ✅ FIXÉ : Validation de schéma ajoutée

```javascript
// script.js L26-38 - validateVehicle() maintenant implémenté
function validateVehicle(v) {
    if (!v || typeof v !== 'object') return false;
    if (typeof v.name !== 'string' || v.name.length === 0) return false;
    if (typeof v.id !== 'string' || v.id.length === 0) return false;
    if (typeof v.rank !== 'number' || v.rank < 0) return false;
    if (typeof v.branch !== 'number' || v.branch < 0) return false;
    if (typeof v.br !== 'number' || v.br < 0) return false;
    if (!['researchable', 'reserve', 'premium', 'event', 'squadron'].includes(v.type)) return false;
    // Accept both old format (yes/no/folder) and new format (connected/disconnected/foldered)
    if (v.connection !== undefined && !['connected', 'disconnected', 'foldered', 'yes', 'no', 'folder'].includes(v.connection)) return false;
    if (v.follow !== undefined && typeof v.follow !== 'string') return false;
    return true;
}
```

#### ✅ FIXÉ : Fonctions XSS prevention ajoutées

```javascript
// script.js L7-23 - escapeHtml() et escapeHtmlAttr() implémentés
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeHtmlAttr(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
```

#### ⚠️ RESTE : XSS via `innerHTML` sur certaines données utilisateur

Malgré les fonctions d'échappement ajoutées, certaines insertions `innerHTML` restent vulnérables :

| Fichier | Ligne | Code dangereux | Statut |
|---|---|---|---|
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js) | ~1368 | `<span class="vehicleName">${vehicle.name}</span>` | ⚠️ Pas échappé |
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js) | ~1345 | `img = '<img src="${vehicle.thumbnail}"...'` | ⚠️ Pas échappé |
| [template.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/template.js) | ~94 | `const vehicleList = ${data.vehicles}` | ⚠️ Injection JSON |

**Remédiation :** Appliquer `escapeHtml()` et `escapeHtmlAttr()` à toutes les insertions de données utilisateur.

---

#### ⚠️ Dépendances CDN obsolètes et non sécurisées

| Dépendance | Version | Problème |
|---|---|---|
| jQuery | 3.5.1 | ⚠️ **Très ancien** (actuelle 3.7+). Vulnérabilités connues |
| Editor.js | 2.28.0 | ✅ Correct |
| Swiper.js | 11.x | ✅ Correct (remplace Galleria) |
| Tom Select | Latest | ✅ Correct (remplace Select2/jQuery) |

**Amélioration :** Tom Select et Swiper.js remplacent partiellement jQuery, mais jQuery est toujours chargé pour compatibilité.

---

#### ⚠️ Google Analytics sans consentement utilisateur

```html
<!-- index.html L13-21 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2MXHJ2WEKE"></script>
```

**Problème :** Pas de banner de consentement RGPD. Le tracking démarre immédiatement au chargement de la page.

---

#### ✅ FIXÉ : `localStorage.clear()` remplacé par `removeItem` ciblés

```javascript
// script.js L559 - Maintenant utilise removeItem ciblés
['save', 'title', 'description', 'branchTitles', 'settings'].forEach(key => localStorage.removeItem(key));
```

---

### ⚡ PERFORMANCE — Optimisations nécessaires

#### 🔴 Script monolithique de ~80 Ko / 2362 lignes

[script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js) est un fichier unique qui contient TOUT : listeners, rendering, data management, UI logic, export, clone.

**Remédiation :** Découper en modules ES6 :
```
src/
├── core/vehicle.js       # Vehicle data model
├── ui/modals.js           # Modal management  
├── ui/tree-renderer.js    # Tech tree rendering
├── features/backup.js     # Backup/restore
├── features/export.js     # HTML export
├── features/clone.js      # Wiki clone utility
├── features/credits.js    # Credits system
└── utils/sanitize.js      # HTML sanitization
```

---

#### 🔴 Redraw excessifs du tech tree

Chaque modification mineure provoque un **redraw complet** de l'arbre.

**Remédiation :**
- Utiliser un **Virtual DOM** ou du patching sélectif
- Séparer le rendu de la description du rendu de l'arbre
- Augmenter le debounce à 1000-1500ms pour la description

---

#### ⚠️ Manipulation DOM lourde dans `createVehicleBadge`

Chaque badge crée un `<table>` avec 3 `<tr>` et 5 `<td>`. Pour 200 véhicules = **1000+ éléments DOM** inutiles.

**Remédiation :** Utiliser des `<div>` avec Flexbox au lieu de `<table>` pour les badges.

---

#### ⚠️ Pas de minification / bundling

Le code est servi brut — ~80 Ko de JS, ~25 Ko de CSS non minifiés. Pas de build step.

**Remédiation :** Ajouter un build minimal avec esbuild ou webpack.

---

#### ⚠️ Images chargées depuis des URLs externes sans `loading="lazy"`

Les thumbnails de véhicules sont des images externes sans optimisation.

**Remédiation :** Ajouter `loading="lazy"`, `width`, `height`, ou `srcset`.

---

### 🏗️ ARCHITECTURE — Améliorations mais reste du travail

#### ✅ AMÉLIORÉ : jQuery partiellement remplacé

- **Tom Select** remplace Select2 (sans jQuery)
- **Swiper.js** remplace Galleria (sans jQuery)
- jQuery toujours chargé pour compatibilité restante

**Remédiation :** Complètement supprimer jQuery et migrer tout le code restant en Vanilla JS.

---

#### 🔴 Duplication massive de code

Les modals **Add** et **Edit** partagent ~90% du même HTML et JS.

**Remédiation :** Créer une seule fonction `readVehicleInput(isEdit)` et un seul template de formulaire dynamique.

---

#### ⚠️ Variables globales excessives

```javascript
const vehicleList = [];          // Global mutable array
let branchTitles = {};           // Global mutable object
let config = null;               // Global
let creditTypes = [];            // Global
let currentCreditType = null;    // Global
let tempCredits = [];            // Global
let tempCreditsEdit = [];        // Global
let sortingLoopError = false;    // Global
const settings = {...};          // Global mutable object
let tomSelectInstances = {};     // Global (nouveau)
```

10 variables globales mutables = risque élevé de side effects et de bugs subtils.

---

#### ⚠️ Pas de gestion d'erreurs robuste

Peu de `try/catch` autour des opérations critiques (localStorage full, Editor.js failure, etc.).

---

### 🎨 CSS — Problèmes

#### ⚠️ Déclarations dupliquées / conflictuelles

`.modal-content` et d'autres sélecteurs sont définis plusieurs fois dans le même fichier.

**Remédiation :** Consolider en une seule déclaration par sélecteur.

---

#### ⚠️ Vendor prefixes inutiles

```css
display: -webkit-box;
display: -ms-flexbox;
display: flex;
```

En 2026, ces prefixes ne sont plus nécessaires.

---

#### ⚠️ Utilisation de `!important` dans `deck_style.css`

**23 occurrences de `!important`** dans `deck_style.css` — signe de guerre de spécificité CSS.

---

### ♿ ACCESSIBILITÉ

#### 🔴 Navigation uniquement au clic

- Aucun `tabindex` sur les éléments interactifs de la nav
- Les `<div>` utilisés comme boutons dans `<nav>` ne sont pas des `<button>`
- Pas de gestion du clavier (Escape pour fermer les modals, Tab navigation)

#### 🔴 Pas de labels ARIA

```html
<nav>
    <div id="navAdd">Add vehicle</div>  <!-- Devrait être <button role="button"> -->
    <div id="navEdit">Edit vehicle</div>
    ...
</nav>
```

#### ⚠️ Contraste insuffisant

```css
--text_muted: #8b949e;  /* Sur fond #161b22 → ratio ~4:1, en dessous du minimum WCAG AA (4.5:1) */
```

---

### 📁 DIVERS

#### ⚠️ API obsolète utilisée

```javascript
// L533, L806
if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(file, fileName);
```

`msSaveOrOpenBlob` est une API Microsoft Edge Legacy / IE uniquement, supprimée depuis longtemps.

---

#### ⚠️ `var` encore utilisé

Le code utilise `'use strict'` et `const`/`let` partout sauf dans quelques endroits qui utilisent encore `var`.

---

#### ⚠️ Double meta viewport

Deux balises `viewport` dans le template d'export — la seconde écrase la première.

---

## 📋 Plan d'action priorisé

### 🔥 Priorité 1 — Sécurité (immédiat)

- [x] Créer une fonction `escapeHtml()` et l'appliquer à toutes les insertions `innerHTML` de données utilisateur
- [x] Valider le schéma des backups JSON importés
- [x] Supprimer `localStorage.clear()` → utiliser des `removeItem` ciblés
- [ ] Appliquer `escapeHtml()` aux insertions restantes (vehicle.name, vehicle.thumbnail dans innerHTML)
- [ ] Ajouter SRI (`integrity`) à tous les scripts CDN

### ⚡ Priorité 2 — Performance (court terme)

- [ ] Séparer le rendu description du rendu arbre
- [ ] Augmenter le debounce de description à 1500ms  
- [ ] Ajouter `loading="lazy"` aux images
- [ ] Remplacer les `<table>` de badges par des `<div>` flex
- [ ] Ajouter minification/bundling

### 🏗️ Priorité 3 — Architecture (moyen terme)

- [ ] Factoriser les formulaires Add/Edit en un seul composant
- [ ] Découper `script.js` en modules ES6
- [ ] Complètement supprimer jQuery
- [ ] Consolider les déclarations CSS dupliquées
- [ ] Nettoyer les vendor prefixes obsolètes
- [ ] Réduire les variables globales

### ♿ Priorité 4 — Accessibilité (moyen terme)

- [ ] Remplacer les `<div>` de navigation par des `<button>`
- [ ] Ajouter gestion Escape pour fermer les modals
- [ ] Ajouter `aria-label` sur les éléments interactifs
- [ ] Vérifier les ratios de contraste WCAG

---

## 📝 Changements récents (Avril 2026)

### ✅ Améliorations apportées

1. **Sécurité**
   - Ajout de `escapeHtml()` et `escapeHtmlAttr()`
   - Validation de schéma pour véhicules et backups
   - Remplacement de `localStorage.clear()` par `removeItem` ciblés

2. **UI/UX**
   - Modales améliorées (horizontal scroll fixé, galerie Swiper)
   - Tooltips modernisés
   - Inputs et boutons stylisés
   - Scrollbar customisée

3. **Fonctionnalités**
   - Tri numérique des branches (fix bug >9)
   - Branches premium toujours à droite
   - Flèches auto pour branches normales, manuelles pour premium
   - Tom Select remplace Select2/jQuery
   - Swiper.js remplace Galleria
   - Validation Editor.js blocks
   - Compatibilité anciens backups

4. **Export**
   - CSS inline inclus
   - Description HTML correcte
   - Script Python sécurisé
