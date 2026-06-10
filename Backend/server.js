import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';

// Route Imports
import authRoutes from './routes/authRoutes.js'; 
import postRoutes from './routes/post.route.js'; 
import userRoutes from './routes/user.routes.js';
import jobRoutes from './routes/job.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
const allowedOrigins = [
    'http://localhost:5173',                    // Local development frontend
    'https://obsidiannet-platform.vercel.app',  // Your production Vercel deployment URL
    process.env.CLIENT_URL                      // Fallback value from dashboard configuration
].filter(Boolean); // ✅ FIXED: Cleans up undefined variables if CLIENT_URL is empty

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // ✅ FIXED: Added the origin to the error message so you can see exactly what Vercel is sending if it fails
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    // ✅ FIXED: Added OPTIONS. Browsers need this for preflight requests before POST/DELETE
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Static Media Folder serving path middleware
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Base Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        message: 'ObsidianNet Backend is running perfectly!' 
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/jobs', jobRoutes);
app.use('/api/analytics', analyticsRoutes);

// Database Connection & Server Startup
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI is missing in your .env file!');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('📦 Connected to MongoDB Atlas successfully.');
        app.listen(PORT, () => {
            console.log(`🚀 Server is fully live on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    });