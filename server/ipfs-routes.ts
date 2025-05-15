import express, { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { uploadFileDirectToNFTStorage, ipfsToHttpUrl } from './nft-storage-csv';

// Configuration de multer pour l'upload de fichiers
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'temp');
      fs.ensureDirSync(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Générer un nom de fichier unique
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

export function registerIPFSRoutes(app: express.Application) {
  // Route pour uploader un fichier directement sur IPFS
  app.post('/api/ipfs/direct-upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier n\'a été fourni' });
      }

      console.log(`📁 Fichier reçu: ${req.file.originalname} (${req.file.size} bytes)`);
      
      // Uploader sur NFT.Storage
      const ipfsUrl = await uploadFileDirectToNFTStorage(req.file.path);
      
      // Convertir en URL HTTP pour prévisualisation
      const httpUrl = ipfsToHttpUrl(ipfsUrl);
      
      // Supprimer le fichier temporaire
      await fs.remove(req.file.path);
      
      res.json({
        success: true,
        originalName: req.file.originalname,
        ipfsUrl,
        httpUrl
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload sur IPFS:', error);
      res.status(500).json({
        error: `Erreur lors de l'upload sur IPFS: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }
  });

  // Route pour uploader une image et générer les métadonnées NFT
  app.post('/api/ipfs/upload-nft', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune image n\'a été fournie' });
      }

      // Extraire les données du formulaire
      const name = req.body.name || 'NFT sans nom';
      const description = req.body.description || '';
      const attributes = JSON.parse(req.body.attributes || '[]');

      console.log(`📁 Image reçue: ${req.file.originalname} (${req.file.size} bytes)`);
      
      // Uploader l'image sur NFT.Storage
      const imageIpfsUrl = await uploadFileDirectToNFTStorage(req.file.path);
      
      // Créer les métadonnées
      const metadata = {
        name,
        description,
        image: imageIpfsUrl,
        attributes,
        created: new Date().toISOString()
      };

      // Créer un fichier JSON temporaire pour les métadonnées
      const metadataPath = path.join(process.cwd(), 'temp', `metadata-${Date.now()}.json`);
      await fs.writeJson(metadataPath, metadata, { spaces: 2 });
      
      // Uploader les métadonnées sur NFT.Storage
      const metadataIpfsUrl = await uploadFileDirectToNFTStorage(metadataPath);
      
      // Convertir en URLs HTTP pour prévisualisation
      const imageHttpUrl = ipfsToHttpUrl(imageIpfsUrl);
      const metadataHttpUrl = ipfsToHttpUrl(metadataIpfsUrl);
      
      // Supprimer les fichiers temporaires
      await fs.remove(req.file.path);
      await fs.remove(metadataPath);
      
      res.json({
        success: true,
        metadata: {
          ...metadata,
          metadataIpfsUrl,
          metadataHttpUrl,
          imageHttpUrl
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création du NFT:', error);
      res.status(500).json({
        error: `Erreur lors de la création du NFT: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }
  });

  // Route pour uploader un fichier HTML et ses dépendances (pour les NFT interactifs)
  app.post('/api/ipfs/upload-interactive-nft', upload.fields([
    { name: 'html', maxCount: 1 },
    { name: 'assets', maxCount: 10 }
  ]), async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.html || files.html.length === 0) {
        return res.status(400).json({ error: 'Aucun fichier HTML n\'a été fourni' });
      }

      const htmlFile = files.html[0];
      const assetFiles = files.assets || [];
      
      console.log(`📁 HTML reçu: ${htmlFile.originalname} (${htmlFile.size} bytes)`);
      console.log(`📁 ${assetFiles.length} fichiers d'assets reçus`);
      
      // Uploader le fichier HTML
      const htmlIpfsUrl = await uploadFileDirectToNFTStorage(htmlFile.path);
      const htmlHttpUrl = ipfsToHttpUrl(htmlIpfsUrl);
      
      // Uploader les assets
      const assets = [];
      for (const assetFile of assetFiles) {
        const assetIpfsUrl = await uploadFileDirectToNFTStorage(assetFile.path);
        const assetHttpUrl = ipfsToHttpUrl(assetIpfsUrl);
        
        assets.push({
          originalName: assetFile.originalname,
          ipfsUrl: assetIpfsUrl,
          httpUrl: assetHttpUrl
        });
        
        // Supprimer le fichier temporaire
        await fs.remove(assetFile.path);
      }
      
      // Supprimer le fichier HTML temporaire
      await fs.remove(htmlFile.path);
      
      res.json({
        success: true,
        html: {
          originalName: htmlFile.originalname,
          ipfsUrl: htmlIpfsUrl,
          httpUrl: htmlHttpUrl
        },
        assets
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload du NFT interactif:', error);
      res.status(500).json({
        error: `Erreur lors de l'upload du NFT interactif: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }
  });
}