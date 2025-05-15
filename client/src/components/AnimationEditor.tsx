import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';

// Interface pour un keyframe d'animation
interface AnimationKeyframe {
  id: string;
  position: number; // pourcentage (0-100)
  transform: {
    translateX: number;
    translateY: number;
    scale: number;
    rotate: number;
  };
  opacity: number;
  timing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  customTiming?: string; // Pour cubic-bezier
}

// Interface pour une animation
interface Animation {
  id: string;
  name: string;
  duration: number; // en secondes
  delay: number; // en secondes
  iterationCount: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  keyframes: AnimationKeyframe[];
}

// Interface pour un effet
interface Effect {
  id: string;
  name: string;
  type: 'particle' | 'text' | 'shockwave' | 'glow' | 'filter';
  trigger: 'click' | 'hover' | 'timer' | 'load' | 'condition';
  conditionType?: 'score' | 'level' | 'combo';
  conditionValue?: number;
  animation: Animation;
  content?: string; // Pour les effets de texte
  color?: string;
  size?: number;
  particleCount?: number; // Pour les particules
  particleShape?: 'circle' | 'square' | 'triangle' | 'image';
  particleImage?: string; // URL de l'image à utiliser comme particule
  active: boolean;
}

interface AnimationEditorProps {
  onSave?: (effects: Effect[]) => void;
  initialEffects?: Effect[];
}

// Générer un ID unique
const generateId = () => Math.random().toString(36).substring(2, 9);

// Créer un keyframe par défaut
const createDefaultKeyframe = (position: number): AnimationKeyframe => ({
  id: generateId(),
  position,
  transform: {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0
  },
  opacity: 1,
  timing: 'linear'
});

// Créer une animation par défaut
const createDefaultAnimation = (): Animation => ({
  id: generateId(),
  name: 'Animation ' + Math.floor(Math.random() * 1000),
  duration: 1,
  delay: 0,
  iterationCount: 1,
  direction: 'normal',
  fillMode: 'none',
  keyframes: [
    createDefaultKeyframe(0),
    createDefaultKeyframe(100)
  ]
});

// Créer un effet par défaut
const createDefaultEffect = (): Effect => ({
  id: generateId(),
  name: 'Effet ' + Math.floor(Math.random() * 1000),
  type: 'particle',
  trigger: 'click',
  animation: createDefaultAnimation(),
  color: '#ff5500',
  size: 10,
  particleCount: 10,
  particleShape: 'circle',
  active: true
});

export function AnimationEditor({ onSave, initialEffects }: AnimationEditorProps) {
  const { toast } = useToast();
  const [effects, setEffects] = useState<Effect[]>(initialEffects || [createDefaultEffect()]);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(effects[0]?.id || null);
  const [previewAnimation, setPreviewAnimation] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(1);
  
  // Effet sélectionné actuellement
  const selectedEffect = effects.find(effect => effect.id === selectedEffectId) || effects[0];
  
  // Mise à jour quand initialEffects change
  useEffect(() => {
    if (initialEffects && initialEffects.length > 0) {
      setEffects(initialEffects);
      setSelectedEffectId(initialEffects[0].id);
    }
  }, [initialEffects]);
  
  // Ajouter un nouvel effet
  const handleAddEffect = () => {
    const newEffect = createDefaultEffect();
    setEffects([...effects, newEffect]);
    setSelectedEffectId(newEffect.id);
    
    toast({
      title: "Effet ajouté",
      description: `${newEffect.name} a été créé`
    });
  };
  
  // Supprimer un effet
  const handleDeleteEffect = (id: string) => {
    const updatedEffects = effects.filter(effect => effect.id !== id);
    setEffects(updatedEffects);
    
    // Si l'effet actuel est supprimé, sélectionner le premier
    if (id === selectedEffectId) {
      setSelectedEffectId(updatedEffects[0]?.id || null);
    }
    
    toast({
      title: "Effet supprimé",
      description: "L'effet a été supprimé avec succès"
    });
  };
  
  // Mettre à jour un effet
  const handleUpdateEffect = (updatedEffect: Effect) => {
    setEffects(effects.map(effect => 
      effect.id === updatedEffect.id ? updatedEffect : effect
    ));
  };
  
  // Ajouter un keyframe
  const handleAddKeyframe = () => {
    if (!selectedEffect) return;
    
    // Calculer une position intermédiaire pour le nouveau keyframe
    const existingPositions = selectedEffect.animation.keyframes.map(kf => kf.position);
    let newPosition = 50; // Par défaut
    
    // Si 0 et 100 existent déjà et qu'il n'y a pas de 50, utiliser 50
    if (existingPositions.includes(0) && existingPositions.includes(100) && !existingPositions.includes(50)) {
      newPosition = 50;
    } 
    // Sinon, trouver un espace
    else {
      const sortedPositions = [...existingPositions].sort((a, b) => a - b);
      for (let i = 0; i < sortedPositions.length - 1; i++) {
        if (sortedPositions[i + 1] - sortedPositions[i] > 10) {
          newPosition = sortedPositions[i] + Math.floor((sortedPositions[i + 1] - sortedPositions[i]) / 2);
          break;
        }
      }
    }
    
    const newKeyframe = createDefaultKeyframe(newPosition);
    const updatedAnimation = {
      ...selectedEffect.animation,
      keyframes: [...selectedEffect.animation.keyframes, newKeyframe].sort((a, b) => a.position - b.position)
    };
    
    const updatedEffect = { ...selectedEffect, animation: updatedAnimation };
    handleUpdateEffect(updatedEffect);
    
    toast({
      title: "Keyframe ajouté",
      description: `Position: ${newPosition}%`
    });
  };
  
  // Supprimer un keyframe
  const handleDeleteKeyframe = (keyframeId: string) => {
    if (!selectedEffect) return;
    
    // Ne pas supprimer s'il n'y a que 2 keyframes (minimum requis)
    if (selectedEffect.animation.keyframes.length <= 2) {
      toast({
        title: "Impossible de supprimer",
        description: "Une animation doit avoir au moins 2 keyframes",
        variant: "destructive"
      });
      return;
    }
    
    const updatedKeyframes = selectedEffect.animation.keyframes.filter(kf => kf.id !== keyframeId);
    const updatedAnimation = {
      ...selectedEffect.animation,
      keyframes: updatedKeyframes
    };
    
    const updatedEffect = { ...selectedEffect, animation: updatedAnimation };
    handleUpdateEffect(updatedEffect);
    
    toast({
      title: "Keyframe supprimé",
      description: "Le keyframe a été supprimé avec succès"
    });
  };
  
  // Mettre à jour un keyframe
  const handleUpdateKeyframe = (keyframeId: string, updates: Partial<AnimationKeyframe>) => {
    if (!selectedEffect) return;
    
    const updatedKeyframes = selectedEffect.animation.keyframes.map(kf => 
      kf.id === keyframeId ? { ...kf, ...updates } : kf
    );
    
    const updatedAnimation = {
      ...selectedEffect.animation,
      keyframes: updatedKeyframes
    };
    
    const updatedEffect = { ...selectedEffect, animation: updatedAnimation };
    handleUpdateEffect(updatedEffect);
  };
  
  // Mettre à jour un attribut de l'animation
  const handleUpdateAnimation = (updates: Partial<Animation>) => {
    if (!selectedEffect) return;
    
    const updatedAnimation = {
      ...selectedEffect.animation,
      ...updates
    };
    
    const updatedEffect = { ...selectedEffect, animation: updatedAnimation };
    handleUpdateEffect(updatedEffect);
  };
  
  // Générer le CSS pour l'animation
  const generateAnimationCSS = (effect: Effect): string => {
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
  
  // Export des animations
  const handleExport = () => {
    const css = effects
      .filter(effect => effect.active)
      .map(effect => generateAnimationCSS(effect))
      .join('\n');
    
    // Créer un objet Blob
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement et le déclencher
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nft-animations.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Libérer l'URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    toast({
      title: "Export réussi",
      description: "Les animations ont été exportées au format CSS"
    });
  };
  
  // Sauvegarder les effets
  const handleSave = () => {
    if (onSave) {
      onSave(effects);
      toast({
        title: "Sauvegarde réussie",
        description: "Les effets d'animation ont été sauvegardés"
      });
    }
  };
  
  // Champ de prévisualisation
  const PreviewField = () => {
    if (!selectedEffect) return null;
    
    // Classe pour l'animation
    const animationClass = previewAnimation ? selectedEffect.animation.name : '';
    
    return (
      <div className="relative w-full h-64 border border-gray-700 rounded-lg overflow-hidden bg-neutral-darker mb-4 flex items-center justify-center">
        <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-neutral-dark/50 backdrop-blur-sm z-10">
          <div className="text-xs text-gray-400">
            Prévisualisation
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="preview-scale" className="text-xs text-gray-400">Échelle</Label>
            <Slider 
              id="preview-scale"
              className="w-24" 
              min={0.5} 
              max={2} 
              step={0.1} 
              value={[previewScale]}
              onValueChange={(value) => setPreviewScale(value[0])}
            />
          </div>
        </div>
        
        {selectedEffect.type === 'particle' && (
          <div 
            className={`w-16 h-16 ${animationClass}`} 
            style={{ 
              transform: `scale(${previewScale})`,
              position: 'relative',
            }}
          >
            {Array.from({ length: selectedEffect.particleCount || 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${selectedEffect.size || 10}px`,
                  height: `${selectedEffect.size || 10}px`,
                  backgroundColor: selectedEffect.color || '#ff5500',
                  borderRadius: selectedEffect.particleShape === 'circle' ? '50%' : 
                                selectedEffect.particleShape === 'square' ? '0' : '0',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
                  opacity: previewAnimation ? 0 : 0.8, // Commence invisible pour l'animation
                }}
              />
            ))}
          </div>
        )}
        
        {selectedEffect.type === 'text' && (
          <div 
            className={`text-2xl font-bold ${animationClass}`}
            style={{ 
              transform: `scale(${previewScale})`,
              color: selectedEffect.color || '#ffffff',
            }}
          >
            {selectedEffect.content || 'Texte d\'exemple'}
          </div>
        )}
        
        {selectedEffect.type === 'shockwave' && (
          <div 
            className={`w-24 h-24 border-2 border-solid rounded-full ${animationClass}`}
            style={{ 
              transform: `scale(${previewScale})`,
              borderColor: selectedEffect.color || '#ff5500',
              opacity: previewAnimation ? 0 : 0.8, // Commence invisible pour l'animation
            }}
          />
        )}
        
        {selectedEffect.type === 'glow' && (
          <div 
            className={`w-16 h-16 rounded-full ${animationClass}`}
            style={{ 
              transform: `scale(${previewScale})`,
              backgroundColor: selectedEffect.color || '#ff5500',
              boxShadow: `0 0 ${selectedEffect.size || 10}px ${selectedEffect.color || '#ff5500'}`,
              opacity: 0.8,
            }}
          />
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-4 right-4 z-10"
          onClick={() => setPreviewAnimation(!previewAnimation)}
        >
          {previewAnimation ? "Arrêter" : "Jouer"}
        </Button>
      </div>
    );
  };
  
  // Visualiseur de timeline
  const TimelineView = () => {
    if (!selectedEffect) return null;
    
    // Trier les keyframes par position
    const sortedKeyframes = [...selectedEffect.animation.keyframes].sort((a, b) => a.position - b.position);
    
    return (
      <div className="w-full h-12 bg-gray-900 rounded relative mt-2 mb-4">
        {/* Ligne de temps */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          <div className="h-full w-0 border-l border-gray-700 absolute left-0"></div>
          <div className="h-full w-0 border-l border-gray-700 absolute left-1/4"></div>
          <div className="h-full w-0 border-l border-gray-700 absolute left-1/2"></div>
          <div className="h-full w-0 border-l border-gray-700 absolute left-3/4"></div>
          <div className="h-full w-0 border-l border-gray-700 absolute right-0"></div>
        </div>
        
        {/* Labels de pourcentage */}
        <div className="absolute -bottom-6 left-0 w-full flex text-xs text-gray-500">
          <span className="absolute left-0 transform -translate-x-1/2">0%</span>
          <span className="absolute left-1/4 transform -translate-x-1/2">25%</span>
          <span className="absolute left-1/2 transform -translate-x-1/2">50%</span>
          <span className="absolute left-3/4 transform -translate-x-1/2">75%</span>
          <span className="absolute right-0 transform translate-x-1/2">100%</span>
        </div>
        
        {/* Points de keyframe */}
        {sortedKeyframes.map((keyframe) => (
          <div 
            key={keyframe.id}
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full cursor-pointer hover:bg-primary-dark"
            style={{ left: `${keyframe.position}%` }}
            onClick={() => {
              // Ouvrir l'éditeur de keyframe ou sélectionner ce keyframe
              const updatedKeyframes = selectedEffect.animation.keyframes.map(kf => ({
                ...kf,
                selected: kf.id === keyframe.id
              }));
              
              const updatedAnimation = {
                ...selectedEffect.animation,
                keyframes: updatedKeyframes
              };
              
              const updatedEffect = { ...selectedEffect, animation: updatedAnimation };
              handleUpdateEffect(updatedEffect);
            }}
          >
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs">
              {keyframe.position}%
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  // Si aucun effet, afficher un message
  if (effects.length === 0 || !selectedEffect) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-neutral-darker border border-gray-700 rounded-lg">
        <p className="text-gray-400 mb-4">Aucun effet d'animation</p>
        <Button onClick={handleAddEffect}>Créer un effet</Button>
      </div>
    );
  }
  
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Éditeur d'Animation</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>Exporter CSS</Button>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </div>
      </div>
      
      {/* Liste des effets disponibles */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {effects.map(effect => (
          <div 
            key={effect.id}
            className={`p-2 border rounded cursor-pointer flex items-center space-x-2 min-w-[120px] ${
              effect.id === selectedEffectId 
                ? 'bg-primary/20 border-primary' 
                : 'bg-neutral-dark border-gray-700 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedEffectId(effect.id)}
          >
            <div className={`w-3 h-3 rounded-full ${effect.active ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-sm truncate">{effect.name}</span>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddEffect}>+</Button>
      </div>
      
      {/* Champ de prévisualisation */}
      <PreviewField />
      
      {/* Timeline */}
      <div>
        <Label>Timeline d'animation</Label>
        <TimelineView />
      </div>
      
      {/* Onglets de configuration */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="keyframes">Keyframes</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
        </TabsList>
        
        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effect-name">Nom de l'effet</Label>
              <Input 
                id="effect-name" 
                value={selectedEffect.name} 
                onChange={(e) => handleUpdateEffect({...selectedEffect, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="effect-type">Type d'effet</Label>
              <Select 
                value={selectedEffect.type}
                onValueChange={(value: any) => handleUpdateEffect({...selectedEffect, type: value})}
              >
                <SelectTrigger id="effect-type">
                  <SelectValue placeholder="Type d'effet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particle">Particules</SelectItem>
                  <SelectItem value="text">Texte</SelectItem>
                  <SelectItem value="shockwave">Onde de choc</SelectItem>
                  <SelectItem value="glow">Lueur</SelectItem>
                  <SelectItem value="filter">Filtre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="effect-trigger">Déclencheur</Label>
              <Select 
                value={selectedEffect.trigger}
                onValueChange={(value: any) => handleUpdateEffect({...selectedEffect, trigger: value})}
              >
                <SelectTrigger id="effect-trigger">
                  <SelectValue placeholder="Déclencheur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="click">Clic</SelectItem>
                  <SelectItem value="hover">Survol</SelectItem>
                  <SelectItem value="timer">Minuteur</SelectItem>
                  <SelectItem value="load">Chargement</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedEffect.trigger === 'condition' && (
              <div className="space-y-2">
                <Label htmlFor="condition-type">Type de condition</Label>
                <Select 
                  value={selectedEffect.conditionType || 'score'}
                  onValueChange={(value: any) => handleUpdateEffect({...selectedEffect, conditionType: value})}
                >
                  <SelectTrigger id="condition-type">
                    <SelectValue placeholder="Type de condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="level">Niveau</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedEffect.trigger === 'condition' && (
              <div className="space-y-2">
                <Label htmlFor="condition-value">Valeur de condition</Label>
                <Input 
                  id="condition-value" 
                  type="number"
                  value={selectedEffect.conditionValue || 0} 
                  onChange={(e) => handleUpdateEffect({...selectedEffect, conditionValue: Number(e.target.value)})}
                />
              </div>
            )}
            
            <div className="space-y-2 flex items-center justify-between">
              <Label htmlFor="effect-active">Actif</Label>
              <Switch 
                id="effect-active" 
                checked={selectedEffect.active}
                onCheckedChange={(checked) => handleUpdateEffect({...selectedEffect, active: checked})}
              />
            </div>
            
            <div className="col-span-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteEffect(selectedEffect.id)}
              >
                Supprimer cet effet
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Onglet Animation */}
        <TabsContent value="animation" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animation-name">Nom de l'animation</Label>
              <Input 
                id="animation-name" 
                value={selectedEffect.animation.name} 
                onChange={(e) => handleUpdateAnimation({name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="animation-duration">Durée (secondes)</Label>
              <Input 
                id="animation-duration" 
                type="number"
                min={0}
                step={0.1}
                value={selectedEffect.animation.duration} 
                onChange={(e) => handleUpdateAnimation({duration: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="animation-delay">Délai (secondes)</Label>
              <Input 
                id="animation-delay" 
                type="number"
                min={0}
                step={0.1}
                value={selectedEffect.animation.delay} 
                onChange={(e) => handleUpdateAnimation({delay: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="animation-iteration">Nombre de répétitions</Label>
              <div className="flex space-x-2">
                <Input 
                  id="animation-iteration" 
                  type="text"
                  value={selectedEffect.animation.iterationCount.toString()} 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'infinite') {
                      handleUpdateAnimation({iterationCount: 'infinite'});
                    } else {
                      const num = parseInt(value);
                      if (!isNaN(num) && num > 0) {
                        handleUpdateAnimation({iterationCount: num});
                      }
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={() => handleUpdateAnimation({iterationCount: 'infinite'})}
                >
                  ∞
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="animation-direction">Direction</Label>
              <Select 
                value={selectedEffect.animation.direction}
                onValueChange={(value: any) => handleUpdateAnimation({direction: value})}
              >
                <SelectTrigger id="animation-direction">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="reverse">Inversé</SelectItem>
                  <SelectItem value="alternate">Alterné</SelectItem>
                  <SelectItem value="alternate-reverse">Alterné inversé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="animation-fill">Mode de remplissage</Label>
              <Select 
                value={selectedEffect.animation.fillMode}
                onValueChange={(value: any) => handleUpdateAnimation({fillMode: value})}
              >
                <SelectTrigger id="animation-fill">
                  <SelectValue placeholder="Remplissage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="forwards">Forwards</SelectItem>
                  <SelectItem value="backwards">Backwards</SelectItem>
                  <SelectItem value="both">Les deux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        {/* Onglet Keyframes */}
        <TabsContent value="keyframes" className="space-y-4">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium">Points-clés de l'animation</h3>
            <Button size="sm" variant="outline" onClick={handleAddKeyframe}>Ajouter un keyframe</Button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {selectedEffect.animation.keyframes
              .sort((a, b) => a.position - b.position)
              .map((keyframe) => (
                <Card key={keyframe.id} className="border-gray-700">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Position: {keyframe.position}%</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteKeyframe(keyframe.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Position (%)</Label>
                        <Input 
                          className="h-8 text-sm"
                          type="number"
                          min={0}
                          max={100}
                          value={keyframe.position}
                          onChange={(e) => {
                            const newValue = Math.min(100, Math.max(0, Number(e.target.value)));
                            handleUpdateKeyframe(keyframe.id, { position: newValue });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Opacité</Label>
                        <div className="flex space-x-2 items-center">
                          <Slider 
                            className="flex-grow"
                            min={0}
                            max={1}
                            step={0.01}
                            value={[keyframe.opacity]}
                            onValueChange={([value]) => handleUpdateKeyframe(keyframe.id, { opacity: value })}
                          />
                          <span className="text-xs w-8">{keyframe.opacity.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Translation X (px)</Label>
                        <Input 
                          className="h-8 text-sm"
                          type="number"
                          value={keyframe.transform.translateX}
                          onChange={(e) => {
                            const newTransform = {
                              ...keyframe.transform,
                              translateX: Number(e.target.value)
                            };
                            handleUpdateKeyframe(keyframe.id, { transform: newTransform });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Translation Y (px)</Label>
                        <Input 
                          className="h-8 text-sm"
                          type="number"
                          value={keyframe.transform.translateY}
                          onChange={(e) => {
                            const newTransform = {
                              ...keyframe.transform,
                              translateY: Number(e.target.value)
                            };
                            handleUpdateKeyframe(keyframe.id, { transform: newTransform });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Échelle</Label>
                        <div className="flex space-x-2 items-center">
                          <Slider 
                            className="flex-grow"
                            min={0}
                            max={3}
                            step={0.1}
                            value={[keyframe.transform.scale]}
                            onValueChange={([value]) => {
                              const newTransform = {
                                ...keyframe.transform,
                                scale: value
                              };
                              handleUpdateKeyframe(keyframe.id, { transform: newTransform });
                            }}
                          />
                          <span className="text-xs w-8">{keyframe.transform.scale.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Rotation (deg)</Label>
                        <Input 
                          className="h-8 text-sm"
                          type="number"
                          value={keyframe.transform.rotate}
                          onChange={(e) => {
                            const newTransform = {
                              ...keyframe.transform,
                              rotate: Number(e.target.value)
                            };
                            handleUpdateKeyframe(keyframe.id, { transform: newTransform });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Timing</Label>
                        <Select 
                          value={keyframe.timing}
                          onValueChange={(value: any) => handleUpdateKeyframe(keyframe.id, { timing: value })}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Timing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="ease">Ease</SelectItem>
                            <SelectItem value="ease-in">Ease In</SelectItem>
                            <SelectItem value="ease-out">Ease Out</SelectItem>
                            <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                            <SelectItem value="cubic-bezier">Cubic Bezier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {keyframe.timing === 'cubic-bezier' && (
                        <div className="space-y-1">
                          <Label className="text-xs">Cubic Bezier</Label>
                          <Input 
                            className="h-8 text-sm"
                            placeholder="ex: cubic-bezier(0.42, 0, 0.58, 1)"
                            value={keyframe.customTiming || ''}
                            onChange={(e) => handleUpdateKeyframe(keyframe.id, { customTiming: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Onglet Apparence */}
        <TabsContent value="appearance" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effect-color">Couleur</Label>
              <div className="flex space-x-2">
                <div 
                  className="w-8 h-8 rounded border border-gray-700" 
                  style={{ backgroundColor: selectedEffect.color || '#ffffff' }}
                />
                <Input 
                  id="effect-color" 
                  type="color"
                  value={selectedEffect.color || '#ffffff'} 
                  onChange={(e) => handleUpdateEffect({...selectedEffect, color: e.target.value})}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="effect-size">Taille</Label>
              <Input 
                id="effect-size" 
                type="number"
                min={1}
                value={selectedEffect.size || 10} 
                onChange={(e) => handleUpdateEffect({...selectedEffect, size: Number(e.target.value)})}
              />
            </div>
            
            {selectedEffect.type === 'text' && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="effect-content">Contenu du texte</Label>
                <Input 
                  id="effect-content" 
                  value={selectedEffect.content || 'Texte d\'exemple'} 
                  onChange={(e) => handleUpdateEffect({...selectedEffect, content: e.target.value})}
                />
              </div>
            )}
            
            {selectedEffect.type === 'particle' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="particle-count">Nombre de particules</Label>
                  <Input 
                    id="particle-count" 
                    type="number"
                    min={1}
                    max={100}
                    value={selectedEffect.particleCount || 10} 
                    onChange={(e) => handleUpdateEffect({...selectedEffect, particleCount: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="particle-shape">Forme des particules</Label>
                  <Select 
                    value={selectedEffect.particleShape || 'circle'}
                    onValueChange={(value: any) => handleUpdateEffect({...selectedEffect, particleShape: value})}
                  >
                    <SelectTrigger id="particle-shape">
                      <SelectValue placeholder="Forme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Cercle</SelectItem>
                      <SelectItem value="square">Carré</SelectItem>
                      <SelectItem value="triangle">Triangle</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEffect.particleShape === 'image' && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="particle-image">URL de l'image</Label>
                    <Input 
                      id="particle-image" 
                      value={selectedEffect.particleImage || ''} 
                      onChange={(e) => handleUpdateEffect({...selectedEffect, particleImage: e.target.value})}
                      placeholder="https://exemple.com/image.png"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Code CSS généré */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Code CSS généré</Label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(generateAnimationCSS(selectedEffect));
              toast({
                title: "Copié !",
                description: "Le code CSS a été copié dans le presse-papier"
              });
            }}
          >
            Copier
          </Button>
        </div>
        <div className="bg-gray-900 rounded-md p-3 font-mono text-xs text-green-400 overflow-x-auto max-h-60">
          <pre>{generateAnimationCSS(selectedEffect)}</pre>
        </div>
      </div>
    </div>
  );
}