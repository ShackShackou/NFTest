import { JsonRpcProvider, Wallet, ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Récupérer la clé privée
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("Erreur: La clé privée n'est pas définie dans le .env");
  process.exit(1);
}

// Connect to the Ethereum network
const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/jjtEulBKoXYssHNqKVz8BciDZnWfZWdw");
const wallet = new Wallet(privateKey, provider);

// Récupérer le contrat ABI et bytecode
const contractPath = path.join(process.cwd(), 'artifacts', 'contracts', 'DarthBaterNFT.sol', 'DarthBaterNFT.json');
if (!fs.existsSync(contractPath)) {
  console.error(`Contrat non trouvé: ${contractPath}`);
  console.log("Vous devez d'abord compiler le contrat avec: npx hardhat compile");
  process.exit(1);
}

const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const abi = contractJSON.abi;
const bytecode = contractJSON.bytecode;

async function main() {
  try {
    // Afficher l'adresse du wallet
    const walletAddress = await wallet.getAddress();
    console.log(`Déploiement avec l'adresse: ${walletAddress}`);
    
    // Vérifier le solde
    const balance = await provider.getBalance(walletAddress);
    console.log(`Solde: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.001")) {
      console.error("Solde insuffisant pour déployer le contrat. Vous avez besoin d'au moins 0.001 ETH.");
      process.exit(1);
    }
    
    // Base URI pour les métadonnées
    const baseURI = "https://raw-nfts.replit.app/api/metadata";
    
    // Déployer le contrat
    console.log("Déploiement du contrat DarthBaterNFT...");
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await contractFactory.deploy(baseURI);
    console.log("Transaction de déploiement envoyée, hash:", contract.deploymentTransaction().hash);
    
    // Attendre la confirmation
    console.log("En attente de confirmation...");
    await contract.waitForDeployment();
    
    // Obtenir l'adresse du contrat
    const contractAddress = await contract.getAddress();
    console.log(`\nContrat DarthBaterNFT déployé à l'adresse: ${contractAddress}`);
    
    // Sauvegarde de l'adresse du contrat dans .env
    let envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*\n/, `CONTRACT_ADDRESS=${contractAddress}\n`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync('.env', envContent);
    console.log("Adresse du contrat ajoutée au fichier .env");
    
    console.log("\nPour interagir avec le contrat:");
    console.log(`1. Voir sur Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`2. Minter un NFT: node scripts/mint-direct.mjs`);
    
    return contractAddress;
  } catch (error) {
    console.error("Erreur lors du déploiement:", error);
    return null;
  }
}

main()
  .then((address) => {
    if (address) {
      console.log("Déploiement terminé avec succès!");
    } else {
      console.log("Échec du déploiement.");
    }
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });