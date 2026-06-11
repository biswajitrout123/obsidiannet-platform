import Job from '../models/job.model.js';
import cloudinary from '../config/cloudinary.config.js';

export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('postedBy', 'name profilePicture username')
            .populate('applicants.user', 'name profilePicture username headline email')
            .sort({ createdAt: -1 });
            
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createJob = async (req, res) => {
    try {
        if (req.user.role !== "recruiter") {
            return res.status(403).json({ message: "Access denied. Only recruiters can post jobs." });
        }

        // ✅ FIX: Changed 'companyName' to 'company' so it perfectly matches React's request
        const { title, company, location, description, requirements } = req.body;

        const newJob = new Job({
            title,
            company, // ✅ FIX: Now maps correctly directly to the DB schema
            location,
            description,
            requirements,
            postedBy: req.user._id 
        });

        await newJob.save();
        res.status(201).json(newJob);

    } catch (error) {
        console.error("Error in createJob controller:", error);
        res.status(500).json({ message: "Server error while posting job." });
    }
};

export const applyToJob = async (req, res) => {
    try {
        let resumeUrl = req.user.resumeUrl; 
        
        if (req.body.resume) {
            const uploadResponse = await cloudinary.uploader.upload(req.body.resume, {
                resource_type: "auto", 
                folder: "resumes"
            });
            resumeUrl = uploadResponse.secure_url;

            req.user.resumeUrl = resumeUrl;
            await req.user.save();
        }

        if (!resumeUrl) {
            return res.status(400).json({ message: "A resume document is required to apply." });
        }

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const alreadyApplied = job.applicants.some((app) => {
            const appUserId = app.user && app.user._id ? app.user._id.toString() : app.user?.toString();
            return appUserId === req.user._id.toString();
        });

        if (alreadyApplied) {
            return res.status(400).json({ message: "You have already applied for this role." });
        }

        job.applicants.push({
            user: req.user._id,
            resume: resumeUrl,
            status: 'pending'
        });

        await job.save();
        res.status(200).json({ message: "Application submitted successfully!" });
    } catch (error) {
        console.error("Error applying to job:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateApplicantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: "Status field is missing from request body." });
        }

        const normalizedStatus = status.toLowerCase();
        
        if (!['approved', 'rejected', 'pending'].includes(normalizedStatus)) {
            return res.status(400).json({ message: `Invalid status configuration: ${status}` });
        }

        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: "Job listing context not found" });

        const isHiringManager = job.postedBy.toString() === req.user._id.toString();
        const isRecruiterAccount = req.user.role === 'recruiter';

        if (!isHiringManager && !isRecruiterAccount) {
            return res.status(403).json({ message: "Action Denied: Only hiring managers or recruiters can alter application status tracking flags." });
        }

        const applicant = job.applicants.find((app) => {
            if (!app.user) return false;
            const appUserId = app.user._id ? app.user._id.toString() : app.user.toString();
            return appUserId === req.params.applicantId;
        });

        if (!applicant) {
            return res.status(404).json({ message: "Target candidate application index not found on this job record." });
        }

        applicant.status = normalizedStatus;
        await job.save();

        res.status(200).json({ 
            message: `Applicant status tracking modified to '${normalizedStatus}' successfully.`,
            status: normalizedStatus 
        });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Internal server error processing application update data structure." });
    }
};