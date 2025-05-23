import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/components/WalletProvider';
import { AlchemyNftList } from '@/components/AlchemyNftList';
import { LiveEventsTab } from '@/components/LiveEventsTab';
import { alchemyService } from '@/lib/alchemyService';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { shortenAddress } from '@/lib/utils';

// Type pour les NFTs Alchemy
interface AlchemyNFT {
  contract: {
    address: string;
  };
  id: {
    tokenId: string;
    tokenMetadata: {
      tokenType: string;
    };
  };
  title: string;
  description: string;
  tokenUri?: {
    raw: string;
    gateway: string;
  };
  media: {
    raw: string;
    gateway: string;
  }[];
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string;
    }[];
    [key: string]: any;
  };
  timeLastUpdated: string;
}

// Types pour les métadonnées du NFT
interface NFTMetadata {
  id: number;
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  lastUpdated: Date;
  updateFrequency?: number; // en minutes
  nextUpdateTime?: Date;
}

// Types pour les événements programmés
interface ScheduledEvent {
  id: number;
  tokenId: number;
  contractAddress: string;
  eventType: 'attribute_change' | 'image_change' | 'animation_change' | 'description_change';
  scheduledTime: Date;
  newValue: string;
  completed: boolean;
}

export default function AdminPage() {
  const { toast } = useToast();
  const { address, isConnected, isSepoliaNetwork } = useWallet();
  
  // Adresse du propriétaire du NFT (à remplacer par votre adresse réelle)
  const ownerAddress = "0x97004E87AeEe1C25814Ec736FcbB21AdCc010F52";
  
  // Vérification si l'utilisateur connecté est le propriétaire
  const isOwner = isConnected && address?.toLowerCase() === ownerAddress.toLowerCase();
  
  // États
  const [selectedNFT, setSelectedNFT] = useState<AlchemyNFT | null>(null);
  const [blockTimestamp, setBlockTimestamp] = useState<number | null>(null);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata[]>([
    {
      id: 42,
      name: "DARTHBATER #42",
      description: "Un NFT interactif avec mini-jeu intégré",
      image: "https://gateway.pinata.cloud/ipfs/QmYDm8Bzye4RMS5RZPwqRNz9ZRUvk2bciF7VYjwdgXCFm8",
      animation_url: "https://nft-darthbater.replit.app/interactive/42",
      attributes: [
        { trait_type: "Base", value: "Pixel" },
        { trait_type: "Style", value: "Rétro" },
        { trait_type: "Level", value: "1" }
      ],
      lastUpdated: new Date(),
      updateFrequency: 0, // 0 = pas de mise à jour automatique
    }
  ]);
  
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);
  const [newEventType, setNewEventType] = useState<'attribute_change' | 'image_change' | 'animation_change' | 'description_change'>('description_change');
  const [newEventValue, setNewEventValue] = useState('');
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [updateInterval, setUpdateInterval] = useState(5); // en minutes
  const [isLoadingBlock, setIsLoadingBlock] = useState(false);
  
  // Conversion d'un NFT Alchemy en NFTMetadata
  const convertAlchemyNFTtoMetadata = (nft: AlchemyNFT): NFTMetadata => {
    return {
      id: parseInt(nft.id.tokenId),
      name: nft.metadata.name || nft.title || `NFT #${nft.id.tokenId}`,
      description: nft.metadata.description || nft.description || "",
      image: nft.metadata.image || (nft.media && nft.media.length > 0 ? nft.media[0].gateway : ""),
      animation_url: nft.metadata.animation_url,
      attributes: nft.metadata.attributes || [],
      lastUpdated: new Date(nft.timeLastUpdated),
      updateFrequency: 0,
    };
  };
  
  // Sélection d'un NFT Alchemy
  const handleSelectNft = (nft: AlchemyNFT) => {
    setSelectedNFT(nft);
    
    // Convertir en métadonnées locales
    const metadata = convertAlchemyNFTtoMetadata(nft);
    
    // Ajouter ou mettre à jour les métadonnées locales
    setNftMetadata(prev => {
      const existingIndex = prev.findIndex(n => n.id === parseInt(nft.id.tokenId));
      if (existingIndex >= 0) {
        return prev.map((n, i) => i === existingIndex ? { ...n, ...metadata } : n);
      } else {
        return [...prev, metadata];
      }
    });
    
    toast({
      title: "NFT sélectionné",
      description: `${nft.metadata.name || nft.title || `NFT #${nft.id.tokenId}`} a été sélectionné pour édition.`,
    });
  };
  
  // Chargement du timestamp actuel de la blockchain
  const fetchCurrentBlockTimestamp = async () => {
    setIsLoadingBlock(true);
    try {
      const timestamp = await alchemyService.getCurrentBlockTimestamp();
      setBlockTimestamp(timestamp);
      toast({
        title: "Synchronisé avec la blockchain",
        description: `Timestamp actuel: ${new Date(timestamp * 1000).toLocaleString()}`,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du timestamp:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le timestamp actuel de la blockchain",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBlock(false);
    }
  };
  
  // Chargement initial des métadonnées
  useEffect(() => {
    fetchCurrentBlockTimestamp();
    
    // Rafraîchir le timestamp toutes les minutes
    const interval = setInterval(fetchCurrentBlockTimestamp, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Minuterie pour les mises à jour automatiques
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      // Vérifier les événements programmés
      setScheduledEvents(prev => 
        prev.map(event => {
          if (!event.completed && new Date(event.scheduledTime) <= now) {
            // Exécuter l'événement
            executeScheduledEvent(event);
            return { ...event, completed: true };
          }
          return event;
        })
      );
      
      // Vérifier les mises à jour automatiques des NFTs
      nftMetadata.forEach(nft => {
        if (nft.updateFrequency && nft.updateFrequency > 0 && nft.nextUpdateTime && new Date(nft.nextUpdateTime) <= now) {
          // Effectuer une mise à jour automatique
          updateNFTRandomly(nft.id);
        }
      });
    }, 10000); // Vérifier toutes les 10 secondes
    
    return () => clearInterval(timer);
  }, [nftMetadata, scheduledEvents]);
  
  // Fonction pour mettre à jour les métadonnées d'un NFT
  const updateNFTMetadata = async (id: number, updates: Partial<NFTMetadata>) => {
    // Mettre à jour localement
    setNftMetadata(prev => 
      prev.map(nft => 
        nft.id === id 
          ? { 
              ...nft, 
              ...updates, 
              lastUpdated: new Date(),
              nextUpdateTime: nft.updateFrequency && nft.updateFrequency > 0 
                ? new Date(Date.now() + nft.updateFrequency * 60 * 1000) 
                : undefined
            } 
          : nft
      )
    );
    
    // Si un NFT Alchemy est sélectionné et correspond à l'ID
    if (selectedNFT && parseInt(selectedNFT.id.tokenId) === id) {
      try {
        // Envoyer les mises à jour au serveur
        const response = await fetch(`/api/metadata/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerAddress: address,
            metadata: updates,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour des métadonnées sur le serveur');
        }
        
        toast({
          title: "Métadonnées mises à jour",
          description: `Le NFT #${id} a été mis à jour avec succès`,
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour des métadonnées:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la mise à jour des métadonnées sur le serveur. Les modifications sont uniquement locales.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Métadonnées mises à jour localement",
        description: `Le NFT #${id} a été mis à jour localement`,
      });
    }
  };
  
  // Mise à jour aléatoire pour la démo
  const updateNFTRandomly = (id: number) => {
    const levels = ['1', '2', '3', '4', '5'];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    
    const nft = nftMetadata.find(n => n.id === id);
    if (!nft) return;
    
    // Mettre à jour un attribut aléatoirement
    const updatedAttributes = nft.attributes.map(attr => 
      attr.trait_type === 'Level' ? { ...attr, value: randomLevel } : attr
    );
    
    updateNFTMetadata(id, { 
      attributes: updatedAttributes,
      description: `Un NFT interactif avec mini-jeu intégré - Mis à jour automatiquement au niveau ${randomLevel}!`
    });
  };
  
  // Exécuter un événement programmé
  const executeScheduledEvent = (event: ScheduledEvent) => {
    const nft = nftMetadata.find(n => n.id === event.tokenId);
    if (!nft) return;
    
    switch (event.eventType) {
      case 'description_change':
        updateNFTMetadata(event.tokenId, { description: event.newValue });
        break;
      case 'image_change':
        updateNFTMetadata(event.tokenId, { image: event.newValue });
        break;
      case 'animation_change':
        updateNFTMetadata(event.tokenId, { animation_url: event.newValue });
        break;
      case 'attribute_change':
        const [trait, value] = event.newValue.split(':');
        const updatedAttributes = nft.attributes.map(attr => 
          attr.trait_type === trait ? { ...attr, value } : attr
        );
        updateNFTMetadata(event.tokenId, { attributes: updatedAttributes });
        break;
    }
    
    toast({
      title: "Événement exécuté",
      description: `L'événement programmé pour le NFT #${event.tokenId} a été exécuté`,
    });
  };
  
  // Programmer un nouvel événement
  const scheduleNewEvent = () => {
    if (!selectedNFT) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un NFT",
        variant: "destructive"
      });
      return;
    }
    
    // Valider les entrées
    if (newEventType === 'attribute_change' && (!newAttributeKey || !newAttributeValue)) {
      toast({
        title: "Erreur",
        description: "Veuillez spécifier la clé et la valeur de l'attribut",
        variant: "destructive"
      });
      return;
    }
    
    if (newEventType !== 'attribute_change' && !newEventValue) {
      toast({
        title: "Erreur",
        description: "Veuillez spécifier une valeur pour l'événement",
        variant: "destructive"
      });
      return;
    }
    
    // Créer le nouvel événement
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + updateInterval * 60 * 1000);
    
    const newEvent: ScheduledEvent = {
      id: Date.now(), // utiliser timestamp comme ID unique
      tokenId: parseInt(selectedNFT.id.tokenId),
      contractAddress: selectedNFT.contract.address,
      eventType: newEventType,
      scheduledTime,
      newValue: newEventType === 'attribute_change' 
        ? `${newAttributeKey}:${newAttributeValue}` 
        : newEventValue,
      completed: false
    };
    
    setScheduledEvents(prev => [...prev, newEvent]);
    
    // Réinitialiser les champs
    setNewEventValue('');
    setNewAttributeKey('');
    setNewAttributeValue('');
    
    toast({
      title: "Événement programmé",
      description: `Un nouvel événement a été programmé pour le NFT #${selectedNFT.id.tokenId} à ${scheduledTime.toLocaleTimeString()}`,
    });
  };
  
  // Activer/désactiver les mises à jour automatiques
  const toggleAutoUpdates = (id: number, enabled: boolean, frequency: number = 5) => {
    setNftMetadata(prev => 
      prev.map(nft => 
        nft.id === id 
          ? { 
              ...nft, 
              updateFrequency: enabled ? frequency : 0,
              nextUpdateTime: enabled 
                ? new Date(Date.now() + frequency * 60 * 1000) 
                : undefined
            } 
          : nft
      )
    );
    
    toast({
      title: enabled ? "Mises à jour automatiques activées" : "Mises à jour automatiques désactivées",
      description: enabled 
        ? `Le NFT #${id} sera mis à jour toutes les ${frequency} minutes` 
        : `Les mises à jour automatiques ont été désactivées pour le NFT #${id}`,
    });
  };
  
  // Si l'utilisateur n'est pas le propriétaire, afficher un message d'erreur
  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Accès refusé</CardTitle>
            <CardDescription>
              Cette page est réservée au propriétaire du contrat NFT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-light">
              Veuillez vous connecter avec le wallet propriétaire du contrat pour accéder à l'interface d'administration.
            </p>
            <p className="mt-4 text-sm text-neutral-light">
              Adresse du propriétaire: <span className="font-mono">{shortenAddress(ownerAddress)}</span>
            </p>
            {isConnected && (
              <p className="text-sm text-neutral-light mt-2">
                Votre adresse: <span className="font-mono">{shortenAddress(address || '')}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-pixel text-primary mb-6">
        Console <span className="text-accent">Admin</span>
      </h1>
      <p className="text-neutral-light mb-4">
        Gérez vos NFTs à distance et programmez des événements automatiques
      </p>
      
      {blockTimestamp && (
        <div className="mb-6 p-3 bg-neutral-darker rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-light">
              Heure blockchain: <span className="text-white">{new Date(blockTimestamp * 1000).toLocaleString()}</span>
            </p>
            <p className="text-xs text-neutral-light mt-1">
              Synchronisé avec le réseau {isSepoliaNetwork ? 'Sepolia' : 'Ethereum'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchCurrentBlockTimestamp}
            disabled={isLoadingBlock}
          >
            {isLoadingBlock ? "Synchronisation..." : "Synchroniser"}
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Vos NFTs</CardTitle>
              <CardDescription>
                Sélectionnez un NFT pour le gérer à distance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlchemyNftList onSelectNft={handleSelectNft} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-7">
          {selectedNFT ? (
            <Tabs defaultValue="metadata" className="mt-0">
              <TabsList className="w-full">
                <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
                <TabsTrigger value="scheduled">Événements programmés</TabsTrigger>
                <TabsTrigger value="auto">Mises à jour automatiques</TabsTrigger>
                <TabsTrigger value="live">Événements en direct</TabsTrigger>
              </TabsList>
              
              {/* Onglet des métadonnées */}
              <TabsContent value="metadata">
                <Card>
                  <CardHeader>
                    <CardTitle>Modifier les métadonnées</CardTitle>
                    <CardDescription>
                      Ces changements seront appliqués immédiatement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {nftMetadata
                      .filter(nft => nft.id === parseInt(selectedNFT.id.tokenId))
                      .map(nft => (
                        <div key={nft.id} className="space-y-4">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-24 h-24 rounded-md overflow-hidden">
                              <img 
                                src={nft.image} 
                                alt={nft.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://via.placeholder.com/200?text=NFT";
                                }}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-primary">{nft.name}</h3>
                              <p className="text-xs text-neutral-light mt-1">
                                Collection: <span className="font-mono">{shortenAddress(selectedNFT.contract.address)}</span>
                              </p>
                              <p className="text-xs text-neutral-light mt-1">
                                Token ID: <span className="font-mono">{selectedNFT.id.tokenId}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Nom</label>
                            <Input 
                              value={nft.name} 
                              onChange={e => updateNFTMetadata(nft.id, { name: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea 
                              value={nft.description} 
                              onChange={e => updateNFTMetadata(nft.id, { description: e.target.value })}
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">URL de l'image</label>
                            <Input 
                              value={nft.image} 
                              onChange={e => updateNFTMetadata(nft.id, { image: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">URL d'animation (HTML interactif)</label>
                            <Input 
                              value={nft.animation_url || ''} 
                              onChange={e => updateNFTMetadata(nft.id, { animation_url: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Attributs</label>
                            <div className="space-y-2">
                              {nft.attributes.map((attr, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <Input 
                                    value={attr.trait_type} 
                                    onChange={e => {
                                      const newAttributes = [...nft.attributes];
                                      newAttributes[idx].trait_type = e.target.value;
                                      updateNFTMetadata(nft.id, { attributes: newAttributes });
                                    }}
                                    className="w-1/2"
                                  />
                                  <Input 
                                    value={attr.value} 
                                    onChange={e => {
                                      const newAttributes = [...nft.attributes];
                                      newAttributes[idx].value = e.target.value;
                                      updateNFTMetadata(nft.id, { attributes: newAttributes });
                                    }}
                                    className="w-1/2"
                                  />
                                  <Button 
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const newAttributes = nft.attributes.filter((_, i) => i !== idx);
                                      updateNFTMetadata(nft.id, { attributes: newAttributes });
                                    }}
                                  >
                                    Supprimer
                                  </Button>
                                </div>
                              ))}
                              
                              <Button
                                variant="outline"
                                onClick={() => {
                                  const newAttributes = [...nft.attributes, { trait_type: '', value: '' }];
                                  updateNFTMetadata(nft.id, { attributes: newAttributes });
                                }}
                              >
                                Ajouter un attribut
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-neutral-light">
                              Dernière mise à jour: {nft.lastUpdated.toLocaleString()}
                            </p>
                            {nft.nextUpdateTime && (
                              <p className="text-sm text-neutral-light">
                                Prochaine mise à jour automatique: {nft.nextUpdateTime.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Onglet des événements programmés */}
              <TabsContent value="scheduled">
                <Card>
                  <CardHeader>
                    <CardTitle>Programmer des événements</CardTitle>
                    <CardDescription>
                      Planifiez des modifications automatiques de vos NFTs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Nouvel événement</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Type d'événement</label>
                          <Select
                            value={newEventType}
                            onValueChange={(value: any) => setNewEventType(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type d'événement" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="description_change">Changer la description</SelectItem>
                              <SelectItem value="image_change">Changer l'image</SelectItem>
                              <SelectItem value="animation_change">Changer l'animation URL</SelectItem>
                              <SelectItem value="attribute_change">Modifier un attribut</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {newEventType === 'attribute_change' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium mb-1">Attribut</label>
                              <Input 
                                value={newAttributeKey}
                                onChange={e => setNewAttributeKey(e.target.value)}
                                placeholder="ex: Level"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Valeur</label>
                              <Input 
                                value={newAttributeValue}
                                onChange={e => setNewAttributeValue(e.target.value)}
                                placeholder="ex: 5"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium mb-1">Nouvelle valeur</label>
                            <Input 
                              value={newEventValue}
                              onChange={e => setNewEventValue(e.target.value)}
                              placeholder={
                                newEventType === 'description_change' 
                                  ? "Nouvelle description" 
                                  : newEventType === 'image_change' 
                                    ? "URL de la nouvelle image" 
                                    : "URL de la nouvelle animation"
                              }
                            />
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Délai (minutes)</label>
                          <div className="flex gap-2">
                            <Input 
                              type="number" 
                              min="1"
                              value={updateInterval}
                              onChange={e => setUpdateInterval(Number(e.target.value))}
                            />
                            <Button onClick={scheduleNewEvent}>Programmer</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">Événements programmés</h3>
                    {scheduledEvents.length === 0 ? (
                      <p className="text-neutral-light">Aucun événement programmé</p>
                    ) : (
                      <Table>
                        <TableCaption>Liste des événements programmés</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>NFT</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Heure prévue</TableHead>
                            <TableHead>État</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scheduledEvents
                            .filter(event => selectedNFT ? event.tokenId === parseInt(selectedNFT.id.tokenId) : true)
                            .map(event => (
                              <TableRow key={event.id}>
                                <TableCell>#{event.tokenId}</TableCell>
                                <TableCell>
                                  {event.eventType === 'description_change' 
                                    ? 'Description' 
                                    : event.eventType === 'image_change' 
                                      ? 'Image' 
                                      : event.eventType === 'animation_change' 
                                        ? 'Animation URL' 
                                        : `Attribut (${event.newValue.split(':')[0]})`
                                  }
                                </TableCell>
                                <TableCell>{new Date(event.scheduledTime).toLocaleString()}</TableCell>
                                <TableCell>
                                  {event.completed 
                                    ? <span className="text-green-500">Exécuté</span> 
                                    : <span className="text-yellow-500">En attente</span>
                                  }
                                </TableCell>
                                <TableCell>
                                  {!event.completed && (
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => setScheduledEvents(prev => prev.filter(e => e.id !== event.id))}
                                    >
                                      Annuler
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Onglet des mises à jour automatiques */}
              <TabsContent value="auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Mises à jour automatiques</CardTitle>
                    <CardDescription>
                      Configurez des mises à jour périodiques pour votre NFT
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {nftMetadata
                      .filter(nft => nft.id === parseInt(selectedNFT.id.tokenId))
                      .map(nft => (
                        <div key={nft.id} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="auto-updates"
                              checked={nft.updateFrequency ? nft.updateFrequency > 0 : false}
                              onChange={e => toggleAutoUpdates(nft.id, e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="auto-updates" className="text-sm font-medium">
                              Activer les mises à jour automatiques
                            </label>
                          </div>
                          
                          {(nft.updateFrequency && nft.updateFrequency > 0) && (
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Fréquence des mises à jour (minutes)
                              </label>
                              <div className="flex gap-2">
                                <Input 
                                  type="number" 
                                  min="1"
                                  value={nft.updateFrequency}
                                  onChange={e => toggleAutoUpdates(nft.id, true, Number(e.target.value))}
                                  className="w-32"
                                />
                                <Button 
                                  onClick={() => updateNFTRandomly(nft.id)}
                                  variant="outline"
                                >
                                  Mettre à jour maintenant
                                </Button>
                              </div>
                              
                              {nft.nextUpdateTime && (
                                <p className="text-sm text-neutral-light mt-2">
                                  Prochaine mise à jour: {nft.nextUpdateTime.toLocaleString()}
                                </p>
                              )}
                              
                              <div className="mt-4 p-4 bg-neutral-darker/60 rounded-lg">
                                <h4 className="text-md font-medium mb-2">Comportement des mises à jour automatiques</h4>
                                <p className="text-sm text-neutral-light">
                                  Les mises à jour automatiques modifieront aléatoirement l'attribut "Level" du NFT 
                                  et mettront à jour la description avec le nouveau niveau.
                                </p>
                                <p className="text-sm text-neutral-light mt-2">
                                  Cette fonctionnalité permet de garder votre NFT dynamique et évolutif au fil du temps.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-neutral-light">
                      Note: Pour une application en production, ces modifications seraient synchronisées avec un serveur 
                      et appliquées à tous les NFTs grâce à la mise à jour des métadonnées.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Onglet des événements en direct */}
              <TabsContent value="live">
                <LiveEventsTab 
                  tokenId={parseInt(selectedNFT.id.tokenId)} 
                  ownerAddress={address || ''}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Gestion des NFTs</CardTitle>
                <CardDescription>
                  Sélectionnez un NFT dans la liste pour commencer à le gérer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 border border-dashed border-neutral-dark rounded-lg">
                  <p className="text-neutral-light mb-4">
                    Utilisez l'API Alchemy pour gérer vos NFTs à distance
                  </p>
                  <p className="text-sm text-neutral-light">
                    Cette interface vous permet de contrôler vos NFTs même après leur vente,
                    en programmant des événements et des mises à jour automatiques.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}