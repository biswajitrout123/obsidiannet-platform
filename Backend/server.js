import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';

// Route Imports
import authRoutes from './routes/authRoutes.js'; 
import postRoutes from './routes/post.route.js'; 
import userRoutes from './routes/user.routes.js';
import jobRoutes from './routes/job.routes.js';

// Environment Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
    'http://localhost:5173',                    
    'https://obsidiannet-platform.vercel.app',  
    process.env.CLIENT_URL                      
];

app.use(cors({
    origin: (origin, callback) => {
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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