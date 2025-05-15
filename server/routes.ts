import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

// Stockage en mémoire des métadonnées personnalisées
const nftMetadataStore = new Map<number, NftMetadata>();

// Fonction d'initialisation des métadonnées pour le NFT #42
function initializeMetadata() {
  if (!nftMetadataStore.has(42)) {
    nftMetadataStore.set(42, {
      name: "DARTHBATER #42",
      description: "Un NFT interactif avec mini-jeu intégré",
      image: "https://gateway.pinata.cloud/ipfs/QmYDm8Bzye4RMS5RZPwqRNz9ZRUvk2bciF7VYjwdgXCFm8",
      animation_url: "https://nft-darthbater.replit.app/interactive/42",
      attributes: [
        { trait_type: "Base", value: "Pixel" },
        { trait_type: "Style", value: "Rétro" },
        { trait_type: "Level", value: "1" }
      ],
      lastUpdated: new Date()
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialiser les métadonnées
  initializeMetadata();
  
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

      res.json(metadata);
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
      
      res.json({ success: true, metadata: updatedMetadata });
    } catch (error) {
      console.error("Error updating metadata:", error);
      res.status(500).json({ message: "Failed to update metadata" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
