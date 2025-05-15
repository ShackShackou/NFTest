import { JsonRpcProvider } from 'ethers';

// Connect to the Ethereum network
const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/jjtEulBKoXYssHNqKVz8BciDZnWfZWdw");

async function main() {
  try {
    // Get block by number
    console.log("Tentative de connexion à Sepolia via Alchemy...");
    const blockNumber = "latest";
    const block = await provider.getBlock(blockNumber);

    console.log("Connexion réussie!");
    console.log("Dernier bloc:", block.number);
    console.log("Hash:", block.hash);
    console.log("Timestamp:", new Date(Number(block.timestamp) * 1000).toLocaleString());
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return false;
  }
}

main()
  .then((success) => {
    if (success) {
      console.log("Test de connexion terminé avec succès!");
    } else {
      console.log("Échec du test de connexion.");
    }
  })
  .catch(console.error);