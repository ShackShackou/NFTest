import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { NftShop, ShopItem } from './NftShop';
import { useToast } from '@/hooks/use-toast';
import { 
  AnimationEffect, 
  loadAnimationsFromStorage,
  registerAnimation,
  triggerAnimation
} from '@/lib/animationService';

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
  claimed: boolean;
  type: 'clicks' | 'combos' | 'boss' | 'level';
}

// Type pour les particules d'arrière-plan
interface BackgroundParticle {
  id: number;
  x: number;
  y: number;
  type: number;
}

// Type pour les événements temporels
interface TimeEvent {
  active: boolean;
  currentEvent: {
    type: 'night' | 'weekend' | 'special';
    name: string;
    description: string;
    rewards: string[];
    multiplier: number;
    endTime: Date;
  } | null;
  completed: string[];
}

// Type pour les mini-jeux
interface MiniGames {
  unlocked: { memory: boolean; puzzle: boolean; platformer: boolean };
  active: null | 'memory' | 'puzzle' | 'platformer';
  memoryGame: {
    cards: { id: number; icon: string; matched: boolean; flipped: boolean }[];
    firstCard?: number;
    secondCard?: number;
    moves: number;
    pairs: number;
    completed: boolean;
  };
  puzzleGame: {
    pieces: { id: number; position: number; correctPosition: number }[];
    moves: number;
    completed: boolean;
  };
  platformerGame: {
    position: { x: number; y: number };
    platforms: { x: number; y: number; width: number }[];
    obstacles: { x: number; y: number; type: string }[];
    goal: { x: number; y: number };
    completed: boolean;
  };
}

// Type pour le tableau des meilleurs scores
interface HighScore {
  name: string;
  score: number;
  level: number;
  date: Date;
}

// Type pour les chapitres et fragments narratifs
interface StoryChapter {
  id: number;
  title: string;
  description: string;
  fragments: StoryFragment[];
  unlocked: boolean;
  completed: boolean;
}

interface StoryFragment {
  id: number;
  text: string;
  choices?: StoryChoice[];
  unlocked: boolean;
  read: boolean;
}

interface StoryChoice {
  id: number;
  text: string;
  consequence: string;
  unlockFragmentId?: number;
  selected: boolean;
}

interface StoryState {
  showStoryUI: boolean;
  chapters: StoryChapter[];
  currentChapter: number;
  currentFragment: number;
  playerChoices: { chapterId: number; fragmentId: number; choiceId: number }[];
  ending: 'none' | 'good' | 'neutral' | 'bad';
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
  
  // État pour la navigation à l'intérieur du NFT
  const [activeScreen, setActiveScreen] = useState<'main' | 'stats' | 'shop' | 'quests' | 'story' | 'minigames' | 'secretcodes'>('main');
  
  // États pour les fonctionnalités ARG
  const [clickPattern, setClickPattern] = useState<number[]>([]);
  const [foundClues, setFoundClues] = useState<string[]>([]);
  const [secretCode, setSecretCode] = useState<string>('');
  const [secretMessages, setSecretMessages] = useState<string[]>([]);
  const [hasHiddenFeature, setHasHiddenFeature] = useState<boolean>(false);
  const [lastDecryptionKey, setLastDecryptionKey] = useState<string>('');
  
  // Messages cryptés pour l'ARG
  const [encryptedMessages] = useState<{[key: string]: string}>({
    'PIXEL42': 'KFdeWEJQSlBEUVJAWFo=', // Message codé à décrypter
    'DARKBATER': 'QEdKS0BQQ0dLQkFUQ0ZH',
    'NFTHUNTER': 'REpAR05AQ1pNQVRDQEA=',
    'CHAINMASTER': 'QEBIRkNURkdARkBDSEFGR0BEUQ=='
  });
  
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

  // Points et monnaie du jeu
  const [points, setPoints] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  // Boss de jeu
  const [boss, setBoss] = useState<Boss>({
    active: false,
    health: 1000,
    maxHealth: 1000,
    name: "Le Pixel Corrompu",
    sprite: "boss-sprite.svg",
    level: 1,
    attackTimer: 0,
    defeated: false,
    animation: 'idle'
  });
  
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
      id: "quest1",
      title: "Cliqueur Frénétique",
      description: "Faire 100 clics aujourd'hui",
      requirement: 100,
      currentProgress: 0,
      reward: 500,
      completed: false,
      claimed: false,
      type: 'clicks'
    },
    {
      id: "quest2",
      title: "Maître du Combo",
      description: "Atteindre un combo de 10",
      requirement: 10,
      currentProgress: 0,
      reward: 300,
      completed: false,
      claimed: false,
      type: 'combos'
    }
  ]);
  
  // Particules d'arrière-plan
  const [backgroundParticles, setBackgroundParticles] = useState<BackgroundParticle[]>([]);
  
  // Highscores
  const [highScores, setHighScores] = useState<HighScore[]>([
    { name: "Pixel Master", score: 9500, level: 42, date: new Date() },
    { name: "NFT Enjoyer", score: 8200, level: 36, date: new Date() },
    { name: "Crypto King", score: 7800, level: 31, date: new Date() }
  ]);
  
  // Système d'événements temporels
  const [timeEvents, setTimeEvents] = useState<TimeEvent>({
    active: false,
    currentEvent: null,
    completed: []
  });
  
  // Système de mini-jeux
  const [miniGames, setMiniGames] = useState<MiniGames>({
    unlocked: { memory: false, puzzle: false, platformer: false },
    active: null,
    memoryGame: {
      cards: Array(16).fill(0).map((_, i) => ({
        id: i,
        icon: ['🍎', '🍌', '🍇', '🍒', '🍊', '🍍', '🥝', '🥭'][Math.floor(i/2)],
        matched: false,
        flipped: false
      })),
      moves: 0,
      pairs: 0,
      completed: false
    },
    puzzleGame: {
      pieces: Array(9).fill(0).map((_, i) => ({
        id: i,
        position: i,
        correctPosition: i
      })),
      moves: 0,
      completed: false
    },
    platformerGame: {
      position: { x: 50, y: 200 },
      platforms: [
        { x: 0, y: 250, width: 200 },
        { x: 250, y: 200, width: 100 },
        { x: 400, y: 150, width: 150 }
      ],
      obstacles: [
        { x: 220, y: 240, type: 'spike' },
        { x: 350, y: 140, type: 'fire' }
      ],
      goal: { x: 500, y: 120 },
      completed: false
    }
  });

  // Système de récit et narration
  const [storyState, setStoryState] = useState<StoryState>({
    showStoryUI: false,
    chapters: [
      {
        id: 1,
        title: "L'éveil du pixel",
        description: "Le début de votre voyage dans ce monde numérique",
        fragments: [
          {
            id: 1,
            text: "Vous vous réveillez dans un monde fait de pixels. Les couleurs sont vives, l'air est chargé d'énergie numérique.",
            unlocked: true,
            read: false,
          },
          {
            id: 2,
            text: "Une voix résonne dans votre tête: 'Bienvenue dans le Pixelverse. Vous avez été choisi.'",
            choices: [
              {
                id: 1,
                text: "Demander: 'Choisi pour quoi?'",
                consequence: "La voix répond: 'Pour restaurer l'harmonie du code.'",
                unlockFragmentId: 3,
                selected: false
              },
              {
                id: 2,
                text: "Rester silencieux",
                consequence: "La voix continue: 'Votre silence est sage. Observez d'abord.'",
                unlockFragmentId: 4,
                selected: false
              }
            ],
            unlocked: false,
            read: false
          },
          {
            id: 3,
            text: "Vous apprenez que le Pixelverse est menacé par une corruption qui dévore le code source. Seul un être capable de manipuler les pixels peut y remédier.",
            unlocked: false,
            read: false
          },
          {
            id: 4,
            text: "En observant attentivement, vous remarquez que certains pixels semblent plus lumineux que d'autres. Ce sont des fragments de code pur.",
            unlocked: false,
            read: false
          }
        ],
        unlocked: true,
        completed: false
      },
      {
        id: 2,
        title: "Les gardiens du code",
        description: "Découvrez ceux qui protègent le Pixelverse",
        fragments: [
          {
            id: 1,
            text: "Vous rencontrez les Gardiens du Code, des entités anciennes qui surveillent l'intégrité du Pixelverse depuis sa création.",
            unlocked: false,
            read: false
          }
        ],
        unlocked: false,
        completed: false
      }
    ],
    currentChapter: 1,
    currentFragment: 1,
    playerChoices: [],
    ending: 'none'
  });
  
  // Référence pour l'animation GIF et le canvas
  const gifRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLImageElement>(null);
  const glassesRef = useRef<HTMLImageElement>(null);
  const backgroundRef = useRef<HTMLImageElement>(null);
  const effectRef = useRef<HTMLImageElement>(null);
  const animationContainerRef = useRef<HTMLDivElement>(null);
  
  // Animation personnalisée
  const [customAnimations, setCustomAnimations] = useState<AnimationEffect[]>([]);
  const [animationInstances, setAnimationInstances] = useState<string[]>([]);
  
  // Items du shop
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: 1,
      name: "Casquette Pixel",
      description: "Une casquette stylée qui augmente vos points de 10%",
      price: 500,
      imageSrc: '/assets/shop/cap.svg',
      category: 'hat',
      owned: false
    },
    {
      id: 2,
      name: "Lunettes Cool",
      description: "Des lunettes qui augmentent votre vitesse d'animation de 5%",
      price: 750,
      imageSrc: '/assets/shop/glasses.svg',
      category: 'accessory',
      owned: false
    },
    {
      id: 3,
      name: "Fond Galaxy",
      description: "Un arrière-plan cosmique qui double vos points de combo",
      price: 1000,
      imageSrc: '/assets/shop/background.svg',
      category: 'background',
      owned: false
    },
    {
      id: 4,
      name: "Effet Néon",
      description: "Un effet lumineux qui attire des points bonus",
      price: 1500,
      imageSrc: '/assets/shop/effect.svg',
      category: 'effect',
      owned: false
    }
  ]);
  
  const { toast } = useToast();
  
  // Fonction pour corriger les erreurs de type de variant toast
  const showToast = (title: string, description: string, variant: 'default' | 'destructive' | 'success' = 'default') => {
    // Convertir 'success' en 'default' pour être compatible avec le type attendu
    const toastVariant: 'default' | 'destructive' | undefined = 
      variant === 'success' ? 'default' : variant;
      
    toast({
      title,
      description,
      variant: toastVariant
    });
  };
  
  // Gère la soumission d'un code secret
  const handleSecretCodeSubmit = () => {
    if (checkSecretCode(secretCode)) {
      // Code valide
      const decryptedMessage = atob(encryptedMessages[secretCode.toUpperCase()]);
      setSecretMessages(prev => [...prev, decryptedMessage]);
      setLastDecryptionKey(secretCode);
      
      // Activer fonctionnalité cachée
      setHasHiddenFeature(true);
      
      // Récompenser le joueur
      setPoints(prev => prev + 500);
      setGameStats(prev => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, `Code secret: ${secretCode}`]
      }));
      
      showToast(
        "Code secret validé!",
        "Vous avez débloqué un contenu exclusif (+500 points)",
        "success"
      );
      
      // Réinitialiser le champ de code
      setSecretCode('');
    } else {
      // Code invalide
      showToast(
        "Code invalide",
        "Ce code secret n'existe pas. Continuez à chercher!",
        "destructive"
      );
    }
  };
  
  // Vérifie si un motif de clic spécifique est effectué
  const checkClickPattern = (pattern: number[]) => {
    const clue = revealHiddenClue(pattern);
    if (clue && !foundClues.includes(clue)) {
      setFoundClues(prev => [...prev, clue]);
      
      showToast(
        "Indice ARG découvert!",
        clue,
        "success"
      );
    }
  };
  
  // Mise à jour du motif de clic lors d'un clic sur le NFT
  const updateClickPattern = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Diviser la zone en grille 3x3 pour suivre les motifs
    const gridX = Math.floor((x / rect.width) * 3) + 1;
    const gridY = Math.floor((y / rect.height) * 3) + 1;
    const gridPosition = (gridY - 1) * 3 + gridX; // 1 à 9, représentant la position
    
    // Stocker les 5 derniers clics pour le motif
    const newPattern = [...clickPattern, gridPosition].slice(-5);
    setClickPattern(newPattern);
    
    // Vérifier le motif
    checkClickPattern(newPattern);
  };
  
  // Initialisation et chargement
  useEffect(() => {
    // Simuler le temps de chargement
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Initialiser les particules d'arrière-plan
      setBackgroundParticles(generateBackgroundParticles(15));
      // Vérifier s'il y a un événement temporel actif
      checkTimeEvents();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Charger les animations personnalisées
  useEffect(() => {
    // Charger les animations depuis le stockage local
    const animations = loadAnimationsFromStorage();
    if (animations && animations.length > 0) {
      setCustomAnimations(animations);
      
      // Enregistrer chaque animation active dans le DOM
      const instances = animations
        .filter(anim => anim.active)
        .map(anim => registerAnimation(anim));
      
      setAnimationInstances(instances);
    }
    
    // Nettoyer les animations à la destruction du composant
    return () => {
      animationInstances.forEach(instance => {
        try {
          const styleElement = document.getElementById(`anim_style_${instance}`);
          if (styleElement) {
            document.head.removeChild(styleElement);
          }
        } catch (error) {
          console.error("Erreur lors du nettoyage des animations:", error);
        }
      });
    };
  }, []);
  
  // Animation des particules d'arrière-plan
  useEffect(() => {
    if (isPaused || isFrozen) return;
    
    const interval = setInterval(() => {
      setBackgroundParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: (particle.x + (Math.sin(particle.id) * 0.5)) % 100,
          y: (particle.y + (Math.cos(particle.id) * 0.3) + 0.1) % 100
        }))
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [isPaused, isFrozen]);

  // Animation des effets visuels
  useEffect(() => {
    if (gameEffects.length === 0 || isPaused || isFrozen) return;
    
    const interval = setInterval(() => {
      setGameEffects(prevEffects => 
        prevEffects
          .map(effect => ({
            ...effect,
            y: effect.y - 1,
            opacity: effect.opacity - 0.02,
            scale: effect.scale + 0.01
          }))
          .filter(effect => effect.opacity > 0)
      );
      
      setParticleEffects(prevEffects => 
        prevEffects
          .map(effect => ({
            ...effect,
            x: effect.x + (Math.sin(effect.id) * 2),
            y: effect.y - 2,
            opacity: effect.opacity - 0.02,
            scale: effect.scale - 0.02,
            rotation: (effect.rotation || 0) + 5
          }))
          .filter(effect => effect.opacity > 0)
      );
      
      setShockwaves(prevEffects => 
        prevEffects
          .map(effect => ({
            ...effect,
            scale: effect.scale + 0.2,
            opacity: effect.opacity - 0.05
          }))
          .filter(effect => effect.opacity > 0)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, [gameEffects, particleEffects, shockwaves, isPaused, isFrozen]);

  // Animation du boss
  useEffect(() => {
    if (!boss.active || isPaused || isFrozen) return;
    
    const interval = setInterval(() => {
      setBoss(prevBoss => {
        if (prevBoss.health <= 0 && !prevBoss.defeated) {
          return { ...prevBoss, animation: 'defeat', defeated: true };
        }
        
        // Logique d'attaque du boss
        const newAttackTimer = prevBoss.attackTimer + 1;
        if (newAttackTimer >= 100 && prevBoss.animation === 'idle') {
          // Le boss attaque
          return { ...prevBoss, attackTimer: 0, animation: 'attack' };
        } else if (prevBoss.animation === 'attack' && newAttackTimer >= 20) {
          // L'attaque est terminée, retour à l'état d'inactivité
          return { ...prevBoss, animation: 'idle' };
        } else if (prevBoss.animation === 'hurt' && newAttackTimer >= 10) {
          // L'animation de dégâts est terminée
          return { ...prevBoss, animation: 'idle' };
        }
        
        return { ...prevBoss, attackTimer: newAttackTimer };
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [boss, isPaused, isFrozen]);

  // Logique des quêtes journalières
  useEffect(() => {
    const updateQuestsInterval = setInterval(() => {
      if (isPaused || isFrozen) return;
      
      setDailyQuests(prevQuests => 
        prevQuests.map(quest => {
          let newProgress = quest.currentProgress;
          let completed = quest.completed;
          
          // Mise à jour de la progression en fonction du type de quête
          if (quest.type === 'clicks') {
            newProgress = Math.min(gameStats.totalClicks, quest.requirement);
          } else if (quest.type === 'combos') {
            newProgress = Math.min(gameStats.maxCombo, quest.requirement);
          } else if (quest.type === 'level') {
            newProgress = Math.min(gameStats.level, quest.requirement);
          }
          
          // Vérifier si la quête est complétée
          if (newProgress >= quest.requirement && !completed) {
            completed = true;
            // Notification de quête complétée
            showToast(
              "Quête complétée!",
              `${quest.title} - Réclamer ${quest.reward} points`,
              "success"
            );
          }
          
          return { ...quest, currentProgress: newProgress, completed };
        })
      );
    }, 1000);
    
    return () => clearInterval(updateQuestsInterval);
  }, [gameStats, isPaused, isFrozen, toast]);

  // Vérification des événements temporels
  const checkTimeEvents = () => {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    let newEvent = timeEvents.currentEvent;
    let isActive = false;
    
    // Événement nocturne (entre 22h et 6h)
    if (currentHour >= 22 || currentHour < 6) {
      newEvent = {
        type: 'night',
        name: "Mode Nuit",
        description: "Gagnez 2x plus de points pendant la nuit!",
        rewards: ["Double Points", "Animations Spéciales"],
        multiplier: 2,
        endTime: new Date(new Date().setHours(6, 0, 0, 0))
      };
      isActive = true;
    } 
    // Événement de week-end (samedi et dimanche)
    else if (currentDay === 0 || currentDay === 6) {
      newEvent = {
        type: 'weekend',
        name: "Bonus Week-end",
        description: "C'est le week-end! +50% d'XP pour tout le week-end.",
        rewards: ["50% XP Bonus", "Déblocage spécial shop"],
        multiplier: 1.5,
        endTime: new Date(new Date().setHours(23, 59, 59, 999))
      };
      isActive = true;
    }
    
    setTimeEvents({
      ...timeEvents,
      active: isActive,
      currentEvent: newEvent
    });
    
    if (isActive && newEvent) {
      toast({
        title: `Événement: ${newEvent.name}`,
        description: newEvent.description,
        variant: "default"
      });
    }
  };

  // Génération de particules d'arrière-plan
  const generateBackgroundParticles = (count: number): BackgroundParticle[] => {
    return Array(count).fill(0).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: Math.floor(Math.random() * 3)
    }));
  };

  // Gestionnaire de clic sur le NFT
  const handleNftClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaused || isFrozen) return;
    
    // Calculer la position du clic par rapport à l'élément
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // ==== Système ARG: Détection de motifs de clics ====
    // Diviser la zone en grille 3x3 pour le suivi des motifs
    const gridX = Math.floor((x / 100) * 3) + 1;
    const gridY = Math.floor((y / 100) * 3) + 1;
    const gridPosition = (gridY - 1) * 3 + gridX; // 1 à 9, représentant la position dans la grille
    
    // Stocker les 5 derniers clics pour le motif
    const newPattern = [...clickPattern, gridPosition].slice(-5);
    setClickPattern(newPattern);
    
    // Vérifier si le motif correspond à un indice caché
    const clue = revealHiddenClue(newPattern);
    if (clue && !foundClues.includes(clue)) {
      setFoundClues(prev => [...prev, clue]);
      
      // Animation spéciale pour la découverte d'un indice
      const clueEffect: GameEffect = {
        id: Date.now() + 100,
        text: "💡 INDICE TROUVÉ!",
        x: 50,
        y: 40,
        color: '#f5f542',
        opacity: 1,
        scale: 1.5,
        type: 'text'
      };
      setGameEffects(prev => [...prev, clueEffect]);
      
      showToast(
        "Indice ARG découvert!",
        clue,
        "success"
      );
    }
    
    // ==== Gameplay standard ====
    // Incrémenter le compteur de clics
    setClickCount(prev => prev + 1);
    
    // Mettre à jour les statistiques
    setGameStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1
    }));
    
    // Déclencher les animations personnalisées liées au clic
    if (animationContainerRef.current) {
      animationInstances.forEach(instanceId => {
        triggerAnimation(
          instanceId, 
          'click', 
          animationContainerRef.current as HTMLElement,
          {
            score: points,
            level: gameStats.level,
            combo: currentCombo
          }
        );
      });
    }
    
    // Logique de combo
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    setLastClickTime(now);
    
    let newCombo = currentCombo;
    let newMultiplier = comboMultiplier;
    
    // Si le clic est assez rapide, augmenter le combo
    if (timeDiff < 500) {
      newCombo += 1;
      if (newCombo % 5 === 0) {
        newMultiplier += 0.5;
      }
      
      setComboText(`Combo x${newCombo}`);
      
      // Animation de texte combo
      const comboEffect: GameEffect = {
        id: Date.now(),
        text: `Combo x${newCombo}`,
        x,
        y,
        color: newCombo > 10 ? '#ffcc00' : '#ffffff',
        opacity: 1,
        scale: 1,
        type: 'text'
      };
      
      setGameEffects(prev => [...prev, comboEffect]);
    } else {
      // Réinitialiser le combo si trop lent
      if (newCombo > gameStats.maxCombo) {
        setGameStats(prev => ({
          ...prev,
          maxCombo: newCombo
        }));
        
        // Déclencher les animations personnalisées liées au nouveau record de combo
        if (animationContainerRef.current) {
          animationInstances.forEach(instanceId => {
            triggerAnimation(
              instanceId, 
              'condition', 
              animationContainerRef.current as HTMLElement,
              {
                score: points,
                level: gameStats.level,
                combo: newCombo
              }
            );
          });
        }
      }
      
      newCombo = 1;
      newMultiplier = 1;
      setComboText("");
    }
    
    setCurrentCombo(newCombo);
    setComboMultiplier(newMultiplier);
    
    // Points gagnés pour ce clic
    const basePoints = 10;
    const eventMultiplier = timeEvents.active && timeEvents.currentEvent 
      ? timeEvents.currentEvent.multiplier 
      : 1;
    
    const pointsEarned = Math.floor(basePoints * newMultiplier * eventMultiplier);
    
    // Mettre à jour les points
    setPoints(prev => prev + pointsEarned);
    setEarnedPoints(pointsEarned);
    
    // Ajouter l'effet visuel des points gagnés
    const pointsEffect: GameEffect = {
      id: Date.now() + 1,
      text: `+${pointsEarned}`,
      x,
      y,
      color: '#00ff00',
      opacity: 1,
      scale: 1,
      type: 'text'
    };
    
    setGameEffects(prev => [...prev, pointsEffect]);
    
    // Créer des particules
    const particleCount = Math.min(Math.floor(newCombo / 2) + 2, 10);
    const newParticles = Array(particleCount).fill(0).map((_, i) => ({
      id: Date.now() + 100 + i,
      text: '*',
      x: x + (Math.random() * 10 - 5),
      y: y + (Math.random() * 10 - 5),
      color: getRandomColor(),
      opacity: 1,
      scale: 0.5 + Math.random() * 0.5,
      rotation: Math.random() * 360,
      type: 'particle' as const
    }));
    
    setParticleEffects(prev => [...prev, ...newParticles]);
    
    // Ajouter un effet d'onde de choc sur les clics puissants
    if (newCombo > 5 || Math.random() > 0.7) {
      const shockwave: GameEffect = {
        id: Date.now() + 200,
        text: '',
        x,
        y,
        color: 'rgba(255, 255, 255, 0.3)',
        opacity: 0.7,
        scale: 0.1,
        type: 'shockwave'
      };
      
      setShockwaves(prev => [...prev, shockwave]);
    }
    
    // Logique d'XP et de niveau
    const xpGained = Math.floor(pointsEarned / 5);
    updateExperience(xpGained);
    
    // Si un boss est actif, lui infliger des dégâts
    if (boss.active && !boss.defeated) {
      const damage = Math.floor(10 * newMultiplier);
      setBoss(prev => {
        const newHealth = Math.max(0, prev.health - damage);
        
        // Ajouter un effet de dégâts sur le boss
        const damageEffect: GameEffect = {
          id: Date.now() + 300,
          text: `-${damage}`,
          x: 50, // Centré sur le boss
          y: 40,
          color: '#ff0000',
          opacity: 1,
          scale: 1,
          type: 'text'
        };
        
        setGameEffects(prev => [...prev, damageEffect]);
        
        return {
          ...prev,
          health: newHealth,
          animation: newHealth <= 0 ? 'defeat' : 'hurt'
        };
      });
    }
    
    // Logique pour accélérer l'animation avec les clics rapides
    if (timeDiff < 300) {
      setAnimationSpeed(prev => {
        const newSpeed = Math.min(prev + 0.1, 3.0);
        if (newSpeed > gameStats.maxSpeed) {
          setGameStats(prevStats => ({
            ...prevStats,
            maxSpeed: newSpeed
          }));
        }
        return newSpeed;
      });
    } else {
      // Diminuer progressivement la vitesse si les clics sont plus lents
      setAnimationSpeed(prev => Math.max(prev - 0.05, 1.0));
    }
  };

  // Mise à jour de l'expérience et du niveau
  const updateExperience = (xpAmount: number) => {
    setGameStats(prev => {
      let newXp = prev.xp + xpAmount;
      let newLevel = prev.level;
      let newXpNeeded = prev.xpNeeded;
      
      // Vérifier si le joueur monte de niveau
      while (newXp >= newXpNeeded) {
        newXp -= newXpNeeded;
        newLevel += 1;
        newXpNeeded = Math.floor(newXpNeeded * 1.5);
        
        // Notification de niveau supérieur
        showToast(
          "Niveau supérieur!",
          `Vous avez atteint le niveau ${newLevel}!`,
          "success"
        );
        
        // Déclencher les animations personnalisées liées au niveau
        if (animationContainerRef.current) {
          animationInstances.forEach(instanceId => {
            triggerAnimation(
              instanceId, 
              'condition', 
              animationContainerRef.current as HTMLElement,
              {
                score: points,
                level: newLevel,
                combo: currentCombo
              }
            );
          });
        }
        
        // Débloquer des mini-jeux en fonction du niveau
        if (newLevel === 3 && !miniGames.unlocked.memory) {
          setMiniGames(prev => ({
            ...prev, 
            unlocked: { ...prev.unlocked, memory: true }
          }));
          
          toast({
            title: "Mini-jeu débloqué!",
            description: "Vous avez débloqué le jeu de mémoire!",
            variant: "default"
          });
        } else if (newLevel === 5 && !miniGames.unlocked.puzzle) {
          setMiniGames(prev => ({
            ...prev, 
            unlocked: { ...prev.unlocked, puzzle: true }
          }));
          
          toast({
            title: "Mini-jeu débloqué!",
            description: "Vous avez débloqué le jeu de puzzle!",
            variant: "default"
          });
        } else if (newLevel === 8 && !miniGames.unlocked.platformer) {
          setMiniGames(prev => ({
            ...prev, 
            unlocked: { ...prev.unlocked, platformer: true }
          }));
          
          toast({
            title: "Mini-jeu débloqué!",
            description: "Vous avez débloqué le jeu de plateforme!",
            variant: "default"
          });
        }
        
        // Débloquer des chapitres d'histoire en fonction du niveau
        if (newLevel === 2) {
          unlockStoryFragment(1, 2); // Débloque le fragment 2 du chapitre 1
        } else if (newLevel === 4) {
          unlockStoryChapter(2); // Débloque le chapitre 2
        }
      }
      
      return { ...prev, xp: newXp, level: newLevel, xpNeeded: newXpNeeded };
    });
  };

  // Fonctions pour le système de narration
  const unlockStoryFragment = (chapterId: number, fragmentId: number) => {
    setStoryState(prev => {
      const newChapters = [...prev.chapters];
      const chapterIndex = newChapters.findIndex(c => c.id === chapterId);
      
      if (chapterIndex >= 0) {
        const chapter = newChapters[chapterIndex];
        const fragmentIndex = chapter.fragments.findIndex(f => f.id === fragmentId);
        
        if (fragmentIndex >= 0) {
          chapter.fragments[fragmentIndex].unlocked = true;
          
          toast({
            title: "Nouvelle histoire débloquée!",
            description: `Un nouveau fragment de l'histoire est disponible!`,
            variant: "default"
          });
        }
      }
      
      return { ...prev, chapters: newChapters };
    });
  };

  const unlockStoryChapter = (chapterId: number) => {
    setStoryState(prev => {
      const newChapters = [...prev.chapters];
      const chapterIndex = newChapters.findIndex(c => c.id === chapterId);
      
      if (chapterIndex >= 0) {
        newChapters[chapterIndex].unlocked = true;
        // Débloquer le premier fragment du chapitre
        if (newChapters[chapterIndex].fragments.length > 0) {
          newChapters[chapterIndex].fragments[0].unlocked = true;
        }
        
        showToast(
          "Nouveau chapitre débloqué!",
          `Le chapitre "${newChapters[chapterIndex].title}" est maintenant disponible!`,
          "success"
        );
      }
      
      return { ...prev, chapters: newChapters };
    });
  };

  const makeStoryChoice = (choiceId: number) => {
    setStoryState(prev => {
      const chapter = prev.chapters.find(c => c.id === prev.currentChapter);
      if (!chapter) return prev;
      
      const fragment = chapter.fragments.find(f => f.id === prev.currentFragment);
      if (!fragment || !fragment.choices) return prev;
      
      const choice = fragment.choices.find(c => c.id === choiceId);
      if (!choice) return prev;
      
      // Marquer le choix comme sélectionné
      const newChapters = [...prev.chapters];
      const chapterIndex = newChapters.findIndex(c => c.id === prev.currentChapter);
      const fragmentIndex = newChapters[chapterIndex].fragments.findIndex(
        f => f.id === prev.currentFragment
      );
      
      // Mettre à jour tous les choix pour ce fragment
      const newChoices = newChapters[chapterIndex].fragments[fragmentIndex].choices?.map(
        c => ({ ...c, selected: c.id === choiceId })
      );
      
      if (newChoices) {
        newChapters[chapterIndex].fragments[fragmentIndex].choices = newChoices;
      }
      
      // Enregistrer le choix du joueur
      const newPlayerChoices = [
        ...prev.playerChoices,
        { chapterId: prev.currentChapter, fragmentId: prev.currentFragment, choiceId }
      ];
      
      // Débloquer le fragment associé au choix si spécifié
      if (choice.unlockFragmentId) {
        const fragmentToUnlockIndex = newChapters[chapterIndex].fragments.findIndex(
          f => f.id === choice.unlockFragmentId
        );
        
        if (fragmentToUnlockIndex >= 0) {
          newChapters[chapterIndex].fragments[fragmentToUnlockIndex].unlocked = true;
        }
      }
      
      // Afficher la conséquence du choix
      toast({
        title: "Conséquence",
        description: choice.consequence,
        variant: "default"
      });
      
      return { 
        ...prev, 
        chapters: newChapters, 
        playerChoices: newPlayerChoices 
      };
    });
  };

  const toggleStoryUI = () => {
    setStoryState(prev => ({ ...prev, showStoryUI: !prev.showStoryUI }));
  };

  const readStoryFragment = (chapterId: number, fragmentId: number) => {
    setStoryState(prev => {
      const newChapters = [...prev.chapters];
      const chapterIndex = newChapters.findIndex(c => c.id === chapterId);
      
      if (chapterIndex >= 0) {
        const fragmentIndex = newChapters[chapterIndex].fragments.findIndex(
          f => f.id === fragmentId
        );
        
        if (fragmentIndex >= 0) {
          newChapters[chapterIndex].fragments[fragmentIndex].read = true;
        }
      }
      
      return { 
        ...prev, 
        chapters: newChapters,
        currentChapter: chapterId,
        currentFragment: fragmentId
      };
    });
  };

  // Gestionnaire pour ouvrir un mini-jeu
  const handleOpenMiniGame = (gameType: 'memory' | 'puzzle' | 'platformer') => {
    if (!miniGames.unlocked[gameType]) {
      toast({
        title: "Mini-jeu verrouillé",
        description: `Atteignez un niveau plus élevé pour débloquer ce mini-jeu.`,
        variant: "destructive"
      });
      return;
    }
    
    setMiniGames(prev => ({ ...prev, active: gameType }));
  };

  // Gestionnaire pour fermer un mini-jeu
  const handleCloseMiniGame = () => {
    setMiniGames(prev => ({ ...prev, active: null }));
  };

  // Fonction pour jouer une carte dans le jeu de mémoire
  const handleMemoryCardClick = (cardId: number) => {
    setMiniGames(prev => {
      // Ignorer si deux cartes sont déjà retournées
      const game = prev.memoryGame;
      if (game.firstCard !== undefined && game.secondCard !== undefined) return prev;
      
      // Ignorer si la carte est déjà retournée ou associée
      const cardIndex = game.cards.findIndex(card => card.id === cardId);
      if (game.cards[cardIndex].flipped || game.cards[cardIndex].matched) return prev;
      
      // Retourner la carte
      const newCards = [...game.cards];
      newCards[cardIndex].flipped = true;
      
      let newFirstCard = game.firstCard;
      let newSecondCard = game.secondCard;
      let newMoves = game.moves;
      let newPairs = game.pairs;
      
      // Première ou deuxième carte?
      if (newFirstCard === undefined) {
        newFirstCard = cardId;
      } else {
        newSecondCard = cardId;
        newMoves++;
        
        // Vérifier si les cartes correspondent
        const firstCardIndex = game.cards.findIndex(card => card.id === newFirstCard);
        if (newCards[firstCardIndex].icon === newCards[cardIndex].icon) {
          // Paire trouvée
          newCards[firstCardIndex].matched = true;
          newCards[cardIndex].matched = true;
          newPairs++;
          
          // Vérifier si le jeu est terminé
          if (newPairs === 8) {
            showToast(
              "Félicitations!",
              `Vous avez terminé le jeu de mémoire en ${newMoves} mouvements!`,
              "success"
            );
            
            // Récompense pour avoir terminé le jeu
            const pointsEarned = Math.max(100, 800 - (newMoves * 20));
            setPoints(prev => prev + pointsEarned);
            updateExperience(pointsEarned / 5);
            
            return {
              ...prev,
              memoryGame: {
                ...game,
                cards: newCards,
                firstCard: undefined,
                secondCard: undefined,
                moves: newMoves,
                pairs: newPairs,
                completed: true
              }
            };
          }
          
          // Réinitialiser pour le prochain tour
          newFirstCard = undefined;
          newSecondCard = undefined;
        } else {
          // Les cartes ne correspondent pas, les retourner après un délai
          setTimeout(() => {
            setMiniGames(current => {
              const currentCards = [...current.memoryGame.cards];
              currentCards[firstCardIndex].flipped = false;
              currentCards[cardIndex].flipped = false;
              
              return {
                ...current,
                memoryGame: {
                  ...current.memoryGame,
                  cards: currentCards,
                  firstCard: undefined,
                  secondCard: undefined
                }
              };
            });
          }, 1000);
        }
      }
      
      return {
        ...prev,
        memoryGame: {
          ...game,
          cards: newCards,
          firstCard: newFirstCard,
          secondCard: newSecondCard,
          moves: newMoves,
          pairs: newPairs
        }
      };
    });
  };

  // Fonctions pour le jeu de puzzle
  const handlePuzzlePieceClick = (pieceId: number) => {
    setMiniGames(prev => {
      const game = prev.puzzleGame;
      const pieceIndex = game.pieces.findIndex(piece => piece.id === pieceId);
      
      // Échanger avec une pièce adjacente
      const emptyIndex = game.pieces.findIndex(piece => piece.position === 8); // La position 8 est vide
      const emptyPosition = game.pieces[emptyIndex].position;
      const piecePosition = game.pieces[pieceIndex].position;
      
      // Vérifier si le mouvement est valide (adjacence)
      const isValid = 
        (Math.abs(emptyPosition % 3 - piecePosition % 3) === 1 && Math.floor(emptyPosition / 3) === Math.floor(piecePosition / 3)) ||
        (Math.abs(Math.floor(emptyPosition / 3) - Math.floor(piecePosition / 3)) === 1 && emptyPosition % 3 === piecePosition % 3);
      
      if (!isValid) return prev;
      
      // Effectuer le mouvement
      const newPieces = [...game.pieces];
      newPieces[pieceIndex].position = emptyPosition;
      newPieces[emptyIndex].position = piecePosition;
      
      const newMoves = game.moves + 1;
      
      // Vérifier si le puzzle est résolu
      const completed = newPieces.every(piece => piece.position === piece.correctPosition);
      
      if (completed) {
        showToast(
          "Félicitations!",
          `Vous avez résolu le puzzle en ${newMoves} mouvements!`,
          "success"
        );
        
        // Récompense pour avoir terminé le jeu
        const pointsEarned = Math.max(150, 1000 - (newMoves * 10));
        setPoints(prev => prev + pointsEarned);
        updateExperience(pointsEarned / 5);
      }
      
      return {
        ...prev,
        puzzleGame: {
          ...game,
          pieces: newPieces,
          moves: newMoves,
          completed
        }
      };
    });
  };

  // Fonction pour réclamer une quête complétée
  const claimQuest = (questId: string) => {
    setDailyQuests(prevQuests => 
      prevQuests.map(quest => {
        if (quest.id === questId && quest.completed && !quest.claimed) {
          // Ajouter les points de récompense
          setPoints(prev => prev + quest.reward);
          
          showToast(
            "Récompense réclamée!",
            `Vous avez reçu ${quest.reward} points!`,
            "success"
          );
          
          return { ...quest, claimed: true };
        }
        return quest;
      })
    );
  };

  // Achat d'un item du shop
  const handlePurchase = (item: ShopItem) => {
    if (points < item.price) {
      toast({
        title: "Points insuffisants",
        description: `Il vous manque ${item.price - points} points pour acheter cet item.`,
        variant: "destructive"
      });
      return;
    }
    
    setPoints(prev => prev - item.price);
    
    setShopItems(prevItems => 
      prevItems.map(shopItem => 
        shopItem.id === item.id 
          ? { ...shopItem, owned: true } 
          : shopItem
      )
    );
    
    showToast(
      "Achat réussi!",
      `Vous avez acheté ${item.name}!`,
      "success"
    );
  };

  // Application d'un item
  const handleApply = (item: ShopItem) => {
    if (!item.owned) {
      toast({
        title: "Item non possédé",
        description: `Vous devez d'abord acheter cet item.`,
        variant: "destructive"
      });
      return;
    }
    
    setShopItems(prevItems => 
      prevItems.map(shopItem => {
        // Désélectionner tous les items de la même catégorie
        if (shopItem.category === item.category) {
          return { ...shopItem, applied: shopItem.id === item.id };
        }
        return shopItem;
      })
    );
    
    showToast(
      "Item appliqué",
      `Vous avez équipé ${item.name}!`,
      "default"
    );
  };

  // Génération d'une couleur aléatoire
  const getRandomColor = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Système de cryptographie pour les ARG (Alternate Reality Games)
  const decryptMessage = (encryptedMessage: string, key: string): string => {
    // Simple XOR encryption/decryption
    let decrypted = '';
    for (let i = 0; i < encryptedMessage.length; i++) {
      const encryptedChar = encryptedMessage.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    return decrypted;
  };
  
  // Fonction pour vérifier un code secret entré par le joueur
  const checkSecretCode = (code: string): boolean => {
    // Les codes secrets peuvent déclencher des événements spéciaux dans le jeu
    const secretCodes = [
      "PIXEL42", 
      "DARKBATER", 
      "NFTHUNTER",
      "CHAINMASTER"
    ];
    
    return secretCodes.includes(code.toUpperCase());
  };
  
  // Fonction pour révéler progressivement des indices cachés
  const revealHiddenClue = (clickPattern: number[]): string | null => {
    // Certains motifs de clics spécifiques peuvent révéler des indices
    // Exemple : cliquer dans la séquence coin supérieur gauche, 
    // centre, coin inférieur droit, centre
    
    const patterns = {
      "1,4,7,4": "Cherchez dans le coin sombre de l'image...",
      "2,2,5,5": "Le code est caché dans les métadonnées",
      "3,6,3,6": "Suivez @creator sur Twitter pour le prochain indice",
      "7,7,7": "Discord: rejoignez le canal #secret-hunters"
    };
    
    const patternKey = clickPattern.join(',');
    return patterns[patternKey as keyof typeof patterns] || null;
  };

  // Fonction pour afficher le récit
  const showStoryDetails = () => {
    const currentChapter = storyState.chapters.find(c => c.id === storyState.currentChapter);
    if (!currentChapter) return null;
    
    const currentFragment = currentChapter.fragments.find(f => f.id === storyState.currentFragment);
    if (!currentFragment) return null;
    
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 overflow-auto">
        <div className="bg-gray-800 rounded-lg p-4 w-full h-full overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-white">{currentChapter.title}</h2>
            <button 
              onClick={() => setActiveScreen('main')}
              className="text-gray-400 hover:text-white"
            >
              Retour au jeu
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-200 mb-3 text-sm">{currentFragment.text}</p>
            
            {currentFragment.choices && currentFragment.choices.length > 0 && (
              <div className="mt-3 space-y-2">
                <h3 className="text-sm font-medium text-white mb-2">Choisissez une action:</h3>
                {currentFragment.choices.map(choice => (
                  <button
                    key={choice.id}
                    onClick={() => makeStoryChoice(choice.id)}
                    disabled={choice.selected}
                    className={`block w-full text-left p-2 rounded text-xs ${
                      choice.selected 
                        ? 'bg-blue-900 text-blue-100' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {choice.text}
                    {choice.selected && (
                      <div className="mt-1 text-xs text-blue-300">
                        {choice.consequence}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-700 pt-3">
            <h3 className="text-sm font-medium text-white mb-2">Chapitres:</h3>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {storyState.chapters.filter(chapter => chapter.unlocked).map(chapter => (
                <div key={chapter.id} className="space-y-1">
                  <h4 className="font-medium text-gray-200 text-xs">{chapter.title}</h4>
                  <div className="ml-2 space-y-1">
                    {chapter.fragments
                      .filter(fragment => fragment.unlocked)
                      .map(fragment => (
                        <button
                          key={fragment.id}
                          onClick={() => readStoryFragment(chapter.id, fragment.id)}
                          className={`block text-left px-2 py-1 rounded text-xs ${
                            storyState.currentChapter === chapter.id && 
                            storyState.currentFragment === fragment.id
                              ? 'bg-blue-800 text-white'
                              : fragment.read
                                ? 'text-gray-400 hover:text-white'
                                : 'text-yellow-500 hover:text-yellow-300'
                          }`}
                        >
                          Fragment {fragment.id}
                          {!fragment.read && <span className="ml-2">•</span>}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des mini-jeux
  const renderMiniGame = () => {
    if (!miniGames.active) return null;
    
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-4 w-full h-full overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-white">
              {miniGames.active === 'memory' ? 'Jeu de Mémoire' : 
               miniGames.active === 'puzzle' ? 'Puzzle' : 'Platformer'}
            </h2>
            <button 
              onClick={() => {
                handleCloseMiniGame();
                setActiveScreen('main');
              }}
              className="text-gray-400 hover:text-white"
            >
              Retour au jeu
            </button>
          </div>
          
          {miniGames.active === 'memory' && (
            <div>
              <div className="flex justify-between mb-4">
                <div className="text-white">Mouvements: {miniGames.memoryGame.moves}</div>
                <div className="text-white">Paires: {miniGames.memoryGame.pairs}/8</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {miniGames.memoryGame.cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleMemoryCardClick(card.id)}
                    className={`aspect-square flex items-center justify-center text-2xl rounded ${
                      card.flipped || card.matched
                        ? 'bg-blue-600'
                        : 'bg-gray-700'
                    }`}
                    disabled={card.matched || miniGames.memoryGame.completed}
                  >
                    {(card.flipped || card.matched) && card.icon}
                  </button>
                ))}
              </div>
              {miniGames.memoryGame.completed && (
                <div className="mt-4 p-3 bg-green-800 text-white rounded text-center">
                  Félicitations! Vous avez complété le jeu en {miniGames.memoryGame.moves} mouvements!
                </div>
              )}
            </div>
          )}
          
          {miniGames.active === 'puzzle' && (
            <div>
              <div className="flex justify-between mb-4">
                <div className="text-white">Mouvements: {miniGames.puzzleGame.moves}</div>
              </div>
              <div className="grid grid-cols-3 gap-1 w-64 mx-auto">
                {miniGames.puzzleGame.pieces.map(piece => (
                  <button
                    key={piece.id}
                    onClick={() => handlePuzzlePieceClick(piece.id)}
                    className={`aspect-square flex items-center justify-center text-2xl rounded ${
                      piece.position === 8 // La pièce vide
                        ? 'bg-transparent'
                        : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                    disabled={piece.position === 8 || miniGames.puzzleGame.completed}
                  >
                    {piece.position !== 8 && piece.id + 1}
                  </button>
                ))}
              </div>
              {miniGames.puzzleGame.completed && (
                <div className="mt-4 p-3 bg-green-800 text-white rounded text-center">
                  Félicitations! Vous avez résolu le puzzle en {miniGames.puzzleGame.moves} mouvements!
                </div>
              )}
            </div>
          )}
          
          {miniGames.active === 'platformer' && (
            <div>
              <div className="relative w-full h-64 bg-gray-900 rounded overflow-hidden">
                {/* Personnage joueur */}
                <div 
                  className="absolute w-8 h-8 bg-yellow-500 rounded-full"
                  style={{ 
                    left: `${miniGames.platformerGame.position.x}px`, 
                    top: `${miniGames.platformerGame.position.y}px` 
                  }}
                ></div>
                
                {/* Plateformes */}
                {miniGames.platformerGame.platforms.map((platform, idx) => (
                  <div
                    key={idx}
                    className="absolute h-4 bg-gray-600 rounded"
                    style={{
                      left: `${platform.x}px`,
                      top: `${platform.y}px`,
                      width: `${platform.width}px`
                    }}
                  ></div>
                ))}
                
                {/* Obstacles */}
                {miniGames.platformerGame.obstacles.map((obstacle, idx) => (
                  <div
                    key={idx}
                    className={`absolute w-6 h-6 ${
                      obstacle.type === 'spike' 
                        ? 'bg-red-500' 
                        : 'bg-orange-500'
                    } rounded`}
                    style={{
                      left: `${obstacle.x}px`,
                      top: `${obstacle.y}px`
                    }}
                  ></div>
                ))}
                
                {/* But */}
                <div
                  className="absolute w-8 h-8 bg-green-500 rounded-full animate-pulse"
                  style={{
                    left: `${miniGames.platformerGame.goal.x}px`,
                    top: `${miniGames.platformerGame.goal.y}px`
                  }}
                ></div>
              </div>
              
              <div className="mt-4 flex justify-center gap-2">
                <button className="px-4 py-2 bg-gray-700 rounded">←</button>
                <button className="px-4 py-2 bg-gray-700 rounded">→</button>
                <button className="px-4 py-2 bg-gray-700 rounded">Sauter</button>
              </div>
              
              <div className="mt-4 text-gray-300 text-sm text-center">
                Note: Le mini-jeu plateforme est simplifié pour cette démo. Utilisez les boutons pour contrôler le personnage.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500">Chargement de l'expérience NFT...</p>
      </div>
    );
  }

  // Fonction pour rendre l'écran principal (jeu)
  const renderMainScreen = () => (
    <div className="relative w-full h-full cursor-none" onClick={handleNftClick}>
      {/* Fond interactif avec particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {backgroundParticles.map(particle => (
          <div 
            key={particle.id}
            className={cn(
              "absolute w-2 h-2 rounded-full opacity-50",
              particle.type === 0 ? "bg-blue-500" : 
              particle.type === 1 ? "bg-purple-500" : "bg-pink-500"
            )}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `scale(${1 + (Math.sin(particle.id) * 0.5)})`,
              transition: "transform 0.5s ease-out"
            }}
          />
        ))}
      </div>
      
      {/* Fond personnalisé */}
      {shopItems.find(item => item.category === 'background' && item.applied) && (
        <div className="absolute inset-0 pointer-events-none z-10" ref={backgroundRef}>
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-70"></div>
        </div>
      )}
      
      {/* NFT Image (S.H.A.C.K.E.R. #01) */}
      <img 
        ref={gifRef}
        src="/images/shacker-01.jpg" 
        alt="S.H.A.C.K.E.R. #01" 
        className="w-full h-full object-cover"
        style={{
          filter: isFrozen ? "grayscale(100%)" : "none",
          opacity: isPaused ? 0.7 : 1
        }}
      />
      
      {/* Boss overlay (si actif) */}
      {boss.active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          {/* Barre de vie du boss */}
          <div className="w-4/5 h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-red-600 transition-all duration-300 ease-out"
              style={{ width: `${(boss.health / boss.maxHealth) * 100}%` }}
            ></div>
          </div>
          
          <div className="text-white text-xs mb-4">
            {boss.name} - Niveau {boss.level}
          </div>
          
          {boss.defeated && (
            <div className="text-3xl font-bold text-yellow-400 animate-bounce shadow-lg p-2">
              BOSS VAINCU!
            </div>
          )}
        </div>
      )}
      
      {/* Overlay pour les particules et effets visuels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Effets de texte popup */}
        {gameEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute font-bold transition-all ease-out pointer-events-none"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              color: effect.color,
              opacity: effect.opacity,
              transform: `translate(-50%, -50%) scale(${effect.scale})`,
              textShadow: "0 0 5px rgba(0,0,0,0.5)"
            }}
          >
            {effect.text}
          </div>
        ))}
        
        {/* Particules */}
        {particleEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute transition-all ease-out pointer-events-none text-xl"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              color: effect.color,
              opacity: effect.opacity,
              transform: `translate(-50%, -50%) scale(${effect.scale}) rotate(${effect.rotation}deg)`,
              textShadow: "0 0 5px rgba(0,0,0,0.5)"
            }}
          >
            {effect.text}
          </div>
        ))}
        
        {/* Ondes de choc */}
        {shockwaves.map(effect => (
          <div
            key={effect.id}
            className="absolute rounded-full transition-all ease-out pointer-events-none border-2 border-white"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              opacity: effect.opacity,
              transform: `translate(-50%, -50%) scale(${effect.scale})`,
              width: "50px",
              height: "50px"
            }}
          ></div>
        ))}
      </div>
      
      {/* Overlay pour les accessoires appliqués */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {shopItems.find(item => item.category === 'hat' && item.applied) && (
          <img 
            ref={capRef}
            src="/assets/shop/cap.svg" 
            alt="Cap" 
            className="absolute top-5 left-1/2 transform -translate-x-1/2 w-24 h-auto"
            style={{
              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))"
            }}
          />
        )}
        
        {shopItems.find(item => item.category === 'accessory' && item.applied) && (
          <img 
            ref={glassesRef}
            src="/assets/shop/glasses.svg" 
            alt="Glasses" 
            className="absolute top-20 left-1/2 transform -translate-x-1/2 w-20 h-auto"
            style={{
              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))"
            }}
          />
        )}
        
        {shopItems.find(item => item.category === 'effect' && item.applied) && (
          <img 
            ref={effectRef}
            src="/assets/shop/effect.svg" 
            alt="Effect" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            style={{
              opacity: 0.6,
              animation: "pulse 2s infinite"
            }}
          />
        )}
      </div>
      
      {/* Barre d'état et navigation */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-30">
        <button
          onClick={() => setActiveScreen('stats')}
          className="bg-gray-800/70 hover:bg-gray-700/90 text-white text-xs px-2 py-1 rounded"
        >
          Stats
        </button>
        <button
          onClick={() => setActiveScreen('quests')}
          className="bg-gray-800/70 hover:bg-gray-700/90 text-white text-xs px-2 py-1 rounded"
        >
          Quêtes
        </button>
        <button
          onClick={() => setActiveScreen('shop')}
          className="bg-gray-800/70 hover:bg-gray-700/90 text-white text-xs px-2 py-1 rounded"
        >
          Boutique
        </button>
        <button
          onClick={() => setActiveScreen('story')}
          className="bg-purple-800/70 hover:bg-purple-700/90 text-white text-xs px-2 py-1 rounded"
        >
          Histoire
        </button>
        <button
          onClick={() => setActiveScreen('minigames')}
          className="bg-blue-800/70 hover:bg-blue-700/90 text-white text-xs px-2 py-1 rounded"
        >
          Mini-jeux
        </button>
        <button
          onClick={() => setActiveScreen('secretcodes')}
          className="bg-indigo-800/70 hover:bg-indigo-700/90 text-white text-xs px-2 py-1 rounded"
        >
          ARG
        </button>
      </div>
      
      {/* Info de base */}
      <div className="absolute top-2 left-2 right-2 flex justify-between z-30">
        <div className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
          <span className="font-bold">Niv. {gameStats.level}</span>
          <div className="w-16 h-1.5 bg-gray-700 rounded">
            <div 
              className="h-full bg-blue-500 rounded"
              style={{ width: `${(gameStats.xp / gameStats.xpNeeded) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-gray-800/70 text-yellow-400 text-xs px-2 py-1 rounded font-bold">
          {points} pts
        </div>
      </div>
      
      {/* Cursor personnalisé (rendu en CSS) */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .cursor-custom {
          cursor: url('/assets/custom-cursor.svg'), auto;
        }
        `
      }} />
    </div>
  );

  // Fonction pour rendre l'écran des statistiques
  const renderStatsScreen = () => (
    <div className="relative w-full h-full bg-gray-900 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Statistiques</h2>
        <button 
          onClick={() => setActiveScreen('main')}
          className="text-gray-400 hover:text-white"
        >
          Retour au jeu
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="text-md font-bold text-white">Niveau {gameStats.level}</div>
        <div className="text-md font-bold text-yellow-400">{points} points</div>
      </div>
      
      {/* Barre de progression XP */}
      <div className="w-full h-2 bg-gray-800 rounded-full mb-2">
        <div 
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${(gameStats.xp / gameStats.xpNeeded) * 100}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-gray-400 text-center mb-4">
        {gameStats.xp} / {gameStats.xpNeeded} XP jusqu'au niveau suivant
      </div>
      
      {/* Statistiques du joueur */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-xs text-gray-500">Clics totaux</div>
          <div className="text-md font-medium text-white">{gameStats.totalClicks}</div>
        </div>
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-xs text-gray-500">Combo max</div>
          <div className="text-md font-medium text-white">{gameStats.maxCombo}x</div>
        </div>
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-xs text-gray-500">Vitesse max</div>
          <div className="text-md font-medium text-white">{gameStats.maxSpeed.toFixed(1)}x</div>
        </div>
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-xs text-gray-500">Meilleur score</div>
          <div className="text-md font-medium text-white">{gameStats.bestScore}</div>
        </div>
      </div>

      {/* Événements temporels (si actifs) */}
      {timeEvents.active && timeEvents.currentEvent && (
        <div className="bg-indigo-900 rounded-lg p-3 mt-4 animate-pulse">
          <h3 className="text-sm font-bold text-white mb-1">
            Événement: {timeEvents.currentEvent.name}
          </h3>
          <p className="text-indigo-100 mb-2 text-xs">{timeEvents.currentEvent.description}</p>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {timeEvents.currentEvent.rewards.map((reward, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-indigo-800 text-indigo-200 rounded text-xs"
              >
                {reward}
              </span>
            ))}
          </div>
          
          <div className="text-xs text-indigo-300">
            {`Se termine dans ${Math.floor((timeEvents.currentEvent.endTime.getTime() - new Date().getTime()) / (1000 * 60 * 60))} heures`}
          </div>
        </div>
      )}
      
      {/* Tableau des meilleurs scores */}
      <div className="mt-4">
        <h3 className="text-sm font-bold text-white mb-2">Meilleurs scores</h3>
        <div className="bg-gray-800 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-2 text-left text-gray-300">Joueur</th>
                <th className="p-2 text-left text-gray-300">Score</th>
                <th className="p-2 text-left text-gray-300">Niveau</th>
                <th className="p-2 text-left text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {highScores.map((score, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}>
                  <td className="p-2 text-white">{score.name}</td>
                  <td className="p-2 text-white">{score.score}</td>
                  <td className="p-2 text-white">{score.level}</td>
                  <td className="p-2 text-gray-400">{new Date(score.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Fonction pour rendre l'écran des quêtes
  const renderQuestsScreen = () => (
    <div className="relative w-full h-full bg-gray-900 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Quêtes Journalières</h2>
        <button 
          onClick={() => setActiveScreen('main')}
          className="text-gray-400 hover:text-white"
        >
          Retour au jeu
        </button>
      </div>
      
      <div className="space-y-3">
        {dailyQuests.map(quest => (
          <div 
            key={quest.id}
            className={`p-3 rounded-lg ${
              quest.completed ? 'bg-green-900/50' : 'bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-white text-sm">{quest.title}</h4>
                <p className="text-xs text-gray-400">{quest.description}</p>
              </div>
              {quest.completed && !quest.claimed && (
                <button
                  onClick={() => claimQuest(quest.id)}
                  className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded"
                >
                  Réclamer {quest.reward} pts
                </button>
              )}
              {quest.claimed && (
                <span className="text-xs text-green-400">Réclamé</span>
              )}
            </div>
            
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(quest.currentProgress / quest.requirement) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-right mt-1 text-gray-400">
                {quest.currentProgress}/{quest.requirement}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Fonction pour rendre l'écran du shop
  const renderShopScreen = () => (
    <div className="relative w-full h-full bg-gray-900 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Boutique</h2>
        <button 
          onClick={() => setActiveScreen('main')}
          className="text-gray-400 hover:text-white"
        >
          Retour au jeu
        </button>
      </div>
      
      <div className="flex justify-end mb-3">
        <div className="px-3 py-1 bg-gray-800 rounded text-yellow-400 text-sm font-medium">
          {points} points disponibles
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {shopItems.map(item => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            <div className="h-24 bg-gray-700 flex items-center justify-center p-2">
              <img 
                src={item.imageSrc} 
                alt={item.name}
                className="h-full object-contain" 
              />
            </div>
            <div className="p-2">
              <h3 className="font-medium text-white text-sm">{item.name}</h3>
              <p className="text-gray-400 text-xs mb-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 text-xs font-medium">{item.price} pts</span>
                {item.owned ? (
                  <button
                    onClick={() => handleApply(item)}
                    className={`px-2 py-1 text-xs rounded ${
                      item.applied
                        ? 'bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {item.applied ? 'Appliqué' : 'Appliquer'}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={points < item.price}
                    className={`px-2 py-1 text-xs rounded ${
                      points >= item.price
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Acheter
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Fonction pour rendre l'écran de sélection des mini-jeux
  const renderMiniGamesSelectionScreen = () => (
    <div className="relative w-full h-full bg-gray-900 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Mini-jeux</h2>
        <button 
          onClick={() => setActiveScreen('main')}
          className="text-gray-400 hover:text-white"
        >
          Retour au jeu
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div 
          className={`border rounded-lg overflow-hidden ${
            miniGames.unlocked.memory 
              ? 'border-blue-500 hover:border-blue-400 cursor-pointer' 
              : 'border-gray-700 opacity-50'
          }`}
          onClick={() => miniGames.unlocked.memory && handleOpenMiniGame('memory')}
        >
          <div className="bg-gray-800 p-3">
            <h3 className="font-medium text-white">Jeu de Mémoire</h3>
            <p className="text-gray-400 text-xs mt-1">Testez votre mémoire en trouvant toutes les paires</p>
          </div>
          <div className="bg-gray-700 p-3 text-center">
            {miniGames.unlocked.memory ? (
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded">
                Jouer
              </button>
            ) : (
              <div className="text-xs text-gray-400">
                Débloqué au niveau 3
              </div>
            )}
          </div>
        </div>
        
        <div 
          className={`border rounded-lg overflow-hidden ${
            miniGames.unlocked.puzzle 
              ? 'border-blue-500 hover:border-blue-400 cursor-pointer' 
              : 'border-gray-700 opacity-50'
          }`}
          onClick={() => miniGames.unlocked.puzzle && handleOpenMiniGame('puzzle')}
        >
          <div className="bg-gray-800 p-3">
            <h3 className="font-medium text-white">Puzzle</h3>
            <p className="text-gray-400 text-xs mt-1">Remettez les pièces dans le bon ordre</p>
          </div>
          <div className="bg-gray-700 p-3 text-center">
            {miniGames.unlocked.puzzle ? (
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded">
                Jouer
              </button>
            ) : (
              <div className="text-xs text-gray-400">
                Débloqué au niveau 5
              </div>
            )}
          </div>
        </div>
        
        <div 
          className={`border rounded-lg overflow-hidden ${
            miniGames.unlocked.platformer 
              ? 'border-blue-500 hover:border-blue-400 cursor-pointer' 
              : 'border-gray-700 opacity-50'
          }`}
          onClick={() => miniGames.unlocked.platformer && handleOpenMiniGame('platformer')}
        >
          <div className="bg-gray-800 p-3">
            <h3 className="font-medium text-white">Platformer</h3>
            <p className="text-gray-400 text-xs mt-1">Atteignez l'objectif en évitant les obstacles</p>
          </div>
          <div className="bg-gray-700 p-3 text-center">
            {miniGames.unlocked.platformer ? (
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded">
                Jouer
              </button>
            ) : (
              <div className="text-xs text-gray-400">
                Débloqué au niveau 8
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Rendu de l'écran pour les codes secrets (ARG)
  const renderSecretCodesScreen = () => (
    <div className="relative w-full h-full flex flex-col bg-gray-900 text-white p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-purple-300">Mode ARG - Codes Secrets</h2>
        <button 
          onClick={() => setActiveScreen('main')}
          className="text-gray-400 hover:text-white"
        >
          Retour au jeu
        </button>
      </div>
      
      {/* Interface pour entrer des codes secrets */}
      <div className="mb-6 bg-gray-800 p-3 rounded-lg">
        <p className="text-xs mb-2 text-gray-400">Entrez un code secret pour débloquer du contenu caché</p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            placeholder="ENTREZ CODE"
            className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm uppercase tracking-wider"
            maxLength={15}
          />
          <button
            onClick={handleSecretCodeSubmit}
            className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-xs"
          >
            Valider
          </button>
        </div>
      </div>
      
      {/* Affichage des indices découverts */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-purple-300">Indices découverts</h4>
        {foundClues.length > 0 ? (
          <ul className="bg-gray-800 rounded-lg p-2 text-xs space-y-2">
            {foundClues.map((clue, index) => (
              <li key={index} className="border-b border-gray-700 pb-1">
                <span className="text-yellow-400">💡</span> {clue}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-xs italic">Explorez et cliquez selon des motifs spécifiques pour découvrir des indices cachés...</p>
        )}
      </div>
      
      {/* Messages décryptés */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-purple-300">Messages décryptés</h4>
        {secretMessages.length > 0 ? (
          <ul className="bg-gray-800 rounded-lg p-2 text-xs space-y-2">
            {secretMessages.map((message, index) => (
              <li key={index} className="border-b border-gray-700 pb-1">
                <span className="text-green-400">🔓</span> {message}
                <span className="block text-xs text-gray-500 mt-1">
                  Débloqué avec: {index === secretMessages.length - 1 ? lastDecryptionKey : "???"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-xs italic">Entrez des codes secrets pour débloquer des messages...</p>
        )}
      </div>
      
      {/* Indicateur de progression ARG */}
      <div className="mt-auto pt-4">
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
            style={{ width: `${Math.min(100, (foundClues.length + secretMessages.length) * 10)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">
          Progression ARG: {Math.min(100, (foundClues.length + secretMessages.length) * 10)}%
        </p>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* NFT Display Container - Tout est à l'intérieur du NFT */}
      <div 
        className="relative border rounded-lg overflow-hidden"
        style={{ aspectRatio: "1", maxWidth: "600px", margin: "0 auto", height: "600px" }}
        ref={containerRef}
      >
        {/* Contenu dynamique basé sur l'écran actif */}
        {activeScreen === 'main' && renderMainScreen()}
        {activeScreen === 'stats' && renderStatsScreen()}
        {activeScreen === 'quests' && renderQuestsScreen()}
        {activeScreen === 'shop' && renderShopScreen()}
        {activeScreen === 'story' && showStoryDetails()}
        {activeScreen === 'minigames' && renderMiniGamesSelectionScreen()}
        {activeScreen === 'secretcodes' && renderSecretCodesScreen()}
        
        {/* Affichage des mini-jeux actifs par-dessus tout */}
        {miniGames.active && renderMiniGame()}
      </div>
      
      {/* Indicateur de vitesse d'animation - petit texte en dessous */}
      <div className="text-xs text-gray-500 text-center mt-2">
        Vitesse: {animationSpeed.toFixed(1)}x
      </div>
    </div>
  );
}