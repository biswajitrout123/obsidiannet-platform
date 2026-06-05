import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added submission state

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Updated to use Vite environment variables with a localhost fallback
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const PLACEHOLDER_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button immediately
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, location, description }),
        credentials: 'include',
      });

      if (response.ok) {
        setIsModalOpen(false);
        setTitle(''); setCompany(''); setLocation(''); setDescription('');
        fetchJobs(); // Refresh the list
      }
    } catch (error) {
      console.error("Error posting job:", error);
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  if (isLoading) return <div className="text-white text-center mt-20 text-sm">Loading job board...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-4 pb-12 text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-200 tracking-wide">Job Portal</h2>
          <p className="text-xs text-gray-500 font-medium">Find your next role or recruit top talent.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors shadow-md cursor-pointer"
        >
          + Post a Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-8 text-center shadow-lg">
          <p className="text-gray-400 text-sm">No jobs posted yet. Be the first to hire on ObsidianNet!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-[#11131e] border border-[#1e2230] rounded-xl p-5 shadow-md flex flex-col md:flex-row gap-4 hover:border-[#252a3d] transition-all">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-400 mb-1">{job.title}</h3>
                <div className="flex items-center space-x-3 text-xs font-semibold text-gray-300 mb-3">
                  <span>🏢 {job.company}</span>
                  <span>📍 {job.location}</span>
                  <span className="text-gray-500 font-medium">• Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>
              
              <div className="md:border-l border-[#1e2230] md:pl-5 flex flex-col justify-between items-start md:items-center min-w-[140px]">
                <div className="text-center w-full mb-4 md:mb-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Posted By</p>
                  <Link to={`/profile/${job.postedBy?.username}`} className="flex flex-col items-center group">
                    <img src={job.postedBy?.profilePicture || PLACEHOLDER_AVATAR} alt="Recruiter" className="w-10 h-10 rounded-full border border-[#252a3d] mb-1 group-hover:opacity-80 transition-opacity" />
                    <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">{job.postedBy?.name}</span>
                  </Link>
                </div>
                <button className="w-full px-4 py-1.5 border border-blue-500 text-blue-400 hover:bg-blue-500/10 rounded-full text-xs font-bold transition-all cursor-pointer">
                  Easy Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🪟 Post Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#11131e] border border-[#1e2230] w-full max-w-lg rounded-xl p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2230] pb-3 mb-4">Post a New Opportunity</h3>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1">Job Title</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#090a0f] text-gray-200 text-xs border border-[#1e2230] rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="e.g. Senior Frontend Developer" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 font-semibold mb-1">Company</label>
                  <input required type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-[#090a0f] text-gray-200 text-xs border border-[#1e2230] rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="e.g. Google" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 font-semibold mb-1">Location</label>
                  <input required type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-[#090a0f] text-gray-200 text-xs border border-[#1e2230] rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="e.g. Remote, USA" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1">Job Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#090a0f] text-gray-200 text-xs border border-[#1e2230] rounded-lg p-2.5 focus:outline-none focus:border-blue-500 resize-none min-h-[100px]" placeholder="Describe the role, requirements, and benefits..." />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-[#1e2230]/60 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-semibold rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`px-5 py-1.5 text-white text-xs font-semibold rounded-full transition-all shadow-md ${
                    isSubmitting 
                      ? 'bg-blue-800 cursor-not-allowed opacity-80' 
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}