# 💰 Finance Dashboard

Site **statique** (HTML / CSS / JS vanilla) pour visualiser des données
économiques et financières : indices, forex, matières premières, taux et macro.
Graphiques via [Chart.js](https://www.chartjs.org/) (CDN).

## 🚀 Lancer en local

Les données sont chargées via `fetch()` : il faut servir le dossier (le
double-clic en `file://` est bloqué par le navigateur).

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

En déploiement (GitHub Pages, Netlify, n'importe quel hébergeur statique),
aucun serveur applicatif n'est nécessaire.

## 📁 Structure

```
index.html          → onglets + conteneurs de graphiques
assets/
  app.js            → router d'onglets + chargement JSON + rendu Chart.js
  style.css         → thème sombre
data/
  meta.json         → date de dernière mise à jour
  indices.json      → indices boursiers
  forex.json        → paires de change
  commodities.json  → matières premières
  rates.json        → { sovereign: courbes souveraines, central_banks: taux directeurs }
  macro.json        → indicateurs macro
```

## 🗂️ Onglets

Dashboard · Indices · Forex · Matières · Taux · Macro.

Pour l'instant seul **Dashboard** affiche un graphe (courbe des taux
souverains) ; les autres onglets sont à construire.
