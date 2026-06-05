import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: 'Tech Professional | ObsidianNet Member' },
    profilePicture: { type: String, default: '' },
    bannerImg: { type: String, default: '' },
    skills: { type: [String], default: [] },
    connections: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;