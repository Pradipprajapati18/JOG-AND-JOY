import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowRight, User, Play, ChevronRight, ChevronLeft, Star, MessageSquare, Clock, Sparkles, X, Building2, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';
import { Input, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CustomDropdown from '../components/ui/CustomDropdown';

const inquiryOptions = [
  { label: '🎈 General Inquiry', value: 'general' },
  { label: '🛍️ Wholesale / Dealership', value: 'wholesale' },
  { label: '📦 Order Support & Tracking', value: 'support' },
  { label: '📏 Size & Fit Consultation', value: 'size' }
];

// --- PLAYFUL SVG DOODLE COMPONENTS ---
const SparkleDoodle = ({ className = "w-6 h-6 text-amber-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
);

const SquiggleDoodle = ({ className = "w-16 h-4 text-orange-400" }) => (
  <svg className={className} viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
    <path d="M5 10 Q 25 2, 45 10 T 85 10 T 95 10" />
  </svg>
);

const CloudDoodle = ({ className = "w-12 h-8 text-sky-400" }) => (
  <svg className={className} viewBox="0 0 64 40" fill="currentColor" opacity="0.9">
    <path d="M18 36h30a14 14 0 002-27.8 18 18 0 00-34.6-2.2A12 12 0 0018 36z" />
  </svg>
);

const SmileyDoodle = ({ className = "w-8 h-8 text-[#FF5500]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" fill="#FFE5D9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#FF5500" strokeWidth="2.5" />
    <circle cx="9" cy="9" r="1.5" fill="#FF5500" />
    <circle cx="15" cy="9" r="1.5" fill="#FF5500" />
  </svg>
);

const CrownDoodle = ({ className = "w-8 h-6 text-amber-400" }) => (
  <svg className={className} viewBox="0 0 24 16" fill="currentColor">
    <path d="M2 14L0 3L6.5 8L12 0L17.5 8L24 3L22 14H2Z" />
  </svg>
);

const RocketDoodle = ({ className = "w-10 h-10 text-[#FF5500]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.26-1.5 1.76-2.34L4.5 16.5z" fill="#FFD800" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" fill="#FF5500" stroke="currentColor" />
    <circle cx="15" cy="9" r="2" fill="#fff" />
  </svg>
);

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    inquiryType: 'general',
    comment: ''
  });

  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.name.trim()) newErrors.name = 'Your Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = 'Mobile Number must be exactly 10 digits';
    }
    if (!formData.email.trim()) newErrors.email = 'Email Address is required';
    if (!formData.comment.trim()) newErrors.comment = 'Comment/Inquiry is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Send to Google Sheets
      const scriptData = new URLSearchParams();
      scriptData.append('name', formData.name);
      scriptData.append('mobile', formData.mobile);
      scriptData.append('email', formData.email);
      scriptData.append('inquiryType', formData.inquiryType);
      scriptData.append('comment', formData.comment);

      await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: scriptData,
        mode: 'no-cors'
      });
      
      setIsModalOpen(true);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        inquiryType: 'general',
        comment: ''
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-[#FAF9F5] min-h-screen font-sans text-slate-900 overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="relative w-full pt-12 pb-20 overflow-hidden bg-linear-to-b from-[#FFFDF8] via-[#FAF9F5] to-[#F3F1E9]">
        
        {/* Subtle geometric floaters */}
        <div className="absolute top-12 left-10 w-16 h-16 bg-[#FF5500]/10 rounded-2xl rotate-12 blur-sm pointer-events-none"></div>
        <div className="absolute top-1/3 right-12 w-24 h-24 bg-[#FF5500]/20 rounded-3xl -rotate-12 blur-md pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <div className="flex flex-col items-center justify-center">

            {/* Headline + CTA */}
            <div className="space-y-8 flex flex-col items-center">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/90 border border-slate-200/80 px-4 py-2 rounded-full shadow-xs"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-pulse"></span>
                <span className="text-xs font-bold text-slate-700 tracking-wide">New Spring 2026 Collection • 24/7 Support</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-[4.2rem] font-black tracking-tight text-slate-900 leading-[1.08]"
              >
                Reflect Who<br />
                You Are with<br />
                Our <span className="text-[#FF5500]">Style</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-600 font-medium text-base sm:text-lg leading-relaxed max-w-lg"
              >
                The season of growth has arrived. Reflect who you are with our premium kids activewear collection and dedicated support team.
              </motion.p>

              {/* Email Subscribe / Quick Message bar removed per user request */}


            </div>
          </div>
        </div>
      </section>





      {/* --- MAIN CONTACT FORM & DIRECT CARDS SECTION --- */}
      <section id="contact-form" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Direct Info Cards */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5500]">Direct Connect</span>
                <h2 className="text-4xl font-black text-slate-900 mt-1">Get In Touch With Us</h2>
                <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                  Have questions about our kids activewear line or want to place a custom order? Fill out the form or reach out directly.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Phone Card */}
                <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-slate-200/80 hover:border-[#FF5500]/40 transition-colors flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center shrink-0 font-bold shadow-md shadow-orange-500/20">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Call Us Directly</h4>
                    <p className="text-lg font-black text-slate-900 mt-0.5">+91 94299 05118</p>
                    <p className="text-xs text-slate-500 font-medium">Mon - Sat: 10:00 AM - 7:00 PM IST</p>
                  </div>
                </div>

                {/* Email Card */}
                <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-slate-200/80 hover:border-[#FF5500]/40 transition-colors flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00A3E0] text-white flex items-center justify-center shrink-0 font-bold shadow-md shadow-sky-500/20">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Email Support</h4>
                    <p className="text-lg font-black text-slate-900 mt-0.5">jogjoy85@gmail.com</p>
                    <p className="text-xs text-slate-500 font-medium">Fast response within 24 business hours</p>
                  </div>
                </div>

                {/* Location Card */}
                <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-slate-200/80 hover:border-[#FF5500]/40 transition-colors flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold shadow-md shadow-emerald-500/20">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Head Office Location</h4>
                    <p className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                      49, Kamal House, Pankaj Society, Nr. SBI Bank, Bhattha, Paldi, Ahmedabad - 380007, Gujarat, India.
                    </p>
                  </div>
                </div>

                {/* Live Google Map Embedded */}
                <div className="w-full h-48 mt-4 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group">
                  <iframe 
                    title="Jog and Joy Location"
                    src="https://www.google.com/maps?q=Kamal+Clothing,+49,+Kamal+House,+Pankaj+Society,+Nr.+SBI+Bank,+Bhattha,+Paldi,+Ahmedabad+-+380007,+Gujarat,+India&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 z-0 grayscale group-hover:grayscale-0 transition-all duration-500"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Right Column: Playful Childish Registration / Contact Form */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative bg-linear-to-br from-[#FFF9F2] via-[#FFF3EA] to-[#FFEBE0] p-8 sm:p-12 rounded-[2.5rem] border-4 border-dashed border-[#FF7A00]/30 shadow-2xl overflow-hidden"
            >
              {/* Floating Background SVG Doodles */}
              <div className="absolute top-4 right-6 pointer-events-none animate-bounce">
                <SparkleDoodle className="w-8 h-8 text-amber-400" />
              </div>
              <div className="absolute top-12 left-8 pointer-events-none">
                <CloudDoodle className="w-14 h-9 text-sky-300" />
              </div>
              <div className="absolute bottom-6 right-10 pointer-events-none hidden sm:block">
                <RocketDoodle className="w-12 h-12 text-[#FF5500]" />
              </div>
              <div className="absolute bottom-20 left-4 pointer-events-none opacity-80">
                <SquiggleDoodle className="w-20 h-5 text-orange-400" />
              </div>
              <div className="absolute top-1/2 -right-4 pointer-events-none opacity-40 rotate-45">
                <SparkleDoodle className="w-12 h-12 text-[#00A3E0]" />
              </div>

              {/* Form Header with Playful Crown & Smiley */}
              <div className="mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 bg-amber-200/70 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
                  <CrownDoodle className="w-4 h-3 text-amber-600" />
                  <span>Kid-Friendly Fast Support 🚀</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Send Us a Message
                  </h3>
                  <SmileyDoodle className="w-9 h-9 shrink-0" />
                </div>

                <p className="text-sm font-bold text-slate-600 mt-2 flex items-center gap-2">
                  <span>Fill out this fun form and our activewear team will zoom back to you!</span>
                  <SparkleDoodle className="w-4 h-4 text-amber-500 inline" />
                </p>
              </div>

              {/* Form Input Grid */}
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>Your Name</span>
                      <span className="text-[#FF5500] font-black">*</span>
                    </label>
                    <Input
                      variant="playful"
                      name="name"
                      placeholder="e.g. Anand Shah"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      className="bg-white border-2 border-orange-200/80 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-1 focus:ring-orange-500 focus:ring-4 focus:ring-[#FF5500]/15 shadow-sm text-sm py-3.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>Mobile Number</span>
                      <span className="text-[#FF5500] font-black">*</span>
                    </label>
                    <Input
                      variant="playful"
                      name="mobile"
                      placeholder="+91 98765 43210"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      error={errors.mobile}
                      className="bg-white border-2 border-orange-200/80 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-1 focus:ring-orange-500 focus:ring-4 focus:ring-[#FF5500]/15 shadow-sm text-sm py-3.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>E-mail Address</span>
                      <span className="text-[#FF5500] font-black">*</span>
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
                      className="bg-white border-2 border-orange-200/80 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-1 focus:ring-orange-500 focus:ring-4 focus:ring-[#FF5500]/15 shadow-sm text-sm py-3.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>Inquiry Type</span>
                    </label>
                    <CustomDropdown
                      options={inquiryOptions}
                      value={formData.inquiryType}
                      onChange={(val) => setFormData(prev => ({ ...prev, inquiryType: val }))}
                      className="w-full"
                      buttonClassName="w-full py-3.5 px-4 bg-white border-2 border-[#FFE0D6] rounded-2xl text-slate-900 font-extrabold text-sm hover:border-[#FF7A59]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <span>Comment / Inquiry</span>
                    <span className="text-[#FF5500] font-black">*</span>
                  </label>
                  <Textarea
                    variant="playful"
                    name="comment"
                    placeholder="How can we help your store or kids activewear order today?"
                    required
                    value={formData.comment}
                    onChange={handleChange}
                    error={errors.comment}
                    className="bg-white border-2 border-orange-200/80 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-1 focus:ring-orange-500 focus:ring-4 focus:ring-[#FF5500]/15 shadow-sm text-sm py-3.5"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-linear-to-r from-[#FF5500] via-[#FF6B00] to-[#FF4500] text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-3 cursor-pointer group border-2 border-white/40 disabled:opacity-70"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Submit Message'}</span>
                    {!isSubmitting && (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                        <Send className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.button>
                </div>

              </form>
            </motion.div>

          </div>

        </div>
      </section>





      {/* --- MODALS --- */}
      {/* 1. Form Success Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ name: '', mobile: '', email: '', inquiryType: 'general', comment: '' });
        }}
        title="Message Received!"
        message={`Thank you, ${formData.name}! Your inquiry has been logged with Jog&Joy support. We will get back to you shortly at ${formData.email}.`}
      />



    </div>
  );
}
