import express from 'express';
import multer from 'multer';
import { protectRoute } from '../middleware/authMiddleware.js'; 
import { getPosts, createPost, likePost, commentPost, deletePost } from '../controllers/post.controller.js';

const router = express.Router();

// Use memory storage so Render/Vercel doesn't crash trying to write to local disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 🛣️ Clean Route Definitions (Delegating logic to the controller)
router.get('/', protectRoute, getPosts);
router.post('/create', protectRoute, upload.single('img'), createPost);
router.post('/:id/like', protectRoute, likePost);
router.post('/:id/comment', protectRoute, commentPost);
router.delete('/:id', protectRoute, deletePost);

export default router;