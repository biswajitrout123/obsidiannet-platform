import Job from '../models/job.model.js';

export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('postedBy', 'name profilePicture username')
            .sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createJob = async (req, res) => {
    try {
        const { title, company, location, description } = req.body;
        const newJob = new Job({
            title,
            company,
            location,
            description,
            postedBy: req.user._id
        });
        await newJob.save();
        res.status(201).json(newJob);
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};