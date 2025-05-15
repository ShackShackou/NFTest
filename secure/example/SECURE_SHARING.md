# Guide de partage sécurisé du projet S.H.A.C.K.E.R. NFT

## Informations sensibles à partager

Voici les informations sensibles nécessaires au fonctionnement du projet. Ne les partagez **JAMAIS** via des canaux non sécurisés (email non chiffré, messagerie publique, etc.).

### 1. Clés API et secrets

| Nom | Description | Comment l'obtenir | Comment le partager |
|-----|-------------|-------------------|---------------------|
| `ALCHEMY_API_KEY` | Clé API pour accéder aux services Alchemy | [Dashboard Alchemy](https://dashboard.alchemy.com/) | 1Password, LastPass, message chiffré |
| `NFT_STORAGE_API_KEY` | Clé API pour NFT.Storage | [NFT.Storage](https://nft.storage/) | 1Password, LastPass, message chiffré |
| `METAMASK_API_KEY` | Clé API pour les services MetaMask (si utilisée) | [MetaMask](https://metamask.io/flask/) | 1Password, LastPass, message chiffré |
| `PRIVATE_KEY` | Clé privée du wallet de déploiement | Compte MetaMask | Message chiffré uniquement, jamais en clair |
| `DATABASE_URL` | URL de connexion à la base de données | Configuration PostgreSQL | 1Password, LastPass, message chiffré |
| `PGPASSWORD` | Mot de passe PostgreSQL | Configuration PostgreSQL | 1Password, LastPass, message chiffré |

### 2. Configuration du wallet Ethereum

Pour déployer ou interagir avec les smart contracts:

1. **Clé privée**: Ne partagez JAMAIS votre clé privée principale
2. **Créez un wallet dédié au projet** avec uniquement les fonds nécessaires
3. **Créez une phrase mnémonique dédiée** uniquement pour ce projet

### 3. Méthodes de partage sécurisé

Voici les méthodes recommandées pour partager ces informations:

#### Option 1: Gestionnaire de mots de passe
- Créez un dossier partagé dans 1Password, LastPass, ou autre
- Partagez l'accès uniquement avec les personnes concernées
- Stockez chaque secret comme un élément distinct

#### Option 2: Services de partage sécurisé éphémères
- [PrivateBin](https://privatebin.info/) - message chiffré à expiration automatique
- [Keybase](https://keybase.io/) - messages et fichiers chiffrés
- [Signal](https://signal.org/) - messages chiffrés avec fonction d'auto-destruction

#### Option 3: GPG/PGP (pour les utilisateurs avancés)
1. Obtenez la clé publique GPG du destinataire
2. Créez un fichier avec les secrets
3. Chiffrez-le avec leur clé publique
4. Partagez le fichier chiffré via n'importe quel canal

## Instructions pour exporter le projet

### Option 1: GitHub (Recommandée)

1. **Créez un repository privé** sur GitHub
2. **Initialisez Git** dans votre projet:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/votre-username/shacker-nft.git
   git push -u origin main
   ```
3. **Invitez les collaborateurs** via les paramètres GitHub

Avantages:
- Versionning complet
- Contrôle d'accès précis
- Facilité de collaboration

### Option 2: Archive ZIP (via Replit)

1. Dans Replit, cliquez sur les trois points à côté du nom du projet
2. Sélectionnez "Download as zip"
3. Envoyez ce fichier via un service de partage de fichiers sécurisé

Avantages:
- Simple et rapide
- Pas besoin de configurer Git

### Option 3: Exportation avancée avec exclusions

Pour créer une archive plus propre, exécutez cette commande dans le terminal:

```bash
zip -r shacker-nft.zip . -x "node_modules/*" ".env" ".git/*" "cache/*" "artifacts/*"
```

Cela créera une archive sans les fichiers lourds et sensibles.

## Vérification de l'intégrité

Après avoir partagé le projet, demandez au destinataire de:

1. Vérifier la présence de tous les fichiers essentiels:
   - `contracts/` - Smart contracts
   - `public/` - Interface utilisateur
   - `server/` - Backend
   - `shared/` - Schémas partagés
   - Documentation (README.md, etc.)

2. Créer un fichier `.env` basé sur `.env.example`

3. Installer les dépendances et démarrer le projet:
   ```bash
   npm install
   npm run dev
   ```

4. Confirmer que l'interface d'administration est accessible