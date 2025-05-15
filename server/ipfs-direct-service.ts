import { create as createIPFSClient } from 'ipfs-http-client';
import fs from 'fs-extra';
import path from 'path';
import FormData from 'form-data';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';

// URL de l'API Pinata (alternative à NFT.Storage)
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const INFURA_IPFS_API = 'https://ipfs.infura.io:5001/api/v0';
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || '';
const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET || '';
const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY || '';

// Fallback pour stocker localement si l'upload IPFS échoue
function generateLocalFilePath(fileName: string): {filePath: string, urlPath: string} {
  const publicDir = path.join(process.cwd(), 'public', 'images');
  const randomId = Math.random().toString(36).substring(2, 10);
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const safeName = `${baseName}_${randomId}${extension}`;
  
  return {
    filePath: path.join(publicDir, safeName),
    urlPath: `/images/${safeName}`
  };
}

/**
 * Upload un fichier directement sur le Pinata public IPFS gateway
 */
async function uploadToPinata(filePath: string): Promise<string> {
  try {
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('file', fileStream);
    formData.append('pinataMetadata', JSON.stringify({
      name: path.basename(filePath)
    }));

    const response = await fetch(PINATA_API_URL, {
      method: 'POST',
      headers: {
        // Clés Pinata en test - limitées mais fonctionnelles
        'pinata_api_key': process.env.PINATA_API_KEY || '97ef3262b5b5fc17156d',
        'pinata_secret_api_key': process.env.PINATA_SECRET_KEY || '8e430a7b6a11d7d78aa0f8e536d41c9c9c0a3879f4b9d9bd29a3d56e1f127e35'
      },
      body: formData as any
    });
    
    if (!response.ok) {
      throw new Error(`Erreur de réponse Pinata: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload sur Pinata:', error);
    throw error;
  }
}

/**
 * Upload un fichier sur IPFS via le nœud public d'Infura
 */
async function uploadToInfura(filePath: string): Promise<string> {
  try {
    // Créer un client IPFS avec authentification Infura si disponible
    const auth = INFURA_PROJECT_ID && INFURA_PROJECT_SECRET ? 
      'Basic ' + Buffer.from(INFURA_PROJECT_ID + ':' + INFURA_PROJECT_SECRET).toString('base64') : '';
    
    const client = createIPFSClient({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth
      }
    });
    
    // Lire le fichier
    const fileContent = await fs.readFile(filePath);
    
    // Uploader sur IPFS
    const result = await client.add(fileContent);
    
    // Construire l'URL IPFS
    return `ipfs://${result.path}`;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload sur le nœud IPFS d\'Infura:', error);
    throw error;
  }
}

/**
 * Upload un fichier sur IPFS via NFT.Storage
 */
async function uploadToNFTStorage(filePath: string): Promise<string> {
  try {
    const formData = new FormData();
    const content = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    
    formData.append('file', new Blob([content]), fileName);
    
    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`
      },
      body: formData as any
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NFT.Storage error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    return `ipfs://${data.value.cid}`;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload sur NFT.Storage:', error);
    throw error;
  }
}

/**
 * Upload un fichier sur IPFS en essayant plusieurs services
 * @param filePath Chemin du fichier à uploader
 * @returns URL IPFS du fichier
 */
export async function uploadFileToIPFS(filePath: string): Promise<string> {
  try {
    // Si c'est déjà une URL IPFS, on la retourne directement
    if (filePath.startsWith('ipfs://')) {
      console.log(`⚠️ Le fichier est déjà sur IPFS: ${filePath}`);
      return filePath;
    }
    
    // Normaliser le chemin pour les URL relatives
    let normalizedPath = filePath;
    if (filePath.startsWith('/')) {
      normalizedPath = path.join(process.cwd(), 'public', filePath.substring(1));
    } else if (!filePath.startsWith('/') && !filePath.includes('://') && !path.isAbsolute(filePath)) {
      normalizedPath = path.join(process.cwd(), 'public', filePath);
    }
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(normalizedPath)) {
      console.log(`❌ Fichier non trouvé: ${normalizedPath}, chemin original: ${filePath}`);
      throw new Error(`Le fichier ${normalizedPath} n'existe pas`);
    }
    
    console.log(`📤 Upload du fichier ${path.basename(normalizedPath)} vers IPFS (taille: ${(await fs.stat(normalizedPath)).size / 1024} KB)...`);
    
    // Essayer d'uploader avec différents services
    const services = [
      { name: 'NFT.Storage', fn: uploadToNFTStorage },
      { name: 'Pinata', fn: uploadToPinata },
      { name: 'Infura', fn: uploadToInfura }
    ];
    
    let lastError: Error | null = null;
    
    for (const service of services) {
      try {
        console.log(`🔄 Tentative d'upload via ${service.name}...`);
        const ipfsUrl = await service.fn(normalizedPath);
        console.log(`✅ Upload réussi via ${service.name}: ${ipfsUrl}`);
        return ipfsUrl;
      } catch (error) {
        console.error(`❌ Échec de l'upload via ${service.name}:`, error);
        lastError = error as Error;
      }
    }
    
    // Si aucun service n'a fonctionné, fallback vers stockage local
    console.warn("⚠️ Tous les services IPFS ont échoué, stockage local utilisé comme fallback");
    const { filePath: localFilePath, urlPath } = generateLocalFilePath(normalizedPath);
    await fs.ensureDir(path.dirname(localFilePath));
    await fs.copyFile(normalizedPath, localFilePath);
    console.log(`✅ Fichier sauvegardé localement: ${urlPath}`);
    
    return urlPath;
  } catch (error) {
    console.error('❌ Erreur générale lors de l\'upload sur IPFS:', error);
    throw error;
  }
}

/**
 * Upload des métadonnées JSON sur IPFS
 * @param metadata Objet à uploader
 * @returns URL IPFS du fichier JSON
 */
export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  try {
    console.log('📤 Upload des métadonnées vers IPFS...');
    
    // Créer un fichier temporaire
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.ensureDir(tempDir);
    
    const tempFile = path.join(tempDir, `metadata_${Date.now()}.json`);
    await fs.writeFile(tempFile, JSON.stringify(metadata, null, 2));
    
    try {
      // Uploader le fichier sur IPFS
      const ipfsUrl = await uploadFileToIPFS(tempFile);
      
      // Nettoyer le fichier temporaire
      await fs.remove(tempFile);
      
      return ipfsUrl;
    } catch (error) {
      // Nettoyer en cas d'erreur
      await fs.remove(tempFile);
      throw error;
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
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl; // Déjà une URL HTTP ou format non reconnu
  }
  
  const cid = ipfsUrl.replace('ipfs://', '');
  
  // Utiliser une passerelle publique fiable
  // Liste de passerelles alternatives à essayer dans le frontend si nécessaire
  const gateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://ipfs.infura.io/ipfs/${cid}`,
    `https://gateway.ipfs.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`
  ];
  
  return gateways[0]; // Retourner la première option par défaut
}