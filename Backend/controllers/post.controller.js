import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.model.js'; // ⚠️ Check if your file is Post.js or Post.model.js
import mongoose from 'mongoose';

// 📥 GET all posts
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name username profilePicture')          
            .populate('comments.user', 'name username profilePicture'); 
            
        res.status(200).json(posts);
    } catch (error) {
        console.error("Get Posts Error:", error);
        res.status(500).json({ message: "Internal server error fetching posts" });
    }
};

// 📤 POST Create a new post (Uploads to Cloudinary securely)
export const createPost = async (req, res) => {
    try {
        const { text } = req.body; 
        let imageUrl = null;

        if (!text && !req.file) {
            return res.status(400).json({ message: "Text or image required" });
        }

        // ✅ FIXED: Safely upload from memory buffer directly to Cloudinary
        if (req.file) {
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
        console.error("🔥 Post creation error:", error);
        res.status(500).json({ message: "Error creating post", error: error.message }); 
    }
};

// ❤️ POST Toggle Like
export const likePost = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Post ID format" });
        }

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
        console.error("Like Post Error:", error);
        res.status(500).json({ message: "Error liking post" });
    }
};

// 💬 POST Add Comment
export const commentPost = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Post ID format" });
        }

        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ user: req.user._id, text });
        await post.save();
        
        res.status(201).json(post);
    } catch (error) {
        console.error("Comment Post Error:", error);
        res.status(500).json({ message: "Error commenting" });
    }
};

// 🗑️ DELETE a post 
export const deletePost = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Post ID format" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Safeguard conversion parsing metrics
        const postOwnerStr = post.user ? post.user.toString() : "";
        const loggedInUserStr = req.user?._id ? req.user._id.toString() : (req.user?.id ? req.user.id.toString() : "");

        if (!loggedInUserStr || postOwnerStr !== loggedInUserStr) {
            return res.status(401).json({ message: "Unauthorized to delete this post" });
        }

        // ✅ FIXED: Removed local fs.unlinkSync logic which crashes deployed servers. 
        // Cloudinary handles its own hosted images, so we simply delete the DB record.
        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Unhandled deletion controller crash caught:", error);
        return res.status(500).json({ message: "Error deleting post", error: error.message });
    }
};