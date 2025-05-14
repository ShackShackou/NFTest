import { useState, useEffect, useRef, useCallback } from 'react';

type GifFrameData = {
  url: string;
  delay: number;
};

export const useGifController = (gifUrl: string) => {
  const [frames, setFrames] = useState<GifFrameData[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const frameInterval = useRef<number | null>(null);
  const freezeTimeoutRef = useRef<number | null>(null);
  const gifCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load and parse the GIF
  useEffect(() => {
    const parseGif = async () => {
      try {
        setIsLoading(true);
        
        // Using gifuct-js to parse and extract frames 
        // This would normally be imported, but for this implementation we'll simulate it
        const simulatedFrames: GifFrameData[] = [];
        const totalFrameCount = 24; // Simulating 24 frames for the GIF
        
        // Create simulated frames with delay
        for (let i = 0; i < totalFrameCount; i++) {
          simulatedFrames.push({
            url: gifUrl, // In a real implementation, each frame would have its own data
            delay: 100, // 100ms delay between frames
          });
        }
        
        setFrames(simulatedFrames);
        setTotalFrames(totalFrameCount);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing GIF:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    parseGif();
    
    // Cleanup
    return () => {
      if (frameInterval.current) {
        clearInterval(frameInterval.current);
      }
      if (freezeTimeoutRef.current) {
        clearTimeout(freezeTimeoutRef.current);
      }
    };
  }, [gifUrl]);

  // Animation control
  useEffect(() => {
    if (frames.length === 0 || !isPlaying || isFrozen) return;
    
    const playAnimation = () => {
      frameInterval.current = window.setInterval(() => {
        setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % totalFrames);
      }, frames[currentFrameIndex]?.delay || 100);
    };
    
    playAnimation();
    
    return () => {
      if (frameInterval.current) {
        clearInterval(frameInterval.current);
        frameInterval.current = null;
      }
    };
  }, [frames, isPlaying, currentFrameIndex, totalFrames, isFrozen]);

  // Player controls
  const play = useCallback(() => {
    setIsPlaying(true);
    setIsFrozen(false);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const restart = useCallback(() => {
    setCurrentFrameIndex(0);
    setIsPlaying(true);
    setIsFrozen(false);
  }, []);

  const goToFrame = useCallback((frameIndex: number) => {
    if (frameIndex >= 0 && frameIndex < totalFrames) {
      setCurrentFrameIndex(frameIndex);
    }
  }, [totalFrames]);

  const goToLastFrame = useCallback(() => {
    setCurrentFrameIndex(totalFrames - 1);
    setIsPlaying(false);
  }, [totalFrames]);

  // Specialized interaction for DARTHBATER NFT
  const jumpToFrame19 = useCallback(() => {
    // Jump from frame 15 to 19
    setIsFrozen(true);
    setCurrentFrameIndex(19);

    // Unfreeze after 800ms and resume playing
    if (freezeTimeoutRef.current) {
      clearTimeout(freezeTimeoutRef.current);
    }
    
    freezeTimeoutRef.current = window.setTimeout(() => {
      setIsFrozen(false);
      setIsPlaying(true);
    }, 800);
  }, []);

  return {
    currentFrameIndex,
    totalFrames,
    isPlaying,
    isLoading,
    hasError,
    isFrozen,
    gifCanvasRef,
    play,
    pause,
    restart,
    goToFrame,
    goToLastFrame,
    jumpToFrame19
  };
};
