import { JsonRpcProvider, Wallet, ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Récupérer les informations nécessaires
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("Erreur: La clé privée n'est pas définie dans le .env");
  process.exit(1);
}

const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  console.error("Erreur: L'adresse du contrat n'est pas définie dans le .env");
  console.log("Ajoutez CONTRACT_ADDRESS=0x... à votre fichier .env");
  process.exit(1);
}

// Connect to the Ethereum network
const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/jjtEulBKoXYssHNqKVz8BciDZnWfZWdw");
const wallet = new Wallet(privateKey, provider);

// Récupérer le contrat ABI
const contractPath = path.join(process.cwd(), 'artifacts', 'contracts', 'DarthBaterNFT.sol', 'DarthBaterNFT.json');
if (!fs.existsSync(contractPath)) {
  console.error(`Contrat non trouvé: ${contractPath}`);
  console.log("Vous devez d'abord compiler le contrat avec: npx hardhat compile");
  process.exit(1);
}

const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const abi = contractJSON.abi;

async function main() {
  try {
    // Afficher l'adresse du wallet
    const walletAddress = await wallet.getAddress();
    console.log(`Interaction avec le wallet: ${walletAddress}`);
    
    // Récupérer le solde
    const balance = await provider.getBalance(walletAddress);
    console.log(`Solde: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.001")) {
      console.error("Solde insuffisant pour minter le NFT. Vous avez besoin d'au moins 0.001 ETH.");
      process.exit(1);
    }
    
    // Créer une instance du contrat
    const nftContract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Minter un NFT
    console.log(`\nPréparation du minting d'un nouveau NFT sur le contrat ${contractAddress}...`);
    const mintTx = await nftContract.mint();
    console.log("Transaction de minting envoyée, hash:", mintTx.hash);
    
    // Attendre la confirmation
    console.log("En attente de confirmation...");
    const receipt = await mintTx.wait();
    console.log("Transaction confirmée dans le bloc:", receipt.blockNumber);
    
    // Récupérer l'ID du token minté depuis les logs
    let tokenId = -1;
    for (const log of receipt.logs) {
      try {
        const parsedLog = nftContract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'NFTMinted') {
          tokenId = parsedLog.args[1]; // deuxième argument de l'événement NFTMinted (tokenId)
          break;
        }
      } catch (e) {
        // Ignorer les logs qu'on ne peut pas parser
      }
    }
    
    if (tokenId !== -1) {
      console.log(`\nNFT minté avec succès! Token ID: ${tokenId}`);
      console.log(`\nVous pouvez voir votre NFT ici:`);
      console.log(`https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`);
      return tokenId;
    } else {
      console.log("\nNFT minté, mais impossible de déterminer l'ID du token.");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors du minting:", error);
    return null;
  }
}

main()
  .then((tokenId) => {
    if (tokenId !== null) {
      console.log("Processus de minting terminé avec succès!");
    } else {
      console.log("Échec du minting.");
    }
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });