import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 🎯 Added state for role selection ('user' or 'recruiter')
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 🚀 Passed the role selection parameter into your store's signup handler
    const result = await signup(name, email, password, role);
    
    if (result.success) {
      navigate('/'); 
    } else {
      setError(result.message || 'Failed to complete authentication setup.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto">
      <div className="bg-[#11131e] border border-[#1e2230] rounded-2xl p-8 shadow-xl text-center">
        
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
          Join ObsidianNet
        </h2>
        <p className="text-gray-400 text-sm mb-6">Make the most of your professional life.</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium text-left">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* 💼 ACCOUNT TYPE SELECTOR CARDS */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'user'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'border-[#1e2230] bg-[#090a0f] text-gray-400 hover:text-gray-200'
                }`}
              >
                🧑‍💻 Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'recruiter'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'border-[#1e2230] bg-[#090a0f] text-gray-400 hover:text-gray-200'
                }`}
              >
                💼 Recruiter
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#090a0f] text-gray-200 placeholder-gray-600 border border-[#1e2230] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="type"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#090a0f] text-gray-200 placeholder-gray-600 border border-[#1e2230] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password (6+ characters)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#090a0f] text-gray-200 placeholder-gray-600 border border-[#1e2230] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors shadow-md tracking-wide cursor-pointer"
          >
            {isLoading ? 'Creating Account...' : 'Agree & Join'}
          </button>
        </form>

        <div className="mt-6 border-t border-[#1e2230] pt-4 text-sm text-gray-400">
          Already on ObsidianNet?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-medium">Sign in</Link>
        </div>

      </div>
    </div>
  );
}