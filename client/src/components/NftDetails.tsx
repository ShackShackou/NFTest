import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NftProperties } from "./NftProperties";
import { ShareIcon, HeartIcon, ChevronDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NftDetailsProps {
  nftId: number;
}

export function NftDetails({ nftId }: NftDetailsProps) {
  const { data: nft } = useQuery({
    queryKey: [`/api/nfts/${nftId}`],
    enabled: !!nftId,
  });

  return (
    <div className="flex flex-col space-y-6">
      {/* Main NFT Details Card */}
      <Card className="bg-neutral-dark rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-pixel text-xl md:text-2xl text-white mb-2">
              {nft?.name || "DARTHBATER #42"}
            </h1>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-neutral-light/70">Created by</span>
              <a href="#" className="text-sm font-medium text-primary hover:underline">
                {nft?.creator || "PixelMaster"}
              </a>
              <span className="bg-success/20 text-success text-xs px-2 py-1 rounded-full">
                Verified
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="rounded-full bg-neutral-light/10 hover:bg-neutral-light/20 transition-colors">
              <ShareIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-neutral-light/10 hover:bg-neutral-light/20 transition-colors">
              <HeartIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm text-neutral-light/70">Current price</p>
              <p className="text-2xl font-semibold flex items-center mt-1">
                <svg className="w-5 h-5 mr-2 text-primary" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"/>
                </svg>
                {nft?.price || "0.42 ETH"}
                <span className="ml-2 text-sm text-neutral-light/70">{nft?.usdPrice || "($720.84)"}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-light/70">Ends in</p>
              <p className="text-lg font-medium text-accent">{nft?.endsIn || "12h 42m 03s"}</p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <Button className="flex-1 bg-accent hover:bg-accent/80 text-white font-medium py-3 px-4 rounded-xl transition-colors">
              Buy Now
            </Button>
            <Button variant="outline" className="flex-1 border border-primary text-primary hover:bg-primary/10 font-medium py-3 px-4 rounded-xl transition-colors">
              Place Bid
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Properties Card */}
      <NftProperties properties={nft?.properties || []} />
      
      {/* Description Card */}
      <Card className="bg-neutral-dark rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Description</h2>
          <Button variant="ghost" size="sm" className="text-neutral-light/70 hover:text-primary">
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-neutral-light/80 text-sm">
          {nft?.description || 
            "This interactive NFT features a pixel art character with special powers. The NFT responds to user interaction - hover to pause the animation, click to advance to the final frame. Part of the \"Pixel Warriors\" collection with unique on-chain properties."}
        </p>
      </Card>
      
      {/* Technical Details Card */}
      <Card className="bg-neutral-dark rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Details</h2>
          <Button variant="ghost" size="sm" className="text-neutral-light/70 hover:text-primary">
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-light/70">Contract Address</span>
            <a href="#" className="text-primary hover:underline truncate ml-4">
              {nft?.contractAddress || "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7"}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-light/70">Token ID</span>
            <span>{nft?.tokenId || "42"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-light/70">Token Standard</span>
            <span>{nft?.tokenStandard || "ERC-721"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-light/70">Blockchain</span>
            <span>{nft?.blockchain || "Ethereum"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-light/70">Created</span>
            <span>{nft?.created || "Apr 13, 2023"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
