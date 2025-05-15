// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DarthBaterNFT
 * @dev Un contrat NFT pour la collection DARTHBATER avec des métadonnées externes
 */
contract DarthBaterNFT is ERC721URIStorage, Ownable {
    // Compteur de tokens
    uint256 private _nextTokenId;
    
    // Base URI pour les métadonnées
    string private _baseTokenURI;
    
    // Événement émis lors du mint d'un nouveau NFT
    event NFTMinted(address to, uint256 tokenId);
    
    // Constructeur
    constructor(string memory baseURI) ERC721("DARTHBATER", "DBTR") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Mint un nouveau NFT et l'assigne à une adresse
     * @param to L'adresse qui recevra le NFT
     * @return Le nouveau tokenId
     */
    function mintNFT(address to) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string.concat(_baseTokenURI, "/", _toString(tokenId)));
        
        emit NFTMinted(to, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Fonction publique pour minter un NFT sans spécifier d'adresse (utilise msg.sender)
     * @return Le nouveau tokenId
     */
    function mint() public returns (uint256) {
        return mintNFT(msg.sender);
    }
    
    /**
     * @dev Permet de mettre à jour l'URI de base pour les métadonnées
     * @param newBaseURI La nouvelle URI de base
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    /**
     * @dev Fonction surchargée pour retourner l'URI de base
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Convertit un uint256 en string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}