import { useState, useRef } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useGifController } from '@/hooks/useGifController';
import darthBaterGif from '@assets/13_DARTHBATER.gif';
import { cn } from '@/lib/utils';

interface NftDisplayProps {
  className?: string;
}

export function NftDisplay({ className }: NftDisplayProps) {
  const {
    currentFrameIndex,
    totalFrames,
    isPlaying,
    isLoading,
    isFrozen,
    play,
    pause,
    jumpToFrame19
  } = useGifController(darthBaterGif);

  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      {/* NFT Display Container - Simple with no UI controls */}
      <div 
        ref={containerRef}
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
          onMouseEnter={() => {
            setIsHovering(true);
            pause();
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            if (!isFrozen) play();
          }}
          onClick={() => {
            // This implements exactly the requirement:
            // When clicked, the GIF should jump from frame 15 to 19 and freeze briefly
            const currentFrame = currentFrameIndex;
            if (currentFrame >= 10 && currentFrame <= 17) {
              jumpToFrame19();
            }
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Spinner size="lg" />
            </div>
          ) : (
            <img 
              src={darthBaterGif}
              alt="Interactive NFT - DARTHBATER" 
              className={cn(
                "pixelated max-h-[400px] max-w-full mx-auto",
                isFrozen && "animate-none"
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
