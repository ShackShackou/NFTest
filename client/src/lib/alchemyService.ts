import { Network, Alchemy } from 'alchemy-sdk';

// Vérifier si la clé API Alchemy est disponible depuis l'environnement Vite
const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

// Configuration Alchemy
const settings = {
  apiKey: apiKey || '', // Si pas de clé, ça échouera proprement
  network: Network.ETH_SEPOLIA,
};

// Variable pour l'instance Alchemy
let alchemyInstance: Alchemy | null = null;

// Fonction pour obtenir l'instance Alchemy (lazy initialization)
const getAlchemyInstance = (): Alchemy | null => {
  if (!apiKey) {
    console.warn("Pas de clé API Alchemy disponible");
    return null;
  }
  
  if (!alchemyInstance) {
    try {
      alchemyInstance = new Alchemy(settings);
      console.log("Service Alchemy initialisé");
    } catch (error) {
      console.error("Erreur lors de l'initialisation d'Alchemy:", error);
      return null;
    }
  }
  
  return alchemyInstance;
};

// Service Alchemy avec gestion des erreurs
export const alchemyService = {
  // Vérifier si le service est prêt
  isReady: (): boolean => {
    return !!apiKey && !!getAlchemyInstance();
  },

  // Obtenir l'horodatage du bloc actuel (utile pour vérifier la connexion)
  getCurrentBlockTimestamp: async (): Promise<number> => {
    const alchemy = getAlchemyInstance();
    if (!alchemy) throw new Error('Service Alchemy non initialisé');
    
    try {
      const blockNumber = await alchemy.core.getBlockNumber();
      const block = await alchemy.core.getBlock(blockNumber);
      return block.timestamp;
    } catch (error) {
      console.error("Erreur lors de la récupération du timestamp:", error);
      throw error;
    }
  },

  // Récupérer tous les NFTs pour une adresse
  getNftsForOwner: async (address: string) => {
    const alchemy = getAlchemyInstance();
    if (!alchemy) throw new Error('Service Alchemy non initialisé');
    
    try {
      return await alchemy.nft.getNftsForOwner(address);
    } catch (error) {
      console.error("Erreur lors de la récupération des NFTs:", error);
      throw error;
    }
  },

  // Récupérer un NFT spécifique
  getNftMetadata: async (contractAddress: string, tokenId: string) => {
    const alchemy = getAlchemyInstance();
    if (!alchemy) throw new Error('Service Alchemy non initialisé');
    
    try {
      return await alchemy.nft.getNftMetadata(contractAddress, tokenId);
    } catch (error) {
      console.error("Erreur lors de la récupération des métadonnées NFT:", error);
      throw error;
    }
  },

  // Vérifier la propriété d'un NFT
  isNftOwner: async (address: string, contractAddress: string, tokenId: string) => {
    const alchemy = getAlchemyInstance();
    if (!alchemy) throw new Error('Service Alchemy non initialisé');
    
    try {
      const owner = await alchemy.nft.getOwnersForNft(contractAddress, tokenId);
      return owner.owners.includes(address.toLowerCase());
    } catch (error) {
      console.error("Erreur lors de la vérification de la propriété du NFT:", error);
      throw error;
    }
  }
};

export default alchemyService;