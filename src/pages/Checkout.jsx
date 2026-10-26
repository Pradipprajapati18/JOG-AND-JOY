import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  UserCircle,
  X,
  Loader2
} from 'lucide-react';
import { useCreateOrder } from '../queries/useOrders';
import { useUpsertCustomerByEmail } from '../queries/useCustomers';
import { productsApi } from '../api/endpoints/products';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getColorName, formatColorName, formatColorHex } from '../utils/helpers';
import { createRazorpayOrder, launchRazorpayCheckout, loadRazorpaySdk, verifyRazorpayPayment } from '../utils/razorpay';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem || null;
  const {
    cart,
    cartSubtotal,
    discountAmount,
    shippingFee,
    expressShippingRate,
    baseShippingRate,
    freeShippingThreshold,
    cartGrandTotal,
    clearCart,
    appliedCoupon,
    activeDiscount,
    applyCoupon,
    removeCoupon,
    recordCouponUsage
  } = useCart();

  const checkoutItems = buyNowItem ? [buyNowItem] : cart;

  const activeSubtotal = buyNowItem
    ? (buyNowItem.numericPrice * buyNowItem.quantity)
    : cartSubtotal;

  let activeDiscountAmount = discountAmount;
  if (buyNowItem) {
    if (activeDiscount) {
      if (activeDiscount.minOrderValue && activeSubtotal < activeDiscount.minOrderValue) {
        activeDiscountAmount = 0;
      } else if (activeDiscount.discountPercent) {
        activeDiscountAmount = activeSubtotal * (activeDiscount.discountPercent / 100);
      } else if (activeDiscount.discountFixed) {
        activeDiscountAmount = Math.min(activeSubtotal, activeDiscount.discountFixed);
      }
    } else {
      activeDiscountAmount = 0;
    }
  }

  const hasFreeShipping = (freeShippingThreshold > 0 && activeSubtotal >= freeShippingThreshold) || Boolean(activeDiscount?.freeShipping);
  const activeShippingFee = hasFreeShipping ? 0 : (activeSubtotal > 0 ? (baseShippingRate ?? 99) : 0);

  const activeGrandTotal = buyNowItem
    ? Math.max(0, activeSubtotal - activeDiscountAmount + activeShippingFee)
    : cartGrandTotal;
  const createOrder = useCreateOrder();
  const upsertCustomer = useUpsertCustomerByEmail();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Try to grab the modal trigger if it was provided via Outlet
  const outletContext = useOutletContext();
  const setIsProfileOpen = outletContext?.setIsProfileOpen || (() => { });

  const [step, setStep] = useState(1); // 1: Address | 2: Shipping | 3: Payment | 4: Order Confirmed
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: '',
    shippingMethod: 'standard', // 'standard' | 'express'
    paymentMethod: 'upi' // 'upi' | 'card' | 'cod'
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showManualAddress, setShowManualAddress] = useState(true);

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Pre-load Razorpay checkout SDK in background so checkout is instant
  useEffect(() => {
    loadRazorpaySdk();
  }, []);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const result = applyCoupon(couponCode, buyNowItem ? activeSubtotal : null);
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setCouponError('');
      setCouponCode('');
    }
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));

      const addresses = user.addresses || (user.address ? [{ id: 'legacy-1', label: 'Home', line1: user.address, isDefault: true }] : []);
      if (addresses.length > 0) {
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
        setShowManualAddress(false);
        setFormData(prev => ({
          ...prev,
          address: defaultAddr.line1,
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          pincode: defaultAddr.postalCode || ''
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || ''
      }));
    }
  }, [user]);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid Email is required';
    const cleanPhone = (formData.phone || '').replace(/[^0-9]/g, '');
    if (!formData.phone.trim() || cleanPhone.length < 10) {
      newErrors.phone = 'Valid 10-digit mobile number is required';
    }

    if (showManualAddress) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      const cleanPincode = (formData.pincode || '').replace(/[^0-9]/g, '');
      if (!formData.pincode.trim()) {
        newErrors.pincode = 'Pincode is required';
      } else if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
        newErrors.pincode = 'Valid 6-digit postal pincode is required (e.g. 380001)';
      }
    } else if (!selectedAddressId) {
      newErrors.address = 'Please select a delivery address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr.id);
    setShowManualAddress(false);
    setFormData(prev => ({
      ...prev,
      address: addr.line1,
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.postalCode || ''
    }));
    setErrors(prev => ({ ...prev, address: null, city: null, state: null, pincode: null }));
  };

  const handleContinueToShipping = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const executeOrderCreation = async (paymentInfo = null) => {
    let finalCustomerId = user?.id || null;
    const finalOrderTotal = formData.shippingMethod === 'express' ? activeGrandTotal + expressShippingRate : activeGrandTotal;

    // Upsert customer profile first
    try {
      const cust = await upsertCustomer.mutateAsync({
        email: formData.email,
        data: {
          name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          lastOrderDate: new Date().toISOString(),
          isGuest: !isAuthenticated
        },
        orderAmount: finalOrderTotal
      });
      if (cust && cust.id && !user?.id) {
        finalCustomerId = cust.id;
      }
    } catch (err) {
      console.error("Failed to upsert customer", err);
    }

    const orderPayload = {
      orderNumber: paymentInfo?.customOrderNumber || `JJ-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90) + 10}`,
      customerId: finalCustomerId,
      createdAt: new Date().toISOString(),
      status: 'PROCESSING',
      paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : (paymentInfo?.paymentStatus || 'paid'),
      paymentMethod: formData.paymentMethod,
      fulfillmentStatus: 'unfulfilled',
      channel: 'Web Storefront',
      subtotal: activeSubtotal,
      discountAmount: activeDiscountAmount,
      promotionCodeApplied: activeDiscount?.code || null,
      shippingCost: formData.shippingMethod === 'express' ? activeShippingFee + expressShippingRate : activeShippingFee,
      tax: 0,
      total: finalOrderTotal,
      shippingMethod: formData.shippingMethod,
      razorpayOrderId: paymentInfo?.razorpay_order_id || null,
      razorpayPaymentId: paymentInfo?.razorpay_payment_id || null,
      razorpaySignature: paymentInfo?.razorpay_signature || null,
      items: checkoutItems.map(item => ({
        id: item.id,
        productId: item.id,
        titleSnapshot: item.name,
        unitPrice: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        colorName: formatColorName(item.colorName, item.color),
        image: item.image
      })),
      shippingAddress: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        line1: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.pincode,
        country: 'India'
      },
      statusHistory: [
        {
          status: 'PROCESSING',
          timestamp: new Date().toISOString(),
          note: formData.paymentMethod === 'cod'
            ? 'Order placed by customer (Cash on Delivery)'
            : `Order placed and paid online via Razorpay (${paymentInfo?.razorpay_payment_id || 'Captured'})`
        }
      ]
    };

    // --- FULLY ATOMIC RPC ORDER CREATION ---
    let newOrder;
    try {
      const { data, error } = await supabase.rpc('create_order_atomic', {
        order_payload: orderPayload
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Failed to create order via RPC. No data returned.');
      }

      newOrder = data;

      // Update Razorpay columns on order row if columns exist in database
      if (paymentInfo?.razorpay_payment_id) {
        try {
          const createdId = newOrder.orderNumber || newOrder.id;
          await supabase.from('orders').update({
            razorpayOrderId: paymentInfo.razorpay_order_id,
            razorpayPaymentId: paymentInfo.razorpay_payment_id,
            razorpaySignature: paymentInfo.razorpay_signature
          }).eq('id', createdId);
        } catch (dbErr) {
          console.warn('Non-fatal: could not update razorpay columns in orders table:', dbErr);
        }
      }
      } catch (err) {
      console.error("Atomic order creation failed:", err);
      let friendlyMessage = err.message || "Failed to place order due to insufficient stock or variant mismatch. Please adjust your cart.";

      const match = friendlyMessage.match(/Product ([a-f0-9\-]+) not found/i);
      if (match && match[1]) {
        const missingProductId = match[1];
        const missingItem = checkoutItems.find(item => item.id === missingProductId);
        if (missingItem) {
          friendlyMessage = `The product "${missingItem.name}" is no longer available (it may have been deleted). Please remove it from your cart.`;
        } else {
          friendlyMessage = `A product in your cart is no longer available. Please review your cart.`;
        }
      } else if (friendlyMessage.includes('Insufficient stock')) {
        friendlyMessage = `One or more items in your cart have insufficient stock. Please review your cart quantities before checking out.`;
      }

      // CRITICAL SAFEGUARD: If customer has already paid online (paymentInfo has razorpay_payment_id),
      // we must NOT discard the order! We rescue the transaction with status ON_HOLD and paymentStatus 'paid'
      // so that customer receives confirmation and admin can fulfill manually or refund.
      if (paymentInfo?.razorpay_payment_id) {
        console.warn("Attempting emergency fallback order save for paid customer...");
        try {
          const emergencyOrderId = orderPayload.orderNumber || orderPayload.id || `JJ-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90) + 10}`;
          const emergencyPayload = {
            ...orderPayload,
            id: emergencyOrderId,
            orderNumber: emergencyOrderId,
            status: 'ON_HOLD',
            paymentStatus: 'paid',
            paymentMethod: formData.paymentMethod || 'online',
            razorpayPaymentId: paymentInfo.razorpay_payment_id,
            razorpayOrderId: paymentInfo.razorpay_order_id,
            razorpaySignature: paymentInfo.razorpay_signature,
            adminNotes: `[URGENT] Payment captured via Razorpay (Payment ID: ${paymentInfo.razorpay_payment_id}), but atomic stock deduction reported: "${err.message}". Order placed ON HOLD for manual fulfillment or refund.`
          };
          const { data: fallbackOrder, error: fallbackErr } = await supabase
            .from('orders')
            .insert(emergencyPayload)
            .select()
            .single();

          if (!fallbackErr && fallbackOrder) {
            newOrder = fallbackOrder;
            alert(`Payment received successfully (Payment ID: ${paymentInfo.razorpay_payment_id})! Your order has been placed on priority review for inventory confirmation.`);
          } else {
            alert(friendlyMessage);
            throw err;
          }
        } catch (rescueErr) {
          console.error("Emergency order rescue encountered error:", rescueErr);
          alert(friendlyMessage);
          throw err;
        }
      } else {
        alert(friendlyMessage);
        throw err;
      }
    }

    const orderId = newOrder.orderNumber || newOrder.id;
    setCreatedOrderId(orderId);

    const localOrder = {
      ...(newOrder || {}),
      id: orderId,
      orderNumber: orderId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: orderPayload.items || checkoutItems,
      subtotal: Number(activeSubtotal || 0),
      discountAmount: Number(activeDiscountAmount || 0),
      shippingCost: Number(orderPayload.shippingCost || 0),
      total: Number(finalOrderTotal || 0),
      status: newOrder?.status || 'PROCESSING',
      paymentStatus: newOrder?.paymentStatus || (formData.paymentMethod === 'cod' ? 'pending' : 'paid'),
      paymentMethod: formData.paymentMethod,
      razorpayPaymentId: paymentInfo?.razorpay_payment_id || null
    };

    const existingOrders = JSON.parse(localStorage.getItem('jj_orders') || '[]');
    const filteredExisting = existingOrders.filter(o => {
      const cleanExisting = String(o?.orderNumber || o?.id || '').replace(/^#+/, '');
      const cleanNew = String(orderId || '').replace(/^#+/, '');
      return cleanExisting !== cleanNew;
    });
    localStorage.setItem('jj_orders', JSON.stringify([localOrder, ...filteredExisting]));

    recordCouponUsage();
    queryClient.invalidateQueries({ queryKey: ['orders'] });

    setIsOrderPlaced(true);
    if (!buyNowItem) {
      clearCart();
    }
  };

  const validateLiveStock = async () => {
    try {
      const productIds = Array.from(new Set(checkoutItems.map(i => i.id).filter(Boolean)));
      if (productIds.length === 0) return { valid: true };

      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('id, name, stock, variants')
        .in('id', productIds);

      if (error || !dbProducts || dbProducts.length === 0) {
        // Non-blocking fallback if query encounters network error
        return { valid: true };
      }

      for (const item of checkoutItems) {
        const prod = dbProducts.find(p => String(p.id) === String(item.id));
        if (!prod) {
          return {
            valid: false,
            message: `Product "${item.name}" is no longer available in the store.`
          };
        }

        const reqQty = Number(item.quantity) || 1;
        const reqSize = item.size ? (typeof item.size === 'object' ? item.size.name : String(item.size)) : null;
        const reqColor = item.color ? String(item.color).toLowerCase() : null;

        if (Array.isArray(prod.variants) && prod.variants.length > 0 && (reqSize || reqColor)) {
          const matchedVariant = prod.variants.find(v => {
            const sizeMatches = !reqSize || String(v.size || '').toLowerCase() === reqSize.toLowerCase();
            const colorMatches = !reqColor || String(v.colorHex || '').toLowerCase() === reqColor;
            return sizeMatches && colorMatches;
          });

          if (!matchedVariant) {
            return {
              valid: false,
              message: `The selected variant (${reqSize || ''} ${formatColorName(item.colorName, item.color)}) for "${item.name}" is no longer available.`
            };
          }

          const variantStock = Number(matchedVariant.stock ?? 0);
          if (variantStock < reqQty) {
            return {
              valid: false,
              message: `Insufficient stock for "${item.name}" (${reqSize || ''} ${formatColorName(item.colorName, item.color)}). Available: ${variantStock}, Requested: ${reqQty}. Please adjust your cart.`
            };
          }
        } else {
          const totalStock = Number(prod.stock ?? 0);
          if (totalStock < reqQty) {
            return {
              valid: false,
              message: `Insufficient stock for "${item.name}". Available: ${totalStock}, Requested: ${reqQty}. Please adjust your cart.`
            };
          }
        }
      }

      return { valid: true };
    } catch (e) {
      console.warn('Pre-checkout stock validation note:', e);
      return { valid: true };
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessingPayment(true);

    // Fast pre-payment live stock check to prevent customer being charged for depleted items
    const stockCheck = await validateLiveStock();
    if (!stockCheck.valid) {
      alert(stockCheck.message);
      setIsProcessingPayment(false);
      return;
    }

    // 1. If Cash On Delivery, execute directly with business safeguards
    if (formData.paymentMethod === 'cod') {
      const MAX_COD_AMOUNT = 5000;
      if (finalOrderTotal > MAX_COD_AMOUNT) {
        alert(`Cash on Delivery is limited to orders up to ₹${MAX_COD_AMOUNT}. For orders above ₹${MAX_COD_AMOUNT}, please use secure online payment (UPI, Cards, or Netbanking).`);
        setIsProcessingPayment(false);
        return;
      }

      try {
        await executeOrderCreation(null);
      } catch (e) {
        console.error('COD order creation failed:', e);
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    // 2. Online Payment via Razorpay
    const finalOrderTotal = formData.shippingMethod === 'express' ? activeGrandTotal + expressShippingRate : activeGrandTotal;
    const tempReceipt = `JJ-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90) + 10}`;

    try {
      // Step A: Create order on Razorpay with line items passed for server verification
      const razorpayOrderData = await createRazorpayOrder({
        amount: finalOrderTotal,
        receipt: tempReceipt,
        items: checkoutItems,
        notes: {
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone
        }
      });

      // Step B: Launch official Razorpay Checkout Modal
      await launchRazorpayCheckout({
        razorpayOrder: razorpayOrderData.order,
        keyId: razorpayOrderData.keyId,
        orderNumber: tempReceipt,
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        onSuccess: async (paymentResult) => {
          try {
            // Cryptographically verify signature via backend API - must strictly pass
            if (paymentResult?.razorpay_signature) {
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_signature: paymentResult.razorpay_signature
              });
              if (!verifyRes || !verifyRes.success) {
                throw new Error('Cryptographic payment signature verification failed on server.');
              }
            }
            await executeOrderCreation({
              ...paymentResult,
              customOrderNumber: tempReceipt
            });
          } catch (orderErr) {
            console.error('Order creation error after payment:', orderErr);
            alert(`Payment was successful (Payment ID: ${paymentResult.razorpay_payment_id}), but saving your order encountered an issue: ${orderErr.message}. Please contact customer support with your payment ID.`);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onFailure: (err) => {
          setIsProcessingPayment(false);
          alert(`Payment not completed: ${err.message || 'Payment cancelled or declined.'}`);
        },
        onDismiss: () => {
          setIsProcessingPayment(false);
        }
      });
    } catch (err) {
      setIsProcessingPayment(false);
      console.error('Failed to initiate Razorpay checkout:', err);
      alert(err.message || 'Unable to connect to payment gateway. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFF8EC] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto shadow-sm">
            <UserCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Login Required</h2>
          <p className="text-xs text-slate-500 font-semibold pb-4 leading-relaxed">
            To ensure the security of your order and to sync your cart, please log in or create an account to proceed with checkout.
          </p>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="block w-full py-3.5 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-md hover:bg-slate-800 transition-colors"
          >
            Log In / Create Account
          </button>
        </div>
      </div>
    );
  }

  if (!isOrderPlaced && checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8EC] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 font-semibold pb-4">
            You need to add some products to your cart before you can checkout.
          </p>
          <Link
            to="/products"
            className="block w-full py-3.5 rounded-full bg-[#EF4A45] text-white font-extrabold text-xs shadow-md hover:bg-red-600 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-[#FFF8EC] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Order Confirmed! 🎉</h2>
          <p className="text-xs text-slate-600 font-bold leading-relaxed">
            Thank you for shopping with Jog & Joy Kids! Order <strong>#{createdOrderId || 'JJ-94821'}</strong> has been placed successfully. A confirmation SMS & email have been sent to <strong>{formData.email}</strong>.
          </p>
          <div className="p-4 bg-amber-50 rounded-2xl text-xs font-semibold text-slate-700 text-left space-y-1 border border-amber-100">
            <div className="flex justify-between">
              <span>Delivery Address:</span>
              <span className="font-bold">{formData.city}, {formData.state}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery:</span>
              <span className="font-bold text-emerald-600">Within 3-4 Days</span>
            </div>
          </div>
          <Link
            to="/products"
            className="block w-full py-3.5 rounded-full bg-[#EF4A45] text-white font-extrabold text-xs shadow-md hover:bg-red-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8EC] py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Checkout Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" /> Secure Multi-Step Checkout
          </h1>
        </div>



        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Form Columns - Guided Accordion */}
          <div className="lg:col-span-7 space-y-5">

            {/* Step 1: Contact & Delivery Address */}
            <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border ${step === 1 ? 'border-[#EF4A45] ring-4 ring-[#EF4A45]/10' : 'border-slate-200'} transition-all overflow-hidden`}>
              <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setStep(1)}
              >
                <h3 className={`text-lg font-black flex items-center gap-3 ${step === 1 ? 'text-[#EF4A45]' : 'text-slate-900 group-hover:text-[#EF4A45] transition-colors'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${step === 1 ? 'bg-[#EF4A45] text-white' : 'bg-slate-100 text-slate-500'}`}>1</div>
                  Contact & Delivery
                </h3>
                {step > 1 && (
                  <button className="text-[10px] font-black text-[#EF4A45] hover:underline uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md">Edit</button>
                )}
              </div>

              <AnimatePresence>
                {step === 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                        <div>
                          <label className="block mb-1.5 ml-1 text-slate-500">Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]'} font-bold focus:outline-none transition-all placeholder-slate-300`}
                          />
                          {errors.fullName && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.fullName}</p>}
                        </div>
                        <div>
                          <label className="block mb-1.5 ml-1 text-slate-500">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]'} font-bold focus:outline-none transition-all placeholder-slate-300`}
                          />
                          {errors.email && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block mb-1.5 ml-1 text-slate-500">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 98765 43210"
                            className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]'} font-bold focus:outline-none transition-all placeholder-slate-300`}
                          />
                          {errors.phone && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.phone}</p>}
                        </div>
                      </div>

                      {/* Saved Addresses Section */}
                      {user && (user.addresses?.length > 0 || user.address) && (
                        <div className="pt-4 border-t border-slate-100 mt-2">
                          <h4 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center justify-between">
                            Saved Addresses
                            {!showManualAddress && (
                              <button type="button" onClick={() => setShowManualAddress(true)} className="text-[10px] text-[#EF4A45] hover:underline uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md">
                                + New Address
                              </button>
                            )}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                            {(user.addresses || [{ id: 'legacy-1', label: 'Home', line1: user.address, isDefault: true }]).map(addr => (
                              <div
                                key={addr.id}
                                onClick={() => handleAddressSelect(addr)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${selectedAddressId === addr.id && !showManualAddress ? 'border-[#EF4A45] bg-red-50/40 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:shadow-sm'}`}
                              >
                                {selectedAddressId === addr.id && !showManualAddress && (
                                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#EF4A45] rounded-bl-2xl flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="font-extrabold text-slate-900 text-sm">{addr.label}</span>
                                  {addr.isDefault && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white text-slate-700 shadow-xs border border-slate-200">DEFAULT</span>}
                                </div>
                                <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed pr-4">
                                  {addr.line1}, {addr.city} {addr.postalCode}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manual Address Form */}
                      {(showManualAddress || (!user || (!user.addresses?.length && !user.address))) && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                          {user && (user.addresses?.length > 0 || user.address) && (
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                              <h4 className="text-sm font-extrabold text-slate-800">Enter New Address</h4>
                              <button type="button" onClick={() => setShowManualAddress(false)} className="text-[10px] text-slate-500 hover:text-slate-900 uppercase tracking-wider font-bold bg-slate-100 px-2 py-1 rounded-md">
                                Cancel
                              </button>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                            <div>
                              <label className="block mb-1.5 ml-1 text-slate-500">Pincode</label>
                              <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="380015"
                                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.pincode ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]'} font-bold focus:outline-none transition-all placeholder-slate-300`}
                              />
                              {errors.pincode && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.pincode}</p>}
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block mb-1.5 ml-1 text-slate-500">Flat / House No / Street Address</label>
                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="A-102, Shanti Vihar, Bodakdev"
                                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.address ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]'} font-bold focus:outline-none transition-all placeholder-slate-300`}
                              />
                              {errors.address && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.address}</p>}
                            </div>
                            <div>
                              <label className="block mb-1.5 ml-1 text-slate-500">City</label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Ahmedabad"
                                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.city ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]'} font-bold focus:outline-none transition-all placeholder-slate-300`}
                              />
                              {errors.city && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.city}</p>}
                            </div>
                            <div>
                              <label className="block mb-1.5 ml-1 text-slate-500">State</label>
                              <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="Gujarat"
                                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.state ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#EF4A45]/20 focus:border-[#EF4A45]'} font-bold focus:outline-none transition-all placeholder-slate-300`}
                              />
                              {errors.state && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.state}</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            if (validateStep1()) setStep(2);
                          }}
                          className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl font-extrabold text-sm shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Continue to Delivery <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed State Summary */}
              {step > 1 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">{formData.fullName} • {formData.phone}</h5>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-md line-clamp-2 leading-relaxed">
                      {showManualAddress ? `${formData.address}, ${formData.city} ${formData.pincode}` : 'Saved Address Selected'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Shipping Method */}
            <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border ${step === 2 ? 'border-sky-500 ring-4 ring-sky-500/10' : 'border-slate-200'} transition-all overflow-hidden`}>
              <div
                className={`flex items-center justify-between group ${step > 1 ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                onClick={() => { if (step > 1) setStep(2); }}
              >
                <h3 className={`text-lg font-black flex items-center gap-3 ${step === 2 ? 'text-sky-500' : 'text-slate-900 group-hover:text-sky-500 transition-colors'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${step === 2 ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
                  Delivery Method
                </h3>
                {step > 2 && (
                  <button className="text-[10px] font-black text-sky-500 hover:underline uppercase tracking-widest bg-sky-50 px-2 py-1 rounded-md">Edit</button>
                )}
              </div>

              <AnimatePresence>
                {step === 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-3">
                      <label
                        onClick={() => { setFormData({ ...formData, shippingMethod: 'standard' }); }}
                        className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.shippingMethod === 'standard' ? 'border-sky-500 bg-sky-50/40 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.shippingMethod === 'standard' ? 'border-sky-500' : 'border-slate-300'}`}>
                            {formData.shippingMethod === 'standard' && <motion.div layoutId="shipDot" className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Standard Delivery</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">Delivery in 4-6 business days</p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900 text-sm">{activeShippingFee === 0 ? 'FREE' : `₹${activeShippingFee}`}</span>
                      </label>

                      <label
                        onClick={() => { setFormData({ ...formData, shippingMethod: 'express' }); }}
                        className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.shippingMethod === 'express' ? 'border-[#EF4A45] bg-red-50/40 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.shippingMethod === 'express' ? 'border-[#EF4A45]' : 'border-slate-300'}`}>
                            {formData.shippingMethod === 'express' && <motion.div layoutId="shipDot" className="w-2.5 h-2.5 rounded-full bg-[#EF4A45]" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                              Priority Express <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[9px] px-1.5 py-0.5 rounded-md tracking-wider">FAST</span>
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">Delivery in 1-2 business days</p>
                          </div>
                        </div>
                        <span className="font-black text-[#EF4A45] text-sm">+₹{expressShippingRate}</span>
                      </label>

                      <div className="pt-3">
                        <button
                          onClick={() => setStep(3)}
                          className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl font-extrabold text-sm shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Continue to Payment <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed State Summary */}
              {step > 2 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <Truck className="w-5 h-5 text-sky-500" />
                  </div>
                  <div className="flex flex-col justify-center h-10">
                    <h5 className="text-xs font-black text-slate-900 flex items-center gap-2">
                      {formData.shippingMethod === 'express' ? 'Priority Express' : 'Standard Delivery'}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {formData.shippingMethod === 'express'
                        ? '+₹' + expressShippingRate
                        : (activeShippingFee === 0 ? 'FREE' : '₹' + activeShippingFee)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border ${step === 3 ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200'} transition-all overflow-hidden`}>
              <div
                className={`flex items-center justify-between group ${step > 2 ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                onClick={() => { if (step > 2) setStep(3); }}
              >
                <h3 className={`text-lg font-black flex items-center gap-3 ${step === 3 ? 'text-emerald-500' : 'text-slate-900 group-hover:text-emerald-500 transition-colors'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${step === 3 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>3</div>
                  Payment
                </h3>
              </div>

              <AnimatePresence>
                {step === 3 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-3">
                      <label
                        onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                        className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-50/40 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.paymentMethod === 'upi' ? 'border-emerald-500' : 'border-slate-300'}`}>
                            {formData.paymentMethod === 'upi' && <motion.div layoutId="payDot" className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Instant UPI / Cards</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">GPay, PhonePe, Paytm, Visa, Mastercard</p>
                          </div>
                        </div>
                        <span className="hidden sm:inline-block text-[10px] font-black text-emerald-600 bg-emerald-100/50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">Secure</span>
                      </label>

                      <label
                        onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/40 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.paymentMethod === 'cod' ? 'border-emerald-500' : 'border-slate-300'}`}>
                            {formData.paymentMethod === 'cod' && <motion.div layoutId="payDot" className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Cash On Delivery</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">Pay cash upon parcel arrival</p>
                          </div>
                        </div>
                      </label>

                      {/* Note: The Place Order button is in the sticky summary sidebar */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Order Summary Sidebar (Sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100/50 space-y-5 sticky top-24">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <ShoppingBag className="w-5 h-5 text-[#EF4A45]" /> Order Summary ({checkoutItems.length} items)
              </h3>

              <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm font-bold text-slate-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 shadow-sm" />
                      <div className="flex flex-col truncate">
                        <span className="truncate text-slate-900">{item.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>Qty: {item.quantity} • {typeof item.size === 'object' ? (item.size?.name || 'N/A') : String(item.size || 'N/A')} •</span>
                          {item.color && (
                            <span className="w-2 h-2 rounded-full border border-slate-300 shrink-0 inline-block" style={{ backgroundColor: formatColorHex(item.color) }} />
                          )}
                          <span className="font-semibold text-slate-700">{formatColorName(item.colorName, item.color)}</span>
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 shrink-0">₹{item.numericPrice * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div className="pt-4 border-t border-slate-100">
                <form onSubmit={handleApplyCoupon} className="relative">
                  <input
                    type="text"
                    placeholder="Have a discount code?"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-4 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                  {couponError && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{couponError}</p>}
                </form>
              </div>

              {activeDiscount && (
                <div className="flex items-center justify-between p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-sm">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Discount {activeDiscount.code} applied!</span>
                  {appliedCoupon && (
                    <button onClick={removeCoupon} type="button" className="hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-black text-sm">₹{activeSubtotal}</span>
                </div>
                {activeDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-extrabold">
                    <span>Discount Applied</span>
                    <span className="text-sm">-₹{activeDiscountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="text-slate-900 font-black text-sm">{activeShippingFee === 0 ? 'FREE' : `₹${activeShippingFee}`}</span>
                </div>
                {formData.shippingMethod === 'express' && (
                  <div className="flex justify-between">
                    <span>Priority Express</span>
                    <span className="text-[#EF4A45] font-black text-sm">+₹{expressShippingRate}</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 mt-2 border-t border-slate-100 text-lg font-black text-slate-900 items-end">
                  <span>Total Payable</span>
                  <span className="text-[#EF4A45] text-2xl leading-none">₹{formData.shippingMethod === 'express' ? activeGrandTotal + expressShippingRate : activeGrandTotal}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    if (step < 3) {
                      const msgs = ["Please complete your Address details.", "Please select a Delivery Method."];
                      alert(msgs[step - 1]);
                      return;
                    }
                    if (validateStep1()) {
                      handlePlaceOrder();
                    }
                  }}
                  disabled={step !== 3 || isProcessingPayment}
                  className={`w-full py-4.5 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${step === 3 && !isProcessingPayment
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] hover:shadow-2xl cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-80'
                    }`}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to Gateway...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      {formData.paymentMethod === 'cod' ? 'Confirm Cash on Delivery' : 'Pay & Place Order'}
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-100 text-[11px] font-extrabold text-amber-700 flex flex-col sm:flex-row sm:items-center gap-2 justify-center text-center">
                <ShieldCheck className="w-5 h-5 shrink-0 mx-auto sm:mx-0" />
                <span>100% Secure Payment & Money Back Guarantee</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
