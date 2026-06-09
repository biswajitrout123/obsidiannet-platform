import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    headline: { type: String, default: 'ObsidianNet Professional Member' }, // 🛠️ FIX: Added missing field
    location: { type: String, default: '' }, // 🛠️ FIX: Added missing field
    bio: { type: String, default: 'Tech Professional | ObsidianNet Member' },
    profilePicture: { type: String, default: '' },
    coverBanner: { type: String, default: '' }, // 🛠️ FIX: Changed from bannerImg to coverBanner to match frontend/controller
    skills: { type: [String], default: [] },
    connections: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;