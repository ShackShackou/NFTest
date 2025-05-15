// Script de déploiement pour le contrat DarthBaterNFT
const hre = require("hardhat");

async function main() {
  console.log("Déploiement du contrat DarthBaterNFT...");

  // Base URI pour les métadonnées - utilise l'URL de l'API du serveur
  const baseURI = "http://localhost:5000/api/metadata";

  // Déploiement du contrat
  const DarthBaterNFT = await hre.ethers.getContractFactory("DarthBaterNFT");
  const nftContract = await DarthBaterNFT.deploy(baseURI);

  await nftContract.waitForDeployment();

  const address = await nftContract.getAddress();
  console.log(`Contrat DarthBaterNFT déployé à l'adresse: ${address}`);
  
  // Sauvegarde de l'adresse du contrat
  console.log("Pour interagir avec le contrat, ajoutez l'adresse à votre fichier .env :");
  console.log(`CONTRACT_ADDRESS=${address}`);

  return address;
}

// Exécution du script de déploiement
main()
  .then((address) => {
    console.log("Déploiement terminé avec succès!");
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("Erreur lors du déploiement:", error);
    process.exitCode = 1;
  });