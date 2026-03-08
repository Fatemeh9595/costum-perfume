import { MongoClient, ObjectId } from "mongodb";

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "scentcraft";
const collectionName = process.env.MONGODB_COLLECTION || "shop-perfumes";
const usersCollectionName = "users";
const authSessionsCollectionName = "auth-sessions";

const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });

export type ShopPerfume = {
  fileName: string;
  name: string;
  description: string;
  tasteType: "fruity" | "herbal";
  priceValue: number;
};

export type UserDocument = {
  cartItems: {
    fileName: string;
    name: string;
    priceValue: number;
    quantity: number;
  }[];
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  family: string;
  experience: string;
  notes: string;
  consent: boolean;
  createdAt: string;
};

export type AuthSessionDocument = {
  userId: ObjectId;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  ip: string;
  userAgent: string;
};

let usersIndexReady = false;
let authSessionsIndexesReady = false;

export async function getShopPerfumesCollection() {
  await client.connect();
  return client.db(dbName).collection<ShopPerfume>(collectionName);
}

export async function getUsersCollection() {
  await client.connect();
  const collection = client.db(dbName).collection<UserDocument>(usersCollectionName);

  if (!usersIndexReady) {
    await collection.createIndex({ email: 1 }, { unique: true });
    usersIndexReady = true;
  }

  return collection;
}

export async function getAuthSessionsCollection() {
  await client.connect();
  const collection = client.db(dbName).collection<AuthSessionDocument>(authSessionsCollectionName);

  if (!authSessionsIndexesReady) {
    await collection.createIndex({ tokenHash: 1 }, { unique: true });
    await collection.createIndex({ userId: 1, revokedAt: 1 });
    authSessionsIndexesReady = true;
  }

  return collection;
}

export async function closeMongoConnection() {
  await client.close();
}
