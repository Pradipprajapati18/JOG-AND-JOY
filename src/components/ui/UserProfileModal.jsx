import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Package, MapPin, Heart, LogOut, CheckCircle2, ChevronRight, RotateCcw, Edit2, Save, Loader2, FileText } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useOrdersList } from '../../queries/useOrders';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getColorName, formatColorName, formatColorHex } from '../../utils/helpers';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'profile'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const toggleOrderStatus = (orderId) => {
    setExpandedOrderIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  // Addresses State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
  const [userAddresses, setUserAddresses] = useState([]);

  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState([]);

  // Use the actual logged-in user's ID to fetch orders
  const { data: ordersData, refetch } = useOrdersList(user ? { customerId: user.id } : {});

  React.useEffect(() => {
    if (isOpen && ordersData?.data) {
      const formattedOrders = ordersData.data.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber || `#${o.id.substring(0, 8).toUpperCase()}`,
        date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        items: o.items || [],
        total: `₹${o.total}`,
        status: o.status,
        trackingId: o.trackingId,
        carrier: o.carrier,
        shippingAddress: o.shippingAddress,
        paymentStatus: o.paymentStatus || 'paid',
        paymentMethod: o.paymentMethod || 'online',
        shippingMethod: o.shippingMethod,
      }));
      setOrders(formattedOrders);
    }
  }, [isOpen, ordersData]);

  React.useEffect(() => {
    if (user) {
      setEditForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
      // Initialize addresses array (migrate legacy string if needed)
      if (user.addresses && Array.isArray(user.addresses)) {
        setUserAddresses(user.addresses);
      } else if (user.address) {
        setUserAddresses([{ id: 'legacy-1', label: 'Home', line1: user.address, isDefault: true }]);
      } else {
        setUserAddresses([]);
      }
    }
  }, [user]);

  if (!isOpen) return null;

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
    await updateUser({ name: editForm.name, phone: editForm.phone, address: editForm.address, addresses: userAddresses });
    setIsSaving(false);
    setIsEditing(false);
  };

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


  const handleDownloadInvoice = (order) => {
    const cleanId = String(order.orderNumber || order.id || '').replace(/^#/, '');
    window.open(`/invoice/${cleanId}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* User Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-200 text-xl font-black uppercase">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              {!isEditing ? (
                <>
                  <h3 className="text-xl font-black text-slate-900">
                    {user?.name || 'Jog & Joy Member'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">{user?.email}</p>
                </>
              ) : (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value.replace(/[^A-Za-z\s]/g, '') }))}
                  className="text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Your Name"
                />
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 mb-6 text-xs sm:text-sm font-extrabold text-slate-500 space-x-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 flex items-center gap-1.5 transition-colors border-b-2 ${activeTab === 'orders' ? 'border-[#EF4A45] text-[#EF4A45]' : 'border-transparent hover:text-slate-900'
                }`}
            >
              <Package className="w-4 h-4" /> My Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`pb-3 flex items-center gap-1.5 transition-colors border-b-2 ${activeTab === 'addresses' ? 'border-[#EF4A45] text-[#EF4A45]' : 'border-transparent hover:text-slate-900'
                }`}
            >
              <MapPin className="w-4 h-4" /> Saved Addresses
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 flex items-center gap-1.5 transition-colors border-b-2 ${activeTab === 'profile' ? 'border-[#EF4A45] text-[#EF4A45]' : 'border-transparent hover:text-slate-900'
                }`}
            >
              <User className="w-4 h-4" /> Account Info
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order, i) => (
                  <div key={i} className="p-5 rounded-3xl bg-[#FFF8EC] border border-amber-100 shadow-sm flex flex-col gap-3">
                    {/* Header: Order Number & Status */}
                    <div className="flex items-start justify-between border-b border-amber-200/50 pb-3">
                      <div>
                        <span className="text-sm font-black text-slate-900 block">{order.orderNumber}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 block">Ordered: {order.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white text-slate-700 shadow-xs inline-block mb-1 border border-slate-100">
                          {order.status}
                        </span>
                        <span className="block text-sm font-black text-[#EF4A45]">{order.total}</span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 py-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-slate-700 font-semibold">
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                            {item.image ? (
                              <img src={item.image} alt={item.titleSnapshot} className="w-10 h-10 rounded object-cover border border-amber-100 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-amber-50 border border-amber-100 shrink-0 flex items-center justify-center text-[8px] text-amber-400">IMG</div>
                            )}
                            <div className="flex flex-col truncate">
                              <span className="truncate">
                                <span className="text-slate-400 mr-1">{item.quantity}x</span>
                                {item.titleSnapshot || item.name || 'Item'}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <span>Size: {typeof item.size === 'object' ? (item.size?.name || 'N/A') : String(item.size || 'N/A')} | Color:</span>
                                {item.color && (
                                  <span className="w-2 h-2 rounded-full border border-slate-300 shrink-0 inline-block" style={{ backgroundColor: formatColorHex(item.color) }} />
                                )}
                                <span className="font-semibold text-slate-700">{formatColorName(item.colorName, item.color)}</span>
                              </span>
                            </div>
                          </div>
                          <span className="font-bold shrink-0">₹{item.unitPrice * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Payment Grid */}
                    <div className="bg-white/80 rounded-2xl p-4 text-xs grid grid-cols-2 gap-4 border border-white">
                      <div>
                        <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Shipping To</p>
                        <p className="font-bold text-slate-800 line-clamp-1">{order.shippingAddress?.name || user?.name || 'Customer'}</p>
                        <p className="text-slate-500 font-medium leading-tight mt-0.5 line-clamp-2">
                          {order.shippingAddress ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}` : 'Standard Shipping'}
                        </p>
                        {order.shippingMethod && (
                          <p className="mt-1.5 text-[9px] font-bold text-blue-600 uppercase bg-blue-50 inline-block px-1.5 py-0.5 rounded tracking-wider">
                            {order.shippingMethod}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest mb-1.5 flex items-center gap-1"><Package className="w-3 h-3" /> Payment</p>
                        <p className="font-bold text-slate-800">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                          <span className="text-slate-400 font-medium ml-1 capitalize">({order.paymentStatus})</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions with Tracking Button */}
                    <div className="mt-1 pt-3 border-t border-amber-200/50 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/account/orders/${order.id}`);
                        }}
                        className="flex items-center gap-1.5 text-xs text-[#5B2E89] hover:text-[#46236b] font-black transition-colors bg-white px-3 py-2 rounded-lg border border-purple-200 shadow-sm"
                      >
                        View Full Details
                      </button>

                      <div className="flex gap-2">
                        {order.status !== 'CANCELLED' && (
                          <button onClick={() => handleDownloadInvoice(order)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm" title="Download Invoice / Receipt">
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'DELIVERED' && !order.returnRequest && (
                          <button
                            onClick={() => {
                              onClose();
                              navigate(`/account/orders/${order.orderNumber || order.id}`);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-red-200 text-[#EF4A45] hover:text-red-700 hover:bg-red-50 transition-colors shadow-sm"
                            title="Request Return / Exchange"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {(order.status === 'RETURN_REQUESTED' || order.status === 'EXCHANGE_REQUESTED') && (
                          <span className="flex items-center gap-1 text-[9px] uppercase font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                            {order.status === 'RETURN_REQUESTED' ? 'Return Pending' : 'Exchange Pending'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Collapsible Full-Width Vertical Order Status Timeline */}
                    {expandedOrderIds.includes(order.id) && (
                      <div className="mt-2 p-5 -mx-5 -mb-5 bg-white border-t border-amber-100 rounded-b-3xl animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracking Journey</p>
                          {(order.trackingId || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                            <div className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                              {order.carrier || 'Logistics'}: {order.trackingId || 'Pending'}
                            </div>
                          )}
                        </div>

                        <div className="relative pl-3 flex flex-col gap-6">
                          {(() => {
                            const isDeliveredOrBeyond = ['DELIVERED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REQUESTED', 'EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'REFUNDED'].includes(order.status);
                            const isShippedOrBeyond = ['SHIPPED'].includes(order.status) || isDeliveredOrBeyond;
                            const isReturnOrExchange = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REQUESTED', 'EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'REFUNDED'].includes(order.status);

                            const steps = [
                              { label: 'Order Processing', active: true, desc: 'We are preparing your order.' },
                              { label: 'Shipped', active: isShippedOrBeyond, desc: 'Your order is on the way.' },
                              { label: 'Delivered', active: isDeliveredOrBeyond, desc: 'Delivered to your address.' },
                            ];

                            if (isReturnOrExchange) {
                              let returnLabel = 'Return Pending';
                              if (order.status === 'RETURN_APPROVED') returnLabel = 'Return Approved';
                              if (order.status === 'RETURN_REJECTED') returnLabel = 'Return Rejected';
                              if (order.status === 'EXCHANGE_REQUESTED') returnLabel = 'Exchange Pending';
                              if (order.status === 'EXCHANGE_APPROVED') returnLabel = 'Exchange Approved';
                              if (order.status === 'EXCHANGE_REJECTED') returnLabel = 'Exchange Rejected';
                              if (order.status === 'REFUNDED') returnLabel = 'Refund Processed';

                              steps.push({ label: returnLabel, active: true, desc: 'Post-delivery process initiated.' });
                            }

                            // Calculate height of the active line based on number of active steps
                            const totalSegments = steps.length - 1;
                            const activeSegments = steps.filter(s => s.active).length - 1;
                            const progressHeight = totalSegments === 0 ? '0%' : `${(activeSegments / totalSegments) * 100}%`;

                            return (
                              <>
                                {/* Vertical Connecting Line Background */}
                                <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-amber-100 z-0"></div>
                                {/* Vertical Connecting Line Active */}
                                <div className="absolute left-4 top-2 w-[2px] bg-[#EF4A45] z-0 transition-all duration-700 ease-out" style={{ height: progressHeight }}></div>

                                {steps.map((step, idx) => (
                                  <div key={idx} className="relative z-10 flex items-start gap-4">
                                    <div className={`mt-[2px] w-3 h-3 shrink-0 rounded-full flex items-center justify-center ${step.active ? 'bg-[#EF4A45] ring-4 ring-red-50' : 'bg-amber-200'}`}>
                                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col -mt-1">
                                      <span className={`text-[13px] font-black ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {step.label}
                                      </span>
                                      {step.active && (
                                        <span className="text-[10px] text-slate-500 font-semibold mt-0.5">{step.desc}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">No orders yet</h4>
                  <p className="text-xs text-slate-500 mt-1">When you place an order, it will appear here.</p>
                </div>
              )}

              {orders.length > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    navigate('/account/orders');
                  }}
                  className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  View All Orders in Dashboard <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">

              {userAddresses.length === 0 && !showAddressForm && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">No saved addresses</h4>
                  <p className="text-xs text-slate-500 mt-1">Add an address for faster checkout.</p>
                </div>
              )}

              {userAddresses.map((addr) => (
                <div key={addr.id} className={`p-4 rounded-2xl border ${addr.isDefault ? 'border-[#EF4A45] bg-red-50/30' : 'border-slate-200 bg-slate-50'} relative overflow-hidden group transition-all`}>
                  {addr.isDefault && (
                    <div className="absolute top-0 right-0 bg-[#EF4A45] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm">
                      DEFAULT
                    </div>
                  )}
                  <div className="w-full pr-16">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-extrabold text-slate-900 text-sm">{addr.label}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {addr.line1}<br />
                      {addr.city && addr.state ? `${addr.city}, ${addr.state} ${addr.postalCode || ''}` : ''}<br />
                      {addr.country}
                    </p>

                    <div className="mt-3 flex gap-3">
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">Set Default</button>
                      )}
                      <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider">Delete</button>
                    </div>
                  </div>
                </div>
              ))}

              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:border-slate-300 hover:text-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> Add New Address
                </button>
              ) : (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h4 className="font-black text-slate-800 text-sm">Add New Address</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setNewAddress({ ...newAddress, label: 'Home' })} className={`py-2 rounded-xl border text-xs font-bold transition-all ${newAddress.label === 'Home' ? 'border-[#EF4A45] bg-red-50 text-[#EF4A45]' : 'border-slate-200 text-slate-600'}`}>Home</button>
                    <button type="button" onClick={() => setNewAddress({ ...newAddress, label: 'Work' })} className={`py-2 rounded-xl border text-xs font-bold transition-all ${newAddress.label === 'Work' ? 'border-[#EF4A45] bg-red-50 text-[#EF4A45]' : 'border-slate-200 text-slate-600'}`}>Work</button>
                  </div>

                  <input type="text" placeholder="Flat, House no., Building, Company, Apartment" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#EF4A45]" />

                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#EF4A45]" />
                    <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#EF4A45]" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Pincode" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#EF4A45]" />
                    <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#EF4A45]" />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="rounded text-[#EF4A45] focus:ring-[#EF4A45]" />
                    <span className="text-xs font-bold text-slate-600">Make this my default address</span>
                  </label>

                  <div className="pt-2 flex gap-3">
                    <button onClick={() => setShowAddressForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handleSaveNewAddress} disabled={isSaving} className="flex-1 py-3 bg-[#EF4A45] text-white rounded-xl font-bold text-xs hover:bg-[#d33a36] transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
                      {isSaving && <Loader2 className="w-3 h-3 animate-spin" />} Save Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span>Phone Number</span>
                {!isEditing ? (
                  <span className="text-slate-900">{user?.phone || 'Not provided'}</span>
                ) : (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 w-1/2 focus:outline-none focus:ring-1 focus:ring-red-500 text-right"
                    placeholder="Enter phone number"
                    maxLength={10}
                  />
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                <span>Saved Wishlist Items</span>
                <span className="text-slate-900">{wishlistCount} Products</span>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full mt-4 py-3 rounded-2xl bg-[#EF4A45] hover:bg-red-600 text-white font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full py-4 rounded-2xl font-bold text-[15px] text-slate-400 flex items-center justify-center gap-2 hover:text-rose-500 hover:bg-rose-50/50 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
