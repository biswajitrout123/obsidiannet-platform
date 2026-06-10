import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'recruiter'], default: 'user' }, // 🚨 FIX: Added role for access control
    headline: { type: String, default: 'ObsidianNet Professional Member' }, 
    location: { type: String, default: '' }, 
    bio: { type: String, default: 'Tech Professional | ObsidianNet Member' },
    profilePicture: { type: String, default: '' },
    coverBanner: { type: String, default: '' },
    resumeUrl: { type: String, default: '' }, // 🚨 FIX: Global resume storage
    skills: { type: [String], default: [] },
    connections: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;