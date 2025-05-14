import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import darthBaterGif from '@assets/13_DARTHBATER.gif';
import { cn } from '@/lib/utils';
import { NftShop, ShopItem } from './NftShop';

// Types pour les effets visuels de game feel
interface GameEffect {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  scale: number;
  rotation?: number;
  type: 'text' | 'particle' | 'shockwave';
}

// Type pour les statistiques de jeu
interface GameStats {
  totalClicks: number;
  maxCombo: number;
  maxSpeed: number;
  bestScore: number;
  unlockedAchievements: string[];
}

// Type pour les états du personnage
interface CharacterState {
  isAttacking: boolean;
  isCrouching: boolean;
  isJumping: boolean;
  direction: 'left' | 'right';
}

interface NftDisplayProps {
  className?: string;
}

export function NftDisplay({ className }: NftDisplayProps) {
  // États de base
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [gameEffects, setGameEffects] = useState<GameEffect[]>([]);
  const [comboText, setComboText] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  // Système de combos et statistiques
  const [currentCombo, setCurrentCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [particleEffects, setParticleEffects] = useState<GameEffect[]>([]);
  const [shockwaves, setShockwaves] = useState<GameEffect[]>([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Statistiques et progression
  const [gameStats, setGameStats] = useState<GameStats>({
    totalClicks: 0,
    maxCombo: 0,
    maxSpeed: 1,
    bestScore: 0,
    unlockedAchievements: []
  });
  
  // État du personnage
  const [characterState, setCharacterState] = useState<CharacterState>({
    isAttacking: false,
    isCrouching: false,
    isJumping: false,
    direction: 'right'
  });
  
  // État pour les accessoires et objets dans la boutique
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: 1,
      name: "Casquette Rouge",
      description: "Une casquette tendance pour votre NFT",
      price: 50,
      imageSrc: "/assets/shop/cap.svg",
      category: "hat",
      owned: false,
      applied: false
    },
    {
      id: 2,
      name: "Lunettes Pixel",
      description: "Des lunettes stylées pour donner un look cool",
      price: 30,
      imageSrc: "/assets/shop/glasses.svg",
      category: "accessory",
      owned: false,
      applied: false
    },
    {
      id: 3,
      name: "Fond Spatial",
      description: "Un arrière-plan spatial qui ajoute de la profondeur",
      price: 100,
      imageSrc: "/assets/shop/background.svg",
      category: "background",
      owned: false,
      applied: false
    },
    {
      id: 4,
      name: "Effet Particules",
      description: "Des particules colorées qui suivent votre personnage",
      price: 75,
      imageSrc: "/assets/shop/effect.svg",
      category: "effect",
      owned: false,
      applied: false
    }
  ]);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLImageElement>(null);
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
  
  // Effets de particules en fonction du nombre de clics et du type d'effet
  const createEffect = (x: number, y: number, clickCount: number, type: GameEffect['type'] = 'text', multiplier = 1) => {
    const id = effectIdRef.current++;
    const colors = ["#FF5252", "#FFD740", "#64FFDA", "#448AFF", "#E040FB"];
    const selectedColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Détermine le texte à afficher en fonction du nombre de clics et du multiplicateur
    let text = `+${multiplier}`;
    if (clickCount % 10 === 0) {
      text = `+${clickCount * multiplier}!`;
    } else if (clickCount % 5 === 0) {
      text = `+${5 * multiplier}!`;
    }
    
    // Paramètres différents selon le type d'effet
    if (type === 'particle') {
      return {
        id,
        text: '', // Les particules n'ont pas de texte
        x: x + (Math.random() * 40) - 20,
        y: y + (Math.random() * 40) - 20,
        color: selectedColor,
        opacity: 0.8,
        scale: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * 360,
        type
      };
    } else if (type === 'shockwave') {
      return {
        id,
        text: '', // Les ondes de choc n'ont pas de texte
        x,
        y,
        color: `${selectedColor}50`, // Ajoute de la transparence pour les ondes de choc
        opacity: 0.7,
        scale: 0.1, // Commence petit puis grandit
        type
      };
    } else {
      // Type 'text' par défaut
      return {
        id,
        text,
        x,
        y,
        color: selectedColor,
        opacity: 1,
        scale: 1,
        type
      };
    }
  };
  
  // Crée un groupe de particules
  const createParticles = (x: number, y: number, count: number) => {
    const particles: GameEffect[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(createEffect(x, y, 0, 'particle'));
    }
    return particles;
  };
  
  // Crée une onde de choc
  const createShockwave = (x: number, y: number) => {
    return createEffect(x, y, 0, 'shockwave');
  };
  
  // Une fois que l'image est chargée, on met isLoading à false
  useEffect(() => {
    const img = new Image();
    img.src = darthBaterGif;
    img.onload = () => {
      setIsLoading(false);
    };
  }, []);
  
  // Effet pour animer les effets visuels (texte, particules, ondes de choc)
  useEffect(() => {
    if (gameEffects.length === 0 && particleEffects.length === 0 && shockwaves.length === 0) return;
    
    const animationInterval = setInterval(() => {
      // Animation des textes "+1", etc.
      setGameEffects(prev => 
        prev.map(effect => {
          if (effect.type === 'text') {
            return {
              ...effect,
              y: effect.y - 2, // Monte vers le haut
              opacity: effect.opacity - 0.02, // Disparaît progressivement
              scale: effect.scale + 0.01 // Grandit légèrement
            };
          }
          return effect;
        }).filter(effect => effect.opacity > 0) // Supprime les effets invisibles
      );
      
      // Animation des particules
      setParticleEffects(prev => 
        prev.map(effect => {
          if (effect.type === 'particle') {
            return {
              ...effect,
              y: effect.y - 3 * Math.random(), // Monte plus vite et aléatoirement
              x: effect.x + (Math.random() - 0.5) * 2, // Léger mouvement latéral
              opacity: effect.opacity - 0.03, // Disparaît plus rapidement
              rotation: (effect.rotation || 0) + 5, // Tourne
              scale: effect.scale - 0.01 // Rétrécit
            };
          }
          return effect;
        }).filter(effect => effect.opacity > 0) // Supprime les effets invisibles
      );
      
      // Animation des ondes de choc
      setShockwaves(prev => 
        prev.map(effect => {
          if (effect.type === 'shockwave') {
            return {
              ...effect,
              scale: effect.scale + 0.2, // Grandit rapidement
              opacity: effect.opacity - 0.05 // Disparaît encore plus vite
            };
          }
          return effect;
        }).filter(effect => effect.opacity > 0 && effect.scale < 5) // Supprime les ondes trop grandes ou invisibles
      );
    }, 16); // ~60 FPS
    
    return () => clearInterval(animationInterval);
  }, [gameEffects, particleEffects, shockwaves]);
  
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

  // Fonction pour acheter un élément de la boutique
  const handlePurchase = (item: ShopItem) => {
    if (clickCount >= item.price) {
      // Déduire le coût de l'item des points
      setClickCount(prev => prev - item.price);
      
      // Mettre à jour l'état de l'item pour le marquer comme possédé
      setShopItems(prev => prev.map(shopItem => 
        shopItem.id === item.id ? { ...shopItem, owned: true } : shopItem
      ));
      
      // Afficher un message de confirmation
      setComboText(`${item.name} acheté!`);
    }
  };
  
  // Fonction pour appliquer ou retirer un élément
  const handleApply = (item: ShopItem) => {
    // Trouver si l'élément est déjà appliqué
    const isCurrentlyApplied = shopItems.find(shopItem => shopItem.id === item.id)?.applied;
    
    // Si la catégorie est "hat", on met à jour l'animation de la casquette
    if (item.category === "hat" && capRef.current) {
      capRef.current.style.display = !isCurrentlyApplied ? "block" : "none";
    }
    
    // Mettre à jour l'état des items - désactiver tous les éléments de la même catégorie
    // et activer/désactiver celui sélectionné
    setShopItems(prev => prev.map(shopItem => 
      shopItem.category === item.category
        ? { ...shopItem, applied: shopItem.id === item.id ? !isCurrentlyApplied : false }
        : shopItem
    ));
  };

  // Gestion des combos et multiplicateurs
  const updateCombo = () => {
    const now = Date.now();
    // Si le clic est assez rapide après le dernier (moins de 1 seconde)
    if (now - lastClickTime < 1000) {
      const newCombo = currentCombo + 1;
      setCurrentCombo(newCombo);
      
      // Mise à jour du multiplicateur en fonction du combo
      if (newCombo >= 15) {
        setComboMultiplier(4); // x4 pour 15+ clics consécutifs
      } else if (newCombo >= 10) {
        setComboMultiplier(3); // x3 pour 10+ clics consécutifs
      } else if (newCombo >= 5) {
        setComboMultiplier(2); // x2 pour 5+ clics consécutifs
      }
      
      // Mettre à jour les statistiques si nécessaire
      if (newCombo > gameStats.maxCombo) {
        setGameStats(prev => ({ ...prev, maxCombo: newCombo }));
      }
    } else {
      // Réinitialiser le combo si trop lent
      setCurrentCombo(1);
      setComboMultiplier(1);
    }
    
    setLastClickTime(now);
  };
  
  // Fonction pour simuler la réaction du personnage
  const updateCharacterState = (x: number, containerWidth: number) => {
    // Change la direction du personnage en fonction de la position du clic
    const newDirection = x < containerWidth / 2 ? 'left' as const : 'right' as const;
    
    // Déclenche une animation d'attaque ou de saut aléatoirement
    const randomAction = Math.random();
    const newState = { 
      ...characterState, 
      direction: newDirection,
      isAttacking: false,
      isJumping: false,
      isCrouching: false
    };
    
    if (randomAction < 0.3) {
      newState.isAttacking = true;
      setTimeout(() => setCharacterState(prev => ({ ...prev, isAttacking: false })), 300);
    } else if (randomAction < 0.6) {
      newState.isJumping = true;
      setTimeout(() => setCharacterState(prev => ({ ...prev, isJumping: false })), 500);
    } else {
      newState.isCrouching = true;
      setTimeout(() => setCharacterState(prev => ({ ...prev, isCrouching: false })), 200);
    }
    
    setCharacterState(newState);
  };

  // Fonction pour accélérer l'animation au clic et ajouter tous les effets visuels
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Mise à jour du combo
    updateCombo();
    
    // Incrémenter le compteur de clics (multiplié par le multiplicateur de combo)
    const pointsToAdd = comboMultiplier;
    const newClickCount = clickCount + pointsToAdd;
    setClickCount(newClickCount);
    
    // Mettre à jour les statistiques totales
    setGameStats(prev => ({ 
      ...prev, 
      totalClicks: prev.totalClicks + 1,
      bestScore: Math.max(prev.bestScore, newClickCount)
    }));
    
    // Augmenter la vitesse d'animation (jusqu'à 5x plus rapide après plusieurs clics)
    const newSpeed = Math.min(5, 1 + (currentCombo / 5));
    setAnimationSpeed(newSpeed);
    
    // Mettre à jour les statistiques si c'est une nouvelle vitesse maximale
    if (newSpeed > gameStats.maxSpeed) {
      setGameStats(prev => ({ ...prev, maxSpeed: newSpeed }));
    }
    
    // Créer une position relative à l'intérieur du conteneur
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Mettre à jour l'état du personnage
    updateCharacterState(x, rect.width);
    
    // Ajouter un nouvel effet visuel "+1" ou plus selon le multiplicateur
    const newEffect = createEffect(x, y, newClickCount, 'text', comboMultiplier);
    setGameEffects(prev => [...prev, newEffect]);
    
    // Ajouter des particules
    const particles = createParticles(x, y, 5 + Math.floor(comboMultiplier * 2));
    setParticleEffects(prev => [...prev, ...particles]);
    
    // Ajouter une onde de choc
    const shockwave = createShockwave(x, y);
    setShockwaves(prev => [...prev, shockwave]);
    
    // Afficher un message de combo basé sur le nombre consécutif de clics
    if (currentCombo >= 3) {
      const comboIndex = Math.min(Math.floor(currentCombo / 3) - 1, comboMessages.length - 1);
      setComboText(comboMessages[comboIndex]);
      
      // Débloquer des succès
      if (currentCombo === 10 && !gameStats.unlockedAchievements.includes('Combo Master')) {
        setGameStats(prev => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, 'Combo Master']
        }));
        setComboText("🏆 SUCCÈS DÉBLOQUÉ: Combo Master!");
      }
    }
    
    // Quand l'utilisateur clique, on fait un traitement spécial sur l'image
    setIsFrozen(true);
    
    if (imgRef.current) {
      // Appliquer des effets visuels dynamiques de game feel qui changent avec le combo
      const hueRotate = currentCombo * 15;
      const brightness = 1 + (currentCombo / 20);
      const contrast = 1 + (currentCombo / 15);
      
      imgRef.current.style.filter = `brightness(${brightness}) contrast(${contrast}) hue-rotate(${hueRotate}deg)`;
      imgRef.current.style.transform = `scale(${1 + (currentCombo / 50)}) rotate(${Math.sin(currentCombo) * 5}deg)`;
      
      // Accélérer l'animation GIF avec animation-duration
      imgRef.current.style.animationDuration = `${1 / newSpeed}s`;
      
      // Nettoyer le timeout existant si nécessaire
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Reprendre l'animation après un court délai, plus court si le combo est élevé
      const freezeTime = Math.max(200, 800 - (currentCombo * 20));
      timeoutRef.current = window.setTimeout(() => {
        setIsFrozen(false);
        setIsPaused(false);
        
        if (imgRef.current) {
          // Transition plus douce pour revenir à la normale
          imgRef.current.style.transition = "filter 0.3s ease-out, transform 0.3s ease-out";
          imgRef.current.style.filter = 'none';
          imgRef.current.style.transform = 'none';
          imgRef.current.style.animationPlayState = 'running';
          // Laisser la nouvelle vitesse d'animation
          
          // Réinitialiser la transition après
          setTimeout(() => {
            if (imgRef.current) {
              imgRef.current.style.transition = "";
            }
          }, 300);
        }
      }, freezeTime);
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
              
              {/* Particules */}
              {particleEffects.map(effect => (
                <div
                  key={effect.id}
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${effect.x}px`,
                    top: `${effect.y}px`,
                    width: '8px',
                    height: '8px',
                    backgroundColor: effect.color,
                    opacity: effect.opacity,
                    transform: `scale(${effect.scale}) rotate(${effect.rotation || 0}deg)`,
                    borderRadius: '50%'
                  }}
                />
              ))}
              
              {/* Ondes de choc */}
              {shockwaves.map(effect => (
                <div
                  key={effect.id}
                  className="absolute pointer-events-none z-10"
                  style={{
                    left: `${effect.x}px`,
                    top: `${effect.y}px`,
                    width: '10px',
                    height: '10px',
                    border: `2px solid ${effect.color}`,
                    opacity: effect.opacity,
                    transform: `translate(-50%, -50%) scale(${effect.scale})`,
                    borderRadius: '50%'
                  }}
                />
              ))}
              
              {/* État du personnage (animation) */}
              {characterState.isAttacking && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-4xl">
                  ⚔️
                </div>
              )}
              
              {characterState.isJumping && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-4xl animate-bounce">
                  ↑
                </div>
              )}
              
              {/* Compteur de score et combo */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                Score: {clickCount} | Combo: x{comboMultiplier}
              </div>
              
              {/* Succès débloqués */}
              {gameStats.unlockedAchievements.length > 0 && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-gold px-3 py-1 rounded-full text-xs">
                  🏆 Succès: {gameStats.unlockedAchievements.length}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Interaction hint overlay */}
        {/* Boutique */}
        <NftShop
          points={clickCount}
          onPurchase={handlePurchase}
          onApply={handleApply}
          items={shopItems}
        />
        
        {/* Indicateur de vitesse d'animation */}
        <div className="absolute top-3 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
          Vitesse: {animationSpeed.toFixed(1)}x
        </div>
        
        {/* Overlay pour les accessoires appliqués */}
        {shopItems.find(item => item.id === 1 && item.applied) && (
          <div className="absolute top-[80px] left-0 right-0 flex justify-center pointer-events-none z-20">
            <img 
              ref={capRef}
              src="/assets/shop/cap.svg"
              alt="Casquette"
              className="casquette-overlay"
              style={{
                width: '64px',
                height: '32px',
                transform: isFrozen ? 'translateY(-2px) rotate(3deg)' : 'translateY(0)',
                transition: 'transform 0.3s ease-out'
              }}
            />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-dark/90 to-transparent text-center py-4 px-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs md:text-sm font-medium">
            <span className="mr-2">🖱️</span> 
            Cliquez pour interagir et accélérer l'animation
          </p>
        </div>
      </div>
    </div>
  );
}
