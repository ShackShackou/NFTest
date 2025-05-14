import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import darthBaterGif from '@assets/13_DARTHBATER.gif';
import { cn } from '@/lib/utils';
import { NftShop, ShopItem } from './NftShop';
import { useToast } from '@/hooks/use-toast';

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
  level: number;
  xp: number;
  xpNeeded: number;
  specialAbilities: string[];
}

// Type pour le boss du jeu
interface Boss {
  active: boolean;
  health: number;
  maxHealth: number;
  name: string;
  sprite: string;
  level: number;
  attackTimer: number;
  defeated: boolean;
  animation: 'idle' | 'attack' | 'hurt' | 'defeat';
}

// Type pour les états du personnage
interface CharacterState {
  isAttacking: boolean;
  isCrouching: boolean;
  isJumping: boolean;
  direction: 'left' | 'right';
  evolution: 'normal' | 'evolved' | 'ultimate';
}

// Type pour les quêtes journalières
interface DailyQuest {
  id: string;
  title: string;
  description: string;
  requirement: number;
  currentProgress: number;
  reward: number;
  completed: boolean;
  type: 'clicks' | 'combos' | 'boss' | 'level';
}

// Type pour le tableau des meilleurs scores
interface HighScore {
  name: string;
  score: number;
  level: number;
  date: Date;
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
    unlockedAchievements: [],
    level: 1,
    xp: 0,
    xpNeeded: 100,
    specialAbilities: []
  });
  
  // Système de boss
  const [boss, setBoss] = useState<Boss>({
    active: false,
    health: 100,
    maxHealth: 100,
    name: "DARK PIXEL LORD",
    sprite: "👾",
    level: 1,
    attackTimer: 0,
    defeated: false,
    animation: 'idle'
  });
  
  // Système d'effets sonores
  const [sounds, setSounds] = useState({
    click: null as HTMLAudioElement | null,
    combo: null as HTMLAudioElement | null,
    levelUp: null as HTMLAudioElement | null,
    bossAppear: null as HTMLAudioElement | null,
    victory: null as HTMLAudioElement | null
  });
  
  // Notifications
  const { toast } = useToast();
  
  // État du personnage
  const [characterState, setCharacterState] = useState<CharacterState>({
    isAttacking: false,
    isCrouching: false,
    isJumping: false,
    direction: 'right',
    evolution: 'normal'
  });
  
  // Quêtes journalières
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([
    {
      id: 'quest1',
      title: 'Clicker fou',
      description: 'Cliquez 100 fois sur le NFT',
      requirement: 100,
      currentProgress: 0,
      reward: 50,
      completed: false,
      type: 'clicks'
    },
    {
      id: 'quest2',
      title: 'Combo master',
      description: 'Atteignez un combo de 15',
      requirement: 15,
      currentProgress: 0,
      reward: 100,
      completed: false,
      type: 'combos'
    },
    {
      id: 'quest3',
      title: 'Boss slayer',
      description: 'Battez 1 boss',
      requirement: 1,
      currentProgress: 0,
      reward: 200,
      completed: false,
      type: 'boss'
    }
  ]);
  
  // Tableau des meilleurs scores
  const [highScores, setHighScores] = useState<HighScore[]>([
    { name: "NFT Master", score: 1000, level: 5, date: new Date(2025, 3, 15) },
    { name: "Pixel Pro", score: 750, level: 4, date: new Date(2025, 3, 10) },
    { name: "Clicker King", score: 500, level: 3, date: new Date(2025, 3, 5) }
  ]);
  
  // Particules d'arrière-plan
  const [backgroundParticles, setBackgroundParticles] = useState<Array<{id: number, x: number, y: number, type: number}>>([]);
  
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
  
  // Initialisation des effets sonores
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Création des éléments audio
    const clickSound = new Audio();
    clickSound.src = "data:audio/wav;base64,UklGRl9GAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVtGAAAAAAEAAgADAAQABQAGAAYABwAIAAkACgALAAwADQAOAA8AEAARABIAEgATABQAFQAWABcAGAAZABoAGgAbABwAHQAeAB8AIAAhACIAIgAjACQAJQAmACcAKAApACoAKgArACwALQAuAC8AMAAxADIAMgAzADQANQA2ADcAOAA5ADoAOgA7ADwAPQA+AD8AQABBAEIAQgBDAEQARQBGAEcASABJAEoASgBLAEwATQBOAE8AUABRAFIAUgBTAFQAVQBWAFcAWABZAFoAWgBbAFwAXQBeAF8AYABhAGIAYgBjAGQAZQBmAGcAaABpAGoAagBrAGwAbQBuAG8AcABxAHIAcgBzAHQAdQB2AHcAeAB5AHoAegB7AHwAfQB+AH8AgACBAIIAggCDAIQAhQCGAIcAiACJAIoAigCLAIwAjQCOAI8AkACRAJIAkgCTAJQAlQCWAJcAmACZAJoAmgCbAJwAnQCeAJ8AoAChAKIAogCjAKQApQCmAKcAqACpAKoAqgCrAKwArQCuAK8AsACxALIAsgCzALQAtQC2ALcAuAC5ALoAugC7ALwAvQC+AL8AwADBAMIAwgDDAMQAxQDGAMcAyADJAMoAygDLAMwAzQDOAM8A0ADRANLA0gDTANQA1QDWANcA2ADZANoA2gDbANwA3QDeAN8A4ADhAOIA4gDjAOQA5QDmAOcA6ADpAOoA6gDrAOwA7QDuAO8A8ADxAPIA8gDzAPQA9QD2APcA+AD5APr/+v/5//j/9//2//X/9P/z//L/8f/w/+//7v/t/+z/6//q/+n/6P/n/+b/5f/k/+P/4v/h/+D/3//e/93/3P/b/9r/2f/Y/9f/1v/V/9T/0//S/9H/0P/P/87/zf/M/8v/yv/J/8j/x//G/8X/xP/D/8L/wf/A/7//vv+9/7z/u/+6/7n/uP+3/7b/tf+0/7P/sv+x/7D/r/+u/63/rP+r/6r/qf+o/6f/pv+l/6T/o/+i/6H/oP+f/57/nf+c/5v/mv+Z/5j/l/+W/5X/lP+T/5L/kf+Q/4//jv+N/4z/i/+K/4n/iP+H/4b/hf+E/4P/gv+B/4D/f/9+/33/fP97/3r/ef94/3f/dv91/3T/c/9y/3H/cP9v/27/bf9s/2v/av9p/2j/Z/9m/2X/ZP9j/2L/Yf9g/1//Xv9d/1z/W/9a/1n/WP9X/1b/Vf9U/1P/Uv9R/1D/T/9O/03/TP9L/0r/Sf9I/0f/Rv9F/0T/Q/9C/0H/QP8//z7/Pf88/zv/Ov85/zj/N/82/zX/NP8z/zL/Mf8w/y//Lv8t/yz/K/8q/yn/KP8n/yb/Jf8k/yP/Iv8h/yD/H/8e/x3/HP8b/xr/Gf8Y/xf/Fv8V/xT/E/8S/xH/EP8P/w7/Df8M/wv/Cv8J/wj/B/8G/wX/BP8D/wL/Af8A/gH+Av4D/gT+Bf4G/gf+CP4J/gr+C/4M/g3+Dv4P/hD+Ef4S/hP+FP4V/hb+F/4Y/hn+Gv4b/hz+Hf4e/h/+IP4h/iL+I/4k/iX+Jv4n/ij+Kf4q/iv+LP4t/i7+L/4w/jH+Mv4z/jT+Nf42/jf+OP45/jr+O/48/j3+Pv4//kD+Qf5C/kP+RP5F/kb+R/5I/kn+Sv5L/kz+Tf5O/k/+UP5R/lL+U/5U/lX+Vv5X/lj+Wf5a/lv+XP5d/l7+X/5g/mH+Yv5j/mT+Zf5m/mf+aP5p/mr+a/5s/m3+bv5v/nD+cf5y/nP+dP51/nb+d/54/nn+ev57/nz+ff5+/n/+gP6B/oL+g/6E/oX+hv6H/oj+if6K/ov+jP6N/o7+j/6Q/pH+kv6T/pT+lf6W/pf+mP6Z/pr+m/6c/p3+nv6f/qD+of6i/qP+pP6l/qb+p/6o/qn+qv6r/qz+rf6u/q/+sP6x/rL+s/60/rX+tv63/rj+uf66/rv+vP69/r7+v/7A/sH+wv7D/sT+xf7G/sf+yP7J/sr+y/7M/s3+zv7P/tD+0f7S/tP+1P7V/tb+1/7Y/tn+2v7b/tz+3f7e/t/+4P7h/uL+4/7k/uX+5v7n/uj+6f7q/uv+7P7t/u7+7/7w/vH+8v7z/vT+9f72/vf++P75/vr/+v/5//j/9//2//X/9P/z//L/8f/w/+//7v/t/+z/6//q/+n/6P/n/+b/5f/k/+P/4v/h/+D/3//e/93/3P/b/9r/2f/Y/9f/1v/V/9T/0//S/9H/0P/P/87/zf/M/8v/yv/J/8j/x//G/8X/xP/D/8L/wf/A/7//vv+9/7z/u/+6/7n/uP+3/7b/tf+0/7P/sv+x/7D/r/+u/63/rP+r/6r/qf+o/6f/pv+l/6T/o/+i/6H/oP+f/57/nf+c/5v/mv+Z/5j/l/+W/5X/lP+T/5L/kf+Q/4//jv+N/4z/i/+K/4n/iP+H/4b/hf+E/4P/gv+B/4D/f/9+/33/fP97/3r/ef94/3f/dv91/3T/c/9y/3H/cP9v/27/bf9s/2v/av9p/2j/Z/9m/2X/ZP9j/2L/Yf9g/1//Xv9d/1z/W/9a/1n/WP9X/1b/Vf9U/1P/Uv9R/1D/T/9O/03/TP9L/0r/Sf9I/0f/Rv9F/0T/Q/9C/0H/QP8//z7/Pf88/zv/Ov85/zj/N/82/zX/NP8z/zL/Mf8w/y//Lv8t/yz/K/8q/yn/KP8n/yb/Jf8k/yP/Iv8h/yD/H/8e/x3/HP8b/xr/Gf8Y/xf/Fv8V/xT/E/8S/xH/EP8P/w7/Df8M/wv/Cv8J/wj/B/8G/wX/BP8D/wL/Af8A";
    clickSound.volume = 0.2;
    
    const comboSound = new Audio();
    comboSound.src = "data:audio/wav;base64,UklGRgQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YeACAACBhYqFbF1WWm6DmKacjoJ5cG1wdHqAio2HeGZRQzg5QlJpeY+epaqonIVoTDEcDxITFBYbICIiHRYPCgYEBwoTIzNEVGRxfISNkpWTjoV5aFdIPDUxMDM6RVNhaG92fICEh4iKioiGgnpwY1hNQz01MDEzOkJMV2VziJamrbCvqaOZjHpnWEs/NT9IUV5reYWRm6KopqKbl4+CcWBRRDc2QlVjdIOVpbO7vsC8tbCqpJuSiHttYFRLQTw9QUpYZnN/ipCYmpiRh3hgRyMRCxAPEBEUFxYVDwwHAQEDCQ8bLUNZbYCTn6qxs7Oyr62mmpGJgXdsX1FGPjk1MzQ3PUZQWGNveIGIjZKTk5KMhX1xZFVKQDg2ODxETlZdZm92foOHiImKiISDfndvZ11TR0A6NTEzNzxFTVpndYKQm6WprK2pppyRg29dTT88QUpVYnB8iZSdoaGfnJeOg3ZoWk5FPz9HUl9sd4SDgn+AhpKirbGtpZ2UjYR9dWxkXFRMRkI/PTw+QERLUllgZm50eoCEhoaEgHt0bWZeV1BKREBAPj5AQ0dMUVdbX2NmaGpqa2tqaWdkYV5aV1NQTUtJSEdHSElLTU9SU1VXWFlaWllYVlRSUE1LSUdFREVFRkhKTU9SVFZYWVpbXFxbW1pZV1ZVVFJRUEZMR0I/PDo4NjU1NTU2Nzg6PD5AQUNFR0hJSkpJSUhHRkVDQkA/Pj08Ozo6OTk5Ojo7PD0+P0BBQkNERUVFRUVEQ0JBQD8+PTw7Ozo5OTk5Ojs8PD0+P0BBQkNDQ0REQ0NDQkFAQD8+PTw7Ozo6Ojo6Ozs8PT4/P0BBQUJCQkNDQ0JCQkFBQD8/Pj49PTw8Ozs7PDw9PT4/P0BAQUFBQkJCQkJCQUFBQEA/Pz4+PT08PDw8PDw9PT4+Pz9AQEBAQUFBQUFBQUFAQEBAPz8/Pj4+PT09PT09Pj4+Pz8/QEBAQEBAQUFBQUFAQEBAPz8/Pz4+Pj4+Pj4+Pj4/Pz8/Pz9AQEBAQEBtt5pP";
    comboSound.volume = 0.3;
    
    const levelUpSound = new Audio();
    levelUpSound.src = "data:audio/wav;base64,UklGRtwEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YbgEAACAgICAgICAgICAgICAgICAgICAgICAgICAf3hxeH+AfXZ1eYCFhIB5dHR5fX93cG9yeICAfHNucXiCg4B5c3h+gX96dXh9gYB8d3l+gH15dnd5fHx6eHd6fX59e3h3eHx9e3l4eXx9fHt6e3x9fHt7e3x9fHx7fHx9fX18fH19fX18fHx8fHx8fHx8fH19fX19fX1+fn59fX19fn5+fn5+fn5+f39/f39/f39/f3+AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIB/f39/f39/f39/f39/f39/f39+fn5+fn5+fn5+fn5+fn5+fn5+fn19fX19fX19fX19fX19fX19fXx8fHx8fHx8fHx8fHx8fHx8fHx8e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fH19fX19fX19fX19fX19fX19fX19fX19fX19fX5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAf39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3p6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fIpSwmA=";
    levelUpSound.volume = 0.4;
    
    const bossAppearSound = new Audio();
    bossAppearSound.src = "data:audio/wav;base64,UklGRrQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZADAACVhXhsVk9XZnqVqbbAwLu2qJV5ZExEUGN6kaWxuL24sKGMeGFNQDxEVGh/lam1u7y0pI9wVz4tLjlJYHeNoK63vLqzp5R7Z1A/O0NYcIigrbi/vLOrmo9+a1lKRUlUZXaBjJKZnqCgn5mSiHxwY1hOSElNVl5mbXJ3e36AgoOCgX96dW5mXlVOSUZHSk5UWl9laGxvcXJzcnFwbmtoZF9bV1RSUVBQUVJUVlhaXF1eX19gYGBfX15dXFpZWFdWVlVVVVVWVlZXV1hYWFhZWVlZWVlZWVhYWFhXV1dXV1ZWVlZWVlZWVlZWVlVVVVVVVVVVVVRUVFRUVFRUVFNTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTVFVWV1hZW11eX2BgYF9eXVtZWFZVU1JRUE9OTk1NTU5PUFFSVFVWWFlaW1xdXl5fYGBhYWJiYmNjY2NjY2NiYmJiYmFhYWFhYGBgYGBgYGBgYGBgYGBgYGFhYWFhYWFhYWFhYWFhYWFhYmJiYmJiYmJiY2NjY2NjZGRkZGRkZGRkZGRlZWVlZWVlZWVlZWVlZWVlZWVkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJi7HyARw==";
    bossAppearSound.volume = 0.5;
    
    const victorySound = new Audio();
    victorySound.src = "data:audio/wav;base64,UklGRsQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YaADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIBn+yNn";
    victorySound.volume = 0.5;
    
    // Enregistrement des sons
    setSounds({
      click: clickSound,
      combo: comboSound,
      levelUp: levelUpSound,
      bossAppear: bossAppearSound,
      victory: victorySound
    });
    
    // Toast de bienvenue
    toast({
      title: "Bienvenue dans NFT Interactive",
      description: "Cliquez sur le NFT pour commencer le jeu. Débloquez des améliorations en accumulant des points!",
      duration: 5000,
    });
    
  }, [toast]);
  
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
  
  // Mise en place des particules d'arrière-plan
  useEffect(() => {
    // Créer les particules initiales
    const particles = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100, // Position aléatoire en pourcentage
        y: Math.random() * 100,
        type: Math.floor(Math.random() * 3) + 1 // 3 types de particules
      });
    }
    
    setBackgroundParticles(particles);
  }, []);
  
  // Vérifier et mettre à jour les quêtes journalières
  useEffect(() => {
    const updatedQuests = dailyQuests.map(quest => {
      let newProgress = quest.currentProgress;
      
      // Mettre à jour la progression selon le type de quête
      if (quest.type === 'clicks' && !quest.completed) {
        newProgress = Math.min(quest.requirement, gameStats.totalClicks);
      } else if (quest.type === 'combos' && !quest.completed) {
        newProgress = Math.min(quest.requirement, gameStats.maxCombo);
      } else if (quest.type === 'boss' && !quest.completed && boss.level > 1) {
        newProgress = Math.min(quest.requirement, boss.level - 1);
      } else if (quest.type === 'level' && !quest.completed) {
        newProgress = Math.min(quest.requirement, gameStats.level);
      }
      
      // Vérifier si la quête est complétée
      const justCompleted = !quest.completed && newProgress >= quest.requirement;
      
      if (justCompleted) {
        // Récompenser le joueur
        setClickCount(prev => prev + quest.reward);
        
        // Afficher un toast pour annoncer la complétion de la quête
        toast({
          title: `🎯 Quête complétée: ${quest.title}`,
          description: `Vous avez gagné ${quest.reward} points!`,
          duration: 5000,
        });
      }
      
      return {
        ...quest,
        currentProgress: newProgress,
        completed: quest.completed || justCompleted
      };
    });
    
    setDailyQuests(updatedQuests);
  }, [gameStats.totalClicks, gameStats.maxCombo, boss.level, gameStats.level, toast]);
  
  // Évolution du personnage basée sur le niveau
  useEffect(() => {
    if (gameStats.level >= 10 && characterState.evolution !== 'ultimate') {
      // Évolution ultime
      setCharacterState(prev => ({ ...prev, evolution: 'ultimate' }));
      
      toast({
        title: "✨ ÉVOLUTION ULTIME!",
        description: "Votre NFT a atteint sa forme finale!",
        duration: 5000,
      });
      
    } else if (gameStats.level >= 5 && characterState.evolution === 'normal') {
      // Première évolution
      setCharacterState(prev => ({ ...prev, evolution: 'evolved' }));
      
      toast({
        title: "🌟 ÉVOLUTION!",
        description: "Votre NFT a évolué et devient plus puissant!",
        duration: 5000,
      });
    }
  }, [gameStats.level, characterState.evolution, toast]);
  
  // Mettre à jour les meilleurs scores
  useEffect(() => {
    if (clickCount > 0 && gameStats.level > 1) {
      // Vérifier si le score actuel est un meilleur score
      const lowestScore = highScores.length > 0 ? Math.min(...highScores.map(hs => hs.score)) : 0;
      
      if (clickCount > lowestScore || highScores.length < 5) {
        // Ajouter le nouveau score et trier
        const newHighScores = [
          ...highScores,
          { name: "Vous", score: clickCount, level: gameStats.level, date: new Date() }
        ]
        .sort((a, b) => b.score - a.score) // Trier par score décroissant
        .slice(0, 5); // Garder seulement les 5 premiers
        
        setHighScores(newHighScores);
      }
    }
  }, [clickCount, gameStats.level, highScores]);
  
  // Une fois que l'image est chargée, on met isLoading à false
  useEffect(() => {
    const img = new Image();
    img.src = darthBaterGif;
    img.onload = () => {
      setIsLoading(false);
    };
  }, []);
  

  
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

  // Système de niveau et progression
  const checkLevelUp = () => {
    const { xp, xpNeeded, level } = gameStats;
    
    // Si l'expérience actuelle dépasse ce qui est nécessaire, niveau supérieur
    if (xp >= xpNeeded) {
      const newLevel = level + 1;
      const newXpNeeded = xpNeeded * 1.5; // Augmentation exponentielle
      
      // Jouer le son de niveau supérieur
      if (sounds.levelUp && soundEnabled) {
        sounds.levelUp.currentTime = 0;
        sounds.levelUp.play().catch(error => console.error("Erreur lecture audio:", error));
      }
      
      // Afficher un message de niveau supérieur
      toast({
        title: `🎖️ NIVEAU ${newLevel} ATTEINT!`,
        description: "Vous avez débloqué de nouvelles capacités et bonus!",
        duration: 5000,
      });
      
      // Débloquer une nouvelle capacité spéciale selon le niveau
      let newAbility = "";
      if (newLevel === 2) {
        newAbility = "Double Clic";
      } else if (newLevel === 3) {
        newAbility = "Combo Explosif";
      } else if (newLevel === 5) {
        newAbility = "Maître du Temps";
      } else if (newLevel === 10) {
        newAbility = "Ultra Instinct";
      }
      
      // Mettre à jour les statistiques
      setGameStats(prev => ({ 
        ...prev, 
        level: newLevel, 
        xp: xp - xpNeeded, 
        xpNeeded: newXpNeeded,
        specialAbilities: newAbility ? [...prev.specialAbilities, newAbility] : prev.specialAbilities
      }));
      
      return true;
    }
    
    return false;
  };
  
  // Vérifier si le boss doit apparaître
  const checkBossAppearance = () => {
    // Le boss apparaît tous les 100 clics
    if (!boss.active && !boss.defeated && gameStats.totalClicks % 100 === 0 && gameStats.totalClicks > 0) {
      // Jouer le son d'apparition du boss
      if (sounds.bossAppear && soundEnabled) {
        sounds.bossAppear.currentTime = 0;
        sounds.bossAppear.play().catch(error => console.error("Erreur lecture audio:", error));
      }
      
      // Afficher un toast pour l'apparition du boss
      toast({
        title: `⚠️ BOSS DETECTED: ${boss.name} Lvl ${boss.level}`,
        description: "Cliquez rapidement pour vaincre le boss avant qu'il ne vous attaque!",
        duration: 5000,
        variant: "destructive"
      });
      
      // Activer le boss
      setBoss(prev => ({
        ...prev,
        active: true,
        health: 100 + (prev.level * 50),
        maxHealth: 100 + (prev.level * 50),
        animation: 'idle'
      }));
      
      return true;
    }
    
    return false;
  };
  
  // Gestion des combos et multiplicateurs
  const updateCombo = () => {
    const now = Date.now();
    // Si le clic est assez rapide après le dernier (moins de 1 seconde)
    if (now - lastClickTime < 1000) {
      const newCombo = currentCombo + 1;
      setCurrentCombo(newCombo);
      
      // Jouer le son de combo à partir de 5+
      if (newCombo >= 5 && sounds.combo && soundEnabled) {
        sounds.combo.currentTime = 0;
        sounds.combo.play().catch(error => console.error("Erreur lecture audio:", error));
      }
      
      // Mise à jour du multiplicateur en fonction du combo
      if (newCombo >= 15) {
        setComboMultiplier(4); // x4 pour 15+ clics consécutifs
      } else if (newCombo >= 10) {
        setComboMultiplier(3); // x3 pour 10+ clics consécutifs
      } else if (newCombo >= 5) {
        setComboMultiplier(2); // x2 pour 5+ clics consécutifs
      }
      
      // Ajouter de l'XP en fonction du combo
      const xpGain = Math.ceil(newCombo / 3);
      setGameStats(prev => ({ 
        ...prev, 
        xp: prev.xp + xpGain,
        maxCombo: Math.max(prev.maxCombo, newCombo)
      }));
      
      // Vérifier si un niveau supérieur est atteint
      checkLevelUp();
      
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

  // Gestion des attaques de boss
  const handleBossAttack = () => {
    if (boss.active && !boss.defeated) {
      // Animation d'attaque du boss
      setBoss(prev => ({ ...prev, animation: 'attack' }));
      
      // Effet visuel d'attaque
      toast({
        title: `💥 ${boss.name} ATTAQUE!`,
        description: "Vous perdez des points! Contre-attaquez rapidement!",
        duration: 2000,
        variant: "destructive"
      });
      
      // Pénalité de points
      setClickCount(prev => Math.max(0, prev - 10));
      
      // Retour à l'animation normale après l'attaque
      setTimeout(() => {
        setBoss(prev => ({ ...prev, animation: 'idle' }));
      }, 1000);
    }
  };
  
  // Gestion des attaques contre le boss
  const attackBoss = () => {
    if (boss.active && !boss.defeated) {
      // Calculer les dégâts basés sur le combo et le niveau du joueur
      const damage = Math.ceil(comboMultiplier * (1 + gameStats.level * 0.2));
      
      // Appliquer les dégâts
      const newHealth = Math.max(0, boss.health - damage);
      
      // Mise à jour de l'état du boss
      setBoss(prev => ({ 
        ...prev, 
        health: newHealth,
        animation: newHealth > 0 ? 'hurt' : 'defeat'
      }));
      
      // Vérifier si le boss est vaincu
      if (newHealth <= 0) {
        // Boss vaincu!
        toast({
          title: `🎉 ${boss.name} VAINCU!`,
          description: `Vous avez gagné ${50 * boss.level} points et débloquez une récompense spéciale!`,
          duration: 5000,
        });
        
        // Jouer le son de victoire
        if (sounds.victory && soundEnabled) {
          sounds.victory.currentTime = 0;
          sounds.victory.play().catch(error => console.error("Erreur lecture audio:", error));
        }
        
        // Récompenses
        setClickCount(prev => prev + (50 * boss.level));
        
        // Débloquer un succès
        if (!gameStats.unlockedAchievements.includes('Boss Slayer')) {
          setGameStats(prev => ({
            ...prev,
            unlockedAchievements: [...prev.unlockedAchievements, 'Boss Slayer']
          }));
        }
        
        // Mettre à jour l'état du boss
        setTimeout(() => {
          setBoss(prev => ({ 
            ...prev, 
            defeated: true,
            active: false,
            level: prev.level + 1
          }));
        }, 2000);
      }
    }
  };

  // Fonction pour accélérer l'animation au clic et ajouter tous les effets visuels
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Jouer le son de clic
    if (sounds.click && soundEnabled) {
      sounds.click.currentTime = 0;
      sounds.click.play().catch(error => console.error("Erreur lecture audio:", error));
    }
    
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
    
    // Vérifier si un boss doit apparaître
    checkBossAppearance();
    
    // Si un boss est actif, l'attaquer
    if (boss.active && !boss.defeated) {
      attackBoss();
    }
    
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
    
    // Capacité spéciale: Double Clic si débloquée
    const hasDoubleClic = gameStats.specialAbilities.includes('Double Clic');
    
    // Ajouter un nouvel effet visuel "+1" ou plus selon le multiplicateur
    const newEffect = createEffect(x, y, newClickCount, 'text', comboMultiplier);
    setGameEffects(prev => [...prev, newEffect]);
    
    // Double effet si la capacité est débloquée
    if (hasDoubleClic) {
      const xOffset = x + (Math.random() * 40 - 20);
      const yOffset = y + (Math.random() * 40 - 20);
      const secondEffect = createEffect(xOffset, yOffset, newClickCount, 'text', comboMultiplier);
      setGameEffects(prev => [...prev, secondEffect]);
    }
    
    // Capacité spéciale: Combo Explosif si débloquée
    const hasExplosiveCombo = gameStats.specialAbilities.includes('Combo Explosif');
    const particleCount = hasExplosiveCombo 
      ? 10 + Math.floor(comboMultiplier * 3) 
      : 5 + Math.floor(comboMultiplier * 2);
    
    // Ajouter des particules
    const particles = createParticles(x, y, particleCount);
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
      // Capacité spéciale: Maître du Temps si débloquée
      const hasTimeControl = gameStats.specialAbilities.includes('Maître du Temps');
      
      // Appliquer des effets visuels dynamiques de game feel qui changent avec le combo
      const hueRotate = currentCombo * 15;
      const brightness = 1 + (currentCombo / 20);
      const contrast = 1 + (currentCombo / 15);
      
      imgRef.current.style.filter = `brightness(${brightness}) contrast(${contrast}) hue-rotate(${hueRotate}deg)`;
      imgRef.current.style.transform = `scale(${1 + (currentCombo / 50)}) rotate(${Math.sin(currentCombo) * 5}deg)`;
      
      // Accélérer l'animation GIF avec animation-duration, bonus si capacité spéciale débloquée
      const speedMultiplier = hasTimeControl ? 1.5 : 1;
      imgRef.current.style.animationDuration = `${1 / (newSpeed * speedMultiplier)}s`;
      
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
            isFrozen && "frozen-frame",
            gameStats.level >= 10 ? 'bg-dynamic-3' : gameStats.level >= 5 ? 'bg-dynamic-2' : 'bg-dynamic-1'
          )}
          onMouseEnter={handleImageHover}
          onMouseLeave={handleImageLeave}
          onClick={handleImageClick}
        >
          {/* Particules d'arrière-plan */}
          {backgroundParticles.map(particle => (
            <div
              key={particle.id}
              className={`bg-particle bg-particle-${particle.type}`}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
            />
          ))}
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
              
              {/* Affichage du niveau et de l'XP */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs flex flex-col items-end">
                <div>Niveau: {gameStats.level}</div>
                <div className="w-20 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${(gameStats.xp / gameStats.xpNeeded) * 100}%` }}
                  ></div>
                </div>
                <div className="text-[10px] mt-0.5">XP: {gameStats.xp}/{Math.floor(gameStats.xpNeeded)}</div>
              </div>
              
              {/* Affichage du boss si actif */}
              {boss.active && !boss.defeated && (
                <div className="absolute left-1/2 top-4 transform -translate-x-1/2 z-30 flex flex-col items-center">
                  <div className={`text-4xl ${boss.animation === 'attack' ? 'scale-150 text-red-500' : boss.animation === 'hurt' ? 'shake text-red-300' : boss.animation === 'defeat' ? 'rotate-180 opacity-50' : ''}`}>
                    {boss.sprite}
                  </div>
                  <div className="text-white text-xs mt-1 font-bold">
                    {boss.name} Lvl {boss.level}
                  </div>
                  <div className="w-24 h-2 bg-gray-800 rounded-full mt-1">
                    <div 
                      className="h-full bg-red-600 rounded-full" 
                      style={{ width: `${(boss.health / boss.maxHealth) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Bouton pour désactiver/activer le son */}
              <button 
                className="absolute top-16 right-4 bg-black bg-opacity-70 text-white p-2 rounded-full text-xs z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setSoundEnabled(!soundEnabled);
                  toast({
                    title: soundEnabled ? "Sons désactivés" : "Sons activés",
                    duration: 2000,
                  });
                }}
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>
              
              {/* Capacités spéciales débloquées */}
              {gameStats.specialAbilities.length > 0 && (
                <div className="absolute bottom-12 left-4 bg-black bg-opacity-70 text-gold px-3 py-1 rounded-full text-xs">
                  ⚡ Capacités: {gameStats.specialAbilities.length}
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
