// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DarthBaterNFT
 * @dev Un contrat NFT pour la collection DARTHBATER avec des métadonnées externes
 */
contract DarthBaterNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
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
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, string(abi.encodePacked(_baseTokenURI, "/", Strings.toString(newTokenId))));
        
        emit NFTMinted(to, newTokenId);
        
        return newTokenId;
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
}