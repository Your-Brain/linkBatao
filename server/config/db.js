import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not configured');
    }

    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[Database Error] ${err.message}`);
    throw err;
  }
};