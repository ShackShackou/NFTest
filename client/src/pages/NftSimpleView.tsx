import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function NftSimpleView() {
  const [nft, setNft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Récupérer les données du NFT
    const fetchNft = async () => {
      try {
        const response = await fetch('/api/nfts/42');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("NFT data:", data);
        setNft(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement du NFT:", err);
        setError(err.message || "Erreur inconnue");
        toast({
          title: "Erreur de chargement",
          description: err.message || "Impossible de charger les données du NFT",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNft();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
        <p>Chargement du NFT S.H.A.C.K.E.R. #01...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
        <div className="bg-red-900/50 rounded-lg p-4 mb-4 max-w-md">
          <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">{nft?.name || "S.H.A.C.K.E.R. #01"}</h1>
      
      <div className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden shadow-xl">
        <div className="relative aspect-square w-full">
          <img 
            src={nft?.image || "/images/shacker01.jpg"}
            alt={nft?.name || "S.H.A.C.K.E.R. #01"}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Erreur de chargement de l'image:", e);
              e.currentTarget.src = "images/shacker01.jpg";
            }}
          />
        </div>
        
        <div className="p-4">
          <p className="text-gray-300 mb-4">{nft?.description || "Une créature démoniaque aux yeux jaunes flamboyants."}</p>
          
          <div className="grid grid-cols-2 gap-2">
            {nft?.attributes?.map((attr: any, index: number) => (
              <div key={index} className="bg-gray-700 rounded p-2 text-sm">
                <span className="text-gray-400">{attr.trait_type}:</span> {attr.value}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="mb-2">
          Collection: {nft?.contractAddress ? (
            <span className="font-mono text-xs bg-blue-900 rounded px-2 py-1">
              {nft.contractAddress}
            </span>
          ) : "0x4d9f6cc9d80fdf481a5f367343fdb11b208fee1f"}
        </p>
        <p>Token ID: {nft?.tokenId || "1"}</p>
      </div>
      
      <a 
        href="/diagnostic.html" 
        className="mt-8 text-blue-400 hover:underline"
        target="_blank"
      >
        Ouvrir la page de diagnostic
      </a>
    </div>
  );
}