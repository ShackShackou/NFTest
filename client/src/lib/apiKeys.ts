// Configuration centralisée des clés API
export const apiKeys = {
  // Clé Alchemy (blockchain)
  alchemy: import.meta.env.VITE_ALCHEMY_API_KEY || '',

  // Autres clés API potentielles
  // openSea: import.meta.env.VITE_OPENSEA_API_KEY || '',
  // etherscan: import.meta.env.VITE_ETHERSCAN_API_KEY || '',
};

// Vérifiez si toutes les clés API requises sont disponibles
export const checkApiKeys = () => {
  // Vérification d'Alchemy (obligatoire)
  if (!apiKeys.alchemy) {
    console.warn('⚠️ Aucune clé API Alchemy n\'a été trouvée. Certaines fonctionnalités ne fonctionneront pas correctement.');
    return false;
  }
  
  return true;
};

export default apiKeys;