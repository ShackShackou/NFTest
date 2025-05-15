import { createClient, http } from "viem";
import { createConfig } from "wagmi";
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from "wagmi/connectors";

export { sepolia } from 'wagmi/chains';

// ID du projet WalletConnect (utilisez celui de hardhat pour le développement)
const projectId = 'YOUR_WALLET_CONNECT_PROJECT_ID';

// Créez la configuration Wagmi
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId })
  ],
  transports: {
    [sepolia.id]: http(),
  },
});

// Configuration pour le client Viem
export const client = createClient({
  chain: sepolia,
  transport: http(),
});

// Setup l'environnement pour le développement
if (!import.meta.env.VITE_ALCHEMY_API_KEY) {
  console.warn('VITE_ALCHEMY_API_KEY n\'est pas défini dans l\'environnement.');
};

// Configuration pour le contrat NFT
export const contractAddress = "0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656";