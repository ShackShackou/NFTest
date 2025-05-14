const { ethers } = require("hardhat");

async function main() {
  // URL de base pour les métadonnées des NFTs
  const baseTokenURI = "https://nft-darthbater.replit.app/api/nfts";
  
  console.log("Déploiement du contrat DarthBaterNFT...");
  
  // Déploiement du contrat
  const DarthBaterNFT = await ethers.getContractFactory("DarthBaterNFT");
  const darthBaterNFT = await DarthBaterNFT.deploy(baseTokenURI);
  
  await darthBaterNFT.waitForDeployment();
  
  const address = await darthBaterNFT.getAddress();
  console.log(`Contrat DarthBaterNFT déployé à l'adresse: ${address}`);
}

// Exécution du script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });