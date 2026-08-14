import mongoose from 'mongoose';
import dns from 'dns';
import 'dotenv/config';

// Configure DNS servers to bypass local DNS resolvers (e.g. 127.0.0.1) that refuse SRV queries
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('[Database Warning] Could not override DNS servers:', e.message);
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoUri);

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[Database Error] ${err.message}`);
    throw err;
  }
};