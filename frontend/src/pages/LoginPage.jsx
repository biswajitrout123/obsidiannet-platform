import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate(); // 🚀 Hook to handle automatic redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/'); // 🌟 Instantly takes you inside to the feed page!
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto">
      <div className="bg-[#11131e] border border-[#1e2230] rounded-2xl p-8 shadow-xl text-center">
        
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-400 text-sm mb-6">Stay updated on your professional world.</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium text-left">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#090a0f] text-gray-200 placeholder-gray-600 border border-[#1e2230] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#090a0f] text-gray-200 placeholder-gray-600 border border-[#1e2230] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors shadow-md tracking-wide"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 border-t border-[#1e2230] pt-4 text-sm text-gray-400">
          New to ObsidianNet?{' '}
          <Link to="/signup" className="text-blue-400 hover:underline font-medium">Join now</Link>
        </div>

      </div>
    </div>
  );
}