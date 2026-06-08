import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.model.js';
import { protectRoute } from '../middleware/authMiddleware.js'; 
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv'; // ✅ NEW: Force loads your .env variables

dotenv.config(); 
const router = express.Router();

// 🔍 Terminal Check: This will print when you save the file!
console.log("Cloudinary Config Status:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Keys Found" : "❌ KEYS MISSING (Check .env file)");

// ☁️ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 📥 GET all posts
router.get('/', protectRoute, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePicture')          
      .populate('comments.user', 'name username profilePicture'); 
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// 📤 POST Create a new post (Uploads to Cloudinary)
router.post('/create', protectRoute, upload.single('img'), async (req, res) => {
  try {
    const { text } = req.body; 
    let imageUrl = null;

    if (!text && !req.file) return res.status(400).json({ message: "Text or image required" });

    if (req.file) {
      // Convert memory buffer to base64 DataURI for Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "obsidiannet_posts", 
      });
      
      imageUrl = uploadResponse.secure_url; 
    }

    const newPost = new Post({ 
      user: req.user._id, 
      text: text, 
      img: imageUrl 
    });
    
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("🔥 Exact Post creation error:", error);
    res.status(500).json({ message: "Error creating post", error: error.message }); 
  }
});

// ❤️ POST Toggle Like
router.post('/:id/like', protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likes.includes(req.user._id);
    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString()); 
    } else {
      post.likes.push(req.user._id); 
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

// 🗑️ DELETE a post 
router.delete('/:id', protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const loggedInUserId = req.user?._id || req.user?.id;
    if (post.user.toString() !== loggedInUserId.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (post.img && !post.img.startsWith('http')) {
      try {
        const absoluteImagePath = path.join(process.cwd(), post.img);
        if (fs.existsSync(absoluteImagePath)) fs.unlinkSync(absoluteImagePath);
      } catch (e) {}
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting post", error: error.message });
  }
});

export default router;