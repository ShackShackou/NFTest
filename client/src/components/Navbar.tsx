import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";
import { MenuIcon, X, Wallet, LogOut } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { useWallet } from "@/components/WalletProvider";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { 
    address, 
    isConnected, 
    balance,
    isLoading,
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  return (
    <nav className="bg-neutral-dark/80 backdrop-blur-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="font-pixel text-primary text-xl cursor-pointer">
                  PIXEL<span className="text-accent">NFT</span>
                </span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-primary cursor-pointer">Explore</span>
                </Link>
                <Link href="/collections/pixel">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-neutral-light hover:text-primary cursor-pointer">Collections</span>
                </Link>
                <Link href="/mint">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-accent hover:text-accent/80 cursor-pointer">Mint NFT</span>
                </Link>
                <Link href="/manager">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-accent hover:text-accent/80 cursor-pointer">Manager</span>
                </Link>
                <Link href="/admin">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:text-red-400 cursor-pointer">Admin</span>
                </Link>
                <Link href="#">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-neutral-light hover:text-primary cursor-pointer">Activity</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="text-primary font-medium bg-neutral-darker px-3 py-1 rounded-md flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    <span>{shortenAddress(address || '')}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={disconnectWallet}
                    className="text-neutral-light hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  className="bg-accent hover:bg-accent/80 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-300"
                  onClick={connectWallet}
                  disabled={isLoading}
                >
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-light"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-neutral-dark/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-primary cursor-pointer">Explore</span>
            </Link>
            <Link href="/collections/pixel">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-neutral-light hover:text-primary cursor-pointer">Collections</span>
            </Link>
            <Link href="/mint">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-accent hover:text-accent/80 cursor-pointer">Mint NFT</span>
            </Link>
            <Link href="/manager">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-accent hover:text-accent/80 cursor-pointer">Manager</span>
            </Link>
            <Link href="/admin">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:text-red-400 cursor-pointer">Admin</span>
            </Link>
            <Link href="#">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-neutral-light hover:text-primary cursor-pointer">Activity</span>
            </Link>
            <div className="pt-4">
              {isConnected ? (
                <div className="space-y-2">
                  <div className="text-primary font-medium bg-neutral-darker px-3 py-2 rounded-md flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    <span>{shortenAddress(address || '')}</span>
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={disconnectWallet}
                    className="w-full flex items-center justify-center text-neutral-light hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full bg-accent hover:bg-accent/80 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-300"
                  onClick={connectWallet}
                  disabled={isLoading}
                >
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
