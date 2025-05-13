import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import pixelBackground1 from "@/assets/pixelBackground1.svg";
import pixelBackground2 from "@/assets/pixelBackground2.svg";
import pixelBackground3 from "@/assets/pixelBackground3.svg";
import pixelBackground4 from "@/assets/pixelBackground4.svg";

interface RelatedNft {
  id: number;
  name: string;
  number: number;
  price: string;
  lastPrice: string;
  background: string;
}

interface RelatedNftsProps {
  collectionId: number;
}

export function RelatedNfts({ collectionId }: RelatedNftsProps) {
  const { data: relatedNfts } = useQuery({
    queryKey: [`/api/collections/${collectionId}/nfts`],
    enabled: !!collectionId,
  });

  // Default related NFTs if none are provided by the API
  const defaultRelatedNfts: RelatedNft[] = [
    {
      id: 1,
      name: "PIXEL WARRIOR",
      number: 38,
      price: "0.36 ETH",
      lastPrice: "0.28 ETH",
      background: pixelBackground1
    },
    {
      id: 2,
      name: "CYBER KNIGHT",
      number: 41,
      price: "0.45 ETH",
      lastPrice: "0.32 ETH",
      background: pixelBackground2
    },
    {
      id: 3,
      name: "SPACE RIDER",
      number: 43,
      price: "0.38 ETH",
      lastPrice: "0.30 ETH",
      background: pixelBackground3
    },
    {
      id: 4,
      name: "TECH WIZARD",
      number: 45,
      price: "0.40 ETH",
      lastPrice: "0.35 ETH",
      background: pixelBackground4
    }
  ];

  const nftsToDisplay = relatedNfts || defaultRelatedNfts;

  const getBgColor = (index: number) => {
    const colors = [
      "bg-blue-900/40",
      "bg-purple-900/40",
      "bg-green-900/40",
      "bg-yellow-900/40"
    ];
    return colors[index % colors.length];
  };

  const getAnimateColor = (index: number) => {
    const colors = [
      "bg-primary/50",
      "bg-accent/30",
      "bg-primary/40",
      "bg-accent/40"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="mt-16">
      <h2 className="font-pixel text-xl mb-6">More from this collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {nftsToDisplay.map((nft, index) => (
          <Card 
            key={nft.id} 
            className="bg-neutral-dark rounded-xl overflow-hidden hover-glow transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`h-48 ${getBgColor(index)} relative overflow-hidden`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-32 h-32 ${getAnimateColor(index)} animate-pulse-slow`}></div>
              </div>
              <span className="absolute top-2 right-2 bg-neutral-dark/80 text-xs px-2 py-1 rounded-full">
                <svg className="w-3 h-3 inline mr-1 text-primary" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M234.5 5.7c13.9-5 29.1-5 43.1 0l192 68.6C495 83.4 512 107.5 512 134.6V377.4c0 27-17 51.2-42.5 60.3l-192 68.6c-13.9 5-29.1 5-43.1 0l-192-68.6C17 428.6 0 404.5 0 377.4V134.6c0-27 17-51.2 42.5-60.3l192-68.6zM256 66L82.3 128 256 190l173.7-62L256 66zm32 368.6l160-57.1v-188L288 246.6v188z"/>
                </svg>
                #{nft.number}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-medium">{nft.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-primary" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"/>
                  </svg>
                  <span className="font-medium">{nft.price}</span>
                </div>
                <span className="text-xs text-neutral-light/70">Last: {nft.lastPrice}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
