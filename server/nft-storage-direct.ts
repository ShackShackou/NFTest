import { NFTStorage, File, Blob } from 'nft.storage';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';

// Clé API NFT.Storage
const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY || '';

// Création du client NFT.Storage
let client: NFTStorage;

try {
  client = new NFTStorage({ token: NFT_STORAGE_API_KEY });
  console.log('✅ Client NFT.Storage initialisé avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation du client NFT.Storage:', error);
}

/**
 * Convertit un chemin de fichier en file buffer
 */
async function getFileBuffer(filePath: string): Promise<Buffer> {
  // Si c'est une URL, télécharger d'abord le fichier
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    try {
      console.log(`🌐 Téléchargement du fichier depuis URL: ${filePath}`);
      
      // Télécharger le fichier
      const response = await fetch(filePath);
      
      if (!response.ok) {
        throw new Error(`Impossible de télécharger le fichier: ${response.status} ${response.statusText}`);
      }
      
      // Convertir la réponse en Buffer
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement du fichier:', error);
      throw error;
    }
  }
  
  // Pour les chemins locaux, normaliser le chemin
  let normalizedPath = filePath;
  if (filePath.startsWith('/')) {
    normalizedPath = path.join(process.cwd(), 'public', filePath.substring(1));
  } else if (!filePath.startsWith('/') && !path.isAbsolute(filePath)) {
    normalizedPath = path.join(process.cwd(), 'public', filePath);
  }
  
  // Vérifier si le fichier existe
  if (!await fs.pathExists(normalizedPath)) {
    throw new Error(`Fichier non trouvé: ${normalizedPath}`);
  }
  
  // Lire le fichier en tant que Buffer
  return await fs.readFile(normalizedPath);
}

/**
 * Upload un fichier sur IPFS via NFT.Storage
 */
export async function uploadToNFTStorage(filePath: string): Promise<string> {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error('NFT_STORAGE_API_KEY non définie. Veuillez définir cette variable d\'environnement.');
  }
  
  try {
    console.log(`📤 Préparation de l'upload du fichier ${path.basename(filePath)} vers NFT.Storage...`);
    
    // Obtenir le contenu du fichier
    const content = await getFileBuffer(filePath);
    
    // Obtenir le nom du fichier
    const fileName = path.basename(filePath);
    
    // Créer un objet File pour NFT.Storage
    const file = new File([content], fileName, { type: 'application/octet-stream' });
    
    console.log(`📤 Début de l'upload vers NFT.Storage (taille: ${(content.length / 1024).toFixed(2)} KB)...`);
    
    // Upload sur NFT.Storage
    const cid = await client.storeBlob(file);
    
    console.log(`✅ Upload réussi vers NFT.Storage avec CID: ${cid}`);
    
    // Construire l'URL IPFS
    const ipfsUrl = `ipfs://${cid}`;
    
    return ipfsUrl;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload sur NFT.Storage:', error);
    throw error;
  }
}

/**
 * Upload des métadonnées sur IPFS via NFT.Storage
 */
export async function uploadMetadataToNFTStorage(metadata: any): Promise<string> {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error('NFT_STORAGE_API_KEY non définie. Veuillez définir cette variable d\'environnement.');
  }
  
  try {
    console.log(`📄 Préparation de l'upload des métadonnées vers NFT.Storage...`);
    
    // Convertir les métadonnées en JSON
    const metadataString = JSON.stringify(metadata, null, 2);
    
    // Créer un blob avec les métadonnées
    const blob = new Blob([metadataString], { type: 'application/json' });
    
    console.log(`📤 Début de l'upload des métadonnées vers NFT.Storage...`);
    
    // Upload sur NFT.Storage
    const cid = await client.storeBlob(blob);
    
    console.log(`✅ Upload des métadonnées réussi vers NFT.Storage avec CID: ${cid}`);
    
    // Construire l'URL IPFS
    const ipfsUrl = `ipfs://${cid}`;
    
    return ipfsUrl;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload des métadonnées sur NFT.Storage:', error);
    throw error;
  }
}

/**
 * Convertit une URL IPFS en URL HTTP accessible via une passerelle
 */
export function ipfsToHttpUrl(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://nftstorage.link/ipfs/${cid}`;
}