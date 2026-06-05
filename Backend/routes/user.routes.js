import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getUserProfile, updateProfile, getSuggestedUsers, toggleConnection } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/profile/:username', protectRoute, getUserProfile);
router.put('/update', protectRoute, updateProfile);
router.get('/suggestions', protectRoute, getSuggestedUsers);
router.post('/connect/:id', protectRoute, toggleConnection);

export default router;