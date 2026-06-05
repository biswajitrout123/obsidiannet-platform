import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
    try {
        const { text, img } = req.body;
        const userId = req.user._id.toString();

        const newPost = new Post({
            user: userId,
            text,
            img,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getPosts = async (req, res) => {
    try {
        // 
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("user", "name username profilePicture"); 

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};