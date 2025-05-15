import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNftLiveUpdates } from '@/hooks/useNftLiveUpdates';
import { formatDate } from '@/lib/utils';

// Types d'événements en direct
type EventType = 'game_bonus' | 'special_achievement' | 'story_progression' | 'visual_effect' | 'secret_code';

interface LiveEventsTabProps {
  tokenId: number;
  ownerAddress: string;
}

export function LiveEventsTab({ tokenId, ownerAddress }: LiveEventsTabProps) {
  const { toast } = useToast();
  const { isConnected, events } = useNftLiveUpdates(tokenId);
  
  // États pour le formulaire d'événement
  const [eventType, setEventType] = useState<EventType>('game_bonus');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDuration, setEventDuration] = useState('60');
  const [secretCode, setSecretCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fonction pour envoyer un événement en direct
  const sendLiveEvent = async () => {
    if (!eventTitle) {
      toast({
        title: "Erreur",
        description: "Le titre de l'événement est requis",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparer les données de l'événement
      const eventData = {
        type: eventType,
        title: eventTitle,
        description: eventDescription,
        duration: parseInt(eventDuration),
        secretCode: secretCode || undefined,
        startTime: new Date().toISOString()
      };
      
      // Envoyer l'événement au serveur
      const response = await fetch(`/api/events/${tokenId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerAddress,
          eventData
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'événement');
      }
      
      const result = await response.json();
      
      toast({
        title: "Événement envoyé",
        description: "L'événement en direct a été envoyé avec succès à tous les utilisateurs",
      });
      
      // Réinitialiser le formulaire
      setEventTitle('');
      setEventDescription('');
      setSecretCode('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'événement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'événement en direct. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Envoyer un événement en direct</CardTitle>
          <CardDescription>
            Créez des événements spéciaux qui seront envoyés immédiatement à tous les possesseurs du NFT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type d'événement</label>
              <Select
                value={eventType}
                onValueChange={(value: EventType) => setEventType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type d'événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="game_bonus">Bonus de jeu</SelectItem>
                  <SelectItem value="special_achievement">Succès spécial</SelectItem>
                  <SelectItem value="story_progression">Progression d'histoire</SelectItem>
                  <SelectItem value="visual_effect">Effet visuel</SelectItem>
                  <SelectItem value="secret_code">Code secret</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <Input 
                value={eventTitle}
                onChange={e => setEventTitle(e.target.value)}
                placeholder="Titre de l'événement"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                value={eventDescription}
                onChange={e => setEventDescription(e.target.value)}
                placeholder="Description de l'événement"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
              <Input 
                type="number"
                min="1"
                value={eventDuration}
                onChange={e => setEventDuration(e.target.value)}
              />
            </div>
            
            {eventType === 'secret_code' && (
              <div>
                <label className="block text-sm font-medium mb-1">Code secret</label>
                <Input 
                  value={secretCode}
                  onChange={e => setSecretCode(e.target.value)}
                  placeholder="Code secret à déverrouiller"
                />
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                onClick={sendLiveEvent} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer l'événement en direct"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Historique des événements</CardTitle>
          <CardDescription>
            Liste des événements récents envoyés à ce NFT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-neutral-light text-center py-8">
                Aucun événement n'a encore été envoyé
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-neutral-darker/60 rounded-lg border border-neutral-dark/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-primary">
                          {event.type === 'live_event' ? event.data?.title : 'Mise à jour de métadonnées'}
                        </h4>
                        <p className="text-sm text-neutral-light mt-1">
                          {event.type === 'live_event' ? event.data?.description : 'Les métadonnées du NFT ont été mises à jour'}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-light bg-neutral-dark px-2 py-1 rounded">
                        {event.type === 'live_event' ? 'Événement' : 'Métadonnées'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-neutral-light mt-3">
                      Envoyé le {formatDate(new Date(event.timestamp))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-sm text-primary font-medium">
            État de la connexion:
          </p>
          <p className="text-xs text-neutral-light">
            {isConnected 
              ? 'Connecté et prêt à recevoir des événements' 
              : 'Déconnecté du serveur - Reconnexion en cours...'}
          </p>
        </div>
        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
    </div>
  );
}