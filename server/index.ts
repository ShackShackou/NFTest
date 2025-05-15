import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerIPFSRoutes } from "./ipfs-routes";
import { registerStaticRoutes } from "./static-routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';

// Obtenir l'équivalent de __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir les fichiers statiques depuis le dossier public
app.use(express.static(path.join(__dirname, "../public")));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Enregistrer les routes IPFS
  registerIPFSRoutes(app);
  
  // Enregistrer les routes statiques
  registerStaticRoutes(app);
  
  // Route pour générer des métadonnées au format NFT.Storage
  app.get('/api/nft/create-metadata-csv', async (req: Request, res: Response) => {
    try {
      const baseUrl = getBaseUrl(req);
      const tokenCount = Number(req.query.tokens || 1);
      
      // Générer les mappings
      const mappings = [];
      for (let i = 0; i < tokenCount; i++) {
        // L'URL de métadonnée pointe vers notre propre serveur
        const metadataUrl = `${baseUrl}/api/nft/${i}/metadata`;
        mappings.push({
          tokenId: String(i),
          cid: metadataUrl
        });
      }
      
      // Générer le fichier CSV
      const csvPath = await generateNFTStorageCSV(mappings);
      
      // Renvoyer l'URL du fichier CSV
      const csvUrl = `${baseUrl}${csvPath}`;
      
      res.json({
        success: true,
        message: `Fichier CSV pour ${tokenCount} tokens généré avec succès`,
        csvUrl,
        csvPath,
        mappings
      });
    } catch (error) {
      console.error('Erreur lors de la génération du CSV de métadonnées:', error);
      res.status(500).json({
        error: `Erreur lors de la génération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }
  });
  
  // Enregistrer les autres routes
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
