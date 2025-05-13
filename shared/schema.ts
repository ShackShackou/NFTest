import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// NFT Collection Schema
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").notNull(),
  floorPrice: text("floor_price"),
  totalVolume: text("total_volume"),
  itemCount: integer("item_count"),
  created: timestamp("created").defaultNow(),
});

// NFT Schema
export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  tokenId: text("token_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image").notNull(),
  price: text("price"),
  usdPrice: text("usd_price"),
  lastPrice: text("last_price"),
  creator: text("creator").notNull(),
  owner: text("owner").notNull(),
  contractAddress: text("contract_address").notNull(),
  tokenStandard: text("token_standard").notNull(),
  blockchain: text("blockchain").notNull(),
  collectionId: integer("collection_id").notNull(),
  endsIn: text("ends_in"),
  properties: json("properties").notNull().default([]),
  created: timestamp("created").defaultNow(),
});

// Users Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  walletAddress: text("wallet_address").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  profileImage: text("profile_image"),
  created: timestamp("created").defaultNow(),
});

// Insert Schemas
export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  created: true,
});

export const insertNftSchema = createInsertSchema(nfts).omit({
  id: true,
  created: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created: true,
});

// Types
export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;

export type Nft = typeof nfts.$inferSelect;
export type InsertNft = z.infer<typeof insertNftSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Property Type
export type NftProperty = {
  type: string;
  value: string;
  rarity: string;
};
