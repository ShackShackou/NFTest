# Guide d'installation complet du projet S.H.A.C.K.E.R. NFT

Ce document explique comment installer et configurer le projet complet à partir de l'archive fournie.

## Étape 1: Extraire l'archive

```bash
tar -xzvf shacker-nft-project.tar.gz -C /chemin/vers/dossier/cible
cd /chemin/vers/dossier/cible
```

## Étape 2: Installer les dépendances

Le dossier `node_modules` n'est pas inclus dans l'archive pour réduire sa taille. Vous devez installer toutes les dépendances avec npm :

```bash
npm install
```

Cette commande installera automatiquement toutes les dépendances listées dans le fichier package.json, notamment :
- React et React DOM
- Tailwind CSS
- ethers.js
- Hardhat
- NFT.storage
- Express
- Drizzle ORM
- et toutes les autres dépendances nécessaires

## Étape 3: Configurer les variables d'environnement

1. Copier le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Éditer le fichier `.env` et remplacer toutes les valeurs par vos propres clés API :
   ```
   # Blockchain
   PRIVATE_KEY=votre_clé_privée_ethereum
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/votre_clé_alchemy

   # API Keys
   ALCHEMY_API_KEY=votre_clé_alchemy
   NFT_STORAGE_API_KEY=votre_clé_nft_storage
   METAMASK_API_KEY=votre_clé_metamask

   # Database (si applicable)
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

Pour obtenir ces clés API, consultez le fichier `API_KEYS_FORMAT.md` qui explique comment les générer.

## Étape 4: Initialiser la base de données (optionnel)

Si vous utilisez une base de données PostgreSQL :

```bash
npm run db:push
```

## Étape 5: Démarrer le projet

```bash
npm run dev
```

Le serveur devrait démarrer et être accessible à l'adresse : http://localhost:5000

## Étape 6: Accéder à l'interface d'administration

Ouvrez votre navigateur et accédez à l'adresse suivante :
http://localhost:5000/admin-nft.html

## Structure des fichiers importants

Le projet contient les dossiers et fichiers principaux suivants :

- `client/` : Code source du frontend React
- `contracts/` : Smart contracts Ethereum
- `public/` : Fichiers statiques et interfaces HTML (admin, etc.)
- `server/` : Backend Express et services
- `scripts/` : Scripts de déploiement et minting
- `shared/` : Schémas partagés entre frontend et backend

## Outils de développement inclus

1. **Interface d'administration NFT** : `/admin-nft.html`
2. **Générateur de CSV pour NFT.Storage** : `/csv-generator.html`
3. **Outil d'upload direct IPFS** : `/ipfs-upload.html`
4. **Gestionnaire de métadonnées NFT** : `/nft-metadata-generator.html`

## Documentation

Le projet inclut une documentation complète :

- `README.md` : Vue d'ensemble du projet
- `PROJECT_DOCUMENTATION.md` : Documentation technique détaillée
- `PROJECT_ARCHITECTURE.md` : Schémas de l'architecture
- `API_REFERENCE.md` : Documentation des APIs
- `EXPORT_INSTRUCTIONS.md` : Guide pour exporter le projet
- `SECURE_SHARING.md` : Guide pour partager les informations sensibles
- `API_KEYS_FORMAT.md` : Format des clés API et variables d'environnement

## Dépannage

Si vous rencontrez des problèmes lors de l'installation :

1. **Erreurs npm** : Essayez de supprimer `package-lock.json` et refaites `npm install`
2. **Problèmes de configuration** : Vérifiez que toutes les variables d'environnement sont correctement définies
3. **Erreurs de blockchain** : Assurez-vous d'avoir suffisamment d'ETH de test sur votre wallet Sepolia
4. **Problèmes de serveur** : Vérifiez les logs dans la console

Pour tout autre problème, consultez la section "Solutions aux problèmes courants" dans `PROJECT_DOCUMENTATION.md`.