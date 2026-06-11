import React, { useState, useEffect } from 'react';
import { Briefcase, Users, FileText, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom'; 

// ✅ FIX: Define the base URL so the fetch requests don't crash
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RecruiterDashboard() {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Recruiter's Posted Jobs on Load
    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/jobs`, { credentials: 'include' });
                const data = await response.json();

                // Make sure to define 'user' context in your app if this filtering is needed!
                // We are keeping your logic intact here
                const myJobs = data.filter(job => job.postedBy?._id === window.currentUser?._id); 
                
                // If you don't have a 'user' variable mapped yet, change the above line to:
                // const myJobs = data; 
                
                setJobs(myJobs);
                if (myJobs.length > 0) setSelectedJob(myJobs[0]._id);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyJobs();
    }, []);

    // 2. Fetch Applications when a specific Job is selected
    useEffect(() => {
        if (!selectedJob) return;

        const fetchApplications = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/recruiter/applications/${selectedJob}`);
                const data = await response.json();
                setApplications(data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };
        fetchApplications();
    }, [selectedJob]);

    // 3. Handle Status Updates
    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/recruiter/applications/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status on server');
            }

            // Optimistically update UI
            setApplications(prev =>
                prev.map(app => app._id === applicationId ? { ...app, status: newStatus } : app)
            );
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Error updating status. Make sure you are logged in as a recruiter.');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepted': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'reviewed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'; // Pending
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">

                {/* Left Sidebar: My Postings */}
                <div className="w-full md:w-1/3 bg-[#111827] rounded-xl border border-gray-800 p-4 h-[calc(100vh-100px)] overflow-y-auto">

                    <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-semibold">My Postings</h2>
                        </div>
                        <Link to="/post-job" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            + Post Job
                        </Link>
                    </div>

                    {jobs.length === 0 ? (
                        <p className="text-gray-400 text-sm">You haven't posted any jobs yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map(job => (
                                <div
                                    key={job._id}
                                    onClick={() => setSelectedJob(job._id)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedJob === job._id
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-800 bg-[#1A2234] hover:border-gray-600'
                                        }`}
                                >
                                    <h3 className="font-medium text-gray-100">{job.title}</h3>
                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-full text-blue-400"><Users className="w-3 h-3" /> View</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Applicant Tracking */}
                <div className="w-full md:w-2/3 bg-[#111827] rounded-xl border border-gray-800 p-6 h-[calc(100vh-100px)] overflow-y-auto">
                    {selectedJob ? (
                        <>
                            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                                <h2 className="text-2xl font-bold">{jobs.find(j => j._id === selectedJob)?.title} - Applicants</h2>
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {applications.length} Total
                                </span>
                            </div>

                            {applications.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No applications received yet for this position.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {applications.map(app => (
                                        <div key={app._id} className="bg-[#1A2234] border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4">

                                            {/* Applicant Info */}
                                            <div className="flex items-start gap-4">
                                                <img
                                                    src={app.applicant?.profilePicture || 'https://via.placeholder.com/50'}
                                                    alt="Profile"
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                                                />
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-100">{app.applicant?.name || 'Anonymous User'}</h4>
                                                    <p className="text-sm text-gray-400">{app.applicant?.headline || 'No headline provided'}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {/* Actions & Status */}
                                            <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                                                    {app.status || 'Pending'}
                                                </span>

                                                <div className="flex gap-2 w-full">
                                                    <select
                                                        className="bg-gray-900 border border-gray-700 text-sm rounded-md px-2 py-1 flex-1 focus:ring-blue-500 focus:border-blue-500"
                                                        value={app.status || 'Pending'}
                                                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Reviewed">Reviewed</option>
                                                        <option value="Interviewing">Interviewing</option>
                                                        <option value="Accepted">Accepted</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </div>

                                                {/* Resume Link */}
                                                {app.resumeUrl && (
                                                    <a
                                                        href={app.resumeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4" /> View Resume <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a job from the left to view applicants.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}