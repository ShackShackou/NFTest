import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import express from 'express';

/**
 * Service de gestion d'upload d'images
 */
export class UploadService {
  private uploadDir: string;
  
  constructor() {
    // Créer le répertoire d'upload s'il n'existe pas
    this.uploadDir = path.join(process.cwd(), 'public', 'images');
    fs.ensureDirSync(this.uploadDir);
  }
  
  /**
   * Configure le middleware Multer pour l'upload de fichiers
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        // Créer un nom de fichier unique avec timestamp
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(file.originalname);
        const filename = `upload_${timestamp}_${randomId}${extension}`;
        cb(null, filename);
      }
    });
    
    // Fonction de filtrage pour n'accepter que les images
    const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non supporté. Seuls les formats JPEG, PNG, GIF et WEBP sont acceptés.'));
      }
    };
    
    return multer({ 
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // Limite à 5MB
      }
    });
  }
  
  /**
   * Enregistre les routes d'upload dans l'application Express
   */
  registerRoutes(app: express.Application) {
    const upload = this.getMulterConfig();
    
    // Route pour uploader une image
    app.post('/api/upload/image', upload.single('file'), (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            error: 'Aucun fichier n\'a été téléchargé' 
          });
        }
        
        // Construire l'URL relative pour accéder au fichier
        const relativePath = `/images/${req.file.filename}`;
        
        // Répondre avec les informations du fichier
        res.json({
          success: true,
          file: {
            name: req.file.originalname,
            url: relativePath,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'upload d\'image:', error);
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'upload'
        });
      }
    });
  }
}

// Instance singleton du service d'upload
export const uploadService = new UploadService();