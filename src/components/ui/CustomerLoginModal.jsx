import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2, Phone, MapPin, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import emailjs from '@emailjs/browser';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export default function CustomerLoginModal({ isOpen, onClose }) {
  const { login, register, resetPassword, updateUser, loginWithGoogle } = useAuth();
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'complete_profile'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUserToUpdate, setPendingUserToUpdate] = useState(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result?.success) {
        setError(result?.message || 'Failed to initiate Google sign in.');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during Google sign in.');
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'name') value = value.replace(/[^A-Za-z\s]/g, '');
    if (name === 'phone') value = value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict JS Validation
    if (view === 'forgot') {
      if (!formData.email?.trim()) {
        setError('Email is required.');
        return;
      }
      setIsLoading(true);
      
      try {
        const res = await resetPassword(formData.email.trim());
        if (res?.success) {
          setSuccessMsg('If an account exists, a recovery link has been sent to your email.');
        } else {
          setError(res?.message || 'Failed to send recovery link. Please try again later.');
        }
      } catch (err) {
        console.error('Reset password error:', err);
        setError('Failed to send recovery link. Please try again later.');
      }
      
      setIsLoading(false);
      return;
    }

    if (view === 'register' || view === 'complete_profile') {
      if (view === 'register') {
        if (!formData.name?.trim()) {
          setError('Full Name is required.');
          return;
        }
        if (!formData.phone?.trim() || formData.phone.length !== 10) {
          setError('Valid 10-digit Phone Number is required.');
          return;
        }
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
      }
      if (!formData.address?.trim()) {
        setError('Address Line is required.');
        return;
      }
      if (!formData.city?.trim()) {
        setError('City is required.');
        return;
      }
      if (!formData.state?.trim()) {
        setError('State is required.');
        return;
      }
      if (!formData.pincode?.trim()) {
        setError('Pincode is required.');
        return;
      }
    }
    
    setIsLoading(true);
    
    let success = false;
    let registeredOrLoggedInUser = null;

    if (view === 'complete_profile' && pendingUserToUpdate) {
      const addresses = [{
        id: 'addr-' + Date.now(),
        label: 'Home',
        line1: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.pincode.trim(),
        isDefault: true
      }];
      success = await updateUser({ address: formData.address.trim(), addresses });
      if (!success) setError('Failed to update profile. Please try again.');
    } else if (view === 'login') {
      const result = await login(formData.email.trim(), formData.password);
      success = result?.success;
      if (!success) {
        setError(result?.message || 'Invalid email or password.');
      } else {
        registeredOrLoggedInUser = result.user;
      }
    } else if (view === 'register') {
      const addresses = [{
        id: 'addr-' + Date.now(),
        label: 'Home',
        line1: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.pincode.trim(),
        isDefault: true
      }];
      const result = await register(
        formData.name.trim(), 
        formData.email.trim(), 
        formData.password, 
        'CUSTOMER', 
        formData.phone.trim(), 
        formData.address.trim(),
        addresses
      );
      success = result?.success;
      if (!success) setError(result?.message || 'Registration failed. Please try again.');
    }
    
    setIsLoading(false);
    
    if (success) {
      if (view === 'login' && registeredOrLoggedInUser) {
        // Intercept if no address
        const hasAddress = registeredOrLoggedInUser.addresses?.length > 0 || registeredOrLoggedInUser.address;
        if (!hasAddress) {
          setPendingUserToUpdate(registeredOrLoggedInUser);
          setView('complete_profile');
          return;
        }
      }
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden"
        >
          {/* Close Button */}
          {view !== 'complete_profile' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="overflow-y-auto overflow-x-hidden p-6 sm:p-8 w-full relative">
            {/* Decorative blurs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD5A1] rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute top-10 left-0 w-24 h-24 bg-[#AEE6FF] rounded-full blur-3xl opacity-30 -translate-x-1/2"></div>
            </div>

            <div className="mb-8 pr-8">
            <h2 className="text-3xl font-black text-[#1e293b] mb-2 tracking-tight">
              {view === 'login' ? 'Welcome Back 👋' : view === 'register' ? 'Join Jog & Joy ✨' : view === 'complete_profile' ? 'Complete Profile 📍' : 'Reset Password 🔐'}
            </h2>
            <p className="text-slate-500 font-semibold text-sm leading-relaxed">
              {view === 'login' 
                ? 'Sign in to view your orders and saved items.' 
                : view === 'register' 
                  ? 'Create an account for faster checkout and exclusive deals.'
                  : view === 'complete_profile'
                    ? 'Please provide your full delivery address to continue.'
                    : 'Enter your email to receive a password reset link.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {view === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A45] transition-colors" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Jane Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required={view === 'register'}
                        pattern="^[A-Za-z\s]+$"
                        title="Name can only contain letters and spaces"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A45] transition-colors" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        required={view === 'register'}
                        pattern="^[0-9]{10}$"
                        maxLength={10}
                        title="Phone number must be exactly 10 digits"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Address Line</label>
                    <div className="relative group">
                      <MapPin className="w-5 h-5 absolute left-4 top-4 text-slate-400 group-focus-within:text-[#EF4A45] transition-colors" />
                      <textarea
                        name="address"
                        placeholder="Flat, House no., Building, Company, Apartment"
                        value={formData.address}
                        onChange={handleChange}
                        required={view === 'register'}
                        rows={2}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required={view === 'register'}
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">State</label>
                      <div className="relative">
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required={view === 'register'}
                          className={`w-full px-4 py-3.5 pr-10 rounded-2xl border-2 border-slate-100 bg-slate-50/50 ${formData.state ? 'text-slate-900' : 'text-slate-400'} text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200 appearance-none cursor-pointer`}
                        >
                          <option value="" disabled>Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s} className="text-slate-900 bg-white">
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="e.g. 400001"
                      value={formData.pincode}
                      onChange={handleChange}
                      required={view === 'register'}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </motion.div>
              )}

              {view === 'complete_profile' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Address Line</label>
                    <div className="relative group">
                      <MapPin className="w-5 h-5 absolute left-4 top-4 text-slate-400 group-focus-within:text-[#EF4A45] transition-colors" />
                      <textarea
                        name="address"
                        placeholder="Flat, House no., Building, Company, Apartment"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={2}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">State</label>
                      <div className="relative">
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className={`w-full px-4 py-3.5 pr-10 rounded-2xl border-2 border-slate-100 bg-slate-50/50 ${formData.state ? 'text-slate-900' : 'text-slate-400'} text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200 appearance-none cursor-pointer`}
                        >
                          <option value="" disabled>Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s} className="text-slate-900 bg-white">
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="e.g. 400001"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {view !== 'forgot' && view !== 'complete_profile' && (
              <>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A45] transition-colors" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">Password</label>
                    {view === 'login' && (
                      <button 
                        type="button" 
                        onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }}
                        className="text-[11px] font-black text-[#EF4A45] hover:text-[#d33a36] hover:underline transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A45] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required={view !== 'forgot'}
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {view === 'forgot' && (
               <div>
                 <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email Address</label>
                 <div className="relative group">
                   <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A45] transition-colors" />
                   <input
                     type="email"
                     name="email"
                     placeholder="you@example.com"
                     value={formData.email}
                     onChange={handleChange}
                     required
                     className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#EF4A45] focus:ring-4 focus:ring-[#EF4A45]/10 focus:bg-white transition-all duration-200"
                   />
                 </div>
               </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#EF4A45] text-xs font-bold bg-[#EF4A45]/10 p-4 rounded-2xl flex items-center gap-2 border border-[#EF4A45]/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4A45]"></div>
                {error}
              </motion.div>
            )}
            
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-700 text-xs font-bold bg-green-50 p-4 rounded-2xl flex items-center gap-2 border border-green-200"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                {successMsg}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#EF4A45] text-white font-black py-4 rounded-2xl hover:bg-[#d33a36] shadow-[0_8px_16px_rgba(239,74,69,0.25)] hover:shadow-[0_12px_24px_rgba(239,74,69,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : view === 'complete_profile' ? 'Save & Continue' : 'Send Recovery Link'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {(view === 'login' || view === 'register') && (
            <div className="mt-5">
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-black uppercase text-slate-400 tracking-wider shrink-0">
                  or continue with
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-sm shadow-xs hover:border-slate-300 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{view === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {view !== 'complete_profile' && (
            <div className="mt-8 text-center text-sm font-semibold text-slate-500">
              {view === 'login' ? "Don't have an account? " : view === 'register' ? "Already have an account? " : "Remembered your password? "}
              <button
                type="button"
                onClick={() => {
                  setView(view === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccessMsg('');
                  setFormData({ name: '', email: '', password: '', phone: '', address: '', city: '', state: '', pincode: '' });
                }}
                className="text-[#EF4A45] hover:text-[#d33a36] hover:underline font-black transition-colors"
              >
                {view === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </div>
          )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
