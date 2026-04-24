# 🔍 Audit Complet — WT Tech-Tree Maker

> **Projet audité :** `Our-WT-TT-Maker`  
> **Date :** 23 Avril 2026  
> **Fichiers analysés :** `index.html`, `script.js` (2275 lignes), `style.css` (1456 lignes), `template.js`, `editorjs-credits-tool.js`, `config.json`, `css/index.css`, `css/deck_style.css`

---

## 📊 Résumé Exécutif

| Catégorie | Score | Détail |
|---|---|---|
| 🛡️ Sécurité | ⚠️ **Moyen** | Plusieurs failles XSS critiques, dépendances obsolètes |
| ⚡ Performance | ⚠️ **Moyen** | Fichier JS monolithique, redraws excessifs, pas de lazy loading |
| 🏗️ Architecture | 🔴 **Faible** | Pas de séparation de responsabilités, code monolithique |
| 🎨 UI/UX | 🟢 **Bon** | Design moderne et cohérent, bonne utilisation de CSS variables |
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

### 🏗️ 2. Bonne organisation du code JS
- Utilisation de `'use strict'`
- Régions de code bien définies (`#region` / `#endregion`)
- ESLint configuré avec des règles strictes
- `init()` async pour l'initialisation propre

### 🔧 3. Fonctionnalités solides
- Système de backup/restore JSON fonctionnel
- Clone depuis le wiki WT — fonctionnalité avancée bien pensée
- Système de crédits modulaire piloté par `config.json`
- Editor.js bien intégré avec support de types de blocs multiples
- Système de folders (groupes de véhicules) élaboré

### 💾 4. Persistance des données
- Utilisation cohérente de `localStorage` pour la sauvegarde automatique
- Backup/restore via fichiers JSON téléchargeables
- Description tech tree sauvegardée en temps réel avec debounce (`setTimeout 500ms`)

### 📦 5. Configuration externalisée
- `config.json` sépare bien la configuration métier du code
- Types de crédits, sections de description, et thème UI externalisés
- Fallback robuste si le config ne charge pas ([script.js:L22-33](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js#L22-L33))

---

## 🔴 Ce qui est MAL fait / À corriger

---

### 🛡️ SÉCURITÉ — Failles critiques

#### 🔴 CRITIQUE : Injection XSS via `innerHTML` sur données utilisateur

> [!CAUTION]
> C'est la faille la plus grave du projet. Un attaquant peut injecter du JavaScript arbitraire.

**Emplacements critiques :**

| Fichier | Ligne | Code dangereux |
|---|---|---|
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js#L864) | L864 | `document.querySelector('#modal_title').innerText = vehicle.name` ✅ (ok ici) |
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js#L873) | L873 | `modalDesc.innerHTML = convertEditorBlocksToHtml(blocks)` ⚠️ |
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js#L875) | L875 | `modalDesc.innerHTML = vehicle.description` 🔴 **XSS direct** |
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js#L1066) | L1066 | `descDiv.innerHTML = techTreeDescription` 🔴 **XSS direct** |
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js#L1345) | L1345 | `img = '<img src="${vehicle.thumbnail}"...'` 🔴 **XSS via attribut** |
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js#L1368) | L1368 | `<span class="vehicleName">${vehicle.name}</span>` 🔴 **XSS** |
| [script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js#L1991) | L1991 | `onclick="removeCredit(${index})"` 🔴 **Inline event handler** |
| [template.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/template.js#L80) | L80 | `const vehicleList = ${data.vehicles}` 🔴 **Injection de code dans l'export** |

**Impact :** Si un backup JSON est partagé avec du contenu malveillant dans `name`, `description`, ou `thumbnail`, le code JS sera exécuté dans le navigateur de l'utilisateur qui le charge.

**Remédiation :**
```javascript
// Créer une fonction d'échappement HTML
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Utiliser textContent au lieu de innerHTML quand c'est du texte brut
element.textContent = vehicle.name; // au lieu de innerHTML
```

---

#### 🔴 CRITIQUE : `JSON.parse()` sur backup utilisateur sans validation de schéma

```javascript
// script.js L552 - Le JSON est parsé et utilisé directement
const loadedData = JSON.parse(result);
if ([loadedData.title, loadedData.description, loadedData.vehicleList].includes(undefined)) {
    window.alert('Incorrect save file!');
    return;
}
```

**Problème :** Seule la présence des clés est vérifiée, pas le type ni le contenu. Un fichier de backup malformé peut injecter des propriétés inattendues dans `vehicleList`, potentiellement avec des prototypes pollués.

**Remédiation :** Valider chaque véhicule avec un schéma :
```javascript
function validateVehicle(v) {
    return typeof v.name === 'string' 
        && typeof v.rank === 'number'
        && typeof v.br === 'number'
        && ['researchable','reserve','premium','event','squadron'].includes(v.type);
}
```

---

#### ⚠️ Dépendances CDN obsolètes et non sécurisées

| Dépendance | Version | Problème |
|---|---|---|
| jQuery | 3.5.1 | ⚠️ **Très ancien** (actuelle 3.7+). Vulnérabilités connues |
| Galleria | 1.6.1 | ⚠️ Projet abandonné (dernier commit 2019) |
| Select2 | 4.1.0-rc.0 | ⚠️ Version **release candidate**, pas stable |
| Editor.js | 2.28.0 | ✅ Correct |

**Problèmes supplémentaires :**
- `galleria.min.js` est chargé via CDN **sans attribut `integrity`** (SRI) → risque de supply chain attack
- jQuery a un SRI ✅ mais les autres scripts CDN n'en ont pas 🔴

---

#### ⚠️ Google Analytics sans consentement utilisateur

```html
<!-- index.html L13-21 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2MXHJ2WEKE"></script>
```

**Problème :** Pas de banner de consentement RGPD. Le tracking démarre immédiatement au chargement de la page.

---

#### ⚠️ `localStorage.clear()` efface TOUT

```javascript
// script.js L499
localStorage.clear();
```

Cela efface **toutes** les données localStorage du domaine, pas seulement celles de l'app. Si le site partage un domaine avec d'autres apps, leurs données seront perdues aussi.

**Remédiation :** Supprimer uniquement les clés spécifiques :
```javascript
['save', 'title', 'description', 'branchTitles', 'settings'].forEach(k => localStorage.removeItem(k));
```

---

### ⚡ PERFORMANCE — Optimisations nécessaires

#### 🔴 Script monolithique de 75 Ko / 2275 lignes

[script.js](file:///e:/Travaille/CodageAutres/Projets%20Web/Wargame/WarTT/Our-WT-TT-Maker/script.js) est un fichier unique qui contient TOUT : listeners, rendering, data management, UI logic, export, clone. Cela impacte :
- Le **temps de parsing** initial
- La **maintenabilité** (impossible de tree-shake)
- Le **debugging** (hard to isolate bugs)

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

Chaque modification mineure provoque un **redraw complet** de l'arbre :

```javascript
// script.js L836 - Settings change
drawTree(organizeTree(vehicleList));

// script.js L2182 - Description change (même avec debounce, le redraw est total)
drawTree(organizeTree(vehicleList));
```

La fonction `drawTree` (L1046) fait :
1. `techTreeDiv.innerHTML = ''` — **détruit tout le DOM**
2. Reconstruit TOUT avec `createElement` en boucle
3. Appelle `affixFolderNumbers()`, `createBranchArrows()`, `setFillerSizes()`, `addBranchHeaders()`, `fitOverflowingFolder()`

**Impact :** Sur un arbre de 200+ véhicules, chaque keypress dans la description redessine tout.

**Remédiation :**
- Utiliser un **Virtual DOM** ou du patching sélectif
- Séparer le rendu de la description du rendu de l'arbre
- Augmenter le debounce à 1000-1500ms pour la description

---

#### ⚠️ Manipulation DOM lourde dans `createVehicleBadge`

```javascript
// L1356-1378 - Création de HTML via template literal injecté dans innerHTML
div.innerHTML = `<table>...<td id="${vehicle.id}"...>${vehicle.name}...</td>...</table>`;
```

Chaque badge crée un `<table>` avec 3 `<tr>` et 5 `<td>`. Pour 200 véhicules = **1000+ éléments DOM** inutiles.

**Remédiation :** Utiliser des `<div>` avec Flexbox au lieu de `<table>` pour les badges.

---

#### ⚠️ Pas de minification / bundling

Le code est servi brut — 75 Ko de JS, 26 Ko de CSS non minifiés. Pas de build step.

**Remédiation :** Ajouter un build minimal :
```json
"scripts": {
    "build": "esbuild script.js --bundle --minify --outfile=dist/script.min.js"
}
```

---

#### ⚠️ Images chargées depuis des URLs externes sans `loading="lazy"`

Les thumbnails de véhicules sont des images externes sans optimisation :
```javascript
if (vehicle.thumbnail !== undefined) img = `<img src="${vehicle.thumbnail}" style="...">`;
```

Pas de `loading="lazy"`, `width`, `height`, ou `srcset`.

---

### 🏗️ ARCHITECTURE — Problèmes structurels

#### 🔴 Mélange jQuery / Vanilla JS

Le projet utilise jQuery pour Select2 et Galleria uniquement, mais charge **90 Ko de jQuery** pour ça :

```javascript
// jQuery usage (seulement pour Select2 et Galleria)
$('#editionSelect').select2({ width: '15em' });
$('.galleria').data('galleria');
$('#editionSelect').on('change', ...);
```

**Tout le reste** est en Vanilla JS (`document.querySelector`, `addEventListener`).

**Remédiation :** Remplacer Select2 par un composant natif comme [Tom Select](https://tom-select.js.org/) (sans jQuery) et Galleria par une galerie moderne sans dépendance.

---

#### 🔴 Duplication massive de code

Les modals **Add** et **Edit** partagent ~90% du même HTML et JS :

| Add | Edit | % identique |
|---|---|---|
| `readVehicleInput()` (L1458-1534) | `readVehicleEditInput()` (L1535-1614) | ~85% |
| HTML du formulaire Add (L54-185) | HTML du formulaire Edit (L203-333) | ~90% |
| `creditsSectionAdd` | `creditsSectionEdit` | ~95% |

**Impact :** Chaque modification doit être faite deux fois. Bug probable si l'un est oublié.

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
```

9 variables globales mutables = risque élevé de side effects et de bugs subtils.

---

#### ⚠️ Pas de gestion d'erreurs robuste

```javascript
// L527 - Si l'éditeur n'est pas prêt, ça crashe silencieusement
const outputData = await window.techTreeMainDescEditor.save();
```

Peu de `try/catch` autour des opérations critiques (localStorage full, Editor.js failure, etc.).

---

### 🎨 CSS — Problèmes

#### ⚠️ Déclarations dupliquées / conflictuelles

Le CSS contient des redéfinitions du même sélecteur :

```css
/* Première déclaration L706-714 */
.modal-content {
    background-color: rgb(46, 66, 80);
    margin: 5% auto;
    padding: 20px;
    width: 100%;
    max-width: 750px;
    max-height: 90vh;
}

/* Seconde déclaration L768-778 (écrase la première) */
.modal-content {
    position: relative;
    margin: auto;
    padding: 0;
    width: 100%;
}

/* Troisième déclaration L921-933 (section Modern UI, écrase les deux) */
.modal-content {
    background: var(--tech_tree_bg);
    border-radius: 16px;
    max-width: 800px;
}
```

`.modal-content` est défini **3 fois** dans le même fichier.

Même chose pour `footer`, `a`, `.close`, `#techTreeName`, `#addButton`, etc.

**Remédiation :** Consolider en une seule déclaration par sélecteur.

---

#### ⚠️ Vendor prefixes inutiles

```css
display: -webkit-box;
display: -ms-flexbox;
display: flex;
-webkit-box-pack: space-between;
-ms-flex-pack: space-between;
```

En 2026, les prefixes `-webkit-box` et `-ms-flexbox` ne sont plus nécessaires. Flexbox est supporté nativement depuis 2015.

---

#### ⚠️ Utilisation de `!important` dans `deck_style.css`

```css
body { background-color: var(--bg-color) !important; }
.vehicleBadge { border-radius: 4px !important; }
.modal { z-index: 2000 !important; }
```

**23 occurrences de `!important`** dans `deck_style.css` — signe de guerre de spécificité CSS.

---

### ♿ ACCESSIBILITÉ

#### 🔴 Navigation uniquement au clic

- Aucun `tabindex` sur les éléments interactifs de la nav
- Les `<div>` utilisés comme boutons dans `<nav>` ne sont pas des `<button>`
- Pas de gestion du clavier (Escape pour fermer les modals, Tab navigation)
- `window.onclick` capture les clics globalement mais pas les events clavier

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

#### ⚠️ `updateMenuDisplay` a sa logique inversée

```javascript
// L2207-2218
if (settings.menuVisible) {
    hideButton.innerText = 'Show Menu';    // ← "visible" mais texte dit "Show"?
    navTabs.forEach(tab => tab.style.display = 'none');  // ← "visible" mais on cache?
}
```

La logique semble inversée : quand `menuVisible` est `true`, le menu est **caché**.

---

#### ⚠️ API obsolète utilisée

```javascript
// L533, L806
if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(file, fileName);
```

`msSaveOrOpenBlob` est une API Microsoft Edge Legacy / IE uniquement, supprimée depuis longtemps.

---

#### ⚠️ `var` encore utilisé

```javascript
// L532, L535-536, L808-809, L1147, L1162
var file = new Blob([JSON.stringify(content)], {type: 'application/json'});
var a = document.createElement('a'), url = URL.createObjectURL(file);
var lookup = { M: 1000, ... };
```

Le code utilise `'use strict'` et `const`/`let` partout sauf dans ces endroits qui utilisent encore `var`.

---

#### ⚠️ Double meta viewport

```html
<!-- template.js L10 et L15 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
```

Deux balises `viewport` dans le template d'export — la seconde écrase la première.

---

## 📋 Plan d'action priorisé

### 🔥 Priorité 1 — Sécurité (immédiat)

- [ ] Créer une fonction `escapeHtml()` et l'appliquer à toutes les insertions `innerHTML` de données utilisateur
- [ ] Valider le schéma des backups JSON importés
- [ ] Supprimer `localStorage.clear()` → utiliser des `removeItem` ciblés
- [ ] Ajouter SRI (`integrity`) à tous les scripts CDN

### ⚡ Priorité 2 — Performance (court terme)

- [ ] Séparer le rendu description du rendu arbre
- [ ] Augmenter le debounce de description à 1500ms  
- [ ] Ajouter `loading="lazy"` aux images
- [ ] Remplacer les `<table>` de badges par des `<div>` flex

### 🏗️ Priorité 3 — Architecture (moyen terme)

- [ ] Factoriser les formulaires Add/Edit en un seul composant
- [ ] Découper `script.js` en modules ES6
- [ ] Remplacer jQuery par des alternatives légères
- [ ] Consolider les déclarations CSS dupliquées
- [ ] Nettoyer les vendor prefixes obsolètes

### ♿ Priorité 4 — Accessibilité (moyen terme)

- [ ] Remplacer les `<div>` de navigation par des `<button>`
- [ ] Ajouter gestion Escape pour fermer les modals
- [ ] Ajouter `aria-label` sur les éléments interactifs
- [ ] Vérifier les ratios de contraste WCAG
