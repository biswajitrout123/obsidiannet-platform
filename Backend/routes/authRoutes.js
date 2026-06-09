import express from 'express';
import { signup, login, logout, getCurrentUser } from '../controllers/authController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// NEW: The route the frontend uses to verify if you are logged in
router.get('/me', protectRoute, getCurrentUser);

export default router;