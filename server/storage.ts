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
      name: "Shackers OGs",
      description: "Shackers OGs est une collection de démons uniques avec des caractéristiques variées comme des yeux flamboyants, des cornes et d'autres traits rares qui font de chaque pièce un trésor numérique pour les collectionneurs.",
      creatorId: demoUser.id,
      floorPrice: "0.50 ETH",
      totalVolume: "76.5 ETH",
      itemCount: 100,
      created: new Date()
    };
    this.collections.set(demoCollection.id, demoCollection);
    
    // Create demo NFTs - Données exactes du NFT S.H.A.C.K.E.R. #01
    const shackerProperties: NftProperty[] = [
      { type: "Gender", value: "Male", rarity: "65%" },
      { type: "Type", value: "Demon", rarity: "92%" },
      { type: "Accessory", value: "Piercings", rarity: "38%" },
      { type: "Floor", value: "1", rarity: "77%" },
      { type: "Eyes", value: "Yellow Flames", rarity: "9%" },
      { type: "Accessory", value: "Small Horns", rarity: "28%" },
      { type: "Damages", value: "Bloody Nose", rarity: "6%" },
      { type: "Favorite Food", value: "Carrots", rarity: "1%" }
    ];
    
    const demoNft: Nft = {
      id: 42,  // Set id to 42 to match the expected url path in NftMarketplace component
      tokenId: "1",
      name: "S.H.A.C.K.E.R. #01",
      description: "Une créature démoniaque aux yeux jaunes flamboyants et aux petites cornes. NFT rare de la collection Shackers OG sur Ethereum.",
      image: "/images/shacker-01.jpg",
      price: "0.50 ETH",
      usdPrice: "($1,250.00)",
      lastPrice: "0.45 ETH",
      creator: "Shackers OGs",
      owner: "SHACK",
      contractAddress: "0x4d9f6cc9d80fdf481a5f367343fdb11b208fee1f",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "24h 00m 00s",
      properties: shackerProperties,
      created: new Date(2022, 4, 15) // May 15, 2022
    };
    this.nftId = 43; // Make sure nftId is correctly set after creating this NFT
    this.nfts.set(demoNft.id, demoNft);
    
    // Create related NFTs in the same collection
    const relatedNft1: Nft = {
      id: this.nftId++,
      tokenId: "2",
      name: "S.H.A.C.K.E.R. #02",
      description: "Un autre démon unique de la collection Shackers OG avec des traits distinctifs.",
      image: "/images/shacker-01.jpg", // Utilisé la même image temporairement
      price: "0.55 ETH",
      usdPrice: "($1,375.00)",
      lastPrice: "0.48 ETH",
      creator: "Shackers OGs",
      owner: "0x7a82F69a3db775C9c10F2b0A1D38699Ec4232d2b",
      contractAddress: "0x4d9f6cc9d80fdf481a5f367343fdb11b208fee1f",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "8h 22m 45s",
      properties: shackerProperties.slice(0, 5),
      created: new Date(2022, 4, 14)
    };
    this.nfts.set(relatedNft1.id, relatedNft1);
    
    const relatedNft2: Nft = {
      id: this.nftId++,
      tokenId: "3",
      name: "S.H.A.C.K.E.R. #03",
      description: "Un démon de la collection Shackers OG avec des traits rares.",
      image: "/images/shacker-01.jpg", // Utilisé la même image temporairement
      price: "0.48 ETH",
      usdPrice: "($1,200.00)",
      lastPrice: "0.45 ETH",
      creator: "Shackers OGs",
      owner: "0x9Ed30408f11D2bFC23c34f18275bBf23bB716Bc9",
      contractAddress: "0x4d9f6cc9d80fdf481a5f367343fdb11b208fee1f",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "5h 30m 45s",
      properties: shackerProperties.slice(2, 6),
      created: new Date(2022, 4, 15)
    };
    this.nfts.set(relatedNft2.id, relatedNft2);
    
    const relatedNft3: Nft = {
      id: this.nftId++,
      tokenId: "4",
      name: "S.H.A.C.K.E.R. #04",
      description: "Un membre effrayant de la collection Shackers OG.",
      image: "/images/shacker-01.jpg", // Utilisé la même image temporairement
      price: "0.52 ETH",
      usdPrice: "($1,300.00)",
      lastPrice: "0.46 ETH",
      creator: "Shackers OGs",
      owner: "0xaFd30408f11D2bFC23c34f18275bBf23bB716Bca",
      contractAddress: "0x4d9f6cc9d80fdf481a5f367343fdb11b208fee1f",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "8h 12m 33s",
      properties: shackerProperties.slice(3, 7),
      created: new Date(2022, 4, 16)
    };
    this.nfts.set(relatedNft3.id, relatedNft3);
    
    const relatedNft4: Nft = {
      id: this.nftId++,
      tokenId: "5",
      name: "S.H.A.C.K.E.R. #05",
      description: "Un autre exemplaire unique de la collection Shackers OG.",
      image: "/images/shacker-01.jpg", // Utilisé la même image temporairement
      price: "0.49 ETH",
      usdPrice: "($1,225.00)",
      lastPrice: "0.43 ETH",
      creator: "Shackers OGs",
      owner: "0xbEd30408f11D2bFC23c34f18275bBf23bB716Bcb",
      contractAddress: "0x4d9f6cc9d80fdf481a5f367343fdb11b208fee1f",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "11h 45m 10s",
      properties: shackerProperties.slice(1, 5),
      created: new Date(2022, 4, 17)
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
