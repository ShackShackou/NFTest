import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types d'événements WebSocket
interface WebSocketEvent {
  type: 'metadata_update' | 'live_event' | 'notification';
  tokenId?: number;
  data?: any;
  message?: string;
  timestamp: number;
}

export function useNftLiveUpdates(tokenId?: number) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const { toast } = useToast();

  // Fonction pour se connecter au serveur WebSocket
  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket server at:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        toast({
          title: "Connexion établie",
          description: "Vous recevrez les mises à jour en temps réel de vos NFTs.",
        });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketEvent;
          console.log('WebSocket event received:', data);
          
          // Filtrer les événements par tokenId si spécifié
          if (!tokenId || data.tokenId === tokenId) {
            // Stocker l'événement dans l'historique
            setEvents(prev => [data, ...prev.slice(0, 49)]); // Garder seulement les 50 derniers événements
            setLastEvent(data);
            
            // Afficher une notification pour l'événement
            if (data.type === 'notification' && data.message) {
              toast({
                title: "Notification",
                description: data.message,
              });
            } else if (data.type === 'metadata_update') {
              toast({
                title: "Métadonnées mises à jour",
                description: `NFT #${data.tokenId} a été mis à jour.`,
              });
            } else if (data.type === 'live_event') {
              toast({
                title: "Événement en direct",
                description: `Nouvel événement pour NFT #${data.tokenId}.`,
              });
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter au serveur de mises à jour.",
          variant: "destructive",
        });
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        setIsConnected(false);
        
        // Essayer de se reconnecter après 5 secondes
        setTimeout(() => {
          if (ws.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, 5000);
      };
      
      setSocket(ws);
      
      // Nettoyer la connexion à la désinscription
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      return () => {};
    }
  }, [tokenId, toast]);
  
  // Se connecter au serveur WebSocket au montage du composant
  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);
  
  // Fonction pour envoyer un message au serveur
  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected. Cannot send message.');
    }
  }, [socket]);
  
  return {
    isConnected,
    lastEvent,
    events,
    sendMessage
  };
}