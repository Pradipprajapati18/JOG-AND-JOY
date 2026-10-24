import React, { useState, useEffect } from 'react';
import { Phone, Save, Edit2, Loader2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const { wishlistCount } = useWishlist();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!editForm.name?.trim()) {
      alert("Name is required.");
      return;
    }
    if (!editForm.phone?.trim() || editForm.phone.length !== 10) {
      alert("Valid 10-digit Phone Number is required.");
      return;
    }
    if (editForm.name && !/^[A-Za-z\s]+$/.test(editForm.name)) {
      alert("Name can only contain letters and spaces.");
      return;
    }
    if (editForm.phone && !/^[0-9]{10}$/.test(editForm.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    setIsSaving(true);
    await updateUser({ name: editForm.name, phone: editForm.phone, address: editForm.address });
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Account Info</h2>
          <p className="text-slate-500 mt-1">Manage your personal information and contact details.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="hidden md:flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-2xl">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
          
          <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-black text-[#EF4A45] shadow-sm border border-slate-100">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]"
                  placeholder="Full Name"
                />
              ) : (
                <h3 className="text-xl font-black text-slate-900">{user?.name || 'Customer'}</h3>
              )}
              <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              {!isEditing ? (
                <p className="text-base font-bold text-slate-800 bg-white px-4 py-3 rounded-xl border border-slate-100">{user?.phone || 'Not provided'}</p>
              ) : (
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#EF4A45]/20 focus-within:border-[#EF4A45]">
                  <span className="pl-4 text-slate-400 font-bold">+91</span>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="w-full bg-transparent px-3 py-3 font-bold text-slate-800 focus:outline-none"
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Heart className="w-3.5 h-3.5" /> Saved Wishlist Items
              </label>
              <p className="text-base font-bold text-slate-800 bg-white px-4 py-3 rounded-xl border border-slate-100">{wishlistCount} Products</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-200">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full md:hidden py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 py-3.5 rounded-xl bg-[#EF4A45] hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
