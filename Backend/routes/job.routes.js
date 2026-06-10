import express from 'express';
import { protectRoute, authorizeRoles } from '../middleware/authMiddleware.js';
import { getJobs, createJob, applyToJob, updateApplicantStatus } from '../controllers/job.controller.js';

const router = express.Router();

// Publicly available to all logged-in users
router.get('/', protectRoute, getJobs);

// Candidate Route: Only normal users can apply to jobs
router.post('/:id/apply', protectRoute, authorizeRoles('user'), applyToJob);

// Recruiter Routes: Only recruiters can post jobs and approve/reject applicants
router.post('/create', protectRoute, authorizeRoles('recruiter'), createJob);
router.put('/:jobId/applicants/:applicantId/status', protectRoute, authorizeRoles('recruiter'), updateApplicantStatus);

export default router;