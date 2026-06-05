import express from 'express';
import multer from 'multer';
import path from 'path';
import Post from '../models/Post.model.js';
import { protectRoute } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Configure Multer for local image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/'); },
  filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// 📥 GET all posts (Now with Dynamic User Data & Comments)
router.get('/', protectRoute, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name profilePicture') // Pulls real name/avatar
      .populate('comments.user', 'name profilePicture'); // Pulls commenter info
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// 📤 POST Create a new post (Now supports images via Multer)
router.post('/create', protectRoute, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!content && !imagePath) return res.status(400).json({ message: "Content or image required" });

    const newPost = new Post({ user: req.user._id, content, image: imagePath });
    await newPost.save();
    
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// ❤️ POST Toggle Like
router.post('/:id/like', protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likes.includes(req.user._id);
    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString()); // Unlike
    } else {
      post.likes.push(req.user._id); // Like
    }
    
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error liking post" });
  }
});

// 💬 POST Add Comment
router.post('/:id/comment', protectRoute, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.user._id, text });
    await post.save();
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error commenting" });
  }
});

export default router;