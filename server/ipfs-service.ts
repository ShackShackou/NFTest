import { NFTStorage, File } from 'nft.storage';
import fs from 'fs-extra';
import path from 'path';

// Récupération de la clé API depuis les variables d'environnement
const API_KEY = process.env.NFT_STORAGE_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ NFT_STORAGE_API_KEY non trouvée dans les variables d\'environnement');
}

// Création du client NFT.Storage
const client = new NFTStorage({ token: API_KEY || '' });

/**
 * Upload un fichier sur IPFS via NFT.Storage
 * @param filePath Chemin du fichier à uploader ou URL du fichier
 * @returns URL IPFS du fichier
 */
export async function uploadFileToIPFS(filePath: string): Promise<string> {
  try {
    // Si c'est déjà une URL IPFS, on la retourne directement
    if (filePath.startsWith('ipfs://')) {
      console.log(`⚠️ Le fichier est déjà sur IPFS: ${filePath}`);
      return filePath;
    }
    
    // Si c'est une URL HTTP qui pointe vers le cache IPFS local
    if (filePath.includes('/ipfs-cache/')) {
      const segments = filePath.split('/');
      const filename = segments[segments.length - 1];
      // Si c'est un fichier du cache avec un CID, construire l'URL IPFS
      if (filename.includes('bafkrei')) {
        const cid = filename.split('.')[0]; // extraire le CID sans l'extension
        return `ipfs://${cid}`;
      }
    }
    
    // Normaliser le chemin pour les URL relatives
    let normalizedPath = filePath;
    if (filePath.startsWith('/')) {
      normalizedPath = path.join(process.cwd(), 'public', filePath);
    } else if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      try {
        // Extraire le chemin de l'URL et le convertir en chemin local
        const url = new URL(filePath);
        const localPath = url.pathname;
        normalizedPath = path.join(process.cwd(), 'public', localPath);
      } catch (e) {
        console.error("Erreur de parsing d'URL:", e);
        normalizedPath = filePath;
      }
    }
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(normalizedPath)) {
      throw new Error(`Le fichier ${normalizedPath} n'existe pas`);
    }

    // Lire le fichier
    const fileData = await fs.readFile(normalizedPath);
    
    // Déterminer le type MIME en fonction de l'extension
    const extension = path.extname(normalizedPath).toLowerCase();
    let contentType = 'application/octet-stream'; // Type par défaut
    
    if (extension === '.jpg' || extension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (extension === '.png') {
      contentType = 'image/png';
    } else if (extension === '.gif') {
      contentType = 'image/gif';
    } else if (extension === '.svg') {
      contentType = 'image/svg+xml';
    } else if (extension === '.json') {
      contentType = 'application/json';
    } else if (extension === '.html') {
      contentType = 'text/html';
    }

    // Créer un objet File pour NFT.Storage
    const fileName = path.basename(normalizedPath);
    const file = new File([fileData], fileName, { type: contentType });

    console.log(`📤 Upload du fichier ${fileName} vers IPFS (taille: ${(fileData.length / 1024).toFixed(2)} KB)...`);
    
    // Tentative d'upload sur IPFS via NFT.Storage
    try {
      const cid = await client.storeBlob(file);
      const ipfsUrl = `ipfs://${cid}`;
      const gatewayUrl = `https://nftstorage.link/ipfs/${cid}`;
      
      console.log(`✅ Fichier uploadé avec succès sur IPFS:`);
      console.log(`- IPFS URL: ${ipfsUrl}`);
      console.log(`- Gateway URL: ${gatewayUrl}`);
      
      return ipfsUrl;
    } catch (uploadError) {
      console.error("Erreur d'upload NFT.Storage:", uploadError);
      
      // Si l'upload IPFS échoue, sauvegardons localement
      const randomId = Math.random().toString(36).substring(2, 10);
      const publicDir = path.join(process.cwd(), 'public', 'images');
      await fs.ensureDir(publicDir);
      
      // Générer un nom de fichier unique
      const safeName = `shacker01_${randomId}${extension}`;
      const localPath = path.join(publicDir, safeName);
      
      // Copier le fichier avec un nouveau nom dans le dossier public/images
      await fs.copyFile(normalizedPath, localPath);
      
      // Retourner une URL relative
      return `/images/${safeName}`;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload sur IPFS:', error);
    throw error;
  }
}

/**
 * Upload une métadonnée NFT sur IPFS via NFT.Storage
 * @param metadata Objet métadonnée à uploader
 * @returns URL IPFS de la métadonnée
 */
export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  try {
    console.log(`📤 Upload des métadonnées NFT vers IPFS...`);
    
    // Convertir l'objet en JSON
    const data = JSON.stringify(metadata, null, 2);
    
    // Créer un objet File pour NFT.Storage
    const file = new File([data], 'metadata.json', { type: 'application/json' });
    
    // Tentative d'upload sur IPFS via NFT.Storage
    try {
      const cid = await client.storeBlob(file);
      const ipfsUrl = `ipfs://${cid}`;
      const gatewayUrl = `https://nftstorage.link/ipfs/${cid}`;
      
      console.log(`✅ Métadonnées uploadées avec succès sur IPFS:`);
      console.log(`- IPFS URL: ${ipfsUrl}`);
      console.log(`- Gateway URL: ${gatewayUrl}`);
      
      return ipfsUrl;
    } catch (uploadError) {
      console.error("Erreur d'upload des métadonnées sur NFT.Storage:", uploadError);
      
      // Si l'upload IPFS échoue, sauvegardons localement
      const randomId = Math.random().toString(36).substring(2, 10);
      const publicDir = path.join(process.cwd(), 'public', 'metadata');
      await fs.ensureDir(publicDir);
      
      // Générer un nom de fichier unique
      const fileName = `metadata_${randomId}.json`;
      const localPath = path.join(publicDir, fileName);
      
      // Écrire le fichier JSON
      await fs.writeFile(localPath, data);
      
      // Retourner une URL relative
      return `/metadata/${fileName}`;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload des métadonnées sur IPFS:', error);
    throw error;
  }
}

/**
 * Convertit une URL IPFS en URL HTTP accessible via une passerelle
 * @param ipfsUrl URL IPFS (ipfs://...)
 * @returns URL HTTP via gateway
 */
export function ipfsToHttpUrl(ipfsUrl: string): string {
  // Si ce n'est pas une URL IPFS, retourner telle quelle
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  // Extraire le CID (Content ID) de l'URL IPFS
  const cid = ipfsUrl.replace('ipfs://', '');
  
  // Utiliser la passerelle d'accès NFT.Storage (fiable et rapide)
  return `https://nftstorage.link/ipfs/${cid}`;
}