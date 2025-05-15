# Documentation du Projet S.H.A.C.K.E.R. NFT

## Aperçu du projet

Ce projet est une plateforme pour créer, gérer et mettre à jour des NFTs interactifs pour la collection S.H.A.C.K.E.R. sur la blockchain Ethereum. Le but principal est de créer des NFTs qui contiennent non seulement une image, mais aussi une expérience interactive complète (mini-jeu, animations, etc.) directement intégrée dans le NFT.

L'objectif principal est de garder le contrôle sur les NFTs même après leur vente, permettant la mise à jour des métadonnées, l'organisation d'événements live, et l'évolution du contenu interactif au fil du temps.

## Architecture du projet

```
📁 Project
│
├── 📁 client               # Frontend React/TypeScript
│   └── 📁 src              # Code source frontend
│
├── 📁 contracts            # Smart contracts Ethereum (Solidity)
│   └── S.H.A.C.K.E.R.sol   # Smart contract principal
│
├── 📁 public               # Fichiers statiques
│   ├── 📁 nft-package      # Contenu interactif du NFT (HTML/CSS/JS)
│   ├── admin-nft.html      # Interface d'administration des NFTs
│   ├── nft-manager.html    # Gestion des NFTs
│   ├── csv-generator.html  # Générateur de CSV pour NFT.Storage
│   └── nft-metadata-generator.html # Générateur de métadonnées
│
├── 📁 scripts              # Scripts de déploiement et outils
│   ├── deploy-direct.mjs   # Script pour déployer le contrat
│   └── mint-direct.mjs     # Script pour minter des NFTs
│
├── 📁 server               # Backend Express
│   ├── db.ts               # Connexion à la base de données
│   ├── ipfs-direct-service.ts # Service IPFS direct
│   ├── ipfs-service.ts     # Service IPFS principal
│   ├── nft-storage-direct.ts # Service NFT.Storage
│   ├── csv-generator.ts    # Générateur de fichiers CSV
│   ├── routes.ts           # Routes API principales
│   ├── ipfs-routes.ts      # Routes pour IPFS
│   ├── nft-routes.ts       # Routes pour NFT
│   └── static-routes.ts    # Routes pour contenu statique
│
└── 📁 shared               # Code partagé frontend/backend
    └── schema.ts           # Modèles de données et types
```

## Fonctionnalités principales

1. **Création et déploiement de NFTs interactifs**
   - Smart contract déployé sur Sepolia testnet (adresse: 0xd10AC868cFC5Ab7B5d3eA041D552FB57F6a03037)
   - Interface pour minter de nouveaux NFTs
   - Interface pour modifier les métadonnées NFT

2. **Expérience interactive dans les NFTs**
   - Mini-jeu intégré dans chaque NFT
   - Animation et effets visuels
   - Système de points, combos et niveaux
   - Quêtes et récompenses

3. **Système de mise à jour**
   - Métadonnées hébergées sur IPFS
   - Possibilité de mettre à jour le contenu dynamiquement
   - Événements live et notifications

4. **Administration**
   - Interface d'administration pour gérer les NFTs
   - Déploiement de mises à jour
   - Gestion des événements

## Configuration requise

### Clés API et secrets

Pour faire fonctionner ce projet, vous aurez besoin des clés API suivantes:

- **Ethereum** 
  - Variable: `PRIVATE_KEY`
  - Description: Clé privée du wallet Ethereum pour déployer les smart contracts et minter les NFTs
  - Où l'obtenir: Généré par MetaMask ou autre wallet Ethereum

- **NFT.Storage**
  - Variable: `NFT_STORAGE_API_KEY`
  - Description: Clé API pour stocker les métadonnées et les images sur IPFS
  - Où l'obtenir: [NFT.Storage](https://nft.storage) (créer un compte et générer une clé)

- **Alchemy**
  - Variable: `ALCHEMY_API_KEY`
  - Description: API pour interagir avec la blockchain Ethereum
  - Où l'obtenir: [Alchemy](https://www.alchemy.com/) (créer un compte et générer une clé)

- **Sepolia Test Network**
  - Variable: `SEPOLIA_RPC_URL`
  - Description: URL RPC pour interagir avec le testnet Sepolia
  - Valeur typique: https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

### Base de données

Le projet utilise une base de données PostgreSQL pour stocker les informations sur les NFTs, les collections et les utilisateurs.

- Variables d'environnement pour la base de données:
  - `DATABASE_URL`: URL de connexion à la base de données
  - `PGDATABASE`: Nom de la base de données
  - `PGHOST`: Hôte de la base de données
  - `PGPORT`: Port de la base de données
  - `PGUSER`: Utilisateur de la base de données
  - `PGPASSWORD`: Mot de passe de la base de données

## Flux de travail

### 1. Création d'un NFT interactif

1. Développer le contenu interactif (HTML/CSS/JS) dans le dossier `public/nft-package/`
2. Héberger ce contenu sur un serveur accessible publiquement
3. Générer les métadonnées NFT pointant vers le contenu interactif
4. Stocker les métadonnées sur IPFS via NFT.Storage
5. Minter le NFT en utilisant les scripts fournis

### 2. Mise à jour d'un NFT

1. Modifier le contenu interactif si nécessaire
2. Mettre à jour les métadonnées pointant vers le nouveau contenu
3. Générer un fichier CSV contenant les mappings tokenID → CID
4. Uploader ce CSV sur NFT.Storage pour mettre à jour les NFTs

### 3. Organisation d'événements live

1. Utiliser l'interface d'administration pour créer un nouvel événement
2. Spécifier le type d'événement, la durée, et les détails
3. Les NFTs seront automatiquement notifiés via WebSockets

## Problèmes connus et solutions

### NFT.Storage accepte uniquement des fichiers CSV

NFT.Storage a récemment changé son API et accepte désormais uniquement les fichiers CSV pour les mises à jour de métadonnées. Pour contourner ce problème:

1. Héberger les fichiers HTML et images sur un serveur accessible (comme votre Replit)
2. Utiliser l'outil "Générateur de Métadonnées NFT" pour générer un CSV compatible
3. Uploader ce CSV sur NFT.Storage

### Erreur "API Key is malformed"

Si vous rencontrez cette erreur avec NFT.Storage:
1. Vérifiez que votre clé API est correctement formée et valide
2. Utilisez le générateur de CSV fourni au lieu d'uploader directement via l'API
3. Assurez-vous que le format du CSV est correct (tokenID,cid)

## Comment déployer

### Déployer sur Replit

1. Clonez ce projet sur Replit
2. Configurez les variables d'environnement (voir section Configuration)
3. Exécutez `npm run dev` pour démarrer le serveur

### Déployer sur un autre service

1. Clonez le repository GitHub (à créer)
2. Installez les dépendances avec `npm install`
3. Configurez les variables d'environnement
4. Exécutez `npm run build` puis `npm start`

## Tests

Pour tester les NFTs interactifs:
1. Déployez le projet
2. Accédez à l'interface d'administration (`/admin-nft.html`)
3. Mintez un nouveau NFT ou mettez à jour un NFT existant
4. Vérifiez que le NFT apparaît correctement sur OpenSea Testnet

## Roadmap future

- Intégration avec plus de marketplaces NFT
- Amélioration de l'expérience interactive
- Système de communication entre NFTs
- Fonctionnalités multijoueur
- Migration vers la mainnet Ethereum

## Contacts et ressources

- Documentation NFT.Storage: [https://nft.storage/docs/](https://nft.storage/docs/)
- Documentation OpenSea: [https://docs.opensea.io/](https://docs.opensea.io/)
- Documentation Alchemy: [https://docs.alchemy.com/](https://docs.alchemy.com/)
- Documentation Hardhat: [https://hardhat.org/getting-started/](https://hardhat.org/getting-started/)

## Exportation du projet

Pour exporter l'intégralité du projet:

1. **GitHub**:
   - Créez un nouveau repository sur GitHub
   - Initialisez Git dans votre projet: `git init`
   - Ajoutez les fichiers: `git add .`
   - Committez: `git commit -m "Initial commit"`
   - Ajoutez le remote: `git remote add origin <URL_DU_REPO>`
   - Poussez: `git push -u origin main`

2. **Export manuel**:
   - Téléchargez tous les fichiers depuis Replit
   - Assurez-vous d'exclure les dossiers node_modules et tout fichier contenant des informations sensibles
   - Compressez le dossier en ZIP
   - Partagez le fichier ZIP

**IMPORTANT**: N'incluez jamais les clés API ou secrets dans votre code source exporté. Utilisez toujours des variables d'environnement et fournissez un fichier .env.example avec des valeurs factices.