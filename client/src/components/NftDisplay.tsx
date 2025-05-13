import { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useGifController } from '@/hooks/useGifController';
import { PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react';
import darthBaterGif from '@assets/13_DARTHBATER.gif';

interface NftDisplayProps {
  className?: string;
}

export function NftDisplay({ className }: NftDisplayProps) {
  const {
    currentFrameIndex,
    totalFrames,
    isPlaying,
    isLoading,
    play,
    pause,
    restart,
    goToFrame,
    goToLastFrame,
  } = useGifController(darthBaterGif);

  const containerRef = useRef<HTMLDivElement>(null);

  // Render the GIF image
  const [staticImage, setStaticImage] = useState<string>('');

  useEffect(() => {
    if (containerRef.current) {
      // For actual implementation, we'd render each frame based on currentFrameIndex
      // Since we can't use actual binary files, we're using the GIF directly
      setStaticImage(darthBaterGif);
    }
  }, [currentFrameIndex]);

  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      {/* NFT Display Container */}
      <div 
        ref={containerRef}
        className="relative bg-neutral-dark rounded-xl overflow-hidden hover-glow transition-all duration-300 h-[450px] sm:h-[550px] flex items-center justify-center"
      >
        {/* Background effect */}
        <div className="absolute inset-0 bg-primary/30 z-0"></div>
        
        {/* NFT Display */}
        <div 
          className="relative z-10 p-4 cursor-pointer"
          onMouseEnter={() => pause()}
          onMouseLeave={() => play()}
          onClick={() => goToLastFrame()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Spinner size="lg" />
            </div>
          ) : (
            <img 
              src={darthBaterGif}
              alt="Interactive NFT - DARTHBATER" 
              className="pixelated max-h-[400px] max-w-full mx-auto"
            />
          )}
        </div>
        
        {/* Interaction hint overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-dark/90 to-transparent text-center py-4 px-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs md:text-sm font-medium">
            <span className="mr-2">🖱️</span> 
            Hover to pause, click to advance
          </p>
        </div>
      </div>
      
      {/* GIF Controls */}
      <div className="flex items-center justify-between bg-neutral-dark rounded-xl p-4">
        <div className="flex space-x-4">
          <Button 
            variant="ghost"
            size="icon"
            onClick={play}
            disabled={isPlaying}
            className="text-xl text-neutral-light hover:text-primary transition-colors"
          >
            <PlayIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={pause}
            disabled={!isPlaying}
            className="text-xl text-neutral-light hover:text-primary transition-colors"
          >
            <PauseIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={restart}
            className="text-xl text-neutral-light hover:text-primary transition-colors"
          >
            <RotateCcwIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm mr-2">Frame: {currentFrameIndex + 1}/{totalFrames}</span>
          <Slider
            className="w-24 md:w-32"
            min={0}
            max={totalFrames - 1}
            step={1}
            value={[currentFrameIndex]}
            onValueChange={(value) => {
              goToFrame(value[0]);
            }}
          />
        </div>
      </div>
    </div>
  );
}
