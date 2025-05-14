import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NftMarketplace from "@/pages/NftMarketplace";
import NftMintPage from "@/pages/NftMintPage";
import NotFound from "@/pages/not-found";
import { WalletProvider } from "@/components/WalletProvider";
import { WagmiConfig } from "wagmi";
import { config } from "@/lib/walletConfig";

function Router() {
  return (
    <Switch>
      <Route path="/" component={NftMarketplace} />
      <Route path="/collections/pixel" component={NftMarketplace} />
      <Route path="/mint" component={NftMintPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </WalletProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default App;
