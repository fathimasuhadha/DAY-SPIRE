import React, { useState } from 'react';
import { ShieldCheck, User, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { Logo } from './Logo';

export const AdminLoginModal = () => {
  const { adminLogin, setActiveTab } = usePlanner();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    const success = adminLogin(username, password);
    if (!success) {
      setErrorMsg('Invalid username or password. Please try again.');
    } else {
      setErrorMsg('');
    }
  };

  return (
    <div id="admin-login-view" className="max-w-md mx-auto my-8 sm:my-16 px-4">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E8E2D9] shadow-lg">
        
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" className="mb-4" />
          <h2 className="font-heading font-bold text-2xl text-[#084C61]">
            Admin Portal Access
          </h2>
          <p className="text-xs sm:text-sm text-[#7D7D7D] mt-1">
            Restricted content management interface for Akkaraipattu Tourism
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-[20px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-username-input" className="block text-xs font-bold text-[#084C61] uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#7D7D7D] absolute left-3.5 top-3" />
              <input
                id="admin-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full pl-10 pr-3 py-2.5 rounded-full border border-[#E8E2D9] bg-[#FDFBF7] text-[#084C61] text-sm focus:outline-none focus:ring-2 focus:ring-[#E27D60]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password-input" className="block text-xs font-bold text-[#084C61] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#7D7D7D] absolute left-3.5 top-3" />
              <input
                id="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-10 pr-3 py-2.5 rounded-full border border-[#E8E2D9] bg-[#FDFBF7] text-[#084C61] text-sm focus:outline-none focus:ring-2 focus:ring-[#E27D60]"
              />
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            className="w-full py-3 rounded-full bg-[#084C61] hover:bg-[#063b4b] text-white font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#E27D60]" />
            <span>Sign In to Admin Dashboard</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            id="admin-back-home-btn"
            type="button"
            onClick={() => setActiveTab('home')}
            className="text-xs text-[#7D7D7D] hover:text-[#084C61] font-medium inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Visitor Site</span>
          </button>
        </div>

      </div>
    </div>
  );
};
