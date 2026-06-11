import express from 'express';
import multer from 'multer';
import User from '../models/User.js'; // Imported model to fetch user by ID
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

router.get('/suggestions', protectRoute, getSuggestedUsers);
router.get('/connections', protectRoute, getUserConnections); 
router.get('/search', protectRoute, searchUsers); 
router.get('/profile/:username', protectRoute, getUserProfile);
router.post('/connect/:id', protectRoute, toggleConnection);

// ✅ NEW ROUTE: Fixed the 404 error for ChatPage frontend fetch
router.get('/:id', protectRoute, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

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