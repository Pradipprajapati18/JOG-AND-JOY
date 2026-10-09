import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ArrowRight, Truck, CreditCard, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createSlug } from '../utils/helpers';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartGrandTotal,
    appliedCoupon,
    autoCoupon,
    activeDiscount,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const result = applyCoupon(couponCode);
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setCouponError('');
      setCouponCode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-[#EF4A45] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800">Shopping Cart</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🛍️</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 font-medium mb-8">Looks like you haven't added anything to your bag yet.</p>
            <Link 
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#EF4A45] text-white font-extrabold rounded-full hover:bg-red-600 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Cart Table */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1E293B] text-white">
                        <th className="py-4 px-6 text-xs font-black uppercase tracking-wider rounded-tl-3xl">Product</th>
                        <th className="py-4 px-6 text-xs font-black uppercase tracking-wider">Price</th>
                        <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-center">Quantity</th>
                        <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-right rounded-tr-3xl">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={`${item.id}-${item.size}-${item.color}`} className="border-b border-slate-100 last:border-0 group">
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => removeFromCart(item.id, item.size, item.color)}
                                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:text-white hover:bg-[#EF4A45] transition-colors shrink-0"
                                title="Remove Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col">
                                <Link to={`/product/${createSlug(item.name || item.title) || item.id}`} className="font-bold text-slate-800 hover:text-[#EF4A45] transition-colors leading-tight mb-1">
                                  {item.name}
                                </Link>
                                <div className="text-xs font-semibold text-slate-500">
                                  Size: {item.size}
                                </div>
                                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                                  Color: <span className="w-3 h-3 rounded-full inline-block border border-slate-200" style={{ backgroundColor: item.color }}></span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6 font-bold text-slate-700">
                            ₹{item.numericPrice}
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex items-center justify-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 w-24 mx-auto">
                              <button 
                                onClick={() => updateQuantity(item.id, item.size, item.color, -1)}
                                className="text-slate-400 hover:text-[#EF4A45] transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-black text-slate-800 text-sm w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.size, item.color, 1)}
                                disabled={item.quantity >= (item.stock || Infinity)}
                                className={`transition-colors ${item.quantity >= (item.stock || Infinity) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-[#EF4A45]'}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-6 px-6 text-right font-black text-slate-800 text-lg">
                            ₹{item.numericPrice * item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Cart Actions */}
                <div className="bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                  <Link 
                    to="/products"
                    className="px-6 py-2.5 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-400 transition-colors w-full sm:w-auto text-center"
                  >
                    Continue Shopping
                  </Link>
                  <button 
                    onClick={clearCart}
                    className="px-6 py-2.5 rounded-full bg-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-300 transition-colors w-full sm:w-auto text-center"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-24">
                <h3 className="text-xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Order Summary</h3>
                
                {/* Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="mb-6 relative">
                  <input 
                    type="text" 
                    placeholder="Coupon code (Try KIDS20)" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button 
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#1E293B] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Apply
                  </button>
                  {couponError && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{couponError}</p>}
                </form>

                {activeDiscount && (
                  <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl mb-6 text-sm font-bold">
                    <span>Discount {activeDiscount.code} applied!</span>
                    {appliedCoupon && (
                      <button onClick={removeCoupon} className="hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-4 mb-6 text-sm font-bold text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-900">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-slate-900">{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mb-8 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900">Total</span>
                  <span className="text-2xl font-black text-[#EF4A45]">₹{cartGrandTotal}</span>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-[#EF4A45] text-white font-black rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#AEE6FF]/30 flex items-center justify-center text-blue-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm">Free Shipping</h4>
              <p className="text-xs font-semibold text-slate-500">On orders over ₹999</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#FFD6BA]/30 flex items-center justify-center text-orange-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm">Flexible Payment</h4>
              <p className="text-xs font-semibold text-slate-500">Pay with multiple options</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#CFFFE5]/30 flex items-center justify-center text-green-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm">24x7 Support</h4>
              <p className="text-xs font-semibold text-slate-500">We're here to help you</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
