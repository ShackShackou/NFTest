// Service d'intégration Alchemy pour la gestion avancée des NFTs

// Types pour les réponses de l'API Alchemy
interface AlchemyNFT {
  contract: {
    address: string;
  };
  id: {
    tokenId: string;
    tokenMetadata: {
      tokenType: string;
    };
  };
  title: string;
  description: string;
  tokenUri: {
    raw: string;
    gateway: string;
  };
  media: {
    raw: string;
    gateway: string;
  }[];
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string;
    }[];
    [key: string]: any;
  };
  timeLastUpdated: string;
}

// Service Alchemy pour les opérations NFT
export class AlchemyService {
  private apiKey: string;
  private baseUrl: string;
  private network: 'sepolia' | 'mainnet';

  constructor(network: 'sepolia' | 'mainnet' = 'sepolia') {
    this.apiKey = import.meta.env.VITE_ALCHEMY_API_KEY || '';
    this.network = network;
    this.baseUrl = network === 'mainnet' 
      ? `https://eth-mainnet.g.alchemy.com/v2/${this.apiKey}`
      : `https://eth-sepolia.g.alchemy.com/v2/${this.apiKey}`;
  }

  // Obtenir tous les NFTs détenus par une adresse
  async getNFTsForOwner(ownerAddress: string): Promise<AlchemyNFT[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/getNFTs?owner=${ownerAddress}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.ownedNfts || [];
    } catch (error) {
      console.error('Error fetching NFTs from Alchemy:', error);
      throw error;
    }
  }

  // Obtenir un NFT spécifique par son adresse de contrat et son tokenId
  async getNFT(contractAddress: string, tokenId: string): Promise<AlchemyNFT | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching NFT from Alchemy:', error);
      throw error;
    }
  }

  // Obtenir tous les NFTs d'une collection spécifique détenus par une adresse
  async getNFTsForOwnerByCollection(ownerAddress: string, contractAddress: string): Promise<AlchemyNFT[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/getNFTs?owner=${ownerAddress}&contractAddresses[]=${contractAddress}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.ownedNfts || [];
    } catch (error) {
      console.error('Error fetching collection NFTs from Alchemy:', error);
      throw error;
    }
  }

  // Vérifier si une adresse possède un NFT spécifique
  async ownsNFT(ownerAddress: string, contractAddress: string, tokenId: string): Promise<boolean> {
    try {
      const nfts = await this.getNFTsForOwnerByCollection(ownerAddress, contractAddress);
      return nfts.some(nft => nft.id.tokenId === tokenId);
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      return false;
    }
  }

  // Obtenir l'historique des transferts d'un NFT
  async getNFTTransfers(contractAddress: string, tokenId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/getAssetTransfers?contractAddress=${contractAddress}&tokenId=${tokenId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transfers || [];
    } catch (error) {
      console.error('Error fetching NFT transfers from Alchemy:', error);
      throw error;
    }
  }

  // Récupérer des données de bloc (utile pour programmer des événements)
  async getBlock(blockNumber: string): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBlockByNumber',
          params: [blockNumber, false],
        }),
      });

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching block from Alchemy:', error);
      throw error;
    }
  }

  // Récupérer le timestamp actuel de la blockchain (utile pour programmer des événements)
  async getCurrentBlockTimestamp(): Promise<number> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBlockByNumber',
          params: ['latest', false],
        }),
      });

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      // Convertir le timestamp hexadécimal en nombre décimal
      const timestamp = parseInt(data.result.timestamp, 16);
      return timestamp;
    } catch (error) {
      console.error('Error fetching current block timestamp from Alchemy:', error);
      throw error;
    }
  }
}

// Créer une instance du service
export const alchemyService = new AlchemyService('sepolia');