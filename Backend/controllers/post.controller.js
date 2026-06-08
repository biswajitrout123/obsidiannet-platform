import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
    try {
        const { text } = req.body; 
        const userId = req.user._id.toString();

        // 🖼️ Initialize the image path
        let imgPath = req.body.img; // Fallback just in case you pass a standard URL

        // ✅ FIXED: If multer intercepted a file, grab its filename and create the local URL path
        if (req.file) {
            imgPath = `/uploads/${req.file.filename}`;
        }

        const newPost = new Post({
            user: userId,
            text,
            img: imgPath, // Now saving the actual file path to MongoDB
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        // Logging the actual error is crucial for debugging
        console.error("Create Post Error:", error); 
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getPosts = async (req, res) => {
    try {
        // Excellent job using .populate() here to grab the user data!
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("user", "name username profilePicture"); 

        res.status(200).json(posts);
    } catch (error) {
        console.error("Get Posts Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};