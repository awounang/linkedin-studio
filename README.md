# LinkedIn Studio

Application web progressive (PWA) en français pour passer d’une absence d’idées à un positionnement, une stratégie de contenu, un calendrier éditorial et des posts prêts à relire.

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir l’URL affichée (en général `http://localhost:5175`). Pour une version installable :

```bash
npm run build
npm run preview
```

## Mettre en ligne

L’application n’a pas de serveur : il suffit d’héberger le dossier `dist`.

**Le plus simple, sans Git :**

```bash
npm install
npm run build
```

Ensuite, sur [Netlify Drop](https://app.netlify.com/drop), glissez le dossier `dist`. Vous obtenez une URL du type `https://quelque-chose.netlify.app`.

**Avec un compte Vercel ou Netlify + GitHub :** créez un dépôt, poussez le projet, puis « Import project ». La commande de build est `npm run build`, le dossier publié est `dist`.

Les comptes et contenus restent dans le navigateur de chaque visiteur (pas de synchronisation entre téléphone et ordinateur, sauf à ajouter plus tard un vrai backend).

## Ce qui fonctionne tout de suite

- Compte local, données privées par utilisateur dans le navigateur
- Onboarding, profil, piliers, sujets, rédaction, calendrier, bibliothèque, revue
- Posts d’exemple et calendrier de démarrage
- Copie du texte, export CSV / ICS
- Installation PWA selon le navigateur (Chrome / Edge / Android ; iOS via « Sur l’écran d’accueil »)

## Ce qui demande une configuration supplémentaire

- Génération par modèle de langage : clé API + backend
- Publication automatique sur LinkedIn : application OAuth officielle
- Synchronisation multi-appareils : serveur d’authentification
