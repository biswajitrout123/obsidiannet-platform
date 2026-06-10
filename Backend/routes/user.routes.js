import express from 'express';
import multer from 'multer';
import { protectRoute } from '../middleware/authMiddleware.js';
import { 
    getSuggestedUsers, 
    getUserProfile, 
    updateProfile, 
    toggleConnection,
    searchUsers,
    getUserConnections
} from '../controllers/user.controller.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🛣️ Clean Route Definitions
router.get('/suggestions', protectRoute, getSuggestedUsers);
router.get('/connections', protectRoute, getUserConnections); // 👥 New endpoint
router.get('/search', protectRoute, searchUsers); // 🔍 New endpoint
router.get('/profile/:username', protectRoute, getUserProfile);
router.post('/connect/:id', protectRoute, toggleConnection);

// 🚀 FIX: Added '/profile' to match the frontend fetch request
router.put(
    '/profile/update', 
    protectRoute, 
    upload.fields([
        { name: 'profilePicture', maxCount: 1 }, 
        { name: 'coverBanner', maxCount: 1 }
    ]), 
    updateProfile
);

export default router;