import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

// Constantes pour les network IDs
const SEPOLIA_CHAIN_ID = 11155111;

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
  
  // Vérifier si MetaMask est disponible
  const checkIfMetaMaskIsAvailable = (): boolean => {
    return typeof window !== 'undefined' && !!window.ethereum;
  };
  
  // Mettre à jour les informations du compte
  const updateAccountInfo = async () => {
    if (!checkIfMetaMaskIsAvailable()) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
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
    window.ethereum.request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err: any) => {
        console.error('Erreur lors de la vérification des comptes:', err);
      });
    
    // Ajouter les écouteurs d'événements
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Nettoyage lors du démontage
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
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
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Demander à l'utilisateur de se connecter
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await updateAccountInfo();
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Erreur inconnue'));
      
      toast({
        title: 'Erreur de connexion',
        description: err.message || 'Impossible de se connecter à MetaMask',
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