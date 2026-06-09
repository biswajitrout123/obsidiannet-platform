import User from '../models/User.js';
import Post from '../models/Post.model.js';
import cloudinary from '../config/cloudinary.config.js';

const uploadToCloudinary = async (file, folder) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = "data:" + file.mimetype + ";base64," + b64;
    const uploadResponse = await cloudinary.uploader.upload(dataURI, { folder });
    return uploadResponse.secure_url;
};

// 🔍 NEW: Search users globally by name or username
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Search query parameter required" });

        // Search for matches matching name or username case-insensitively, excluding oneself
        const users = await User.find({
            _id: { $ne: req.user._id },
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ]
        }).select('name username profilePicture headline connections location');

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in searchUsers:", error.message);
        res.status(500).json({ message: "Server error processing search directory" });
    }
};

// 👥 NEW: Get all mutual connected user object arrays
export const getUserConnections = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('connections', 'name username profilePicture headline location connections bio');
        
        if (!user) return res.status(404).json({ message: "User reference target missing" });
        res.status(200).json(user.connections);
    } catch (error) {
        console.error("Error in getUserConnections:", error.message);
        res.status(500).json({ message: "Failed to retrieve established user connections" });
    }
};

// ⚡ UPDATED: Now filters out users you are already connected to!
export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUser = await User.findById(currentUserId);
        
        // Exclude yourself AND anyone already present in your connections list array mapping
        const excludedIds = [currentUserId, ...currentUser.connections];

        const suggestedUsers = await User.find({ _id: { $nin: excludedIds } })
            .select('name username profilePicture headline connections bio location skills')
            .limit(10); 

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error("Error in getSuggestedUsers:", error.message);
        res.status(500).json({ message: "Failed to fetch network suggestions" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        
        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'name username profilePicture headline');

        res.status(200).json({ user, posts });
    } catch (error) {
        console.error("Error in getUserProfile:", error.message);
        res.status(500).json({ message: "Error fetching profile metadata" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, bio, headline, location, skills } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (req.files) {
            if (req.files.profilePicture) {
                user.profilePicture = await uploadToCloudinary(req.files.profilePicture[0], "obsidiannet_profiles");
            }
            if (req.files.coverBanner) {
                user.coverBanner = await uploadToCloudinary(req.files.coverBanner[0], "obsidiannet_profiles");
            }
        }

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (headline !== undefined) user.headline = headline; 
        if (location !== undefined) user.location = location;

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

export const toggleConnection = async (req, res) => {
    try {
        const myId = req.user._id;
        const targetUserId = req.params.id;

        if (myId.toString() === targetUserId) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const myUser = await User.findById(myId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) return res.status(404).json({ message: "User not found" });

        const isAlreadyConnected = myUser.connections.includes(targetUserId);

        if (isAlreadyConnected) {
            myUser.connections = myUser.connections.filter(id => id.toString() !== targetUserId);
            targetUser.connections = targetUser.connections.filter(id => id.toString() !== myId.toString());
        } else {
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