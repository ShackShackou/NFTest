import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/jjtEulBKoXYssHNqKVz8BciDZnWfZWdw");

async function main() {
  try {
    const txHash = "0x3cf231fe0aa363a5887d943954793f5efd8563f6fdd7fe576751031442693d1e";
    console.log(`Vérification de la transaction: ${txHash}`);
    
    // Récupérer les détails de la transaction
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log("Transaction non trouvée.");
      return null;
    }
    
    console.log("Transaction trouvée!");
    console.log("From:", tx.from);
    console.log("To:", tx.to);
    console.log("Valeur:", tx.value.toString());
    console.log("Nonce:", tx.nonce);
    
    // Vérifier si la transaction est confirmée
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      console.log("Transaction pas encore confirmée.");
      return null;
    }
    
    console.log("\nTransaction confirmée!");
    console.log("Statut:", receipt.status === 1 ? "Succès" : "Échec");
    console.log("Bloc:", receipt.blockNumber);
    console.log("Gas utilisé:", receipt.gasUsed.toString());
    
    if (receipt.status === 1 && receipt.contractAddress) {
      console.log("\nContrat déployé à l'adresse:", receipt.contractAddress);
      
      // Mettre à jour le fichier .env avec l'adresse du contrat
      const fs = await import('fs');
      let envContent = fs.readFileSync('.env', 'utf8');
      
      if (envContent.includes('CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(/CONTRACT_ADDRESS=.*\n/, `CONTRACT_ADDRESS=${receipt.contractAddress}\n`);
      } else {
        envContent += `\nCONTRACT_ADDRESS=${receipt.contractAddress}\n`;
      }
      
      fs.writeFileSync('.env', envContent);
      console.log("Adresse du contrat ajoutée au fichier .env");
      
      return receipt.contractAddress;
    } else if (receipt.status === 0) {
      console.log("\nLa transaction a échoué!");
    } else {
      console.log("\nAucune adresse de contrat trouvée dans le reçu.");
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return null;
  }
}

main()
  .then((contractAddress) => {
    if (contractAddress) {
      console.log(`\nVous pouvez maintenant minter un NFT: node scripts/mint-direct.mjs`);
      console.log(`Ou voir le contrat sur Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });