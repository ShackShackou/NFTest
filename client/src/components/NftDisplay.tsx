import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import darthBaterGif from '@assets/13_DARTHBATER.gif';
import { cn } from '@/lib/utils';

// Types pour les effets visuels de game feel
interface GameEffect {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  scale: number;
}

interface NftDisplayProps {
  className?: string;
}

export function NftDisplay({ className }: NftDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [gameEffects, setGameEffects] = useState<GameEffect[]>([]);
  const [comboText, setComboText] = useState("");
  const [frameOrder, setFrameOrder] = useState<string[]>([]);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const effectIdRef = useRef(0);
  
  // Messages de combo qui apparaissent après plusieurs clics
  const comboMessages = [
    "Combo!",
    "Super!",
    "Fantastic!",
    "Amazing!",
    "Jedi Master!",
    "Force Unleashed!",
    "Epic!",
    "Legendary!"
  ];
  
  // Effets de particules en fonction du nombre de clics
  const createEffect = (x: number, y: number, clickCount: number) => {
    const id = effectIdRef.current++;
    const colors = ["#FF5252", "#FFD740", "#64FFDA", "#448AFF", "#E040FB"];
    
    // Détermine le texte à afficher en fonction du nombre de clics
    let text = "+1";
    if (clickCount % 10 === 0) {
      text = `+${clickCount}!`;
    } else if (clickCount % 5 === 0) {
      text = "+5!";
    }
    
    return {
      id,
      text,
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      scale: 1
    };
  };
  
  // Une fois que l'image est chargée, on met isLoading à false
  useEffect(() => {
    const img = new Image();
    img.src = darthBaterGif;
    img.onload = () => {
      setIsLoading(false);
    };
  }, []);
  
  // Effet pour animer et supprimer les effets visuels
  useEffect(() => {
    if (gameEffects.length === 0) return;
    
    const animationInterval = setInterval(() => {
      setGameEffects(prev => 
        prev.map(effect => ({
          ...effect,
          y: effect.y - 2, // Monte vers le haut
          opacity: effect.opacity - 0.02, // Disparaît progressivement
          scale: effect.scale + 0.01 // Grandit légèrement
        })).filter(effect => effect.opacity > 0) // Supprime les effets invisibles
      );
    }, 16); // ~60 FPS
    
    return () => clearInterval(animationInterval);
  }, [gameEffects]);
  
  // Effet pour afficher et supprimer le texte de combo
  useEffect(() => {
    if (!comboText) return;
    
    const timeout = setTimeout(() => {
      setComboText("");
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, [comboText]);

  // Fonction pour mettre en pause et reprendre l'animation du GIF
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

  // Fonction pour simuler le game feel avec des effets visuels lors du clic
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Incrémenter le compteur de clics
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    
    // Créer une position relative à l'intérieur du conteneur
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Ajouter un nouvel effet visuel "+1"
    const newEffect = createEffect(x, y, newClickCount);
    setGameEffects(prev => [...prev, newEffect]);
    
    // Afficher un message de combo après chaque 3 clics
    if (newClickCount % 3 === 0) {
      const comboIndex = Math.min(Math.floor(newClickCount / 3) - 1, comboMessages.length - 1);
      setComboText(comboMessages[comboIndex]);
    }
    
    // Quand l'utilisateur clique, on fait un traitement spécial sur l'image
    setIsFrozen(true);
    
    if (imgRef.current) {
      // Appliquer des effets visuels dynamiques de game feel
      imgRef.current.style.filter = `brightness(1.3) contrast(1.4) hue-rotate(${newClickCount * 10}deg)`;
      imgRef.current.style.transform = `scale(1.05) rotate(${Math.sin(newClickCount) * 3}deg)`;
      
      // Nettoyer le timeout existant si nécessaire
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Reprendre l'animation après un court délai
      timeoutRef.current = window.setTimeout(() => {
        setIsFrozen(false);
        setIsPaused(false);
        
        if (imgRef.current) {
          imgRef.current.style.filter = 'none';
          imgRef.current.style.transform = 'none';
          imgRef.current.style.animationPlayState = 'running';
        }
      }, 800);
    }
  };

  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      {/* NFT Display Container - Simple avec aucun contrôle UI */}
      <div 
        className="relative overflow-hidden transition-all duration-300 h-[450px] sm:h-[550px] flex items-center justify-center"
      >
        {/* Background teal - correspond à l'arrière-plan de votre GIF */}
        <div className="absolute inset-0 bg-[#1ab3b3] z-0"></div>
        
        {/* NFT Display */}
        <div 
          ref={containerRef}
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
            <div className="relative">
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
              
              {/* Effets visuels de game feel */}
              {gameEffects.map(effect => (
                <div
                  key={effect.id}
                  className="absolute pointer-events-none font-bold z-20"
                  style={{
                    left: `${effect.x}px`,
                    top: `${effect.y}px`,
                    color: effect.color,
                    opacity: effect.opacity,
                    transform: `scale(${effect.scale})`,
                    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                    fontSize: '24px'
                  }}
                >
                  {effect.text}
                </div>
              ))}
              
              {/* Texte de combo */}
              {comboText && (
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-white z-30"
                  style={{
                    textShadow: '0 0 10px #E040FB, 0 0 20px #FFD740, 0 0 30px #FF5252',
                    animation: 'pulse 0.5s ease-in-out infinite alternate'
                  }}
                >
                  {comboText}
                </div>
              )}
              
              {/* Compteur de score */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                Score: {clickCount}
              </div>
            </div>
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
