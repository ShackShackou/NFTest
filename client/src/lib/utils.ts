import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fonction pour combiner les classes CSS avec tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction pour raccourcir une adresse Ethereum
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Fonction pour formater un montant avec 2 décimales
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

// Fonction pour convertir une date en format lisible
export function formatDate(date: Date): string {
  return date.toLocaleString();
}

// Fonction pour formater un timestamp Unix en date
export function formatUnixTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

// Fonction pour formater un prix ETH
export function formatEthPrice(priceWei: string | number): string {
  const price = typeof priceWei === 'string' ? parseFloat(priceWei) : priceWei;
  const ethPrice = price / 1e18; // Convertir Wei en ETH
  
  if (ethPrice < 0.0001) {
    return '< 0.0001 ETH';
  }
  
  return `${ethPrice.toFixed(4)} ETH`;
}

// Fonctions pour interactions avec l'API
export async function apiRequest<T>(
  url: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}