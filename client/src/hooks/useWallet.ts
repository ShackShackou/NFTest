import { useState, useEffect } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Web3Modal from 'web3modal';

// Type pour stocker les informations du portefeuille connecté
export interface WalletInfo {
  address: string;
  chainId: number;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  network: string;
  isConnected: boolean;
}

// ABI simple pour un contrat NFT
const nftAbi = [
  // Fonction de mint basique
  "function mint(address to) public",
  // Événement emis lors d'un transfert
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Options pour le web3modal
const providerOptions = {};

export const useWallet = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    chainId: 0,
    provider: null,
    signer: null,
    network: '',
    isConnected: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fonction pour se connecter au portefeuille
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si window.ethereum existe (MetaMask installé)
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé. Veuillez l'installer pour continuer.");
      }
      
      // Initialiser Web3Modal
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
        theme: "dark"
      });
      
      // Ouvrir la modale de connexion
      const instance = await web3Modal.connect();
      
      // Créer un provider ethers à partir de l'instance
      const provider = new BrowserProvider(instance);
      
      // Obtenir les comptes
      const accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        throw new Error("Aucun compte autorisé.");
      }
      
      // Obtenir le réseau
      const network = await provider.getNetwork();
      
      // Obtenir le signer
      const signer = await provider.getSigner();
      
      // Stocker les informations du portefeuille
      setWalletInfo({
        address: accounts[0].address,
        chainId: Number(network.chainId),
        provider,
        signer,
        network: network.name,
        isConnected: true
      });
      
      // Événements pour détecter les changements
      instance.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length > 0) {
          // En ethers v6, on doit récupérer le signer à nouveau
          const updatedProvider = new BrowserProvider(instance);
          const updatedSigner = await updatedProvider.getSigner();
          
          setWalletInfo(prev => ({
            ...prev,
            address: accounts[0],
            provider: updatedProvider,
            signer: updatedSigner
          }));
        } else {
          // Déconnecté
          disconnectWallet();
        }
      });
      
      instance.on("chainChanged", async () => {
        // Actualiser le provider
        const newProvider = new BrowserProvider(instance);
        const newNetwork = await newProvider.getNetwork();
        const newSigner = await newProvider.getSigner();
        
        setWalletInfo(prev => ({
          ...prev,
          provider: newProvider,
          signer: newSigner,
          chainId: Number(newNetwork.chainId),
          network: newNetwork.name
        }));
      });
      
    } catch (err: any) {
      console.error("Erreur lors de la connexion au portefeuille:", err);
      setError(err.message || "Erreur lors de la connexion au portefeuille");
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour se déconnecter
  const disconnectWallet = () => {
    // Nettoyer les données
    setWalletInfo({
      address: '',
      chainId: 0,
      provider: null,
      signer: null,
      network: '',
      isConnected: false
    });
  };
  
  // Fonction pour mint un NFT de test
  const mintTestNft = async (contractAddress: string, toAddress?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!walletInfo.signer || !walletInfo.isConnected) {
        throw new Error("Portefeuille non connecté");
      }
      
      // Créer un contrat avec l'ABI
      const nftContract = new ethers.Contract(
        contractAddress,
        nftAbi,
        walletInfo.signer
      );
      
      // Adresse de destination (soit l'adresse fournie, soit l'adresse connectée)
      const recipient = toAddress || walletInfo.address;
      
      // Appeler la fonction mint
      const tx = await nftContract.mint(recipient);
      
      // Attendre la confirmation de la transaction
      const receipt = await tx.wait();
      
      // Trouver l'événement Transfer pour obtenir le tokenId
      const transferEvent = receipt.events?.find(
        (event: any) => event.event === "Transfer"
      );
      
      // Extraire le tokenId si l'événement a été trouvé
      const tokenId = transferEvent?.args?.tokenId?.toString() || "N/A";
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        tokenId
      };
      
    } catch (err: any) {
      console.error("Erreur lors du mint du NFT:", err);
      setError(err.message || "Erreur lors du mint du NFT");
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour demander à changer de réseau
  const switchNetwork = async (chainId: number) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas disponible");
      }
      
      // Demander à changer de réseau
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
      
      return true;
    } catch (err: any) {
      console.error("Erreur lors du changement de réseau:", err);
      setError(err.message || "Erreur lors du changement de réseau");
      return false;
    }
  };
  
  // Fonction pour vérifier si nous sommes sur le réseau de test Goerli
  const isOnGoerliTestnet = () => {
    return walletInfo.chainId === 5; // 5 = Goerli Testnet
  };
  
  // Fonction pour vérifier si nous sommes sur le réseau de test Sepolia
  const isOnSepoliaTestnet = () => {
    return walletInfo.chainId === 11155111; // 11155111 = Sepolia Testnet
  };
  
  // Vérifier automatiquement si un fournisseur est déjà connecté
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const web3Modal = new Web3Modal({
          cacheProvider: true,
          providerOptions
        });
        
        if (web3Modal.cachedProvider) {
          await connectWallet();
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };
    
    checkConnection();
  }, []);
  
  return {
    walletInfo,
    error,
    loading,
    connectWallet,
    disconnectWallet,
    mintTestNft,
    switchNetwork,
    isOnGoerliTestnet,
    isOnSepoliaTestnet
  };
};

// Export the hook
// Keep default export for backward compatibility
export default useWallet;