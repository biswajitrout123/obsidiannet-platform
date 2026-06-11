import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PLACEHOLDER_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function JobsPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Interactive States
  const [showPostModal, setShowPostModal] = useState(false);
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null); // Triggers Resume Upload Modal

  // Form States
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', description: '', requirements: '' });
  const [isPosting, setIsPosting] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle File Selection and Convert to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setResumeFile(reader.result);
    }
  };

  // Submit Application to Backend
  const submitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile && !user?.resumeUrl) {
      return alert("Please upload a resume to apply.");
    }

    setIsSubmittingApp(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${applyingJobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeFile }),
        credentials: 'include'
      });

      if (response.ok) {
        alert("Applied successfully!");
        setApplyingJobId(null);
        setResumeFile(null);
        fetchJobs(); // Refresh jobs to show "Applied" state
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to apply.");
      }
    } catch (error) {
      console.error("Application error:", error);
      alert("An error occurred while applying.");
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // 🎯 NEW: Added the missing function to handle Recruiter posting a new job
  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
        credentials: 'include'
      });

      if (response.ok) {
        alert("Job posted successfully!");
        setShowPostModal(false);
        setNewJob({ title: '', company: '', location: '', description: '', requirements: '' }); // Reset form
        fetchJobs(); // Refresh the feed
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to post job.");
      }
    } catch (error) {
      console.error("Posting error:", error);
      alert("An error occurred while posting.");
    } finally {
      setIsPosting(false);
    }
  };

  // Recruiter: Approve or Reject Applicant
  const handleApplicantStatus = async (jobId, applicantId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applicants/${applicantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });

      if (response.ok) {
        alert(`Applicant marked as ${status}`);
        fetchJobs();
        setViewingApplicantsJob(null); // Close modal to refresh data
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-4 pb-12 text-left">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-[#11131e] border border-[#1e2230] rounded-xl p-6 shadow-lg mb-6">
        <div>
          <h2 className="text-gray-100 font-bold text-xl sm:text-2xl tracking-wide">Job Portal</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {user?.role === 'recruiter' ? "Manage listings and review talent resumes." : "Find your next career leap."}
          </p>
        </div>
        
        {user?.role === 'recruiter' && (
          <button onClick={() => setShowPostModal(true)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-xs sm:text-sm shadow-md transition-all cursor-pointer">
            + Post a Job
          </button>
        )}
      </div>

      {/* Main Listings Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading listings...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-[#11131e] rounded-xl border border-[#1e2230]">No available listings.</div>
        ) : (
          jobs.map((job) => {
            const hasApplied = job.applicants?.some(applicant => applicant.user?._id === user?._id || applicant.user === user?._id);

            return (
              <div key={job._id} className="bg-[#11131e] border border-[#1e2230] rounded-xl p-5 shadow-md flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-all hover:border-[#252a3d]">
                <div className="flex-1 min-w-0">
                  <h3 className="text-blue-400 font-bold text-base sm:text-lg">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-gray-400 text-xs font-medium">
                    <span>🏢 {job.company}</span> • <span>📍 {job.location}</span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-3 line-clamp-3">{job.description}</p>
                </div>

                <div className="flex flex-col items-start md:items-end justify-between min-w-[160px]">
                  {/* 🎯 NEW: Recruiter gets Manage button, Users get Apply button */}
                  {user?.role === 'recruiter' ? (
                    <button onClick={() => setViewingApplicantsJob(job)} className="px-4 py-1.5 border border-blue-500/40 hover:bg-blue-600/10 text-blue-400 rounded-full text-xs font-semibold cursor-pointer">
                      👥 Manage ({job.applicants?.length || 0})
                    </button>
                  ) : (
                    <button 
                      onClick={() => !hasApplied && setApplyingJobId(job._id)}
                      disabled={hasApplied}
                      className={`px-6 py-1.5 font-semibold rounded-full text-xs transition-all border cursor-pointer ${
                        hasApplied ? "bg-transparent border-[#1e2230] text-gray-500 cursor-not-allowed" : "bg-blue-600 border-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {hasApplied ? "✓ Applied" : "Easy Apply"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🟡 MODAL C: User Application / Resume Upload Modal */}
      {applyingJobId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11131e] border border-[#1e2230] w-full max-w-sm rounded-xl shadow-2xl p-6">
            <h3 className="text-gray-100 font-bold text-lg mb-4">Submit Application</h3>
            <form onSubmit={submitApplication}>
              <label className="block text-[11px] font-semibold text-gray-500 mb-2">Upload Resume (PDF/Doc)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600/20 file:text-blue-400 mb-4 cursor-pointer" />
              
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setApplyingJobId(null)} className="px-4 py-1.5 text-gray-400 hover:bg-[#1c1f2e] rounded-md text-xs cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmittingApp} className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold cursor-pointer">
                  {isSubmittingApp ? "Uploading..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔵 MODAL B: View Applications (Recruiter Dashboard View) */}
      {viewingApplicantsJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11131e] border border-[#1e2230] w-full max-w-xl rounded-xl shadow-2xl p-6 relative">
            <div className="flex justify-between items-center border-b border-[#1e2230] pb-3 mb-4">
              <h3 className="text-gray-100 font-bold text-base">Applicants for {viewingApplicantsJob.title}</h3>
              <button onClick={() => setViewingApplicantsJob(null)} className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer">✕ Close</button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {viewingApplicantsJob.applicants?.length > 0 ? (
                viewingApplicantsJob.applicants.map((applicant, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[#090a0f] border border-[#1e2230] rounded-lg gap-3">
                    
                    <div className="flex items-center space-x-3">
                      <img src={applicant.user?.profilePicture || PLACEHOLDER_AVATAR} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h4 className="text-gray-200 font-semibold text-sm">{applicant.user?.name}</h4>
                        <p className="text-[10px] text-blue-400">Status: <span className="uppercase">{applicant.status}</span></p>
                      </div>
                    </div>
                    
                    {/* Recruiter Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={applicant.resume} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 text-[11px] font-medium rounded-md transition-all"
                      >
                        📄 Resume
                      </a>
                      <button 
                        onClick={() => handleApplicantStatus(viewingApplicantsJob._id, applicant.user._id, 'approved')}
                        className="px-3 py-1 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/30 text-[11px] font-medium rounded-md transition-all cursor-pointer"
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => handleApplicantStatus(viewingApplicantsJob._id, applicant.user._id, 'rejected')}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-[11px] font-medium rounded-md transition-all cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-500">No applications yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🟢 MODAL A: Create Job Listing Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#11131e] border border-[#1e2230] w-full max-w-md rounded-xl p-6 relative">
            <h3 className="text-gray-100 font-bold text-lg mb-4">Post a New Role</h3>
            <form onSubmit={handlePostJobSubmit} className="space-y-3">
              <input type="text" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="Job Title" className="w-full bg-[#090a0f] border border-[#1e2230] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input type="text" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} placeholder="Company" className="w-full bg-[#090a0f] border border-[#1e2230] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input type="text" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="Location" className="w-full bg-[#090a0f] border border-[#1e2230] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <textarea value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Role Description" className="w-full bg-[#090a0f] border border-[#1e2230] rounded-lg p-2 text-xs text-white resize-none focus:outline-none focus:border-blue-500" rows="4" />
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-4 py-1.5 text-gray-400 hover:text-white text-xs cursor-pointer transition-colors">Cancel</button>
                <button type="submit" disabled={isPosting} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors">
                  {isPosting ? "Posting..." : "Publish Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}