import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/components/WalletProvider';
import { ethers } from 'ethers';
import { contractABI, contractAddress as defaultContractAddress } from '@/lib/contractConfig';
import { shortenAddress } from '@/lib/utils';

export default function NftTransfer() {
  const { toast } = useToast();
  const { address, isConnected, isLoading, isSepoliaNetwork } = useWallet();
  
  const [error, setError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [tokenId, setTokenId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [contractAddress, setContractAddress] = useState(defaultContractAddress);
  
  // État pour le statut du transfert
  const [transferStatus, setTransferStatus] = useState<{
    success?: boolean;
    transactionHash?: string;
    error?: string;
  } | null>(null);
  
  const handleTransferNft = async () => {
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
        description: 'Veuillez passer sur le réseau Sepolia testnet',
        variant: 'destructive',
      });
      return;
    }
    
    if (!tokenId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un ID de token',
        variant: 'destructive',
      });
      return;
    }
    
    if (!recipientAddress) {
      toast({
        title: 'Erreur', 
        description: 'Veuillez entrer une adresse de destinataire',
        variant: 'destructive',
      });
      return;
    }
    
    if (!ethers.isAddress(recipientAddress)) {
      toast({
        title: 'Erreur',
        description: 'L\'adresse du destinataire n\'est pas valide',
        variant: 'destructive',
      });
      return;
    }
    
    setTransferring(true);
    setTransferStatus(null);
    setError(null);
    
    try {
      if (!window?.ethereum) {
        throw new Error('MetaMask n\'est pas installé');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Vérifier si l'utilisateur est le propriétaire du NFT
      const owner = await nftContract.ownerOf(tokenId);
      
      if (owner.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('Vous n\'êtes pas le propriétaire de ce NFT');
      }
      
      // Transférer le NFT
      const transaction = await nftContract.transferFrom(address, recipientAddress, tokenId);
      
      toast({
        title: 'Transaction envoyée',
        description: 'Attendez que la transaction soit confirmée...',
      });
      
      const receipt = await transaction.wait();
      
      toast({
        title: 'NFT transféré avec succès !',
        description: `Le NFT #${tokenId} a été envoyé à ${shortenAddress(recipientAddress)}`,
      });
      
      setTransferStatus({
        success: true,
        transactionHash: receipt.hash,
      });
      
      // Réinitialiser les champs
      setTokenId('');
      setRecipientAddress('');
      
    } catch (err: any) {
      const errorMsg = err.message || 'Une erreur s\'est produite';
      setError(errorMsg);
      
      toast({
        title: 'Erreur lors du transfert',
        description: errorMsg.substring(0, 100) + (errorMsg.length > 100 ? '...' : ''),
        variant: 'destructive',
      });
      
      setTransferStatus({
        success: false,
        error: errorMsg,
      });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="p-6 bg-neutral-darker rounded-lg border border-neutral-dark/80 shadow-lg">
      <h2 className="text-2xl font-pixel text-primary mb-6">Transfert <span className="text-accent">NFT</span></h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {isConnected ? (
        <div className="space-y-4">
          <div>
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
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">ID du Token</label>
            <Input 
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white text-sm"
              placeholder="42"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Adresse du destinataire</label>
            <Input 
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white text-sm"
              placeholder="0x..."
            />
          </div>
          
          <Button
            onClick={handleTransferNft}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={transferring || !isSepoliaNetwork}
            size="sm"
          >
            {transferring ? "Transaction en cours..." : "Envoyer le NFT"}
          </Button>
          
          {!isSepoliaNetwork && (
            <p className="text-xs text-amber-400 mt-2">
              Vous devez être sur le réseau Sepolia Testnet pour transférer
            </p>
          )}
        </div>
      ) : (
        <div className="text-center p-4 border border-gray-700 rounded-lg">
          <p className="text-neutral-light mb-4">Veuillez connecter votre portefeuille pour transférer un NFT</p>
        </div>
      )}
      
      {/* Résultat du transfert */}
      {transferStatus && (
        <div className={`mt-4 border ${transferStatus.success ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'} rounded-lg p-3`}>
          <h3 className={`text-md font-semibold ${transferStatus.success ? 'text-green-400' : 'text-red-400'} mb-2`}>
            {transferStatus.success ? "NFT transféré avec succès!" : "Échec du transfert"}
          </h3>
          
          {transferStatus.success && (
            <div>
              <span className="text-gray-400">Transaction:</span>
              <a 
                href={`https://sepolia.etherscan.io/tx/${transferStatus.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-400 hover:underline break-all"
              >
                {shortenAddress(transferStatus.transactionHash || '')}
              </a>
            </div>
          )}
          
          {!transferStatus.success && (
            <p className="text-red-300 text-sm">{transferStatus.error}</p>
          )}
        </div>
      )}
    </div>
  );
}