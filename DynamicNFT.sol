// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // Pour la gestion du propriétaire
import "@openzeppelin/contracts/utils/Counters.sol"; // Pour générer les token IDs

/**
 * @title DynamicNFT
 * @dev Un contrat ERC721 de base pour des NFT dynamiques dont les métadonnées peuvent être mises à jour
 * par le propriétaire du contrat.
 */
contract DynamicNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter; // Compteur pour les IDs de token auto-incrémentés

    /**
     * @dev Émis lorsqu'une URI de token est mise à jour.
     * @param tokenId L'ID du token.
     * @param newURI La nouvelle URI des métadonnées.
     * @param updater L'adresse qui a effectué la mise à jour.
     */
    event MetadataUpdate(uint256 indexed tokenId, string newURI, address indexed updater);

    /**
     * @dev Constructeur du contrat.
     * @param name_ Le nom de la collection NFT.
     * @param symbol_ Le symbole de la collection NFT.
     * @param initialOwner L'adresse qui deviendra le propriétaire du contrat.
     */
    constructor(string memory name_, string memory symbol_, address initialOwner)
        ERC721(name_, symbol_)
        Ownable(initialOwner) // Transfère la propriété à initialOwner
    {}

    /**
     * @dev Minte un nouveau NFT à une adresse donnée avec une URI de métadonnées spécifique.
     * Seul le propriétaire du contrat peut appeler cette fonction.
     * @param to L'adresse qui recevra le nouveau NFT.
     * @param uri L'URI des métadonnées pour le nouveau NFT.
     * @return L'ID du token minté.
     */
    function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Met à jour l'URI des métadonnées pour un token NFT existant.
     * Seul le propriétaire du contrat peut appeler cette fonction.
     * Émet un événement `MetadataUpdate`.
     * @param tokenId L'ID du token dont l'URI doit être mise à jour.
     * @param newURI La nouvelle URI des métadonnées.
     */
    function updateTokenURI(uint256 tokenId, string memory newURI) public onlyOwner {
        require(_exists(tokenId), "DynamicNFT: URI update for nonexistent token");
        _setTokenURI(tokenId, newURI);
        emit MetadataUpdate(tokenId, newURI, msg.sender);
    }

    /**
     * @dev Retourne l'URI de base pour construire les token URIs. Est vide par défaut.
     * Nous nous appuyons sur _setTokenURI qui stocke l'URI complète.
     */
    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    /**
     * @dev Hook de transfert appelé avant tout transfert de token.
     * Utilisé ici pour s'assurer que ERC721URIStorage est compatible.
     */
    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize)
        internal
        override(ERC721) // Spécifier quel _beforeTokenTransfer est surchargé
    {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    /**
     * @dev Nécessaire pour ERC721URIStorage.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI)
        internal
        override(ERC721, ERC721URIStorage) // Surcharge les deux versions si nécessaire
    {
        super._setTokenURI(tokenId, _tokenURI);
    }

    /**
     * @dev Nécessaire pour ERC721URIStorage.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage) // Surcharge les deux versions si nécessaire
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Nécessaire pour ERC721URIStorage et la compatibilité avec les interfaces.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage) // Surcharge les deux versions si nécessaire
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // --- Espace réservé conceptuel pour l'intégration Chainlink ---
    // Pour une intégration Chainlink, vous ajouteriez :
    // 1. Des variables d'état pour stocker l'adresse de l'oracle, le Job ID, les frais, etc.
    // 2. Une fonction pour demander des données à un oracle Chainlink.
    //    Ex: function requestDataFromOracle(bytes32 _specId, uint256 _payment) public onlyOwner { ... }
    // 3. Une fonction de rappel (fulfill) que l'oracle Chainlink appelle avec la réponse.
    //    Ex: function fulfill(bytes32 _requestId, bytes memory _data) public recordChainlinkFulfillment { ... }
    //    Dans cette fonction `fulfill`, vous analyseriez `_data` et décideriez si vous devez appeler `updateTokenURI`.
    // ---------------------------------------------------------------
}