// Service pour gérer les animations personnalisées pour les NFTs

// Type d'effet d'animation
export interface AnimationEffect {
  id: string;
  name: string;
  type: 'particle' | 'text' | 'shockwave' | 'glow' | 'filter';
  trigger: 'click' | 'hover' | 'timer' | 'load' | 'condition';
  conditionType?: 'score' | 'level' | 'combo';
  conditionValue?: number;
  animation: {
    name: string;
    duration: number;
    delay: number;
    iterationCount: number | 'infinite';
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    fillMode: 'none' | 'forwards' | 'backwards' | 'both';
    keyframes: Array<{
      id: string;
      position: number;
      transform: {
        translateX: number;
        translateY: number;
        scale: number;
        rotate: number;
      };
      opacity: number;
      timing: string;
      customTiming?: string;
    }>;
  };
  content?: string;
  color?: string;
  size?: number;
  particleCount?: number;
  particleShape?: 'circle' | 'square' | 'triangle' | 'image';
  particleImage?: string;
  active: boolean;
}

// État global pour suivre les animations actives
const activeAnimations = new Map<string, AnimationEffect>();

// Générer un identifiant unique pour les instances d'animation
const generateUniqueId = () => `animation_${Math.random().toString(36).substring(2, 9)}`;

// Charger les animations depuis le stockage local
export const loadAnimationsFromStorage = (): AnimationEffect[] => {
  try {
    const stored = localStorage.getItem('nft-animations');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des animations:', error);
  }
  return [];
};

// Enregistrer une animation dans le DOM
export const registerAnimation = (effect: AnimationEffect): string => {
  const styleId = `anim_style_${effect.animation.name}`;
  
  // Vérifier si cette animation existe déjà dans le DOM
  if (!document.getElementById(styleId)) {
    // Créer les règles CSS
    const css = generateAnimationCSS(effect);
    
    // Créer l'élément style
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = css;
    
    // Ajouter au document
    document.head.appendChild(styleEl);
  }
  
  // Générer un ID unique pour cette instance d'animation
  const instanceId = generateUniqueId();
  activeAnimations.set(instanceId, effect);
  
  return instanceId;
};

// Supprimer une animation du DOM
export const unregisterAnimation = (instanceId: string): void => {
  if (activeAnimations.has(instanceId)) {
    activeAnimations.delete(instanceId);
  }
};

// Déclencher une animation basée sur son type de déclencheur
export const triggerAnimation = (
  instanceId: string, 
  trigger: 'click' | 'hover' | 'timer' | 'load' | 'condition',
  elementRef: HTMLElement,
  conditions?: { score?: number; level?: number; combo?: number }
): void => {
  const effect = activeAnimations.get(instanceId);
  if (!effect || !effect.active) return;
  
  // Vérifier si le déclencheur correspond
  if (effect.trigger !== trigger) return;
  
  // Pour les conditions, vérifier si elles sont remplies
  if (trigger === 'condition' && conditions && effect.conditionType && effect.conditionValue) {
    const conditionValue = conditions[effect.conditionType as keyof typeof conditions];
    if (conditionValue === undefined || conditionValue < (effect.conditionValue || 0)) {
      return; // Condition non remplie
    }
  }
  
  // Appliquer l'animation
  applyAnimation(effect, elementRef);
};

// Appliquer l'animation à un élément DOM
export const applyAnimation = (effect: AnimationEffect, element: HTMLElement): void => {
  // Créer un conteneur pour l'animation si nécessaire
  let animContainer: HTMLElement;
  
  // Si c'est un effet de particules, créer plusieurs éléments
  if (effect.type === 'particle') {
    // Créer un conteneur pour toutes les particules
    animContainer = document.createElement('div');
    animContainer.className = `anim-container anim-particle ${effect.animation.name}`;
    animContainer.style.position = 'absolute';
    animContainer.style.top = '50%';
    animContainer.style.left = '50%';
    animContainer.style.transform = 'translate(-50%, -50%)';
    animContainer.style.pointerEvents = 'none';
    
    // Créer les particules
    const count = effect.particleCount || 10;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = `particle ${effect.animation.name}`;
      particle.style.position = 'absolute';
      particle.style.width = `${effect.size || 10}px`;
      particle.style.height = `${effect.size || 10}px`;
      particle.style.backgroundColor = effect.color || '#ff5500';
      
      // Appliquer la forme appropriée
      if (effect.particleShape === 'circle') {
        particle.style.borderRadius = '50%';
      } else if (effect.particleShape === 'triangle') {
        particle.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
      } else if (effect.particleShape === 'image' && effect.particleImage) {
        particle.style.backgroundImage = `url(${effect.particleImage})`;
        particle.style.backgroundSize = 'cover';
      }
      
      // Position aléatoire autour du centre
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 20;
      particle.style.left = `calc(50% + ${Math.cos(angle) * distance}px)`;
      particle.style.top = `calc(50% + ${Math.sin(angle) * distance}px)`;
      
      // Ajouter au conteneur
      animContainer.appendChild(particle);
    }
  } 
  // Effet de texte
  else if (effect.type === 'text') {
    animContainer = document.createElement('div');
    animContainer.className = `anim-container anim-text ${effect.animation.name}`;
    animContainer.style.position = 'absolute';
    animContainer.style.top = '50%';
    animContainer.style.left = '50%';
    animContainer.style.transform = 'translate(-50%, -50%)';
    animContainer.style.color = effect.color || '#ffffff';
    animContainer.style.fontSize = `${effect.size || 20}px`;
    animContainer.style.fontWeight = 'bold';
    animContainer.style.pointerEvents = 'none';
    animContainer.textContent = effect.content || 'Animation';
  } 
  // Effet d'onde de choc
  else if (effect.type === 'shockwave') {
    animContainer = document.createElement('div');
    animContainer.className = `anim-container anim-shockwave ${effect.animation.name}`;
    animContainer.style.position = 'absolute';
    animContainer.style.top = '50%';
    animContainer.style.left = '50%';
    animContainer.style.transform = 'translate(-50%, -50%)';
    animContainer.style.width = `${effect.size || 50}px`;
    animContainer.style.height = `${effect.size || 50}px`;
    animContainer.style.borderRadius = '50%';
    animContainer.style.border = `2px solid ${effect.color || '#ff5500'}`;
    animContainer.style.pointerEvents = 'none';
  } 
  // Effet de lueur
  else if (effect.type === 'glow') {
    animContainer = document.createElement('div');
    animContainer.className = `anim-container anim-glow ${effect.animation.name}`;
    animContainer.style.position = 'absolute';
    animContainer.style.top = '50%';
    animContainer.style.left = '50%';
    animContainer.style.transform = 'translate(-50%, -50%)';
    animContainer.style.width = `${effect.size || 20}px`;
    animContainer.style.height = `${effect.size || 20}px`;
    animContainer.style.borderRadius = '50%';
    animContainer.style.backgroundColor = effect.color || '#ff5500';
    animContainer.style.boxShadow = `0 0 ${effect.size || 20}px ${effect.color || '#ff5500'}`;
    animContainer.style.pointerEvents = 'none';
  } 
  // Effet de filtre (s'applique directement à l'élément)
  else if (effect.type === 'filter') {
    // Appliquer directement la classe d'animation à l'élément
    element.classList.add(effect.animation.name);
    
    // Nettoyer après l'animation
    const duration = (effect.animation.duration + effect.animation.delay) * 1000;
    setTimeout(() => {
      element.classList.remove(effect.animation.name);
    }, duration);
    
    return; // Sortir car pas besoin de gérer un conteneur
  } else {
    // Fallback en cas de type non géré
    animContainer = document.createElement('div');
    animContainer.className = `anim-container ${effect.animation.name}`;
  }
  
  // Ajouter le conteneur à l'élément
  element.appendChild(animContainer);
  
  // Calculer la durée totale de l'animation pour nettoyer après
  const calculatedDuration = effect.animation.iterationCount === 'infinite' 
    ? 10000 // 10 secondes dans le cas d'une animation infinie
    : (effect.animation.duration + effect.animation.delay) * 1000 * (
      typeof effect.animation.iterationCount === 'number' 
        ? effect.animation.iterationCount 
        : 1
    );
  
  // Supprimer l'animation après sa fin
  setTimeout(() => {
    if (element.contains(animContainer)) {
      element.removeChild(animContainer);
    }
  }, calculatedDuration);
};

// Générer le CSS pour l'animation
export const generateAnimationCSS = (effect: AnimationEffect): string => {
  if (!effect || !effect.animation) return '';
  
  const { animation } = effect;
  const keyframes = animation.keyframes.sort((a, b) => a.position - b.position);
  
  // Générer les keyframes
  let keyframesCSS = `@keyframes ${animation.name} {\n`;
  keyframes.forEach(kf => {
    keyframesCSS += `  ${kf.position}% {\n`;
    keyframesCSS += `    transform: translateX(${kf.transform.translateX}px) translateY(${kf.transform.translateY}px) scale(${kf.transform.scale}) rotate(${kf.transform.rotate}deg);\n`;
    keyframesCSS += `    opacity: ${kf.opacity};\n`;
    keyframesCSS += `  }\n`;
  });
  keyframesCSS += `}\n\n`;
  
  // Générer l'animation
  let animationCSS = `.${animation.name} {\n`;
  animationCSS += `  animation-name: ${animation.name};\n`;
  animationCSS += `  animation-duration: ${animation.duration}s;\n`;
  animationCSS += `  animation-delay: ${animation.delay}s;\n`;
  animationCSS += `  animation-iteration-count: ${animation.iterationCount};\n`;
  animationCSS += `  animation-direction: ${animation.direction};\n`;
  animationCSS += `  animation-fill-mode: ${animation.fillMode};\n`;
  
  // Générer le timing function basé sur le premier keyframe
  if (keyframes[0]) {
    const timing = keyframes[0].timing;
    if (timing === 'cubic-bezier' && keyframes[0].customTiming) {
      animationCSS += `  animation-timing-function: ${keyframes[0].customTiming};\n`;
    } else {
      animationCSS += `  animation-timing-function: ${timing};\n`;
    }
  }
  
  animationCSS += `}\n`;
  
  return keyframesCSS + animationCSS;
};