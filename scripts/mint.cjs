// Script pour mint un nouveau NFT sur le contrat déployé
const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("Adresse du contrat non définie! Ajoutez CONTRACT_ADDRESS à votre fichier .env");
    process.exit(1);
  }
  
  console.log(`Préparation du minting d'un nouveau NFT sur le contrat ${contractAddress}...`);

  // Récupérer le contrat
  const DarthBaterNFT = await hre.ethers.getContractFactory("DarthBaterNFT");
  const nftContract = DarthBaterNFT.attach(contractAddress);

  // Récupérer l'adresse du signataire
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Adresse du wallet qui va recevoir le NFT: ${deployer.address}`);

  // Mint un nouveau NFT
  console.log("Minting du NFT en cours...");
  const transaction = await nftContract.mint();
  await transaction.wait();

  console.log("NFT minté avec succès!");
  
  // Récupérer le nouvel ID du token
  const tokenId = await nftContract._nextTokenId() - 1n;
  console.log(`Nouvel ID de token: ${tokenId}`);
  
  // Afficher les informations sur OpenSea testnet
  console.log("\nVous pouvez voir votre NFT sur OpenSea Testnet :");
  console.log(`https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`);
}

// Exécution du script de minting
main()
  .then(() => {
    console.log("Processus de minting terminé avec succès!");
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("Erreur lors du minting:", error);
    process.exitCode = 1;
  });