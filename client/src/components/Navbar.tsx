import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";
import { MenuIcon, X } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <Link href="#">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-primary cursor-pointer">Explore</span>
                </Link>
                <Link href="#">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-neutral-light hover:text-primary cursor-pointer">Collections</span>
                </Link>
                <Link href="#">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-neutral-light hover:text-primary cursor-pointer">Create</span>
                </Link>
                <Link href="#">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-neutral-light hover:text-primary cursor-pointer">Activity</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button className="bg-accent hover:bg-accent/80 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-300">
                Connect Wallet
              </Button>
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
            <Link href="#">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-primary cursor-pointer">Explore</span>
            </Link>
            <Link href="#">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-neutral-light hover:text-primary cursor-pointer">Collections</span>
            </Link>
            <Link href="#">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-neutral-light hover:text-primary cursor-pointer">Create</span>
            </Link>
            <Link href="#">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-neutral-light hover:text-primary cursor-pointer">Activity</span>
            </Link>
            <div className="pt-4">
              <Button className="w-full bg-accent hover:bg-accent/80 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-300">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
