import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatEthPrice, shortenAddress } from '@/lib/utils';
import { useWallet } from '@/components/WalletProvider';
import { ethers } from 'ethers';
import { contractABI, contractAddress as defaultContractAddress } from '@/lib/contractConfig';

export default function NftMinter() {
  const { toast } = useToast();
  const { 
    address, 
    isConnected, 
    isLoading, 
    chainId,
    isSepoliaNetwork,
    connectWallet, 
    disconnectWallet 
  } = useWallet();
  
  const [error, setError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  
  const [mintStatus, setMintStatus] = useState<{
    success?: boolean;
    transactionHash?: string;
    tokenId?: string;
    error?: string;
  } | null>(null);
  
  // État pour stocker l'adresse du contrat
  const [contractAddress, setContractAddress] = useState<string>(defaultContractAddress);
  
  const handleSwitchToTestnet = async () => {
    try {
      if (!window?.ethereum) {
        throw new Error('MetaMask n\'est pas installé');
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // chainId en hexadécimal pour Sepolia (11155111)
      });
      
      toast({
        title: 'Réseau changé',
        description: 'Vous êtes maintenant sur le réseau de test Sepolia',
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de réseau');
      
      // Si le réseau n'est pas configuré, proposer de l'ajouter
      if (err.code === 4902) {
        try {
          // Vérifier que window.ethereum existe
          const ethereum = window.ethereum;
          if (ethereum && ethereum.request) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
          } else {
            setError('MetaMask n\'est pas disponible ou n\'est pas correctement initialisé');
          }
        } catch (addError: any) {
          setError(addError.message || 'Impossible d\'ajouter le réseau Sepolia');
        }
      }
      
      toast({
        title: 'Erreur',
        description: 'Impossible de changer de réseau',
        variant: 'destructive',
      });
    }
  };
  
  const handleMintNft = async () => {
    if (!isConnected) {
      toast({
        title: 'Erreur',
        description: 'Veuillez d\'abord connecter votre portefeuille',
        variant: 'destructive',
      });
      return;
    }
    
    if (!isSepoliaNetwork) {
      toast({
        title: 'Mauvais réseau',
        description: 'Veuillez passer sur le réseau Sepolia testnet pour minter',
        variant: 'destructive',
      });
      return;
    }
    
    setIsMinting(true);
    setMintStatus(null);
    setError(null);
    
    try {
      if (!window?.ethereum) {
        throw new Error('MetaMask n\'est pas installé');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Vérifier quelle fonction est disponible sur le contrat
      let transaction;
      try {
        // Essayer d'abord mint()
        if (typeof nftContract.mint === 'function') {
          transaction = await nftContract.mint();
        } 
        // Sinon essayer safeMint(address) si disponible
        else if (typeof nftContract.safeMint === 'function') {
          transaction = await nftContract.safeMint(address);
        }
        // Sinon essayer mintNFT(address) si disponible
        else if (typeof nftContract.mintNFT === 'function') {
          transaction = await nftContract.mintNFT(address);
        }
        else {
          throw new Error("Aucune fonction de mint reconnue n'est disponible sur ce contrat");
        }
      } catch (err) {
        console.error("Erreur lors de la détection de la fonction mint:", err);
        throw new Error(`Le contrat ne supporte pas le mint: ${err.message}`);
      }
      
      // Attendre que la transaction soit minée
      toast({
        title: 'Transaction envoyée',
        description: 'Attendez que la transaction soit confirmée...',
      });
      
      const receipt = await transaction.wait();
      
      // Chercher l'événement Transfer dans les logs (standard ERC721)
      const transferEvent = receipt.logs
        .map((log: any) => {
          try {
            return nftContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter((event: any) => event && event.name === 'Transfer')[0];
      
      // Extraire le tokenId de l'événement Transfer (to, from, tokenId)
      const tokenId = transferEvent ? transferEvent.args[2].toString() : 'Inconnu';
      
      toast({
        title: 'NFT minté avec succès !',
        description: `Token ID: ${tokenId}`,
      });
      
      setMintStatus({
        success: true,
        transactionHash: receipt.hash,
        tokenId: tokenId,
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Une erreur s\'est produite';
      setError(errorMsg);
      
      toast({
        title: 'Erreur lors du mint',
        description: errorMsg.substring(0, 100) + (errorMsg.length > 100 ? '...' : ''),
        variant: 'destructive',
      });
      
      setMintStatus({
        success: false,
        error: errorMsg,
      });
    } finally {
      setIsMinting(false);
    }
  };
  
  return (
    <div className="p-6 bg-neutral-darker rounded-lg border border-neutral-dark/80 shadow-lg">
      <h2 className="text-2xl font-pixel text-primary mb-6">NFT<span className="text-accent">Mint</span></h2>
      
      {/* Statut de connexion */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Statut</span>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-900/30 text-green-400 hover:bg-green-900/40">
              Connecté
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-900/30 text-red-400 hover:bg-red-900/40">
              Non connecté
            </Badge>
          )}
        </div>
        
        {isConnected && (
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>
              <span className="text-gray-500">Adresse:</span>
              <div className="text-white font-mono mt-1">{shortenAddress(address || '')}</div>
            </div>
            <div>
              <span className="text-gray-500">Réseau:</span>
              <div className="text-white capitalize mt-1">{isSepoliaNetwork ? 'Sepolia' : chainId ? `Chain ID: ${chainId}` : 'Inconnu'}</div>
            </div>
          </div>
        )}
        
        <Button 
          onClick={isConnected ? disconnectWallet : connectWallet}
          className={isConnected ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
          disabled={isLoading}
          size="sm"
          variant="default"
        >
          {isLoading ? "Chargement..." : isConnected ? "Déconnecter" : "Connecter MetaMask"}
        </Button>
        
        {isConnected && !isSepoliaNetwork && (
          <Button 
            onClick={handleSwitchToTestnet}
            className="ml-2 bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
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
      {isConnected && (
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
            disabled={isMinting || !isSepoliaNetwork}
            size="sm"
          >
            {isMinting ? "Transaction en cours..." : "Minter le NFT"}
          </Button>
          
          {!isSepoliaNetwork && (
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