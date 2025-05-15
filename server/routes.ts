import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from 'ws';
import { uploadFileToIPFS, uploadMetadataToIPFS, ipfsToHttpUrl } from './ipfs-direct-service';
import { generateNFTStorageCSV } from './csv-generator';
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { uploadService } from './upload-service';

// Type pour les métadonnées du NFT
interface NftMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  lastUpdated: Date;
  updateFrequency?: number;
}

// Type pour les événements WebSocket
interface WebSocketEvent {
  type: 'metadata_update' | 'live_event' | 'notification';
  tokenId: number;
  data: any;
  timestamp: number;
}

// Stockage en mémoire des métadonnées personnalisées
const nftMetadataStore = new Map<number, NftMetadata>();

// Stockage des clients WebSocket connectés
const connectedClients = new Map<string, any>();

// Fonction pour obtenir l'URL de base du serveur
function getBaseUrl(req: Request): string {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

// Fonction d'initialisation des métadonnées pour les NFT
function initializeMetadata() {

  // Métadonnées pour S.H.A.C.K.E.R. #01 (ID=0 pour le NFT déjà minté)
  if (!nftMetadataStore.has(0)) {
    nftMetadataStore.set(0, {
      name: "S.H.A.C.K.E.R. #01",
      description: "Une créature démoniaque aux yeux jaunes flamboyants et aux petites cornes. NFT rare de la collection Shackers OG sur Ethereum. NFT interactif avec mini-jeu intégré.",
      image: "/images/shacker01.jpg", // URL relative (sera convertie en absolue)
      animation_url: "/", // URL relative (sera convertie en absolue)
      attributes: [
        { trait_type: "Gender", value: "Male" },
        { trait_type: "Type", value: "Demon" },
        { trait_type: "Eyes", value: "Yellow Flames" },
        { trait_type: "Accessory", value: "Piercings" },
        { trait_type: "Accessory", value: "Small Horns" },
        { trait_type: "Damages", value: "Bloody Nose" },
        { trait_type: "Collection", value: "Shackers OGs" },
        { trait_type: "Rarity", value: "#86" },
        { trait_type: "Interactive", value: "Yes" }
      ],
      lastUpdated: new Date()
    });
  }
  
  // Métadonnées pour S.H.A.C.K.E.R. #01 (ID=1 pour OpenSea)
  if (!nftMetadataStore.has(1)) {
    nftMetadataStore.set(1, {
      name: "S.H.A.C.K.E.R. #01",
      description: "Une créature démoniaque aux yeux jaunes flamboyants et aux petites cornes. NFT rare de la collection Shackers OG sur Ethereum. NFT interactif avec mini-jeu intégré.",
      image: "/images/shacker01.jpg", // URL relative (sera convertie en absolue)
      animation_url: "/", // URL relative (sera convertie en absolue)
      attributes: [
        { trait_type: "Gender", value: "Male" },
        { trait_type: "Type", value: "Demon" },
        { trait_type: "Eyes", value: "Yellow Flames" },
        { trait_type: "Accessory", value: "Piercings" },
        { trait_type: "Accessory", value: "Small Horns" },
        { trait_type: "Damages", value: "Bloody Nose" },
        { trait_type: "Collection", value: "Shackers OGs" },
        { trait_type: "Rarity", value: "#86" },
        { trait_type: "Interactive", value: "Yes" }
      ],
      lastUpdated: new Date()
    });
  }
  
  // Pour compatibilité avec le code existant (ID=42)
  if (!nftMetadataStore.has(42)) {
    // Créer une copie avec les mêmes valeurs
    const metadata1 = nftMetadataStore.get(1);
    if (metadata1) {
      nftMetadataStore.set(42, {
        name: metadata1.name,
        description: metadata1.description,
        image: metadata1.image,
        animation_url: metadata1.animation_url,
        attributes: [...metadata1.attributes],
        lastUpdated: new Date()
      });
    }
  }
}

// Fonction pour envoyer un événement à tous les clients connectés
function broadcastEvent(event: WebSocketEvent) {
  connectedClients.forEach((client, clientId) => {
    if (client.readyState === 1) { // 1 = WebSocket.OPEN
      client.send(JSON.stringify(event));
    }
  });
}

// Importer les routes NFT
import { registerNFTRoutes } from './nft-routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Route pour générer un fichier CSV compatible avec NFT.Storage
  app.post('/api/nft/generate-csv', async (req: Request, res: Response) => {
    try {
      const { mappings } = req.body;
      
      if (!mappings || !Array.isArray(mappings) || mappings.length === 0) {
        return res.status(400).json({ 
          error: "Un tableau de mappings (tokenId, cid) est requis" 
        });
      }
      
      // Générer le fichier CSV
      const csvPath = await generateNFTStorageCSV(mappings);
      
      // Renvoyer l'URL du fichier CSV
      const baseUrl = getBaseUrl(req);
      const csvUrl = `${baseUrl}${csvPath}`;
      
      res.json({
        success: true,
        message: "Fichier CSV généré avec succès",
        csvUrl,
        csvPath
      });
    } catch (error) {
      console.error('Erreur lors de la génération du CSV:', error);
      res.status(500).json({
        error: `Erreur lors de la génération du CSV: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }
  });
  // Enregistrer les routes d'upload
  uploadService.registerRoutes(app);
  
  // Enregistrer les routes NFT
  registerNFTRoutes(app);
  
  // Configuration de Multer pour l'upload de fichiers
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), 'temp');
      fs.ensureDirSync(uploadDir);
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: multerStorage });
  
  // API pour uploader un fichier direct sur IPFS
  app.post('/api/ipfs/upload-file', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier téléchargé" });
      }
      
      const filePath = req.file.path;
      console.log(`📤 Fichier téléchargé: ${filePath}`);
      
      // Uploader sur IPFS
      const ipfsUrl = await uploadFileToIPFS(filePath);
      const httpUrl = ipfsToHttpUrl(ipfsUrl);
      
      // Nettoyer le fichier temporaire
      await fs.remove(filePath);
      
      res.json({
        success: true,
        ipfsUrl,
        httpUrl,
        fileName: req.file.originalname
      });
    } catch (error) {
      console.error("❌ Erreur d'upload direct sur IPFS:", error);
      res.status(500).json({ 
        error: "Erreur lors de l'upload sur IPFS", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  // Initialiser les métadonnées
  initializeMetadata();
  
  // API pour les variables d'environnement (sécurisée)
  app.get("/api/env", (req: Request, res: Response) => {
    try {
      // Renvoyer uniquement les clés d'API nécessaires
      res.json({
        ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des variables d'environnement:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // API Routes
  
  // Get a single NFT by id
  app.get("/api/nfts/:id", async (req, res) => {
    try {
      const nftId = parseInt(req.params.id);
      const nft = await storage.getNft(nftId);
      
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }
      
      // Compléter avec les métadonnées personnalisées si disponibles
      const customMetadata = nftMetadataStore.get(nftId);
      if (customMetadata) {
        const enrichedNft = {
          ...nft,
          name: customMetadata.name,
          description: customMetadata.description,
          image: customMetadata.image,
          animation_url: customMetadata.animation_url,
          attributes: customMetadata.attributes,
          lastUpdated: customMetadata.lastUpdated
        };
        return res.json(enrichedNft);
      }
      
      res.json(nft);
    } catch (error) {
      console.error("Error fetching NFT:", error);
      res.status(500).json({ message: "Failed to fetch NFT data" });
    }
  });
  
  // Get NFTs from a collection
  app.get("/api/collections/:id/nfts", async (req, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const nfts = await storage.getNftsByCollection(collectionId);
      
      // Enrichir les NFTs avec les métadonnées personnalisées
      const enrichedNfts = nfts.map(nft => {
        const customMetadata = nftMetadataStore.get(nft.id);
        if (customMetadata) {
          return {
            ...nft,
            name: customMetadata.name,
            description: customMetadata.description,
            image: customMetadata.image,
            animation_url: customMetadata.animation_url,
            attributes: customMetadata.attributes,
            lastUpdated: customMetadata.lastUpdated
          };
        }
        return nft;
      });
      
      res.json(enrichedNfts);
    } catch (error) {
      console.error("Error fetching collection NFTs:", error);
      res.status(500).json({ message: "Failed to fetch collection NFT data" });
    }
  });
  
  // Get a collection by id
  app.get("/api/collections/:id", async (req, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const collection = await storage.getCollection(collectionId);
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Failed to fetch collection data" });
    }
  });
  
  // Get a user by id
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // API pour les métadonnées personnalisées
  app.get("/api/metadata/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const metadata = nftMetadataStore.get(id);
      if (!metadata) {
        return res.status(404).json({ error: "Metadata not found" });
      }
      
      // Convertir les URL relatives en URL absolues
      const baseUrl = getBaseUrl(req);
      const metadataWithAbsoluteUrls = {
        ...metadata,
        image: metadata.image.startsWith('http') ? metadata.image : `${baseUrl}${metadata.image}`,
        animation_url: metadata.animation_url ? 
          (metadata.animation_url.startsWith('http') ? metadata.animation_url : `${baseUrl}${metadata.animation_url}`) 
          : undefined
      };

      res.json(metadataWithAbsoluteUrls);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      res.status(500).json({ message: "Failed to fetch metadata" });
    }
  });

  app.put("/api/metadata/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      // Vérifier que le NFT existe
      if (!nftMetadataStore.has(id)) {
        return res.status(404).json({ error: "NFT not found" });
      }

      // Valider le propriétaire via l'adresse (simplifié pour la démo)
      const ownerAddress = "0x97004E87AeEe1C25814Ec736FcbB21AdCc010F52".toLowerCase();
      const requestAddress = (req.body.ownerAddress || "").toLowerCase();
      
      if (requestAddress !== ownerAddress) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const currentMetadata = nftMetadataStore.get(id);
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata not found" });
      }
      
      const updatedMetadata = {
        ...currentMetadata,
        ...req.body.metadata,
        lastUpdated: new Date()
      };

      nftMetadataStore.set(id, updatedMetadata);
      
      // Diffuser la mise à jour à tous les clients connectés
      broadcastEvent({
        type: 'metadata_update',
        tokenId: id,
        data: updatedMetadata,
        timestamp: Date.now()
      });
      
      res.json({ success: true, metadata: updatedMetadata });
    } catch (error) {
      console.error("Error updating metadata:", error);
      res.status(500).json({ message: "Failed to update metadata" });
    }
  });

  // Endpoint pour envoyer un événement en direct à un NFT spécifique
  app.post("/api/events/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      // Vérifier que le NFT existe
      if (!nftMetadataStore.has(id)) {
        return res.status(404).json({ error: "NFT not found" });
      }

      // Valider le propriétaire via l'adresse (simplifié pour la démo)
      const ownerAddress = "0x97004E87AeEe1C25814Ec736FcbB21AdCc010F52".toLowerCase();
      const requestAddress = (req.body.ownerAddress || "").toLowerCase();
      
      if (requestAddress !== ownerAddress) {
        return res.status(403).json({ error: "Not authorized" });
      }

      // Diffuser l'événement en direct à tous les clients connectés
      broadcastEvent({
        type: 'live_event',
        tokenId: id,
        data: req.body.eventData,
        timestamp: Date.now()
      });
      
      res.json({ success: true, message: "Live event sent successfully" });
    } catch (error) {
      console.error("Error sending live event:", error);
      res.status(500).json({ message: "Failed to send live event" });
    }
  });

  // API pour uploader l'image d'un NFT sur IPFS
  app.post("/api/ipfs/upload-nft-image", async (req: Request, res: Response) => {
    try {
      const { tokenId } = req.body;
      
      if (!tokenId && tokenId !== 0) {
        return res.status(400).json({ error: "Token ID requis" });
      }
      
      // Vérifier que le NFT existe
      if (!nftMetadataStore.has(Number(tokenId))) {
        return res.status(404).json({ error: "NFT non trouvé" });
      }
      
      // Récupérer les métadonnées actuelles
      const metadata = nftMetadataStore.get(Number(tokenId));
      if (!metadata) {
        return res.status(404).json({ error: "Métadonnées non trouvées" });
      }
      
      // Si l'image est déjà sur IPFS, ne pas la re-uploader
      if (metadata.image.startsWith('ipfs://')) {
        console.log('⚠️ L\'image est déjà sur IPFS, pas besoin de la re-uploader');
        
        // Uploader les métadonnées directement
        try {
          const ipfsMetadataUrl = await uploadMetadataToIPFS(metadata);
          
          // Réponse avec les URLs existantes
          return res.json({
            success: true,
            metadata: metadata,
            ipfsImageUrl: metadata.image,
            ipfsMetadataUrl,
            httpImageUrl: ipfsToHttpUrl(metadata.image),
            httpMetadataUrl: ipfsToHttpUrl(ipfsMetadataUrl),
            message: "L'image était déjà sur IPFS"
          });
        } catch (metadataError) {
          console.error("Erreur lors de l'upload des métadonnées:", metadataError);
          // Continuer avec l'upload de l'image
        }
      }
      
      // Uploader l'image sur IPFS
      const ipfsImageUrl = await uploadFileToIPFS(metadata.image);
      
      // Mettre à jour les métadonnées avec l'URL IPFS
      const updatedMetadata = {
        ...metadata,
        image: ipfsImageUrl,
        lastUpdated: new Date()
      };
      
      // Sauvegarder les métadonnées mises à jour
      nftMetadataStore.set(Number(tokenId), updatedMetadata);
      
      // Uploader les métadonnées complètes sur IPFS
      const ipfsMetadataUrl = await uploadMetadataToIPFS(updatedMetadata);
      
      // Diffuser la mise à jour à tous les clients connectés
      broadcastEvent({
        type: 'metadata_update',
        tokenId: Number(tokenId),
        data: updatedMetadata,
        timestamp: Date.now()
      });
      
      // Réponse avec toutes les informations
      res.json({ 
        success: true, 
        metadata: updatedMetadata,
        ipfsImageUrl,
        ipfsMetadataUrl,
        httpImageUrl: ipfsToHttpUrl(ipfsImageUrl),
        httpMetadataUrl: ipfsToHttpUrl(ipfsMetadataUrl)
      });
    } catch (error) {
      console.error("Erreur d'upload sur IPFS:", error);
      res.status(500).json({ 
        error: "Erreur lors de l'upload sur IPFS", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // Créer le serveur HTTP
  const httpServer = createServer(app);

  // Configurer le WebSocket Server avec CORS activé
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Permettre toutes les connexions
    verifyClient: () => true 
  });

  wss.on('connection', (ws) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Enregistrer le client
    connectedClients.set(clientId, ws);
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Envoyer un message de bienvenue
    ws.send(JSON.stringify({
      type: 'notification',
      message: 'Connected to DarthBater NFT live updates',
      timestamp: Date.now()
    }));
    
    // Gérer les messages entrants
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log(`Received message from ${clientId}:`, parsedMessage);
        
        // Gérer les différents types de messages ici si nécessaire
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Gérer la déconnexion
    ws.on('close', () => {
      connectedClients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
  });

  return httpServer;
}
