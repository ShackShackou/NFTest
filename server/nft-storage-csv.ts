import { NFTStorage, File } from 'nft.storage';
import fs from 'fs-extra';
import path from 'path';

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
 * Fonction pour uploader un fichier directement sur NFT.Storage
 * Retourne le CID IPFS
 */
export async function uploadFileDirectToNFTStorage(filePath: string): Promise<string> {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error('NFT_STORAGE_API_KEY non définie');
  }

  try {
    console.log(`📤 Upload du fichier: ${filePath}`);
    
    // Normaliser le chemin
    let normalizedPath = filePath;
    if (!path.isAbsolute(filePath)) {
      normalizedPath = path.join(process.cwd(), filePath);
    }

    // Vérifier si le fichier existe
    if (!await fs.pathExists(normalizedPath)) {
      throw new Error(`Le fichier n'existe pas: ${normalizedPath}`);
    }

    // Lire le fichier
    const fileData = await fs.readFile(normalizedPath);
    const fileName = path.basename(normalizedPath);
    
    // Déterminer le type MIME
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (fileName.endsWith('.png')) {
      contentType = 'image/png';
    } else if (fileName.endsWith('.html')) {
      contentType = 'text/html';
    } else if (fileName.endsWith('.json')) {
      contentType = 'application/json';
    }

    // Créer un objet File pour NFT.Storage
    const file = new File([fileData], fileName, { type: contentType });
    
    // Uploader sur NFT.Storage et obtenir le CID
    console.log(`📤 Envoi à NFT.Storage en cours (${(fileData.length / 1024).toFixed(2)} KB)...`);
    const cid = await client.storeBlob(file);
    console.log(`✅ Upload réussi! CID: ${cid}`);
    
    // Retourner l'URL IPFS
    return `ipfs://${cid}`;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload sur NFT.Storage:', error);
    throw error;
  }
}

/**
 * Fonction pour créer un fichier CSV compatible avec NFT.Storage pour les mises à jour de métadonnées
 * Format requis:
 * tokenID,cid
 * 0,bafkreidivzimqfqtoqxkrpge6bjyhlvxqs3rjv5yze7uus7unnbgpyzpce
 * 1,bafkreiaylxpfsgvouqwwqopxvfrqe7qasdyunbgprqp2jkrz37gssstpry
 */
export async function createMetadataUpdateCSV(tokenIdCidMap: Record<string, string>): Promise<string> {
  try {
    console.log('📄 Création du fichier CSV pour mise à jour de métadonnées...');
    
    // Construire le contenu CSV
    let csvContent = 'tokenID,cid\n';
    
    for (const [tokenId, cid] of Object.entries(tokenIdCidMap)) {
      // S'assurer que le CID ne contient pas 'ipfs://'
      const cleanCid = cid.replace('ipfs://', '');
      csvContent += `${tokenId},${cleanCid}\n`;
    }
    
    // Chemin temporaire pour le fichier CSV
    const csvPath = path.join(process.cwd(), 'temp', 'metadata-update.csv');
    
    // Créer le dossier temp s'il n'existe pas
    await fs.ensureDir(path.dirname(csvPath));
    
    // Écrire le fichier CSV
    await fs.writeFile(csvPath, csvContent);
    console.log(`✅ Fichier CSV créé: ${csvPath}`);
    
    return csvPath;
  } catch (error) {
    console.error('❌ Erreur lors de la création du CSV:', error);
    throw error;
  }
}

/**
 * Fonction pour uploader un fichier CSV de mise à jour de métadonnées à NFT.Storage
 */
export async function uploadMetadataUpdateCSV(contractAddress: string, csvPath: string): Promise<string> {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error('NFT_STORAGE_API_KEY non définie');
  }

  try {
    console.log(`📤 Upload du CSV de mise à jour pour le contrat ${contractAddress}...`);
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(csvPath)) {
      throw new Error(`Le fichier CSV n'existe pas: ${csvPath}`);
    }
    
    // Lire le fichier CSV
    const csvData = await fs.readFile(csvPath);
    
    // Créer un objet File pour NFT.Storage
    const file = new File([csvData], 'metadata-update.csv', { type: 'text/csv' });
    
    // Uploader sur NFT.Storage
    console.log(`📤 Envoi du CSV à NFT.Storage...`);
    const cid = await client.storeBlob(file);
    console.log(`✅ Upload du CSV réussi! CID: ${cid}`);
    
    // Construire l'URL pour la mise à jour (format accepté par NFT.Storage)
    const updateUrl = `https://nftstorage.link/ipfs/${cid}`;
    
    return updateUrl;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload du CSV sur NFT.Storage:', error);
    throw error;
  }
}

/**
 * Convertit une URL IPFS en URL HTTP accessible via une passerelle
 */
export function ipfsToHttpUrl(ipfsUrl: string): string {
  if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl || '';
  }
  
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://nftstorage.link/ipfs/${cid}`;
}