import { AnimationEditor } from '@/components/AnimationEditor';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Helmet } from 'react-helmet';

export function AnimationEditorPage() {
  // Fonction pour sauvegarder les animations (à intégrer avec votre système de stockage)
  const handleSaveAnimations = (animations: any[]) => {
    // Ici vous pourriez envoyer les animations au backend
    console.log('Animations sauvegardées:', animations);
    
    // Stocker localement pour le moment
    localStorage.setItem('nft-animations', JSON.stringify(animations));
  };
  
  // Charger les animations existantes depuis le stockage local
  const loadAnimations = () => {
    const savedAnimations = localStorage.getItem('nft-animations');
    if (savedAnimations) {
      try {
        return JSON.parse(savedAnimations);
      } catch (error) {
        console.error('Erreur lors du chargement des animations:', error);
      }
    }
    return undefined;
  };
  
  return (
    <>
      <Helmet>
        <title>Éditeur d'Animation NFT | DARTHBATER</title>
        <meta name="description" content="Créez des animations personnalisées pour vos NFTs avec notre éditeur visuel." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-neutral-darkest text-gray-100">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-4">Éditeur d'Animation NFT</h1>
              <p className="text-gray-400 mb-8">
                Créez des effets et animations personnalisés pour vos NFTs. Les animations peuvent être exportées en CSS ou sauvegardées pour une utilisation ultérieure.
              </p>
            </div>
            
            <div className="bg-neutral-darker border border-gray-700 rounded-lg p-6 shadow-lg">
              <AnimationEditor 
                onSave={handleSaveAnimations}
                initialEffects={loadAnimations()}
              />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}