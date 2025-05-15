import { createConfig } from 'wagmi';
import { sepolia, mainnet, goerli } from 'wagmi/chains';

// Définir les chaînes supportées
export const chains = [sepolia, mainnet, goerli];
export { sepolia, mainnet, goerli };

// Créer une configuration simple pour wagmi
export const config = createConfig({
  chains: [sepolia, mainnet, goerli],
});

// Fonction utilitaire pour vérifier si un réseau est supporté
export const isSupportedNetwork = (chainId?: number): boolean => {
  if (!chainId) return false;
  return chains.some((chain) => chain.id === chainId);
};

// Obtient le nom du réseau à partir du chain ID
export const getNetworkName = (chainId?: number): string => {
  if (!chainId) return 'Réseau inconnu';
  
  const networkMap: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet'
  };
  
  return networkMap[chainId] || `Réseau inconnu (${chainId})`;
};