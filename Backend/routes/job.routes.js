import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getJobs, createJob } from '../controllers/job.controller.js';

const router = express.Router();

router.get('/', protectRoute, getJobs);
router.post('/create', protectRoute, createJob);

export default router;