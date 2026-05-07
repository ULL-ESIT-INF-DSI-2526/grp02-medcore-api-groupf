import mongoose from 'mongoose';

const mongoUri = process.env.ATLAS_URI ?? process.env.MONGODB_URL ?? process.env.MONGODB_URI;

export async function connectDB(): Promise<typeof mongoose> {
  if (!mongoUri) {
    throw new Error(
      'No MongoDB URI specified in env (ATLAS_URI, MONGODB_URL or MONGODB_URI)'
    );
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`Mongoose connected to: ${mongoose.connection.name}`);
    return mongoose;
  } catch (err: any) {
    console.error('Mongoose connection error:', err);
    throw err;
  }
}

export function getMongoose() {
  return mongoose;
}

export function getDb() {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return mongoose.connection.db;
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('Mongoose disconnected');
  } catch (err: any) {
    console.error('Mongoose disconnect error:', err);
    throw err;
  }
}
