import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    // ✅ FIXED: Configured for cross-domain deployment (Vercel ➡️ Render)
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,        // MUST be true for sameSite: 'none' to work in browsers
        sameSite: 'none',    // MUST be 'none' so the cookie passes from Vercel to Render
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const signup = async (req, res) => {
    try {
        // 🎯 Catch incoming role configuration from frontend payload
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const generatedUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000);

        // 🔐 Hash happens HERE (and only here!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Enforce safety constraint: Ensure role falls back cleanly to 'user' if manipulated
        const assignedRole = role === 'recruiter' ? 'recruiter' : 'user';

        const newUser = await User.create({
            name,
            username: generatedUsername,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: assignedRole, // 🎯 Automatically saving the verified account type context
        });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                bio: newUser.bio,
                profilePicture: newUser.profilePicture,
                role: newUser.role, // 🎯 Return role parameter to update application runtime state
            });
        } else {
            res.status(400).json({ message: 'Invalid user data provided.' });
        }
    } catch (error) {
        console.error('Signup Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 🔍 Compares plain text typed password with the single-hashed DB password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            role: user.role, // 🎯 Ensure existing logins cleanly broadcast role info for navbar evaluation
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = async (req, res) => {
    try {
        // ✅ FIXED: Same cross-domain configurations are required to clear the cookie accurately
        res.cookie('token', '', { 
            httpOnly: true, 
            secure: true,
            sameSite: 'none',
            expires: new Date(0) 
        });
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Get Current User Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};