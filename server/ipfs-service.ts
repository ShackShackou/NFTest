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
 * @param filePath Chemin du fichier à uploader
 * @returns URL IPFS du fichier
 */
export async function uploadFileToIPFS(filePath: string): Promise<string> {
  try {
    // Vérifier si le fichier existe
    if (!await fs.pathExists(filePath)) {
      throw new Error(`Le fichier ${filePath} n'existe pas`);
    }

    // Lire le fichier
    const fileData = await fs.readFile(filePath);
    
    // Déterminer le type MIME en fonction de l'extension
    const extension = path.extname(filePath).toLowerCase();
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
    const fileName = path.basename(filePath);
    const file = new File([fileData], fileName, { type: contentType });

    console.log(`📤 Upload du fichier ${fileName} vers IPFS...`);
    
    // Upload du fichier sur IPFS
    const cid = await client.storeBlob(file);
    
    // Construire l'URL gateway IPFS
    const ipfsUrl = `ipfs://${cid}`;
    const gatewayUrl = `https://nftstorage.link/ipfs/${cid}`;
    
    console.log(`✅ Fichier uploadé avec succès sur IPFS:`);
    console.log(`- IPFS URL: ${ipfsUrl}`);
    console.log(`- Gateway URL: ${gatewayUrl}`);
    
    return ipfsUrl;
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
    
    // Upload du fichier sur IPFS
    const cid = await client.storeBlob(file);
    
    // Construire l'URL gateway IPFS
    const ipfsUrl = `ipfs://${cid}`;
    const gatewayUrl = `https://nftstorage.link/ipfs/${cid}`;
    
    console.log(`✅ Métadonnées uploadées avec succès sur IPFS:`);
    console.log(`- IPFS URL: ${ipfsUrl}`);
    console.log(`- Gateway URL: ${gatewayUrl}`);
    
    return ipfsUrl;
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
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl; // Déjà une URL HTTP ou format non reconnu
  }
  
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://nftstorage.link/ipfs/${cid}`;
}