# Référence des APIs du Projet S.H.A.C.K.E.R. NFT

Ce document détaille toutes les APIs et services externes utilisés dans le projet.

## 1. Services externes et APIs

### Ethereum/Blockchain

| Service | Description | Variables d'environnement |
|---------|-------------|--------------------------|
| **Sepolia Testnet** | Réseau de test Ethereum utilisé pour le déploiement des contracts | `SEPOLIA_RPC_URL` |
| **Alchemy** | Fournisseur d'accès à la blockchain | `ALCHEMY_API_KEY` |
| **MetaMask** | Portefeuille crypto pour interagir avec la blockchain | `METAMASK_API_KEY` (optionnel) |

### Stockage décentralisé

| Service | Description | Variables d'environnement |
|---------|-------------|--------------------------|
| **NFT.Storage** | Service de stockage IPFS pour les NFTs | `NFT_STORAGE_API_KEY` |
| **IPFS** | Système de fichiers distribué | (utilise NFT.Storage) |

## 2. APIs internes du backend

### API NFT

| Endpoint | Méthode | Description | Paramètres |
|----------|---------|-------------|------------|
| `/api/metadata/:id` | GET | Récupère les métadonnées d'un NFT | `id`: ID du token |
| `/api/nft/generate-csv` | POST | Génère un fichier CSV compatible NFT.Storage | `mappings`: Array d'objets {tokenId, cid} |
| `/api/nft/create-metadata-csv` | GET | Génère un CSV avec URLs des métadonnées | `tokens`: Nombre de tokens (optionnel) |

### API IPFS

| Endpoint | Méthode | Description | Paramètres |
|----------|---------|-------------|------------|
| `/api/ipfs/direct-upload` | POST | Upload un fichier sur IPFS | `file`: Fichier à uploader (form-data) |
| `/api/ipfs/upload-nft-image` | POST | Upload une image NFT sur IPFS | `imageUrl`: URL de l'image, `tokenId`: ID du token |

### API Événements

| Endpoint | Méthode | Description | Paramètres |
|----------|---------|-------------|------------|
| `/api/events/:id` | POST | Crée un événement pour un NFT | `id`: ID du token, `type`: Type d'événement, `data`: Données de l'événement |

## 3. WebSockets

| Endpoint | Description | Événements |
|----------|-------------|------------|
| `/ws` | WebSocket pour les mises à jour en temps réel | `metadata_update`, `live_event`, `notification` |

## 4. Routes statiques

| Route | Description |
|-------|-------------|
| `/nft-interactive/:tokenId` | Affiche le NFT interactif avec paramètres spécifiques au token |
| `/api/nft/:tokenId/metadata` | Sert les métadonnées du NFT |

## 5. Formats de données

### Format de métadonnées NFT

```json
{
  "name": "S.H.A.C.K.E.R. #01",
  "description": "Une créature démoniaque aux yeux jaunes flamboyants et aux petites cornes. NFT rare de la collection Shackers OG sur Ethereum. NFT interactif avec mini-jeu intégré.",
  "image": "ipfs://bafkreiaylxpfsgvouqwwqopxvfrqe7qasdyunbgprqp2jkrz37gssstpry",
  "animation_url": "ipfs://bafkreidivzimqfqtoqxkrpge6bjyhlvxqs3rjv5yze7uus7unnbgpyzpce",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Demon"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    }
  ]
}
```

### Format CSV pour NFT.Storage

```
tokenID,cid
0,bafkreiaylxpfsgvouqwwqopxvfrqe7qasdyunbgprqp2jkrz37gssstpry
1,bafybeihcoyxrqnbbtgxu5gtvl3qpyunj3chwjynfk4e2ex6bqxbwdtfp4i
```

### Format d'événement WebSocket

```json
{
  "type": "live_event",
  "tokenId": 0,
  "data": {
    "eventType": "special_mission",
    "title": "Mission spéciale",
    "description": "Une nouvelle mission est disponible!",
    "duration": 3600,
    "reward": 100
  },
  "timestamp": 1639012345678
}
```

## 6. Intégration avec OpenSea

OpenSea utilise les métadonnées NFT pour afficher:
- L'image statique via le champ `image`
- Le contenu interactif via le champ `animation_url`
- Les attributs via le tableau `attributes`

Pour que votre NFT s'affiche correctement sur OpenSea:
1. Les URLs dans les métadonnées doivent être accessibles publiquement
2. Le format des métadonnées doit respecter exactement le standard
3. Les fichiers HTML doivent pouvoir être chargés dans un iframe

## 7. Intégration avec Etherscan

Vous pouvez vérifier l'état de votre smart contract sur Etherscan:
- Testnet Sepolia: `https://sepolia.etherscan.io/address/0xd10AC868cFC5Ab7B5d3eA041D552FB57F6a03037`

## 8. Solutions aux problèmes courants

### Problème: NFT.Storage n'accepte que des CSV

**Solution**: 
1. Héberger vos fichiers ailleurs (comme sur votre serveur Replit)
2. Utiliser l'outil "Générateur de métadonnées NFT" pour générer un CSV
3. Ce CSV contiendra des liens vers vos métadonnées qui, elles, pointent vers vos fichiers

### Problème: Erreur "API Key is malformed"

**Solution**:
1. Vérifier que votre clé API est correctement configurée dans .env
2. Si le problème persiste, générer une nouvelle clé API
3. Utiliser l'approche du CSV plutôt que l'upload direct via API