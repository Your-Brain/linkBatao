import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auralink';
    
    // Set Mongoose options
    mongoose.set('strictQuery', false);

    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`[Database] MongoDB Connected to local/URI instance: ${conn.connection.host}`);
    } catch (primaryErr) {
      console.warn('[Database] Local MongoDB not reachable. Initializing MongoMemoryServer fallback...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to MongoMemoryServer fallback at ${conn.connection.host}`);
    }
  } catch (err) {
    console.error(`[Database Error] ${err.message}`);
    process.exit(1);
  }
};
