import React, { useState } from 'react';
import { Briefcase, Upload, Send } from 'lucide-react';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function Career() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    position: '',
    city: '',
    resume: null
  });

  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'E-mail Address is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Contact Number is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsModalOpen(true);
  };

  return (
    <div className="pt-36 pb-24 bg-[#FFF8F0] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-purple-200 text-purple-700 text-xs font-black uppercase tracking-wider shadow-xs">
            <Briefcase className="w-3.5 h-3.5" /> Work With Us
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
            Career <span className="text-purple-600">Opportunities</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Join the passionate team behind Jog&Joy. Explore open positions across apparel design, quality inspection, logistics, and sales.
          </p>
        </div>

        {/* Form */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="fullName"
                placeholder="Rahul Sharma"
                required
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
              />
              <Input
                label="E-mail Address"
                name="email"
                type="email"
                placeholder="rahul@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Contact Number"
                name="mobile"
                placeholder="+91 98765 43210"
                required
                value={formData.mobile}
                onChange={handleChange}
                error={errors.mobile}
              />
              <Input
                label="Desired Position"
                name="position"
                placeholder="Apparel Designer / Quality Inspector"
                required
                value={formData.position}
                onChange={handleChange}
                error={errors.position}
              />
            </div>

            <Input
              label="City"
              name="city"
              placeholder="Ahmedabad"
              required
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
            />

            {/* Resume File Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Attach Resume (PDF/DOCX)
              </label>
              <div className="relative border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-2xl p-6 text-center transition-colors bg-[#FFF8F0]/50 cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-8 h-8 text-purple-600" />
                  <p className="text-xs sm:text-sm text-slate-700 font-bold">
                    {formData.resume ? (
                      <span className="text-purple-700 font-black">{formData.resume.name}</span>
                    ) : (
                      'Click or drag file here to upload resume'
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              </div>
            </div>

            <Button type="submit" variant="lavender" size="lg" icon={Send} className="w-full">
              Submit Job Application
            </Button>
          </form>
        </div>

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ fullName: '', email: '', mobile: '', position: '', city: '', resume: null });
        }}
        title="Application Submitted!"
        message={`Thank you, ${formData.fullName}! Your application for the position of "${formData.position}" has been received by Jog&Joy HR.`}
      />
    </div>
  );
}
