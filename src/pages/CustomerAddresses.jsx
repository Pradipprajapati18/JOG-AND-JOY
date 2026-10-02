import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomerAddresses() {
  const { user, updateUser } = useAuth();
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
  const [userAddresses, setUserAddresses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.addresses && Array.isArray(user.addresses)) {
        setUserAddresses(user.addresses);
      } else if (user.address) {
        setUserAddresses([{ id: 'legacy-1', label: 'Home', line1: user.address, isDefault: true }]);
      } else {
        setUserAddresses([]);
      }
    }
  }, [user]);

  const handleSaveNewAddress = async () => {
    if (!newAddress.line1.trim()) return alert("Address line 1 is required");
    
    setIsSaving(true);
    const addressToSave = { ...newAddress, id: Date.now().toString() };
    
    let updatedAddresses = [...userAddresses];
    if (addressToSave.isDefault || updatedAddresses.length === 0) {
      addressToSave.isDefault = true;
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    
    updatedAddresses.push(addressToSave);
    
    setUserAddresses(updatedAddresses);
    await updateUser({ addresses: updatedAddresses });
    
    setNewAddress({ label: 'Home', line1: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
    setShowAddressForm(false);
    setIsSaving(false);
  };

  const handleDeleteAddress = async (id) => {
    setIsSaving(true);
    const updatedAddresses = userAddresses.filter(a => a.id !== id);
    if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }
    setUserAddresses(updatedAddresses);
    await updateUser({ addresses: updatedAddresses });
    setIsSaving(false);
  };

  const handleSetDefaultAddress = async (id) => {
    setIsSaving(true);
    const updatedAddresses = userAddresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setUserAddresses(updatedAddresses);
    await updateUser({ addresses: updatedAddresses });
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Saved Addresses</h2>
          <p className="text-slate-500 mt-1">Manage your delivery addresses for faster checkout.</p>
        </div>
        {!showAddressForm && (
          <button 
            onClick={() => setShowAddressForm(true)}
            className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        )}
      </div>

      <div className="space-y-4">
        {userAddresses.length === 0 && !showAddressForm && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-black text-slate-800">No saved addresses</h4>
            <p className="text-sm text-slate-500 mt-2 mb-6">You haven't saved any addresses yet.</p>
            <button 
              onClick={() => setShowAddressForm(true)}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>
        )}

        {showAddressForm && (
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm space-y-5 animate-in fade-in duration-300 mb-8">
            <h4 className="font-black text-slate-800 text-lg">Add New Address</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setNewAddress({...newAddress, label: 'Home'})} className={`py-3 rounded-xl border text-sm font-bold transition-all ${newAddress.label === 'Home' ? 'border-[#EF4A45] bg-red-50 text-[#EF4A45]' : 'border-slate-200 bg-white text-slate-600'}`}>Home</button>
              <button type="button" onClick={() => setNewAddress({...newAddress, label: 'Work'})} className={`py-3 rounded-xl border text-sm font-bold transition-all ${newAddress.label === 'Work' ? 'border-[#EF4A45] bg-red-50 text-[#EF4A45]' : 'border-slate-200 bg-white text-slate-600'}`}>Work</button>
            </div>
            
            <input type="text" placeholder="Flat, House no., Building, Company, Apartment" value={newAddress.line1} onChange={(e) => setNewAddress({...newAddress, line1: e.target.value})} className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]" />
              <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Pincode" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]" />
              <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-4">
              <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-[#EF4A45] focus:ring-[#EF4A45]" />
              <span className="text-sm font-bold text-slate-700">Make this my default address</span>
            </label>
            
            <div className="pt-4 flex gap-4">
              <button onClick={() => setShowAddressForm(false)} className="flex-1 py-3.5 border border-slate-200 bg-white rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleSaveNewAddress} disabled={isSaving} className="flex-1 py-3.5 bg-[#EF4A45] text-white rounded-xl font-bold hover:bg-[#d33a36] transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Address
              </button>
            </div>
          </div>
        )}

        {!showAddressForm && userAddresses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {userAddresses.map((addr) => (
              <div key={addr.id} className={`p-6 rounded-2xl border ${addr.isDefault ? 'border-[#EF4A45] bg-red-50/20' : 'border-slate-200 bg-white'} relative overflow-hidden group transition-all`}>
                {addr.isDefault && (
                  <div className="absolute top-0 right-0 bg-[#EF4A45] text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl shadow-sm tracking-wider">
                    DEFAULT
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${addr.isDefault ? 'bg-[#EF4A45]/10 text-[#EF4A45]' : 'bg-slate-100 text-slate-500'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pr-8">
                    <h4 className="font-extrabold text-slate-900 text-base mb-2">{addr.label}</h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                      {addr.line1}<br/>
                      {addr.city && addr.state ? `${addr.city}, ${addr.state} ${addr.postalCode || ''}` : ''}<br/>
                      {addr.country}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs font-bold text-[#EF4A45] hover:text-red-700 transition-colors uppercase tracking-wider flex items-center gap-1.5">
                          Set Default
                        </button>
                      )}
                      <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!showAddressForm && userAddresses.length > 0 && (
          <button 
            onClick={() => setShowAddressForm(true)}
            className="md:hidden w-full mt-4 py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:border-slate-300 hover:text-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        )}
      </div>
    </div>
  );
}
