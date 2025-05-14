import NftMinter from "@/components/NftMinter";
import NftTransfer from "@/components/NftTransfer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/components/WalletProvider";

export default function NftManager() {
  const { isConnected, address, balance } = useWallet();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-pixel text-primary">
            DARTHBATER <span className="text-accent">Manager</span>
          </h1>
          <p className="text-neutral-light mt-2">
            Créez et gérez vos NFTs DARTHBATER sur le réseau Sepolia
          </p>
          
          {isConnected && (
            <div className="mt-4 p-3 bg-neutral-darker/60 rounded-lg">
              <p className="text-sm text-primary">
                {address && <span>Connecté avec: <span className="text-white font-mono">{address}</span></span>}
              </p>
              <p className="text-sm text-primary mt-1">
                {balance && <span>Balance: <span className="text-white">{balance}</span></span>}
              </p>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="mint" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="mint" className="text-base font-medium">
              Minter NFT
            </TabsTrigger>
            <TabsTrigger value="transfer" className="text-base font-medium">
              Transférer NFT
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mint" className="mt-0">
            <NftMinter />
          </TabsContent>
          
          <TabsContent value="transfer" className="mt-0">
            <NftTransfer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}