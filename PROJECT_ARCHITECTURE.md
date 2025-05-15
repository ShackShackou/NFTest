# Architecture du Projet S.H.A.C.K.E.R. NFT

## Schéma global de l'architecture

```
┌─────────────────────────────────┐           ┌─────────────────────────┐
│                                 │           │                         │
│    Frontend (React/TypeScript)  │◄─────────►│   Backend (Express.js)  │
│                                 │    API    │                         │
└─────────────────────────────────┘           └───────────┬─────────────┘
                │                                         │
                │                                         │
                │                                         │
                ▼                                         ▼
┌─────────────────────────────────┐           ┌─────────────────────────┐
│                                 │           │                         │
│  Admin Interface (HTML/JS/CSS)  │           │   PostgreSQL Database   │
│                                 │           │                         │
└─────────────────────────────────┘           └─────────────────────────┘
                │                                         │
                │                                         │
                │                                         │
                ▼                                         │
┌─────────────────────────────────┐                      │
│                                 │                      │
│   NFT Content (HTML/JS/CSS)     │                      │
│                                 │                      │
└──────────────┬──────────────────┘                      │
               │                                         │
               │                                         │
               ▼                                         ▼
┌─────────────────────────────────┐           ┌─────────────────────────┐
│                                 │           │                         │
│     IPFS / NFT.Storage          │◄─────────►│    Ethereum Blockchain  │
│                                 │           │                         │
└─────────────────────────────────┘           └─────────────────────────┘
```

## Détail des connexions entre les services

### 1. Connexion Frontend <-> Backend

- Le frontend React communique avec le backend Express via des API REST
- Les requêtes API incluent:
  - Récupération des métadonnées NFT
  - Upload de fichiers sur IPFS
  - Génération de CSV pour NFT.Storage
  - Mise à jour des métadonnées

### 2. Connexion Backend <-> Base de données

- Le backend se connecte à PostgreSQL via Drizzle ORM
- La base de données stocke:
  - Informations sur les NFTs
  - Informations sur les collections
  - Données utilisateurs

### 3. Connexion Backend <-> IPFS/NFT.Storage

- Le backend utilise l'API NFT.Storage pour:
  - Uploader des images et fichiers HTML
  - Uploader des métadonnées NFT
  - Récupérer des liens IPFS

### 4. Connexion Backend/Frontend <-> Ethereum

- Le frontend se connecte à Ethereum via MetaMask et ethers.js
- Le backend se connecte à Ethereum via Alchemy et ethers.js
- Les interactions incluent:
  - Déploiement de smart contracts
  - Mint de nouveaux NFTs
  - Transfert de NFTs

## Flux des données

```
┌──────────────┐    1. Upload fichier    ┌───────────────┐
│              │─────────────────────────►              │
│   Interface  │                         │    Backend    │
│     Admin    │◄─────────────────────────              │
└──────────────┘    2. Retourne CID      └───────┬───────┘
                                                 │
                                                 │ 3. Stocke métadonnées
                                                 ▼
┌──────────────┐    6. Affiche NFT       ┌───────────────┐
│              │◄─────────────────────────              │
│   OpenSea    │                         │  NFT.Storage  │
│              │                         │              │
└──────────────┘                         └───────┬───────┘
       ▲                                        │
       │                                        │ 4. Retourne URL IPFS
       │ 5. Mint NFT avec URL                   │
       │                                        ▼
┌──────────────┐                        ┌───────────────┐
│              │                        │              │
│   Ethereum   │◄──────────────────────►│    Smart     │
│  Blockchain  │                        │   Contract   │
└──────────────┘                        └───────────────┘
```

## Architecture détaillée du contenu NFT interactif

```
┌───────────────────────────────────────────────┐
│                                               │
│            NFT Interactif (HTML)              │
│                                               │
├───────────────┬───────────────┬───────────────┤
│               │               │               │
│  Image JPEG   │   CSS Styles  │ JavaScript    │
│               │               │ Interactif    │
└───────────────┴───────────────┴───────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                                               │
│               Métadonnées JSON                │
│                                               │
├───────────┬────────────────┬─────────────────┤
│           │                │                 │
│  image    │  animation_url │   attributes    │
│  (IPFS)   │    (IPFS)      │                 │
└───────────┴────────────────┴─────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                                               │
│                CSV pour NFT.Storage           │
│                                               │
├───────────────────────┬───────────────────────┤
│                       │                       │
│       tokenID         │         cid           │
│                       │                       │
└───────────────────────┴───────────────────────┘
```

## Technologies et services externes

### Technologies de base
- **Node.js**: Environnement d'exécution JavaScript côté serveur
- **TypeScript**: Superset de JavaScript avec typage statique
- **React**: Bibliothèque JavaScript pour construire l'interface utilisateur
- **Express.js**: Framework web pour Node.js

### Services blockchain
- **Ethereum**: Réseau blockchain pour les NFTs
- **Sepolia**: Réseau de test Ethereum
- **Alchemy**: Fournisseur d'accès à la blockchain
- **MetaMask**: Portefeuille Ethereum pour interagir avec les dApps

### Stockage décentralisé
- **IPFS**: Système de fichiers distribué pour stocker les fichiers NFT
- **NFT.Storage**: Service de stockage IPFS optimisé pour les NFTs

### Base de données
- **PostgreSQL**: Base de données relationnelle
- **Drizzle ORM**: ORM pour interagir avec PostgreSQL

### Déploiement
- **Replit**: Plateforme de développement et d'hébergement

## Cas d'utilisation

### Création d'un NFT interactif
1. L'utilisateur développe le contenu HTML interactif
2. L'utilisateur télécharge les fichiers via l'interface admin
3. Les fichiers sont stockés sur IPFS via NFT.Storage
4. Les métadonnées sont générées et stockées sur IPFS
5. L'utilisateur minte le NFT avec l'URL des métadonnées

### Mise à jour d'un NFT existant
1. L'utilisateur modifie le contenu HTML interactif
2. Les nouveaux fichiers sont téléchargés sur IPFS
3. Un CSV est généré avec les mappings tokenID → URL
4. L'utilisateur télécharge le CSV et l'upload sur NFT.Storage
5. Les métadonnées du NFT sont mises à jour

### Organisation d'un événement live
1. L'administrateur crée un nouvel événement via l'interface admin
2. Les détails de l'événement sont stockés en base de données
3. Le serveur WebSocket envoie l'événement à tous les NFTs connectés
4. Les NFTs affichent l'événement dans leur interface interactive
5. Les utilisateurs peuvent interagir avec l'événement en temps réel