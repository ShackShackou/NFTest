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
      name: "Pixel Warriors",
      description: "A collection of interactive pixel art warriors with unique abilities",
      creatorId: demoUser.id,
      floorPrice: "0.35 ETH",
      totalVolume: "120 ETH",
      itemCount: 100,
      created: new Date()
    };
    this.collections.set(demoCollection.id, demoCollection);
    
    // Create demo NFTs
    const darthBaterProperties: NftProperty[] = [
      { type: "CHARACTER", value: "Darth Pixel", rarity: "4% have this" },
      { type: "WEAPON", value: "Light Saber", rarity: "12% have this" },
      { type: "RARITY", value: "Legendary", rarity: "2% have this" },
      { type: "BACKGROUND", value: "Teal", rarity: "8% have this" },
      { type: "ANIMATION", value: "Interactive", rarity: "5% have this" }
    ];
    
    const demoNft: Nft = {
      id: this.nftId++,
      tokenId: "42",
      name: "DARTHBATER #42",
      description: "This interactive NFT features a pixel art character with special powers. The NFT responds to user interaction - hover to pause the animation, click to advance to the final frame. Part of the \"Pixel Warriors\" collection with unique on-chain properties.",
      image: "/assets/13_DARTHBATER.gif",
      price: "0.42 ETH",
      usdPrice: "($720.84)",
      lastPrice: "0.30 ETH",
      creator: "PixelMaster",
      owner: "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
      contractAddress: "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "12h 42m 03s",
      properties: darthBaterProperties,
      created: new Date(2023, 3, 13) // April 13, 2023
    };
    this.nfts.set(demoNft.id, demoNft);
    
    // Create related NFTs in the same collection
    const relatedNft1: Nft = {
      id: this.nftId++,
      tokenId: "38",
      name: "PIXEL WARRIOR",
      description: "A pixel warrior with unique abilities",
      image: "/pixel-warrior.gif",
      price: "0.36 ETH",
      usdPrice: "($616.32)",
      lastPrice: "0.28 ETH",
      creator: "PixelMaster",
      owner: "0x8Cd30408f11D2bFC23c34f18275bBf23bB716Bc8",
      contractAddress: "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
      tokenStandard: "ERC-721",
      blockchain: "Ethereum",
      collectionId: demoCollection.id,
      endsIn: "10h 15m 22s",
      properties: [],
      created: new Date(2023, 3, 10)
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

export const storage = new MemStorage();
