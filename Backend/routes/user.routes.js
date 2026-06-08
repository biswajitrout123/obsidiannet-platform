import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import Post from '../models/Post.model.js';
import { protectRoute } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// ☁️ Cloudinary connection
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to handle Cloudinary buffer streams cleanly
const uploadToCloudinary = async (file, folder) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = "data:" + file.mimetype + ";base64," + b64;
  const uploadResponse = await cloudinary.uploader.upload(dataURI, { folder });
  return uploadResponse.secure_url;
};

// 🤝 GET: Fetch suggested connections
router.get('/suggestions', protectRoute, async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.user._id } })
      .select('name username profilePicture headline connections')
      .limit(5);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: "Failed to fetch network suggestions" });
  }
});

// 👤 GET: Fetch profile details (🚨 FIXED: Changed to /profile/:username to match frontend exactly)
router.get('/profile/:username', protectRoute, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePicture');

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile metadata" });
  }
});

// ✏️ PUT: Update name, professional headline, bio, location, skills, and multi-cloud graphics
router.put(
  '/update', 
  protectRoute, 
  upload.fields([
    { name: 'profilePicture', maxCount: 1 }, 
    { name: 'coverBanner', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { name, bio, headline, location, skills } = req.body;
      const user = await User.findById(req.user._id);
      
      if (!user) return res.status(404).json({ message: "User not found" });

      // Stream updates to Cloudinary if incoming files exist
      if (req.files) {
        if (req.files.profilePicture) {
          user.profilePicture = await uploadToCloudinary(req.files.profilePicture[0], "obsidiannet_profiles");
        }
        if (req.files.coverBanner) {
          user.coverBanner = await uploadToCloudinary(req.files.coverBanner[0], "obsidiannet_profiles");
        }
      }

      // Sync data fields safely
      if (name) user.name = name;
      if (bio !== undefined) user.bio = bio;
      if (headline !== undefined) user.headline = headline; 
      if (location !== undefined) user.location = location;

      // Safely turn string input into array
      if (skills !== undefined) {
        user.skills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      }

      await user.save();

      const updatedUser = await User.findById(user._id).select('-password');
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Profile edit error:", error);
      res.status(500).json({ message: "Failed to update profile parameters" });
    }
  }
);

export default router;