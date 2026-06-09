import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import Post from '../models/Post.model.js';

// Initialize Cloudinary Configuration Environment Variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to handle Cloudinary buffer streams cleanly
const uploadToCloudinary = async (file, folder) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = "data:" + file.mimetype + ";base64," + b64;
    const uploadResponse = await cloudinary.uploader.upload(dataURI, { folder });
    return uploadResponse.secure_url;
};

// @desc    Get all users for networking discovery (excluding current user)
// @route    GET /api/users/suggestions
export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        
        // Find users except the current authenticated session instance
        const suggestedUsers = await User.find({ _id: { $ne: currentUserId } })
            .select('name username profilePicture headline connections bio location skills')
            .limit(10); // Safe threshold size parameters

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error("Error in getSuggestedUsers:", error.message);
        res.status(500).json({ message: "Failed to fetch network suggestions" });
    }
};

// @desc    Get user profile by username along with their post timeline
// @route    GET /api/users/profile/:username
export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Fetch matching timeline posts so the profile page layout doesn't error out
        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'name username profilePicture headline');

        res.status(200).json({ user, posts });
    } catch (error) {
        console.error("Error in getUserProfile:", error.message);
        res.status(500).json({ message: "Error fetching profile metadata" });
    }
};

// @desc    Update user profile details and media configurations
// @route    PUT /api/users/update
export const updateProfile = async (req, res) => {
    try {
        const { name, bio, headline, location, skills } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Process profile asset attachments if present in multi-part form payloads
        if (req.files) {
            if (req.files.profilePicture) {
                user.profilePicture = await uploadToCloudinary(req.files.profilePicture[0], "obsidiannet_profiles");
            }
            if (req.files.coverBanner) {
                user.coverBanner = await uploadToCloudinary(req.files.coverBanner[0], "obsidiannet_profiles");
            }
        }

        // Sync explicit data properties safely
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (headline !== undefined) user.headline = headline; 
        if (location !== undefined) user.location = location;

        // Turn comma-separated string payloads into indexable arrays
        if (skills !== undefined) {
            user.skills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select('-password');
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateProfile:", error.message);
        res.status(500).json({ message: "Failed to update profile parameters" });
    }
};

// @desc    Toggle mutual connection between two users
// @route    POST /api/users/connect/:id
export const toggleConnection = async (req, res) => {
    try {
        const myId = req.user._id;
        const targetUserId = req.params.id;

        if (myId.toString() === targetUserId) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const myUser = await User.findById(myId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isAlreadyConnected = myUser.connections.includes(targetUserId);

        if (isAlreadyConnected) {
            // Unlink bidirectional structural connection array mapping references
            myUser.connections = myUser.connections.filter(id => id.toString() !== targetUserId);
            targetUser.connections = targetUser.connections.filter(id => id.toString() !== myId.toString());
        } else {
            // Establish bidirectional network linkage
            myUser.connections.push(targetUserId);
            targetUser.connections.push(myId);
        }

        await myUser.save();
        await targetUser.save();

        res.status(200).json({ 
            connected: !isAlreadyConnected, 
            message: isAlreadyConnected ? "Disconnected successfully" : "Connected successfully" 
        });
    } catch (error) {
        console.error("Error in toggleConnection:", error.message);
        res.status(500).json({ message: "Internal server error toggling connection state" });
    }
};