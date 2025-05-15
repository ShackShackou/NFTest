// Configuration du contrat NFT déployé sur Sepolia testnet
// Adresse du contrat NFT DARTHBATER sur Sepolia
export const contractAddress = "0x8B848F654c30e99bc2e4A1559b4Dc1a"; // Remplacez par l'adresse réelle de votre contrat sur Sepolia

// ABI du contrat (interface pour interagir avec le contrat)
export const contractABI = [
  // Interface ERC-721 standard
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  
  // Fonctions de transfert
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  
  // Fonctions de mint - plusieurs variantes possibles selon l'implémentation
  "function mint() returns (uint256)",
  "function mintNFT(address to) returns (uint256)",
  "function safeMint(address to) returns (uint256)",
  
  // Fonctions supplémentaires (administratives)
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  
  // Événements
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
];

// Fonction pour obtenir adresse et ABI du contrat supporté selon le chainId
export const getContractConfig = (chainId?: number) => {
  // Si on est sur le réseau de test Sepolia (chaînId 11155111)
  if (chainId === 11155111) {
    return {
      contractAddress,
      contractABI,
    };
  }
  
  // Si on est sur d'autres réseaux de test comme Goerli (chaînId 5)
  if (chainId === 5) {
    return {
      contractAddress: "0x0000000000000000000000000000000000000000", // À remplacer si disponible sur Goerli
      contractABI,
    };
  }
  
  // Par défaut, retourner la configuration de Sepolia
  return {
    contractAddress,
    contractABI,
  };
};