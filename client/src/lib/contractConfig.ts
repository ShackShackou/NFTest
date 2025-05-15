// Configuration du contrat NFT déployé sur Sepolia testnet
// Adresse du contrat NFT DARTHBATER sur différents réseaux

// Adresse du contrat déployé en local (réseau Hardhat)
const HARDHAT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Adresse du contrat déployé sur Sepolia testnet (mise à jour avec l'adresse exacte du contrat)
const SEPOLIA_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Utilisation de l'API MetaMask pour une meilleure connectivité
export const METAMASK_API_KEY = process.env.METAMASK_API_KEY;

// Adresse par défaut du contrat (utilisée si chainId n'est pas reconnu)
export const contractAddress = SEPOLIA_CONTRACT_ADDRESS;

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
      contractAddress: SEPOLIA_CONTRACT_ADDRESS,
      contractABI,
    };
  }
  
  // Si on est sur le réseau Hardhat local (chaînId 31337)
  if (chainId === 31337) {
    return {
      contractAddress: HARDHAT_CONTRACT_ADDRESS,
      contractABI,
    };
  }
  
  // Par défaut, retourner la configuration de Sepolia
  return {
    contractAddress: SEPOLIA_CONTRACT_ADDRESS,
    contractABI,
  };
};