import { Network, Alchemy, AssetTransfersCategory } from 'alchemy-sdk';

// Vérifier si la clé API Alchemy est disponible
const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

// Configuration Alchemy
const settings = {
  apiKey: apiKey || 'demo', // Fallback to demo key (limited usage)
  network: Network.ETH_SEPOLIA,
};

let alchemyInstance: Alchemy | null = null;

// Initialiser l'instance d'Alchemy si une clé API est disponible
try {
  if (apiKey) {
    alchemyInstance = new Alchemy(settings);
    console.log('Service Alchemy initialisé avec succès');
  } else {
    console.warn('Pas de clé API Alchemy disponible, certaines fonctionnalités seront limitées');
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation du service Alchemy:', error);
}

export const alchemyService = {
  // Vérifier si le service est prêt
  isReady: () => !!alchemyInstance && !!apiKey,

  // Obtenir l'horodatage du bloc actuel
  getCurrentBlockTimestamp: async () => {
    if (!alchemyInstance) throw new Error('Service Alchemy non initialisé');
    const blockNumber = await alchemyInstance.core.getBlockNumber();
    const block = await alchemyInstance.core.getBlock(blockNumber);
    return block.timestamp;
  },

  // Récupérer tous les NFTs pour une adresse
  getNftsForOwner: async (address: string) => {
    if (!alchemyInstance) throw new Error('Service Alchemy non initialisé');
    try {
      const nfts = await alchemyInstance.nft.getNftsForOwner(address);
      return nfts;
    } catch (error) {
      console.error('Erreur lors de la récupération des NFTs:', error);
      throw error;
    }
  },

  // Récupérer un NFT spécifique
  getNftMetadata: async (contractAddress: string, tokenId: string) => {
    if (!alchemyInstance) throw new Error('Service Alchemy non initialisé');
    try {
      const nft = await alchemyInstance.nft.getNftMetadata(
        contractAddress,
        tokenId
      );
      return nft;
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées NFT:', error);
      throw error;
    }
  },

  // Vérifier la propriété d'un NFT
  isNftOwner: async (address: string, contractAddress: string, tokenId: string) => {
    if (!alchemyInstance) throw new Error('Service Alchemy non initialisé');
    try {
      const owner = await alchemyInstance.nft.getOwnersForNft(contractAddress, tokenId);
      return owner.owners.includes(address.toLowerCase());
    } catch (error) {
      console.error('Erreur lors de la vérification de la propriété du NFT:', error);
      throw error;
    }
  },

  // Récupérer l'historique des transferts pour un NFT
  getNftTransfers: async (contractAddress: string, tokenId: string) => {
    if (!alchemyInstance) throw new Error('Service Alchemy non initialisé');
    try {
      // Utiliser l'API d'événements pour récupérer les transferts
      const transferEvents = await alchemyInstance.core.getLogs({
        address: contractAddress,
        fromBlock: "earliest",
        toBlock: "latest",
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Topic de l'événement Transfer
          null, // from (any)
          null, // to (any)
          null  // tokenId (any)
        ]
      });
      
      // Retourner les logs bruts
      return transferEvents.map(event => ({
        transactionHash: event.transactionHash,
        blockNumber: parseInt(event.blockNumber.toString()),
        topics: event.topics
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts NFT:', error);
      throw error;
    }
  }
};

export default alchemyService;