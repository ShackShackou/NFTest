import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Types pour les éléments de la boutique
export interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
  category: 'hat' | 'accessory' | 'background' | 'effect';
  owned: boolean;
  applied?: boolean;
}

interface NftShopProps {
  points: number;
  onPurchase: (item: ShopItem) => void;
  onApply: (item: ShopItem) => void;
  items: ShopItem[];
}

export function NftShop({ points, onPurchase, onApply, items }: NftShopProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ShopItem['category'] | 'all'>('all');
  
  // Filtrer les éléments selon la catégorie
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-3 left-5 z-30 bg-black bg-opacity-70 hover:bg-opacity-90 text-white border-none"
        >
          <span className="mr-2">🛒</span> Boutique
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Boutique d'accessoires</span>
            <span className="text-sm font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 py-1 px-3 rounded-full">
              {points} points
            </span>
          </DialogTitle>
          <DialogDescription>
            Personnalisez votre NFT avec ces accessoires uniques!
          </DialogDescription>
        </DialogHeader>
        
        {/* Filtres par catégorie */}
        <div className="flex gap-2 mb-4 overflow-x-auto py-1">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Tous
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'hat' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('hat')}
          >
            Casquettes
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'accessory' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('accessory')}
          >
            Accessoires
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'background' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('background')}
          >
            Arrière-plans
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'effect' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('effect')}
          >
            Effets
          </Button>
        </div>
        
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative border rounded-lg overflow-hidden hover:shadow-md transition-all",
                  item.owned && "border-green-500 dark:border-green-700"
                )}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-3">
                  <img
                    src={item.imageSrc}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 h-8">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {item.price} pts
                    </span>
                    {item.owned ? (
                      <Button
                        variant={item.applied ? "default" : "outline"}
                        size="sm"
                        onClick={() => onApply(item)}
                      >
                        {item.applied ? "Appliqué" : "Appliquer"}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={points < item.price}
                        onClick={() => onPurchase(item)}
                      >
                        Acheter
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}