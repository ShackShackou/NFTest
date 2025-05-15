// Service de connexion WebSocket pour les NFTs

interface NftWebSocketEvent {
  type: 'metadata_update' | 'live_event' | 'notification';
  tokenId: number;
  data: any;
  timestamp: number;
}

type EventCallback = (event: NftWebSocketEvent) => void;

class NftWebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 2000;
  private isConnecting: boolean = false;

  constructor() {
    this.callbacks.set('metadata_update', new Set());
    this.callbacks.set('live_event', new Set());
    this.callbacks.set('notification', new Set());
    this.callbacks.set('all', new Set());
  }

  /**
   * Établit la connexion WebSocket
   */
  connect(): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket déjà connecté');
      return Promise.resolve(true);
    }

    if (this.isConnecting) {
      console.log('WebSocket connexion en cours...');
      return Promise.resolve(false);
    }

    this.isConnecting = true;

    return new Promise((resolve) => {
      try {
        // Utiliser le protocole approprié en fonction de HTTPS ou HTTP
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log(`Tentative de connexion WebSocket à ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connecté avec succès');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data: NftWebSocketEvent = JSON.parse(event.data);
            console.log('Message WebSocket reçu:', data);
            
            // Notifier les abonnés au type d'événement spécifique
            this.callbacks.get(data.type)?.forEach(callback => callback(data));
            
            // Notifier les abonnés à tous les événements
            this.callbacks.get('all')?.forEach(callback => callback(data));
          } catch (error) {
            console.error('Erreur lors du traitement du message WebSocket:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Erreur WebSocket:', error);
          this.isConnecting = false;
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('WebSocket déconnecté');
          this.isConnecting = false;
          
          // Tentative de reconnexion automatique
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${this.reconnectTimeout / 1000} secondes...`);
            
            setTimeout(() => {
              this.connect();
            }, this.reconnectTimeout);
            
            // Augmenter le délai pour la prochaine tentative
            this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, 10000);
          }
          
          resolve(false);
        };
      } catch (error) {
        console.error('Erreur lors de la création de la connexion WebSocket:', error);
        this.isConnecting = false;
        resolve(false);
      }
    });
  }

  /**
   * S'abonne à un type d'événement
   */
  subscribe(eventType: 'metadata_update' | 'live_event' | 'notification' | 'all', callback: EventCallback) {
    const callbacks = this.callbacks.get(eventType);
    if (callbacks) {
      callbacks.add(callback);
    }
  }

  /**
   * Se désabonne d'un type d'événement
   */
  unsubscribe(eventType: 'metadata_update' | 'live_event' | 'notification' | 'all', callback: EventCallback) {
    const callbacks = this.callbacks.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Envoie un message au serveur
   */
  send(data: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  /**
   * Ferme la connexion
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Vérifie si la connexion est active
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export d'une instance singleton
export const nftWebSocket = new NftWebSocketService();