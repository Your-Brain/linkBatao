import mongoose from 'mongoose';
import dns from 'dns';
import 'dotenv/config';

// Configure DNS servers to bypass local DNS resolvers that refuse SRV queries
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where DNS cannot be overridden (e.g. Vercel serverless)
}

let cachedConnection = null;
let cachedPromise = null;

export const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  if (mongoose.connection.readyState >= 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('[Database Warning] MONGODB_URI environment variable is not set');
    return null;
  }

  if (!cachedPromise) {
    mongoose.set('strictQuery', false);

    cachedPromise = mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }).then(conn => {
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      cachedConnection = conn;
      return conn;
    }).catch(err => {
      cachedPromise = null;
      console.error(`[Database Error] ${err.message}`);
      throw err;
    });
  }

  try {
    return await cachedPromise;
  } catch (err) {
    cachedPromise = null;
    throw err;
  }
};