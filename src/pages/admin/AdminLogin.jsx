import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAdmin } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, User, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let success = false;
    const loginResult = await login(formData.email, formData.password);
    success = loginResult && loginResult.success;
    if (!success) setError(loginResult?.message || 'Invalid credentials. Please try again.');
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#FAF6F0', color: '#1a1a1a' }}>
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
        className="absolute top-5 left-5 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white text-[#222222] font-black text-xs sm:text-sm rounded-xl border-2 border-[#222222] shadow-[3px_3px_0px_#222222] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#222222] active:translate-y-0 active:shadow-[1px_1px_0px_#222222] transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>
      
      {/* Background Grid Pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.05,
        backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none"
      }} />

      {/* Decorative Stickers */}
      <motion.div 
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: -10 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="absolute top-[10%] left-[10%] hidden lg:flex items-center justify-center w-16 h-16 bg-[#FFD800] border-2 border-[#222222] rounded-2xl shadow-[4px_4px_0px_#222222]"
      >
        <Sparkles className="w-8 h-8 text-[#222222]" />
      </motion.div>

      <motion.div 
        initial={{ scale: 0, rotate: 20 }}
        animate={{ scale: 1, rotate: 15 }}
        transition={{ type: "spring", delay: 0.4 }}
        className="absolute bottom-[15%] right-[12%] hidden lg:flex items-center justify-center w-20 h-20 bg-[#AEE6FF] border-2 border-[#222222] rounded-full shadow-[4px_4px_0px_#222222]"
      >
        <ShieldCheck className="w-10 h-10 text-[#222222]" />
      </motion.div>

      <div className="w-full max-w-250 flex flex-col lg:flex-row bg-white rounded-3xl border-2 border-[#222222] shadow-[8px_8px_0px_#222222] overflow-hidden relative z-10">
        
        {/* Left Side - Branding */}
        <div className="lg:w-5/12 bg-[#FFD800] p-10 flex flex-col justify-center items-center text-center border-b-2 lg:border-b-0 lg:border-r-2 border-[#222222] relative overflow-hidden">
          {/* Abstract circles */}
          <div className="absolute -top-12.5 -right-12.5 w-40 h-40 bg-[#EF4A45] rounded-full border-2 border-[#222222] opacity-50" />
          <div className="absolute -bottom-7.5 -left-7.5 w-24 h-24 bg-[#AEE6FF] rounded-full border-2 border-[#222222] opacity-50" />

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-[#222222] mb-4 tracking-tight leading-tight">
              Jog & Joy<br/>
              <span className="text-[#EF4A45] font-serif italic font-normal">Admin HQ</span>
            </h1>
            <p className="text-[#222222] font-semibold text-lg max-w-62.5 mx-auto opacity-80">
              Manage the storefront with style and confidence!
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:w-7/12 p-8 md:p-12 bg-white relative">
            <h2 className="text-3xl font-black text-[#222222] mb-2">
              Welcome Back 👋
            </h2>
            <p className="text-gray-500 font-medium">
              Enter your admin credentials to continue.
            </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-bold text-[#222222] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@jogandjoy.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-[#222222] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#222222] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-[#222222] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#EF4A45] font-bold text-sm bg-[#EF4A45]/10 p-3 rounded-lg border-2 border-[#EF4A45]/20"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#EF4A45] text-white font-bold py-4 rounded-xl border-2 border-[#222222] shadow-[0px_4px_0px_#222222] hover:-translate-y-1 hover:shadow-[0px_6px_0px_#222222] active:translate-y-1  transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#222222] transition-colors cursor-pointer py-1 px-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Store</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
