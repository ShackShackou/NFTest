import { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { alchemyService } from '@/lib/alchemyService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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

export function AlchemyNftList({ onSelectNft }: { onSelectNft: (nft: AlchemyNFT) => void }) {
  const { address, isConnected } = useWallet();
  const [nfts, setNfts] = useState<AlchemyNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger les NFTs de l'utilisateur depuis Alchemy
  useEffect(() => {
    if (isConnected && address) {
      fetchNfts();
    }
  }, [isConnected, address]);

  const fetchNfts = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const ownerNfts = await alchemyService.getNFTsForOwner(address);
      setNfts(ownerNfts);
      
      if (ownerNfts.length === 0) {
        toast({
          title: "Aucun NFT trouvé",
          description: "Vous ne possédez pas encore de NFTs sur ce réseau",
        });
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des NFTs:", err);
      setError(err.message || "Erreur lors du chargement des NFTs");
      toast({
        title: "Erreur",
        description: "Impossible de charger vos NFTs. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 bg-neutral-darker rounded-lg text-center">
        <p className="text-neutral-light mb-4">Connectez-vous pour voir vos NFTs</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-primary">Vos NFTs</h2>
        <Button 
          onClick={fetchNfts} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? "Chargement..." : "Actualiser"}
        </Button>
      </div>
      
      {error && (
        <div className="p-2 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center p-8">
          <p className="text-neutral-light">Chargement de vos NFTs...</p>
        </div>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nfts.map((nft, index) => (
            <div 
              key={`${nft.contract.address}-${nft.id.tokenId}-${index}`}
              className="p-4 bg-neutral-darker rounded-lg border border-neutral-dark/80 hover:border-accent transition-all cursor-pointer"
              onClick={() => onSelectNft(nft)}
            >
              <div className="aspect-square rounded-md overflow-hidden mb-2">
                {nft.media && nft.media.length > 0 ? (
                  <img 
                    src={nft.media[0].gateway} 
                    alt={nft.title || `NFT #${nft.id.tokenId}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = nft.metadata.image || "https://via.placeholder.com/200?text=NFT";
                    }}
                  />
                ) : nft.metadata.image ? (
                  <img 
                    src={nft.metadata.image} 
                    alt={nft.metadata.name || `NFT #${nft.id.tokenId}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/200?text=NFT";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-dark flex items-center justify-center">
                    <span className="text-neutral-light">Image non disponible</span>
                  </div>
                )}
              </div>
              
              <h3 className="font-medium text-white truncate">
                {nft.metadata.name || nft.title || `NFT #${nft.id.tokenId}`}
              </h3>
              
              <div className="mt-1 text-xs text-neutral-light">
                <div className="flex justify-between">
                  <span>Collection:</span>
                  <span className="font-mono">{shortenAddress(nft.contract.address)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Token ID:</span>
                  <span className="font-mono">{nft.id.tokenId}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-3" 
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNft(nft);
                }}
              >
                Gérer ce NFT
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed border-neutral-dark rounded-lg">
          <p className="text-neutral-light mb-4">Aucun NFT trouvé sur ce réseau</p>
          <p className="text-sm text-neutral-light">
            Assurez-vous d'être connecté au bon réseau (Sepolia) ou achetez/mintez un NFT pour commencer.
          </p>
        </div>
      )}
    </div>
  );
}