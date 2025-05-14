import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatEthPrice, shortenAddress } from '@/lib/utils';

// Contract d'exemple sur Sepolia Testnet - à remplacer par votre contrat réel
const TEST_NFT_CONTRACT = "0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656";

export default function NftMinter() {
  const { toast } = useToast();
  const {
    walletInfo,
    error,
    loading,
    connectWallet,
    disconnectWallet,
    mintTestNft,
    switchNetwork,
    isOnSepoliaTestnet
  } = useWallet();
  
  const [mintStatus, setMintStatus] = useState<{
    success?: boolean;
    transactionHash?: string;
    tokenId?: string;
    error?: string;
  } | null>(null);
  
  // État pour stocker l'adresse du contrat
  const [contractAddress, setContractAddress] = useState<string>(TEST_NFT_CONTRACT);
  
  const handleConnectWallet = async () => {
    if (walletInfo.isConnected) {
      disconnectWallet();
      return;
    }
    
    await connectWallet();
  };
  
  const handleSwitchToTestnet = async () => {
    // ID de Sepolia: 11155111
    const success = await switchNetwork(11155111);
    if (success) {
      toast({
        title: "Réseau changé",
        description: "Vous êtes maintenant sur le réseau de test Sepolia",
      });
    }
  };
  
  const handleMintNft = async () => {
    if (!walletInfo.isConnected) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord connecter votre portefeuille",
        variant: "destructive"
      });
      return;
    }
    
    if (!isOnSepoliaTestnet()) {
      toast({
        title: "Mauvais réseau",
        description: "Veuillez passer sur le réseau Sepolia testnet pour minter",
        variant: "destructive"
      });
      return;
    }
    
    setMintStatus(null);
    
    const result = await mintTestNft(contractAddress);
    
    if (result.success) {
      toast({
        title: "NFT minté avec succès !",
        description: `Token ID: ${result.tokenId}`,
      });
      
      setMintStatus({
        success: true,
        transactionHash: result.transactionHash,
        tokenId: result.tokenId
      });
    } else {
      toast({
        title: "Erreur lors du mint",
        description: result.error || "Une erreur s'est produite",
        variant: "destructive"
      });
      
      setMintStatus({
        success: false,
        error: result.error
      });
    }
  };
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-lg font-bold text-white mb-4">Minter votre NFT sur la blockchain</h2>
      
      {/* Statut de connexion */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Statut</span>
          {walletInfo.isConnected ? (
            <Badge variant="outline" className="bg-green-900/30 text-green-400 hover:bg-green-900/40">
              Connecté
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-900/30 text-red-400 hover:bg-red-900/40">
              Non connecté
            </Badge>
          )}
        </div>
        
        {walletInfo.isConnected && (
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>
              <span className="text-gray-500">Adresse:</span>
              <div className="text-white font-mono mt-1">{shortenAddress(walletInfo.address)}</div>
            </div>
            <div>
              <span className="text-gray-500">Réseau:</span>
              <div className="text-white capitalize mt-1">{walletInfo.network}</div>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleConnectWallet}
          className={walletInfo.isConnected ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
          disabled={loading}
          size="sm"
          variant="default"
        >
          {loading ? "Chargement..." : walletInfo.isConnected ? "Déconnecter" : "Connecter MetaMask"}
        </Button>
        
        {walletInfo.isConnected && !isOnSepoliaTestnet() && (
          <Button 
            onClick={handleSwitchToTestnet}
            className="ml-2 bg-purple-600 hover:bg-purple-700"
            disabled={loading}
            size="sm"
            variant="default"
          >
            Passer sur Sepolia Testnet
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {/* Interface de mint */}
      {walletInfo.isConnected && (
        <div className="border border-gray-700 rounded-lg p-3 mb-4">
          <h3 className="text-md font-semibold text-white mb-3">Minter un NFT de test</h3>
          
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Adresse du contrat NFT</label>
            <Input
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white text-sm"
              placeholder="0x..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Contrat par défaut sur Sepolia Testnet
            </p>
          </div>
          
          <Button
            onClick={handleMintNft}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading || !isOnSepoliaTestnet()}
            size="sm"
          >
            {loading ? "Transaction en cours..." : "Minter le NFT"}
          </Button>
          
          {!isOnSepoliaTestnet() && (
            <p className="text-xs text-amber-400 mt-2">
              Vous devez être sur le réseau Sepolia Testnet pour minter
            </p>
          )}
        </div>
      )}
      
      {/* Résultat du mint */}
      {mintStatus && (
        <div className={`border ${mintStatus.success ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'} rounded-lg p-3`}>
          <h3 className={`text-md font-semibold ${mintStatus.success ? 'text-green-400' : 'text-red-400'} mb-2`}>
            {mintStatus.success ? "NFT minté avec succès!" : "Échec du mint"}
          </h3>
          
          {mintStatus.success ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Token ID:</span>
                <span className="ml-2 text-white">{mintStatus.tokenId}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Transaction:</span>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${mintStatus.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-400 hover:underline break-all"
                >
                  {shortenAddress(mintStatus.transactionHash || '')}
                </a>
              </div>
              
              <p className="text-gray-300 text-xs mt-2">
                Vous pouvez voir votre NFT dans quelques instants sur OpenSea Testnet.
              </p>
            </div>
          ) : (
            <p className="text-red-300 text-sm">{mintStatus.error}</p>
          )}
        </div>
      )}
      
      {/* Informations utiles */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="mb-1">💡 Pour utiliser Sepolia Testnet:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Ajoutez Sepolia à MetaMask (Chain ID: 11155111)</li>
          <li>Obtenez des ETH de test sur un <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">faucet Sepolia</a></li>
          <li>Le NFT apparaîtra sur <a href="https://testnets.opensea.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenSea Testnet</a></li>
        </ol>
      </div>
    </div>
  );
}