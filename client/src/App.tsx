import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NftMarketplace from "@/pages/NftMarketplace";
import NftMintPage from "@/pages/NftMintPage";
import NftManager from "@/pages/NftManager";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import { WalletProvider } from "@/components/WalletProvider";
import { WagmiConfig } from "wagmi";
import { config } from "@/lib/walletConfig";
import { initEnvironment } from "@/lib/initEnvironment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={NftMarketplace} />
      <Route path="/collections/pixel" component={NftMarketplace} />
      <Route path="/mint" component={NftMintPage} />
      <Route path="/manager" component={NftManager} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    alchemyConnected: false
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const status = await initEnvironment();
        setApiStatus(status);
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
      } finally {
        setIsInitialized(true); // Continuer même en cas d'erreur
      }
    };

    initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Temporairement retiré WagmiConfig pour éviter les erreurs de type */}
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          {isInitialized && !apiStatus.alchemyConnected && (
            <div className="fixed bottom-4 right-4 bg-orange-800 text-white p-3 rounded-lg shadow-lg text-sm max-w-xs z-50">
              <p className="font-bold mb-1">⚠️ Avertissement API</p>
              <p>La connexion à l'API Alchemy n'a pas pu être établie. Certaines fonctionnalités pourraient ne pas fonctionner correctement.</p>
            </div>
          )}
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
