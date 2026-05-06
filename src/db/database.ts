import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const mongoUri =
  process.env.ATLAS_URI ?? process.env.MONGODB_URL ?? process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME ?? process.env.MONGODB_DB;

export async function connectDB(): Promise<Db> {
  if (!mongoUri) {
    throw new Error(
      'No MongoDB URI specified in env (ATLAS_URI, MONGODB_URL or MONGODB_URI)'
    );
  }

  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = dbName ? client.db(dbName) : client.db();
    console.log(`MongoDB connected (${db.databaseName})`);
    return db;
  } catch (err: any) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

export function getDb(): Db {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

export async function disconnectDB(): Promise<void> {
  if (!client) return;
  try {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB disconnected');
  } catch (err: any) {
    console.error('MongoDB disconnect error:', err);
    throw err;
  }
}
