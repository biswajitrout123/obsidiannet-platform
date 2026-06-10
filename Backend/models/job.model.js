import mongoose from 'mongoose';

// Sub-schema for individual job applications
const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: String, required: true }, // The uploaded resume URL
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, default: '' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Array of candidates who have applied, storing their specific application data
    applicants: [applicationSchema], 
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;