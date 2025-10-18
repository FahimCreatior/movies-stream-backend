import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import user from './routes/user.js';
import show from './routes/show.js';
import comment from './routes/comment.js';
import urls from './config/urls.js';
import { deserializeUserFromJWT } from './middlewares/deserializeUser.js';

dotenv.config();

// Log environment variables for debugging
console.log('🚀 Server starting with environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- CLIENT:', process.env.CLIENT);
console.log('- MONGOUSER exists:', !!process.env.MONGOUSER);

mongoose.set('strictQuery', false);
const app = express();

// INITIALIZATION CONNECTION
mongoose
  .connect(urls.mongo)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    startServer();
  })
  .catch((e: any) => {
    console.error('❌ MongoDB connection failed:', e.message);
    console.error('⚠️  Starting server anyway for debugging...');
    startServer();
  });

function startServer() {
  try {
    const server = app.listen(urls.port, '0.0.0.0', () => {
      console.log(`[server]: Server is running at http://0.0.0.0:${urls.port}`);
      console.log(`[server]: Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[server]: MongoDB URI: ${urls.mongo.replace(/:[^:]+@/, ':****@')}`);
      console.log('🚀 DEBUG: Latest code with JWT logging is running!');
      console.log('🚀 DEBUG: JWT_SECRET should be working now');
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${urls.port} is already in use`);
      } else {
        console.error('❌ Server error:', err.message);
      }
    });
  } catch (e: any) {
    console.error("❌ Can't start server:", e.message);
  }
}

// MIDDLEWARES
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Basic request logging
app.use((req, res, next) => {
  console.log('🌐 Request received:', {
    method: req.method,
    url: req.url,
    hasAuth: !!req.headers.authorization
  });
  next();
});

const corsOptions = {
  origin: process.env.CLIENT || 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true, // Enable for token-based auth and cookies
};
app.use(cors(corsOptions));
app.use(cookieParser());
// before deserializer ?
app.use(deserializeUserFromJWT);
// app.use(deserializeUserFromSession)

// ROUTES
app.use('/api/v1/user', user);
app.use('/api/v1/show', show);
app.use('/api/v1/comment', comment);
