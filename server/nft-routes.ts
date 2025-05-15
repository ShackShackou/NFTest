import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { uploadToNFTStorage, uploadMetadataToNFTStorage, ipfsToHttpUrl } from './nft-storage-direct';

// Configurer multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'temp');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'temp-' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage });

export function registerNFTRoutes(app: express.Application) {
  // Route pour uploader un fichier directement sur IPFS
  app.post('/api/nft/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Aucun fichier n\'a été téléchargé'
        });
      }
      
      console.log(`📦 Fichier reçu: ${req.file.path} (${req.file.size} octets)`);
      
      // Uploader le fichier sur IPFS
      const ipfsUrl = await uploadToNFTStorage(req.file.path);
      
      // Convertir en URL HTTP pour l'affichage
      const httpUrl = ipfsToHttpUrl(ipfsUrl);
      
      // Supprimer le fichier temporaire
      await fs.remove(req.file.path);
      
      res.json({
        success: true,
        ipfsUrl,
        httpUrl,
        fileName: req.file.originalname
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload sur IPFS:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error
      });
    }
  });
  
  // Route pour mettre à jour les métadonnées d'un NFT avec l'image sur IPFS
  app.post('/api/nft/update-metadata', async (req: Request, res: Response) => {
    try {
      const { tokenId, imageUrl } = req.body;
      
      if (!tokenId && tokenId !== 0) {
        return res.status(400).json({
          success: false,
          error: 'Token ID requis'
        });
      }
      
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'URL de l\'image requise'
        });
      }
      
      // Vérifier que l'image est sur IPFS ou télécharger sur IPFS
      let ipfsImageUrl = imageUrl;
      if (!imageUrl.startsWith('ipfs://')) {
        console.log(`🔄 L'image n'est pas sur IPFS, upload en cours: ${imageUrl}`);
        ipfsImageUrl = await uploadToNFTStorage(imageUrl);
      }
      
      // Créer les métadonnées
      const metadata = {
        name: `S.H.A.C.K.E.R. #${tokenId.toString().padStart(2, '0')}`,
        description: "Une créature démoniaque aux yeux jaunes flamboyants et aux petites cornes. NFT rare de la collection Shackers OG sur Ethereum. NFT interactif avec mini-jeu intégré.",
        image: ipfsImageUrl,
        lastUpdated: new Date(),
        attributes: [
          {
            "trait_type": "Gender",
            "value": "Male"
          }
        ]
      };
      
      // Uploader les métadonnées sur IPFS
      const ipfsMetadataUrl = await uploadMetadataToNFTStorage(metadata);
      
      res.json({
        success: true,
        metadata,
        ipfsImageUrl,
        ipfsMetadataUrl,
        httpImageUrl: ipfsToHttpUrl(ipfsImageUrl),
        httpMetadataUrl: ipfsToHttpUrl(ipfsMetadataUrl)
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des métadonnées:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error
      });
    }
  });
}