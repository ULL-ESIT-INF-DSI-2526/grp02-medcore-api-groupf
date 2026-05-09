import mongoose from 'mongoose';
import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import { connectDB, disconnectDB, getDb } from '../src/db/database.js';

describe('Database Connection Module', () => {
  
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should connect to MongoDB successfully', async () => {
    const conn = await connectDB();
    
    expect(mongoose.connection.readyState).toBe(1);
    expect(conn.connection.name).toBeDefined();
  });

  it('getDb() should return the native MongoDB database object', () => {
    const db = getDb();
    
    expect(db).toBeDefined();
    expect(db.databaseName).toBeDefined();
  });

  it('should throw an error if getDb() is called while disconnected', async () => {
    await disconnectDB();
    
    expect(() => getDb()).toThrow('Database not connected. Call connectDB() first.');
    
    await connectDB();
  });

  it('should disconnect from MongoDB successfully', async () => {
    await disconnectDB();
    
    expect(mongoose.connection.readyState).toBe(0);
  });

  
});