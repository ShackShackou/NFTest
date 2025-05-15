# Comment exporter et partager le projet S.H.A.C.K.E.R. NFT

Ce document explique comment exporter l'intégralité du projet pour le partager avec un autre développeur ou le déployer sur une autre plateforme.

## Option 1: Exporter via GitHub

GitHub est la méthode recommandée pour partager le code source avec d'autres développeurs.

### Étapes:

1. **Créer un repository GitHub**:
   - Allez sur [GitHub](https://github.com) et connectez-vous
   - Cliquez sur "New" pour créer un nouveau repository
   - Donnez un nom à votre repository (ex: "shacker-nft")
   - Choisissez si vous voulez que le repository soit public ou privé
   - Cliquez sur "Create repository"

2. **Initialiser Git dans votre projet**:
   ```bash
   git init
   ```

3. **Créer un fichier .gitignore** (nous avons déjà fait ça):
   ```
   node_modules/
   .env
   .cache/
   dist/
   ```

4. **Ajouter les fichiers au repository**:
   ```bash
   git add .
   ```

5. **Faire un commit initial**:
   ```bash
   git commit -m "Initial commit"
   ```

6. **Ajouter le repository distant**:
   ```bash
   git remote add origin https://github.com/votre-username/shacker-nft.git
   ```

7. **Pousser le code sur GitHub**:
   ```bash
   git push -u origin main
   ```

## Option 2: Exporter manuellement

Si vous ne pouvez pas utiliser GitHub, vous pouvez aussi exporter le projet manuellement.

### Étapes:

1. **Préparer les fichiers**:
   - Assurez-vous que tous les fichiers sensibles comme `.env` sont exclus
   - Le dossier `node_modules` ne doit pas être inclus (il est très volumineux)

2. **Créer une archive**:
   ```bash
   # Si vous utilisez Linux/macOS
   zip -r shacker-nft.zip * -x "node_modules/*" ".env" ".git/*"
   
   # Si vous êtes sur Windows
   # Utilisez un outil comme 7-Zip pour créer une archive ZIP
   ```

3. **Télécharger l'archive**:
   - Depuis Replit, cliquez sur le fichier ZIP dans l'explorateur de fichiers
   - Utilisez l'option "Télécharger" pour le récupérer sur votre ordinateur

4. **Partager l'archive**:
   - Utilisez un service de partage de fichiers comme Google Drive, Dropbox, etc.
   - Ou envoyez directement par e-mail si la taille le permet

## Option 3: Cloner directement depuis Replit

Replit permet également de cloner des projets directement.

### Étapes:

1. **Partager l'URL du Repl**:
   - Cliquez sur le bouton "Share" en haut à droite de l'interface Replit
   - Copiez l'URL et envoyez-la à la personne avec qui vous voulez partager le projet

2. **L'autre personne peut ensuite**:
   - Ouvrir l'URL
   - Cliquer sur "Fork" pour créer une copie du projet dans son propre compte Replit
   - Travailler directement sur cette copie

## Instructions pour le destinataire

Quel que soit le moyen par lequel vous avez récupéré le projet, voici les étapes à suivre pour le configurer:

1. **Installer les dépendances**:
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**:
   - Copiez `.env.example` vers `.env`
   - Remplissez toutes les valeurs requises (clés API, etc.)

3. **Démarrer le serveur de développement**:
   ```bash
   npm run dev
   ```

4. **Accéder à l'interface d'administration**:
   - Ouvrez http://localhost:5000/admin-nft.html dans votre navigateur

## Fichiers importants à vérifier

Assurez-vous que ces fichiers importants sont bien inclus dans l'export:

- `public/nft-package/` - Contient le NFT interactif
- `contracts/` - Contient les smart contracts
- `scripts/` - Contient les scripts de déploiement
- `server/` - Contient le backend
- `PROJECT_DOCUMENTATION.md` - Documentation complète du projet
- `README.md` - Instructions de base
- `.env.example` - Exemple de configuration des variables d'environnement