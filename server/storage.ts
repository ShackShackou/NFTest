import { 
  users, collections, nfts,
  type User, type InsertUser, 
  type Collection, type InsertCollection,
  type Nft, type InsertNft,
  type NftProperty
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getNft(id: number): Promise<Nft | undefined>;
  getNftsByCollection(collectionId: number): Promise<Nft[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  getCollectionByName(name: string): Promise<Collection | undefined>;
  createNft(nft: InsertNft): Promise<Nft>;
  createCollection(collection: InsertCollection): Promise<Collection>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // import { eq } from 'drizzle-orm';
    // const [user] = await db.select().from(users).where(eq(users.id, id));
    // return user || undefined;
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // import { eq } from 'drizzle-orm';
    // const [user] = await db.select().from(users).where(eq(users.username, username));
    // return user || undefined;
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // const [user] = await db
    //   .insert(users)
    //   .values(insertUser)
    //   .returning();
    // return user;
    throw new Error("Not implemented");
  }
  
  async getNft(id: number): Promise<Nft | undefined> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // import { eq } from 'drizzle-orm';
    // const [nft] = await db.select().from(nfts).where(eq(nfts.id, id));
    // return nft || undefined;
    return undefined;
  }
  
  async getNftsByCollection(collectionId: number): Promise<Nft[]> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // import { eq } from 'drizzle-orm';
    // return await db.select().from(nfts).where(eq(nfts.collectionId, collectionId));
    return [];
  }
  
  async getCollection(id: number): Promise<Collection | undefined> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // import { eq } from 'drizzle-orm';
    // const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    // return collection || undefined;
    return undefined;
  }
  
  async getCollectionByName(name: string): Promise<Collection | undefined> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // import { eq } from 'drizzle-orm';
    // const [collection] = await db.select().from(collections).where(eq(collections.name, name));
    // return collection || undefined;
    return undefined;
  }
  
  async createNft(insertNft: InsertNft): Promise<Nft> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // const [nft] = await db
    //   .insert(nfts)
    //   .values(insertNft)
    //   .returning();
    // return nft;
    throw new Error("Not implemented");
  }
  
  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    // Code commented for now - will implement later
    // import { db } from './db';
    // const [collection] = await db
    //   .insert(collections)
    //   .values(insertCollection)
    //   .returning();
    // return collection;
    throw new Error("Not implemented");
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private nfts: Map<number, Nft>;
  private collections: Map<number, Collection>;
  private userId: number;
  private nftId: number;
  private collectionId: number;

  constructor() {
    this.users = new Map();
    this.nfts = new Map();
    this.collections = new Map();
    this.userId = 1;
    this.nftId = 1;
    this.collectionId = 1;
    
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: this.userId++,
      username: "PixelMaster",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      isVerified: true,
      profileImage: "",
      created: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create a demo collection
    const demoCollection: Collection = {
      id: this.collectionId++,
      name: "Original Studio",
      description: "Original Studio est une collection exclusive d'art numérique explorant les frontières entre réalité virtuelle et perception humaine. Chaque œuvre est conçue comme un portail vers des expériences interactives et évolutives.",
      creatorId: demoUser.id,
      floorPrice: "1.0 ETH",
      totalVolume: "895.32 ETH",
      itemCount: 75,
      created: new Date()
    };
    this.collections.set(demoCollection.id, demoCollection);
    
    // Create demo NFTs - Données exactes de l'image fournie
    const originalStudioProperties: NftProperty[] = [
      { type: "Background", value: "Blue Mist", rarity: "8% have this trait" },
      { type: "Jacket", value: "Abstract", rarity: "4% have this trait" },
      { type: "Hairstyle", value: "Crystal", rarity: "6% have this trait" },
      { type: "Eyes", value: "Holographic", rarity: "3% have this trait" },
      { type: "Facial Features", value: "Neon Circuit", rarity: "2% have this trait" },
      { type: "Expression", value: "Enigmatic", rarity: "5% have this trait" },
      { type: "Accessory", value: "Digital Aura", rarity: "7% have this trait" },
      { type: "Rarity Ranking", value: "Legendary", rarity: "Top 1%" }
    ];
    
    const demoNft: Nft = {
      id: 42,  // Set id to 42 to match the expected url path in NftMarketplace component
      tokenId: "1",
      name: "Original Studio #1",
      description: "Original Studio est une collection d'art psychédélique inspirée par le surréalisme et l'imagerie cyberpunk. Chaque pièce est unique et créée numériquement.",
      image: "/images/original-studio-1.jpg",
      price: "1.2 ETH",
      usdPrice: "($3,456.78)",
      lastPrice: "0.9 ETH",
      creator: "Art Dimension Labs",
      owner: "0x4d9f6cc9d80fdf481a5f367343fdb11b208fee1f",
      contractAddress: "0x4d9f9cc9d80fdf481a5f367343fdb11b208fee1f",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "12h 42m 03s",
      properties: originalStudioProperties,
      created: new Date(2024, 4, 15) // May 15, 2024
    };
    this.nftId = 43; // Make sure nftId is correctly set after creating this NFT
    this.nfts.set(demoNft.id, demoNft);
    
    // Create related NFTs in the same collection
    const relatedNft1: Nft = {
      id: this.nftId++,
      tokenId: "2",
      name: "Original Studio #2",
      description: "Une œuvre fascinante explorant les thèmes de la conscience numérique et de l'évolution virtuelle.",
      image: "/images/original-studio-2.jpg",
      price: "1.3 ETH",
      usdPrice: "($3,721.56)",
      lastPrice: "1.1 ETH",
      creator: "Art Dimension Labs",
      owner: "0x7a82F69a3db775C9c10F2b0A1D38699Ec4232d2b",
      contractAddress: "0x4d9f6cc9d80fdf481a5f367343fdb11b208fee1f",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "8h 22m 45s",
      properties: originalStudioProperties.slice(2, 7),
      created: new Date(2024, 4, 14)
    };
    this.nfts.set(relatedNft1.id, relatedNft1);
    
    const relatedNft2: Nft = {
      id: this.nftId++,
      tokenId: "41",
      name: "CYBER KNIGHT",
      description: "A cyber knight with advanced tech",
      image: "/cyber-knight.gif",
      price: "0.45 ETH",
      usdPrice: "($770.40)",
      lastPrice: "0.32 ETH",
      creator: "PixelMaster",
      owner: "0x9Ed30408f11D2bFC23c34f18275bBf23bB716Bc9",
      contractAddress: "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "5h 30m 45s",
      properties: [],
      created: new Date(2023, 3, 12)
    };
    this.nfts.set(relatedNft2.id, relatedNft2);
    
    const relatedNft3: Nft = {
      id: this.nftId++,
      tokenId: "43",
      name: "SPACE RIDER",
      description: "A space rider navigating the cosmos",
      image: "/space-rider.gif",
      price: "0.38 ETH",
      usdPrice: "($650.56)",
      lastPrice: "0.30 ETH",
      creator: "PixelMaster",
      owner: "0xaFd30408f11D2bFC23c34f18275bBf23bB716Bca",
      contractAddress: "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "8h 12m 33s",
      properties: [],
      created: new Date(2023, 3, 14)
    };
    this.nfts.set(relatedNft3.id, relatedNft3);
    
    const relatedNft4: Nft = {
      id: this.nftId++,
      tokenId: "45",
      name: "TECH WIZARD",
      description: "A technologically advanced wizard",
      image: "/tech-wizard.gif",
      price: "0.40 ETH",
      usdPrice: "($684.80)",
      lastPrice: "0.35 ETH",
      creator: "PixelMaster",
      owner: "0xbEd30408f11D2bFC23c34f18275bBf23bB716Bcb",
      contractAddress: "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "11h 45m 10s",
      properties: [],
      created: new Date(2023, 3, 15)
    };
    this.nfts.set(relatedNft4.id, relatedNft4);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, created: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  async getNft(id: number): Promise<Nft | undefined> {
    return this.nfts.get(id);
  }
  
  async getNftsByCollection(collectionId: number): Promise<Nft[]> {
    return Array.from(this.nfts.values()).filter(
      (nft) => nft.collectionId === collectionId
    );
  }
  
  async getCollection(id: number): Promise<Collection | undefined> {
    return this.collections.get(id);
  }
  
  async getCollectionByName(name: string): Promise<Collection | undefined> {
    return Array.from(this.collections.values()).find(
      (collection) => collection.name === name
    );
  }
  
  async createNft(insertNft: InsertNft): Promise<Nft> {
    const id = this.nftId++;
    const nft: Nft = { ...insertNft, id, created: new Date() };
    this.nfts.set(id, nft);
    return nft;
  }
  
  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = this.collectionId++;
    const collection: Collection = { ...insertCollection, id, created: new Date() };
    this.collections.set(id, collection);
    return collection;
  }
}

// Keep using MemStorage for now - we'll switch to DatabaseStorage later after fixing import issues
export const storage = new MemStorage();
