import express from 'express';
import multer from 'multer';
import { protectRoute } from '../middleware/authMiddleware.js';
import { 
    getSuggestedUsers, 
    getUserProfile, 
    updateProfile, 
    toggleConnection 
} from '../controllers/user.controller.js';

const router = express.Router();

//  Use memory storage so Render/Vercel ephemeral instances do not crash
const storage = multer.memoryStorage();
const upload = multer({ storage });

//  Clean Route Definitions
router.get('/suggestions', protectRoute, getSuggestedUsers);
router.get('/profile/:username', protectRoute, getUserProfile);
router.post('/connect/:id', protectRoute, toggleConnection);

// Handle multi-field image streams securely
router.put(
    '/update', 
    protectRoute, 
    upload.fields([
        { name: 'profilePicture', maxCount: 1 }, 
        { name: 'coverBanner', maxCount: 1 }
    ]), 
    updateProfile
);

export default router;