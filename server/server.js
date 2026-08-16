import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import policyRoutes from './routes/policyRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled CSP header for smooth local cross-origin iframe embeddings
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

app.use('/api', apiLimiter);

// Body Parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Base API Route Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AuraLink Anonymous Link Discovery Platform API',
    timestamp: new Date().toISOString()
  });
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/policies', policyRoutes);

// Error handling middleware
app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({
    message: "Backend working 🧠"
  });
});


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `[AuraLink Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });
}

export default app;

