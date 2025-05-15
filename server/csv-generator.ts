import fs from 'fs-extra';
import path from 'path';

/**
 * Génère un fichier CSV compatible avec NFT.Storage pour les mises à jour de métadonnées
 * Format requis:
 * tokenId,cid
 * 0,bafybeihe5wxegafpf5a73p3l5xxvtdupk4t6vfntyv6hfhhw6svutvh47u
 */
export async function generateNFTStorageCSV(mappings: { tokenId: string; cid: string }[]): Promise<string> {
  // Créer le contenu du CSV
  let csvContent = 'tokenID,cid\n';
  
  for (const { tokenId, cid } of mappings) {
    // S'assurer que le CID ne contient pas 'ipfs://'
    const cleanCid = cid.replace('ipfs://', '');
    csvContent += `${tokenId},${cleanCid}\n`;
  }
  
  // Enregistrer le fichier dans le dossier public pour le rendre accessible
  const csvFileName = `nftstorage-update-${Date.now()}.csv`;
  const csvPath = path.join(process.cwd(), 'public', csvFileName);
  
  await fs.writeFile(csvPath, csvContent, 'utf8');
  console.log(`✅ Fichier CSV créé: ${csvPath}`);
  
  // Retourner le chemin relatif vers le fichier CSV
  return `/${csvFileName}`;
}