const { ethers } = require("hardhat");

async function main() {
  // URL de base pour les métadonnées des NFTs (URL de l'API pour récupérer les métadonnées)
  const baseTokenURI = "https://nft-darthbater.replit.app/api/nfts";
  
  console.log("Déploiement du contrat DarthBaterNFT...");
  const network = await ethers.provider.getNetwork();
  console.log("Réseau utilisé:", network.name);
  
  // Récupérer le compte du déployeur
  const [deployer] = await ethers.getSigners();
  console.log(`Compte du déployeur: ${deployer.address}`);
  
  // Récupérer le solde du compte
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Solde du compte: ${ethers.formatEther(balance)} ETH`);
  
  // Déploiement du contrat
  const DarthBaterNFT = await ethers.getContractFactory("DarthBaterNFT");
  console.log("Création de l'instance du contrat...");
  
  const darthBaterNFT = await DarthBaterNFT.deploy(baseTokenURI);
  console.log("Transaction envoyée, en attente de confirmation...");
  
  await darthBaterNFT.waitForDeployment();
  
  const address = await darthBaterNFT.getAddress();
  console.log(`Contrat DarthBaterNFT déployé avec succès à l'adresse: ${address}`);
  console.log("Veuillez noter cette adresse pour la configuration du frontend");
  
  // Ajouter un délai pour s'assurer que la blockchain a bien indexé le contrat
  console.log("Attente de 5 secondes pour l'indexation...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log("Vous pouvez maintenant utiliser cette adresse dans votre fichier contractConfig.ts");
}

// Exécution du script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur pendant le déploiement:", error);
    process.exit(1);
  });