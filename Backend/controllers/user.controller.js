import User from '../models/User.js';

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Find the user, but omit the password field from the result
        const user = await User.findOne({ username }).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserProfile:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


// @desc    Update user profile details
// @route   PUT /api/users/update
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { headline, bio, location, website, skills } = req.body;

        // Process skills string into an array if provided
        let skillsArray;
        if (skills) {
            skillsArray = skills.split(',').map(skill => skill.trim());
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    headline: headline || "",
                    bio: bio || "",
                    location: location || "",
                    website: website || "",
                    ...(skills && { skills: skillsArray })
                }
            },
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateProfile:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};



// @desc    Get all users for networking discovery (excluding current user)
// @route   GET /api/users/suggestions
export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        // Find everyone except you
        const users = await User.find({ _id: { $ne: currentUserId } }).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getSuggestedUsers:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Toggle mutual connection between two users
// @route   POST /api/users/connect/:id
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
            // Remove connection from both sides
            myUser.connections = myUser.connections.filter(id => id.toString() !== targetUserId);
            targetUser.connections = targetUser.connections.filter(id => id.toString() !== myId.toString());
        } else {
            // Establish mutual connection
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
        res.status(500).json({ message: "Internal server error" });
    }
};