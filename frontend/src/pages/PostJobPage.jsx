import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      // Check if the backend actually sent JSON before trying to parse it
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Backend API error: Did not return JSON. Please check your backend terminal for crashes.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post job listing.');
      }

      alert('Job posted successfully!');
      navigate('/jobs'); // Redirect back to the jobs board
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full mt-10 bg-[#11131e] border border-[#1e2230] rounded-xl p-8">
      <h1 className="text-2xl font-bold text-gray-200 mb-6">Post a New Job</h1>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
            <input type="text" name="company" required value={formData.company} onChange={handleChange}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Location (or Remote)</label>
          <input type="text" name="location" required value={formData.location} onChange={handleChange}
            className="w-full bg-[#090a0f] border border-[#1e2230] text-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Job Description</label>
          <textarea name="description" required rows="4" value={formData.description} onChange={handleChange}
            className="w-full bg-[#090a0f] border border-[#1e2230] text-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Requirements</label>
          <textarea name="requirements" required rows="3" value={formData.requirements} onChange={handleChange}
            className="w-full bg-[#090a0f] border border-[#1e2230] text-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"></textarea>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Publishing...' : 'Publish Job Listing'}
        </button>
      </form>
    </div>
  );
}