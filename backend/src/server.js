import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import logger from './config/logger.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import translateRoutes from './routes/translate.routes.js';
import ocrRoutes from './routes/ocr.routes.js';
import phraseRoutes from './routes/phrase.routes.js';
import currencyRoutes from './routes/currency.routes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Utility Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/phrases', phraseRoutes);
app.use('/api/currency', currencyRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Travel Companion AI Backend is running!');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
