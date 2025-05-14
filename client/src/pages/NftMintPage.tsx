import React from 'react';
import NftMinter from '@/components/NftMinter';
import { Toaster } from '@/components/ui/toaster';
import { Link } from 'wouter';

export default function NftMintPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">NFT Minter - DARTHBATER Collection</h1>
        <Link href="/collections/pixel" className="text-blue-500 hover:underline">
          Retour à la galerie
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-900 p-2 rounded-lg mb-4">
            <img 
              src="/assets/13_DARTHBATER.gif" 
              alt="DARTHBATER NFT" 
              className="rounded w-full"
            />
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">À propos de ce NFT</h2>
            <p className="text-gray-300 mb-3">
              DARTHBATER #42 est un NFT interactif de la collection DARTHBATER. 
              Il s'agit d'un NFT avancé qui comporte un mini-jeu complet avec des 
              éléments ARG (Alternate Reality Game) cachés.
            </p>
            
            <h3 className="text-lg font-bold mt-4 mb-2">Fonctionnalités</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Animations interactives en pixel art</li>
              <li>Mini-jeux intégrés</li>
              <li>Système d'évolution et de niveaux</li>
              <li>Éléments ARG avec des codes secrets</li>
              <li>Événements temporels spéciaux</li>
            </ul>
          </div>
        </div>
        
        <div>
          <NftMinter />
        </div>
      </div>
      
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Comment ça fonctionne</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">1. Connectez votre wallet</h3>
            <p className="text-gray-300 text-sm">
              Utilisez MetaMask pour vous connecter à la blockchain Ethereum.
              Nous vous recommandons d'utiliser le réseau de test Sepolia pour éviter
              de dépenser de vrais ETH.
            </p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">2. Mint votre NFT</h3>
            <p className="text-gray-300 text-sm">
              Une fois connecté, cliquez sur le bouton "Mint" pour créer votre 
              NFT DARTHBATER. Assurez-vous d'avoir des ETH de test sur Sepolia.
            </p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">3. Interagissez</h3>
            <p className="text-gray-300 text-sm">
              Après le mint, votre NFT sera visible sur OpenSea Testnet. Vous pouvez
              également interagir avec lui directement sur notre site en visitant
              la galerie.
            </p>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}