// backend/routes/recruiter.routes.js
import express from 'express';
import Job from '../models/Job.js'; // Adjust path to your Job model
import Application from '../models/Application.js'; // Adjust path to your Application model
import { protectRoute } from '../middleware/auth.js'; // Assuming you have auth middleware

const router = express.Router();

// 1. Get all jobs posted by the logged-in recruiter
router.get('/my-postings', protectRoute, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching postings", error: error.message });
  }
});

// 2. Get all applications for a specific job
router.get('/applications/:jobId', protectRoute, async (req, res) => {
  try {
    // Ensure the recruiter owns the job before showing applications
    const job = await Job.findById(req.params.jobId);
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view these applications" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email profilePicture headline') // Pull user details
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications", error: error.message });
  }
});

// 3. Update the status of a specific application
router.patch('/applications/:applicationId/status', protectRoute, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { new: true }
    );
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
});

export default router;