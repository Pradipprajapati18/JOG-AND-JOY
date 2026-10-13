import React, { useState } from 'react';
import { Network, Globe, TrendingUp, ArrowRight, MapPin, Play, Sparkles, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import LiquidEther from '../components/ui/LiquidEther';
import { Input, Textarea } from '../components/ui/Input';
import CustomDropdown from '../components/ui/CustomDropdown';

export default function DistributorNetworkPage() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'mobile') {
      const onlyNums = value.replace(/\D/g, '');
      if (onlyNums.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: onlyNums }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = 'Mobile Number must be exactly 10 digits';
    }
    if (!formData.email.trim()) newErrors.email = 'Email Address is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const scriptData = new URLSearchParams();
      scriptData.append('name', formData.name);
      scriptData.append('mobile', formData.mobile);
      scriptData.append('email', formData.email);
      scriptData.append('companyName', formData.companyName);
      scriptData.append('address', formData.address);
      scriptData.append('city', formData.city);
      scriptData.append('state', formData.state);
      scriptData.append('message', formData.message);

      await fetch(import.meta.env.VITE_DISTRIBUTOR_SCRIPT_URL, {
        method: 'POST',
        body: scriptData,
        mode: 'no-cors'
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', mobile: '', email: '', companyName: '', address: '', city: '', state: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Sorry, there was an error sending your application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-16 pb-24 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* TrendZone-Inspired Distributor Network Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 relative z-10">

          {/* Simple Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Join Our Growing <br />
              <span className="text-[#FF7A59]">Distributor Network</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Partner with JOG & JOY to expand your wholesale apparel distribution with competitive margins, high consumer demand, and fast stock supply.
            </p>
          </div>
        </div>

        {/* Distributor Registration Form */}
        <div className="max-w-2xl mx-auto mb-16 px-2 sm:px-0">
          <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[2rem] shadow-lg border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF7A59]"></div>
            
            <div className="text-center mb-6 sm:mb-8">
              <span className="bg-[#FFF3EE] text-[#FF7A59] text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2 sm:mb-3 inline-block border border-[#FFE0D6]">
                Partner With Us
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Become a Distributor
              </h2>
              <p className="text-slate-500 font-medium text-[11px] sm:text-sm mt-2 max-w-md mx-auto leading-relaxed px-2">
                Fill out the form below to apply for a wholesale dealership. Our team will review your application and get back to you within 24 hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12 animate-[fadeIn_0.5s_ease-in]">
                <div className="w-20 h-20 rounded-full bg-[#FFF3EE] text-[#FF7A59] flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Application Received!</h3>
                <p className="text-slate-500 font-medium">Thank you for your interest. We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>Full Name</span>
                      <span className="text-[#FF7A59] font-black">*</span>
                    </label>
                    <Input
                      variant="playful"
                      name="name"
                      placeholder="e.g. Anand Shah"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      className="bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-sm text-sm py-2.5"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>Mobile Number</span>
                      <span className="text-[#FF7A59] font-black">*</span>
                    </label>
                    <Input
                      variant="playful"
                      name="mobile"
                      placeholder="+91 98765 43210"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      error={errors.mobile}
                      className="bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-sm text-sm py-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>E-mail Address</span>
                      <span className="text-[#FF7A59] font-black">*</span>
                    </label>
                    <Input
                      variant="playful"
                      name="email"
                      type="email"
                      placeholder="anand@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      className="bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-sm text-sm py-2.5"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>Company Name</span>
                      <span className="text-[#FF7A59] font-black">*</span>
                    </label>
                    <Input
                      variant="playful"
                      name="companyName"
                      placeholder="e.g. Super Kids Retail"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      error={errors.companyName}
                      className="bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-sm text-sm py-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <span>Street Address</span>
                    <span className="text-[#FF7A59] font-black">*</span>
                  </label>
                  <Input
                    variant="playful"
                    name="address"
                    placeholder="e.g. 123 Fashion Street, Phase 1"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    className="bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-sm text-sm py-2.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>City</span>
                      <span className="text-[#FF7A59] font-black">*</span>
                    </label>
                    <Input
                      variant="playful"
                      name="city"
                      placeholder="e.g. Ahmedabad"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      error={errors.city}
                      className="bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-sm text-sm py-2.5"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>State / Province</span>
                      <span className="text-[#FF7A59] font-black">*</span>
                    </label>
                    <Input
                      variant="playful"
                      name="state"
                      placeholder="e.g. Gujarat"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      error={errors.state}
                      className="bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-sm text-sm py-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <span>Message / Details</span>
                    <span className="text-[#FF7A59] font-black">*</span>
                  </label>
                  <Textarea
                    variant="playful"
                    name="message"
                    placeholder="Tell us about your retail presence..."
                    required
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    className="bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-sm text-sm py-2.5 min-h-[90px]"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-[#FF7A59] hover:bg-[#E86A4C] text-white font-black text-sm sm:text-base py-3 sm:py-3.5 rounded-xl shadow-md shadow-[#FF7A59]/30 hover:shadow-[#FF7A59]/50 transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.98]"
                  >
                    <span>Submit Application</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
