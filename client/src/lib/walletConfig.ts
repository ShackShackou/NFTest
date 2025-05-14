import { createConfig, http } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';

// Configuration pour les réseaux que nous supportons
export const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

export { sepolia, mainnet };