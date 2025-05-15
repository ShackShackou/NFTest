# Documentation du Projet S.H.A.C.K.E.R. NFT

## Présentation générale

Le projet S.H.A.C.K.E.R. NFT est une plateforme avancée de création, gestion et mise à jour de NFTs interactifs sur la blockchain Ethereum. Contrairement aux NFTs traditionnels qui sont statiques, les NFTs S.H.A.C.K.E.R. contiennent une expérience interactive complète (mini-jeu, animations, narration) directement intégrée dans le NFT.

La particularité de cette plateforme est qu'elle permet de garder le contrôle sur les NFTs même après leur vente, permettant au créateur de faire évoluer l'expérience au fil du temps via des mises à jour de métadonnées, des événements live, et de nouvelles fonctionnalités.

## Architecture technique

Le projet est construit avec une architecture moderne qui combine:

- **Frontend**: React + TypeScript + Tailwind CSS pour l'interface utilisateur
- **Backend**: Node.js + Express pour l'API serveur
- **Stockage décentralisé**: IPFS via NFT.Storage pour héberger les actifs des NFTs
- **Blockchain**: Smart contracts Ethereum déployés sur le testnet Sepolia
- **Base de données**: PostgreSQL avec Drizzle ORM pour le stockage persistant

L'architecture permet une séparation claire entre:
1. Le contenu interactif du NFT (HTML/JS/CSS)
2. Les métadonnées du NFT (format JSON standard)
3. Le smart contract qui gère la propriété sur la blockchain
4. Le backend qui orchestre les mises à jour et les événements

Pour plus de détails, voir le fichier [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md).

## Fonctionnalités principales

### 1. NFTs interactifs

Chaque NFT contient:
- Une image principale visible sur les marketplaces
- Un contenu HTML interactif avec mini-jeu intégré
- Des métadonnées évolutives (attributs, statistiques)

### 2. Administration à distance

L'interface d'administration permet:
- Minter de nouveaux NFTs
- Transférer des NFTs entre adresses
- Mettre à jour les métadonnées des NFTs
- Organiser des événements live
- Uploader de nouveaux contenus sur IPFS

### 3. Système d'événements live

Des événements peuvent être envoyés aux propriétaires de NFTs:
- Missions spéciales temporaires
- Bonus de jeu limités dans le temps
- Évolutions narratives
- Codes secrets pour débloquer du contenu caché

### 4. Mise à jour des métadonnées

Deux approches sont possibles:
- **Méthode API directe**: Upload via l'API NFT.Storage
- **Méthode CSV**: Génération d'un fichier CSV pour mise à jour en masse

## Guides d'utilisation

### Déploiement du smart contract

1. Configurez votre clé privée dans `.env`
2. Exécutez `npx hardhat run scripts/deploy.js --network sepolia`
3. Notez l'adresse du contrat retournée par le script

### Minting d'un nouveau NFT

1. Accédez à `/admin-nft.html`
2. Connectez votre portefeuille MetaMask
3. Dans l'onglet "Mint NFT", cliquez sur "Minter le NFT"
4. Confirmez la transaction dans MetaMask

### Upload de contenu sur IPFS

1. Accédez à `/admin-nft.html`
2. Dans l'onglet "IPFS Direct", téléchargez votre fichier
3. Cliquez sur "Uploader sur IPFS"
4. Utilisez l'URL IPFS retournée dans vos métadonnées

### Création d'un NFT interactif

1. Préparez votre contenu HTML interactif
2. Utilisez l'onglet "IPFS Direct" pour uploader tous les fichiers
3. Créez un package ZIP contenant tous les fichiers
4. Uploadez le ZIP sur IPFS
5. Créez les métadonnées incluant l'URL IPFS du ZIP comme `animation_url`

### Mise à jour des métadonnées via CSV

1. Accédez à `/csv-generator.html`
2. Saisissez les ID de token et les CID correspondants
3. Cliquez sur "Générer CSV"
4. Téléchargez le fichier CSV
5. Uploadez le CSV sur NFT.Storage via leur interface web

### Organisation d'un événement live

1. Accédez à `/admin-nft.html`
2. Dans l'onglet "Événements", remplissez les détails
3. Sélectionnez le type d'événement
4. Cliquez sur "Envoyer l'événement"
5. L'événement est immédiatement transmis aux NFTs via WebSocket

## Spécifications techniques

### Format des métadonnées NFT

```json
{
  "name": "S.H.A.C.K.E.R. #01",
  "description": "NFT interactif avec mini-jeu intégré",
  "image": "ipfs://bafkreiaylxpfsgvouqwwqopxvfrqe7qasdyunbgprqp2jkrz37gssstpry",
  "animation_url": "ipfs://bafkreidivzimqfqtoqxkrpge6bjyhlvxqs3rjv5yze7uus7unnbgpyzpce",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Demon"
    },
    {
      "trait_type": "Level",
      "value": 5,
      "max_value": 100
    }
  ],
  "lastUpdated": "2023-05-15T10:30:00Z"
}
```

### Format CSV pour NFT.Storage

```
tokenID,cid
0,bafkreihv7kjbxwlufc6kus7ttysrjcvhy7f4fcbf73xnrgyiyi3des2jei
1,bafkreifyunxznxnr5q4zcbgxqdvvplftdcsyc2fx4qseo3jx5igzptudke
```

### Communication WebSocket

Le protocole de communication WebSocket utilise JSON:

```json
{
  "type": "live_event",
  "tokenId": 1,
  "data": {
    "eventType": "game_bonus",
    "title": "Bonus de vitesse",
    "description": "Votre personnage se déplace 2x plus vite pendant 1 heure!",
    "duration": 3600,
    "multiplier": 2
  },
  "timestamp": 1683565423000
}
```

Types d'événements supportés:
- `metadata_update`: Notification de mise à jour de métadonnées
- `live_event`: Événement en direct avec données personnalisées
- `notification`: Simple notification textuelle

## Solutions aux problèmes courants

### Problème avec NFT.Storage API

**Symptôme**: Message d'erreur "API Key is malformed"

**Solution**:
1. Vérifiez que votre clé API est correctement configurée dans `.env`
2. Si le problème persiste, utilisez la méthode CSV comme alternative:
   - Générez le CSV avec l'outil `/csv-generator.html`
   - Uploadez manuellement sur https://nft.storage/manage/

### Contenu NFT non visible sur OpenSea

**Symptôme**: L'image ou le contenu interactif ne s'affiche pas sur OpenSea

**Solution**:
1. Vérifiez que les URLs dans les métadonnées commencent par `ipfs://`
2. Assurez-vous que le format des métadonnées est exact (pas de champs supplémentaires)
3. Patientez, OpenSea peut mettre jusqu'à 24h pour mettre à jour

### Problèmes de minting ou transfert

**Symptôme**: Transactions échouent avec erreur de gas ou revert

**Solution**:
1. Vérifiez que vous avez suffisamment d'ETH pour payer les frais
2. Pour le testnet Sepolia, utilisez un faucet: https://sepoliafaucet.com/
3. Assurez-vous d'être connecté au bon réseau dans MetaMask

## Ressources et références

### Smart Contracts

- Adresse du contrat principal: `0xd10AC868cFC5Ab7B5d3eA041D552FB57F6a03037`
- Explorer Sepolia: https://sepolia.etherscan.io/address/0xd10AC868cFC5Ab7B5d3eA041D552FB57F6a03037

### Services externes

- NFT.Storage: https://nft.storage/
- Infura IPFS: https://infura.io/
- Alchemy: https://www.alchemy.com/
- OpenSea Testnet: https://testnets.opensea.io/

### Guides supplémentaires

- Guide de création de NFTs interactifs: [EN COURS]
- Documentation officielle NFT.Storage: https://nft.storage/docs/
- Guide de mise à jour via CSV: [EN COURS]

## Roadmap et améliorations futures

### Améliorations prévues

- [ ] Intégration avec l'API OpenSea pour voir les NFTs directement dans l'admin
- [ ] Système avancé de statistiques pour suivre l'engagement des joueurs
- [ ] Outil de prévisualisation des NFTs interactifs avant déploiement
- [ ] Support de scénarios d'événements programmables et séquentiels
- [ ] Système de récompenses pour les propriétaires de NFTs actifs

## Contribution et maintenance

Pour contribuer au projet:
1. Forker le repository
2. Créer une branche pour votre fonctionnalité
3. Soumettre une pull request

Pour signaler un bug ou demander une fonctionnalité:
- Ouvrir une issue sur GitHub

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus d'informations.