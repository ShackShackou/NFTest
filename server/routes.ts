import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Get a single NFT by id
  app.get("/api/nfts/:id", async (req, res) => {
    try {
      const nftId = parseInt(req.params.id);
      const nft = await storage.getNft(nftId);
      
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
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
      
      res.json(nfts);
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

  const httpServer = createServer(app);

  return httpServer;
}
