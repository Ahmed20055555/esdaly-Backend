import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import reviewRoutes from './routes/review.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import contactRoutes from './routes/contact.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import statsRoutes from './routes/stats.routes.js';

// Load environment variables
dotenv.config();

// Vercel Detection
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
if (isVercel) {
  process.env.NODE_ENV = 'production';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allow multiple origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://esdaly-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.includes('vercel.app'))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now during development
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files with proper headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Allow CORS for images
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');
    // Cache images for 1 year
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.set('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Database Connection with Caching for Serverless
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to avoid potential DNS issues
    };

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('⏳ Connecting to MongoDB...');
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, opts);
    console.log('✅ MongoDB Connected Successfully');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    cachedConnection = null;
    throw err;
  }
};

// Middleware to ensure DB connection before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'الخدمة غير متوفرة حالياً بسبب فشل الاتصال بقاعدة البيانات',
      error: isVercel ? 'Database Connection Error' : err.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/stats', statsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ESDALY Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ESDALY API',
    docs: '/api/health'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.message);
  if (err.stack) console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...((process.env.NODE_ENV === 'development' || process.env.VERCEL) && {
      error: err.message,
      stack: err.stack,
      hint: 'هذا الخطأ يظهر فقط في بيئة التطوير أو Vercel للمساعدة في الحل'
    })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Only start server in development (Vercel/Serverless handles this automatically)
if (!isVercel && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  }).on('error', (err) => {
    console.error('❌ Server startup error:', err);
  });
} else {
  console.log(`✅ App initialized for ${isVercel ? 'Vercel' : 'Production'} environment`);
}

export default app;
