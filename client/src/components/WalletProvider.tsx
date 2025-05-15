import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

// Interface de base pour l'objet ethereum de MetaMask
interface Ethereum {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  selectedAddress?: string;
  chainId?: string;
}

// Constantes pour les network IDs
const SEPOLIA_CHAIN_ID = 11155111;
const HARDHAT_CHAIN_ID = 31337;

// Contexte pour les données du wallet
interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  balance: string;
  chainId: number | undefined;
  isLoading: boolean;
  error: Error | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  isSepoliaNetwork: boolean;
  isOnSupportedNetwork: boolean;
}

// Déclarer ethereum comme une propriété de window
declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider du wallet utilisant directement ethers.js
export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [balance, setBalance] = useState<string>('0 ETH');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Vérifier si nous sommes sur le réseau Sepolia testnet
  const isSepoliaNetwork = chainId === SEPOLIA_CHAIN_ID;
  const isOnSupportedNetwork = chainId === SEPOLIA_CHAIN_ID || chainId === HARDHAT_CHAIN_ID;
  
  // Vérifier si MetaMask est disponible
  const checkIfMetaMaskIsAvailable = (): boolean => {
    try {
      return typeof window !== 'undefined' && 
             typeof window.ethereum !== 'undefined' &&
             typeof window.ethereum.request === 'function';
    } catch (error) {
      console.error("Erreur lors de la vérification de MetaMask:", error);
      return false;
    }
  };
  
  // Mettre à jour les informations du compte
  const updateAccountInfo = async () => {
    if (!checkIfMetaMaskIsAvailable()) return;
    
    const ethereum = window.ethereum;
    if (!ethereum) {
      console.warn("MetaMask n'est pas accessible");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(ethereum as any);
      
      // Obtenir l'adresse du compte
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      setAddress(currentAddress);
      setIsConnected(true);
      
      // Obtenir le network
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      
      // Obtenir le solde
      const balanceWei = await provider.getBalance(currentAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(`${parseFloat(balanceEth).toFixed(4)} ETH`);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des informations du compte:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Erreur inconnue'));
    }
  };
  
  // Écouter les changements de compte et de réseau
  useEffect(() => {
    if (!checkIfMetaMaskIsAvailable()) {
      console.warn("MetaMask n'est pas disponible");
      return;
    }
    
    const ethereum = window.ethereum;
    if (!ethereum) {
      console.warn("MetaMask n'est pas accessible");
      return;
    }
    
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Utilisateur s'est déconnecté
        setIsConnected(false);
        setAddress(undefined);
      } else {
        // Utilisateur a changé de compte ou s'est connecté
        setAddress(accounts[0]);
        setIsConnected(true);
        updateAccountInfo();
      }
    };
    
    const handleChainChanged = (_chainIdHex: string) => {
      // Le navigateur va se recharger automatiquement lors d'un changement de chaîne
      // Alors ici on met juste à jour les infos
      updateAccountInfo();
    };
    
    // Vérifier l'état initial
    try {
      ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch((err: any) => {
          console.error('Erreur lors de la vérification des comptes:', err);
        });
      
      // Ajouter les écouteurs d'événements
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      
      // Nettoyage lors du démontage
      return () => {
        try {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        } catch (error) {
          console.error("Erreur lors du nettoyage des écouteurs:", error);
        }
      };
    } catch (error) {
      console.error("Erreur lors de l'initialisation des écouteurs MetaMask:", error);
      return () => {};
    }
  }, []);
  
  // Fonction pour connecter le wallet
  const connectWallet = async () => {
    if (!checkIfMetaMaskIsAvailable()) {
      toast({
        title: 'MetaMask non détecté',
        description: 'Veuillez installer MetaMask pour utiliser cette fonctionnalité.',
        variant: 'destructive',
      });
      return;
    }
    
    const ethereum = window.ethereum;
    if (!ethereum) {
      toast({
        title: 'MetaMask non accessible',
        description: 'MetaMask est installé mais n\'est pas accessible. Essayez de rafraîchir la page ou de redémarrer votre navigateur.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Demander à l'utilisateur de se connecter
      await ethereum.request({ method: 'eth_requestAccounts' });
      await updateAccountInfo();
      
      // Si nous arrivons ici, c'est que la connexion a réussi
      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté avec votre portefeuille MetaMask.',
      });
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Erreur inconnue'));
      
      // Formater le message d'erreur pour l'utilisateur
      let errorMessage = err?.message || 'Impossible de se connecter à MetaMask';
      
      // Si l'utilisateur a rejeté la requête
      if (errorMessage.includes('User rejected')) {
        errorMessage = 'La connexion a été rejetée dans MetaMask.';
      }
      
      toast({
        title: 'Erreur de connexion',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour déconnecter le wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(undefined);
    setBalance('0 ETH');
    
    toast({
      title: 'Déconnecté',
      description: 'Vous êtes maintenant déconnecté de l\'application.',
    });
  };
  
  // Valeur du contexte
  const value: WalletContextType = {
    address,
    isConnected,
    balance,
    chainId,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    isSepoliaNetwork,
    isOnSupportedNetwork,
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook pour utiliser les données du wallet
export function useWallet() {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet doit être utilisé à l\'intérieur d\'un WalletProvider');
  }
  
  return context;
}