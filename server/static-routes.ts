import express, { Express } from 'express';
import path from 'path';
import fs from 'fs-extra';

/**
 * Enregistre les routes pour servir les NFTs interactifs
 */
export function registerStaticRoutes(app: Express) {
  // Servir les fichiers statiques du dossier public
  app.use(express.static(path.join(process.cwd(), 'public')));
  
  // Note: la route racine est maintenant gérée dans server/index.ts
  
  // Route spéciale pour servir les métadonnées NFT
  app.get('/api/nft/:tokenId/metadata', async (req, res) => {
    const tokenId = req.params.tokenId;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Déterminer l'URL de base sur laquelle votre application est déployée
    // Dans Replit, c'est généralement quelque chose comme https://your-repl-name.username.repl.co
    
    const metadata = {
      name: `S.H.A.C.K.E.R. #${tokenId}`,
      description: "Une créature démoniaque aux yeux jaunes flamboyants et aux petites cornes. NFT rare de la collection Shackers OG sur Ethereum. NFT interactif avec mini-jeu intégré.",
      image: `${baseUrl}/nft-package/shacker01.jpg`,
      animation_url: `${baseUrl}/nft-package/index.html`,
      attributes: [
        {
          trait_type: "Type",
          value: "Demon"
        },
        {
          trait_type: "Rarity",
          value: "Legendary"
        }
      ]
    };
    
    res.json(metadata);
  });
  
  // Route pour servir le package HTML interactif
  app.get('/nft-interactive/:tokenId', (req, res) => {
    // Cette route peut être utilisée pour afficher l'NFT interactif avec des paramètres spécifiques au token
    const tokenId = req.params.tokenId;
    res.sendFile(path.join(process.cwd(), 'public', 'nft-package', 'index.html'));
  });
}