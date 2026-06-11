import express from 'express';
import { protectRoute, authorizeRoles } from '../middleware/authMiddleware.js';
import { getJobs, createJob, applyToJob, updateApplicantStatus } from '../controllers/job.controller.js';

const router = express.Router();

// Publicly available to all logged-in users
router.get('/', protectRoute, getJobs);

// Candidate Route: Only normal users can apply to jobs
router.post('/:id/apply', protectRoute, authorizeRoles('user'), applyToJob);

// ✅ FIX: Changed '/create' to '/' to match the React frontend POST request
router.post('/', protectRoute, authorizeRoles('recruiter'), createJob);

// Recruiter Route: Approve/Reject applicants
router.put('/:jobId/applicants/:applicantId/status', protectRoute, authorizeRoles('recruiter'), updateApplicantStatus);

export default router;