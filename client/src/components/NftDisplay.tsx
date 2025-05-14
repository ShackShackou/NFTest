import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import darthBaterGif from '@assets/13_DARTHBATER.gif';
import { cn } from '@/lib/utils';

interface NftDisplayProps {
  className?: string;
}

export function NftDisplay({ className }: NftDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  // Une fois que l'image est chargée, on met isLoading à false
  useEffect(() => {
    const img = new Image();
    img.src = darthBaterGif;
    img.onload = () => {
      setIsLoading(false);
    };
  }, []);

  // Fonction pour mettre en pause et reprendre l'animation du GIF
  // Cette approche utilise CSS pour contrôler directement l'animation
  const handleImageHover = () => {
    setIsPaused(true);
    if (imgRef.current) {
      imgRef.current.style.animationPlayState = 'paused';
    }
  };

  const handleImageLeave = () => {
    if (!isFrozen) {
      setIsPaused(false);
      if (imgRef.current) {
        imgRef.current.style.animationPlayState = 'running';
      }
    }
  };

  // Fonction pour simuler le saut de frames et freeze lors du clic
  const handleImageClick = () => {
    // Pour simuler le saut de frame 15 à 19, on freeze temporairement
    setIsFrozen(true);
    
    if (imgRef.current) {
      // Ajouter la classe qui indique un état spécial de "clic"
      imgRef.current.classList.add('gif-clicked');
      
      // Nettoyer le timeout existant si nécessaire
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Reprendre l'animation après un court délai
      timeoutRef.current = window.setTimeout(() => {
        setIsFrozen(false);
        setIsPaused(false);
        
        if (imgRef.current) {
          imgRef.current.style.animationPlayState = 'running';
          imgRef.current.classList.remove('gif-clicked');
        }
      }, 800);
    }
  };

  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      {/* NFT Display Container - Simple avec aucun contrôle UI */}
      <div 
        className="relative bg-neutral-dark rounded-xl overflow-hidden hover-glow transition-all duration-300 h-[450px] sm:h-[550px] flex items-center justify-center"
      >
        {/* Background effect */}
        <div className={cn(
          "absolute inset-0 bg-primary/30 z-0",
          isFrozen && "bg-accent/40"
        )}></div>
        
        {/* NFT Display */}
        <div 
          className={cn(
            "relative z-10 p-4 custom-cursor",
            isFrozen && "frozen-frame"
          )}
          onMouseEnter={handleImageHover}
          onMouseLeave={handleImageLeave}
          onClick={handleImageClick}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Spinner size="lg" />
            </div>
          ) : (
            <img 
              ref={imgRef}
              src={darthBaterGif}
              alt="Interactive NFT - DARTHBATER" 
              className={cn(
                "pixelated max-h-[400px] max-w-full mx-auto",
                isPaused && "paused-gif",
                isFrozen && "frozen-gif"
              )}
            />
          )}
        </div>
        
        {/* Interaction hint overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-dark/90 to-transparent text-center py-4 px-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs md:text-sm font-medium">
            <span className="mr-2">🖱️</span> 
            Hover pour arrêter, cliquez sur le personnage pour interagir
          </p>
        </div>
      </div>
    </div>
  );
}
