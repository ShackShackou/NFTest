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
  const frameInterval = useRef<number | null>(null);
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
    };
  }, [gifUrl]);

  // Animation control
  useEffect(() => {
    if (frames.length === 0 || !isPlaying) return;
    
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
  }, [frames, isPlaying, currentFrameIndex, totalFrames]);

  // Player controls
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const restart = useCallback(() => {
    setCurrentFrameIndex(0);
    setIsPlaying(true);
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

  return {
    currentFrameIndex,
    totalFrames,
    isPlaying,
    isLoading,
    hasError,
    gifCanvasRef,
    play,
    pause,
    restart,
    goToFrame,
    goToLastFrame,
  };
};
