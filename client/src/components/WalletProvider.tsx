import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from '../lib/walletConfig';
import { useToast } from '@/hooks/use-toast';

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

// Provider du wallet
export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, isPending: isConnectPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Met à jour l'erreur quand il y a un changement
  useEffect(() => {
    if (connectError) {
      setError(connectError);
      toast({
        title: "Erreur de connexion",
        description: connectError.message,
        variant: "destructive"
      });
    }
  }, [connectError, toast]);
  
  // Met à jour le statut de chargement
  useEffect(() => {
    setIsLoading(isConnectPending);
  }, [isConnectPending]);
  
  // Fonction pour connecter le wallet
  const connectWallet = () => {
    try {
      connect({ connector: injected() });
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setError(err instanceof Error ? err : new Error('Erreur de connexion inconnue'));
    }
  };
  
  // Fonction pour déconnecter le wallet
  const disconnectWallet = () => {
    try {
      disconnect();
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
      setError(err instanceof Error ? err : new Error('Erreur de déconnexion inconnue'));
    }
  };
  
  // Vérifie si on est sur le réseau Sepolia
  const isSepoliaNetwork = chainId === sepolia.id;
  
  // Format de l'ETH balance pour l'affichage
  const balance = balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '0 ETH';
    
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
    isSepoliaNetwork
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