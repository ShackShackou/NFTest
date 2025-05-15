// Initialisation de l'environnement pour les API externes
import { alchemyService } from './alchemyService';

// Fonction pour vérifier si la clé API Alchemy est disponible
export const checkAlchemyKey = async () => {
  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_ALCHEMY_API_KEY n\'est pas défini. Certaines fonctionnalités pourraient ne pas fonctionner correctement.');
    return false;
  }
  
  // Vérifier si la clé est valide en faisant un appel simple
  try {
    const timestamp = await alchemyService.getCurrentBlockTimestamp();
    console.log('Alchemy API connectée avec succès. Timestamp blockchain actuel:', new Date(timestamp * 1000).toLocaleString());
    return true;
  } catch (error) {
    console.error('Erreur lors de la connexion à l\'API Alchemy:', error);
    return false;
  }
};

// Fonction principale d'initialisation
export const initEnvironment = async () => {
  const alchemyConnected = await checkAlchemyKey();
  
  // Ajouter d'autres vérifications d'API ici si nécessaire
  
  return {
    alchemyConnected,
  };
};