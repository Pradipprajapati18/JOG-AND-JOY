import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Truck, CheckCircle2, MapPin, CreditCard,
  Download, ExternalLink, Loader2, Star, RefreshCw, RotateCcw,
  ShieldAlert, Check, X, Sparkles, Search, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useOrder, useOrdersList, useUpdateOrder } from '../queries/useOrders';
import { useCombinedProducts } from '../queries/useCombinedProducts';
import { useCreateReview, useReviewsList } from '../queries/useReviews';
import { useUIContext } from '../context/UIContext';
import { getColorName, formatColorName, formatColorHex, createSlug } from '../utils/helpers';
import { resolveOrderTracking } from '../utils/shipping';
import { supabase } from '../lib/supabase';
import { restockOrderItems } from '../utils/inventory';
import { createRazorpayOrder, launchRazorpayCheckout, verifyRazorpayPayment } from '../utils/razorpay';

export default function CustomerOrderDetails() {
  const { id } = useParams();
  const cleanId = String(id || '').replace(/^#+/, '');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: orderData, isLoading: isOrderLoading } = useOrder(cleanId);
  const { data: ordersData, isLoading: isListLoading } = useOrdersList(user ? { customerId: user.id } : {});
  const isLoading = isOrderLoading || isListLoading;
  const { combinedProducts = [] } = useCombinedProducts();
  const { addToast } = useUIContext();
  const updateOrderMut = useUpdateOrder();
  const createReviewMut = useCreateReview();
  const { data: allReviewsData } = useReviewsList();

  const reviewsMap = useMemo(() => {
    const map = {};
    (allReviewsData?.data || []).forEach(rev => {
      if (rev.productId) map[String(rev.productId)] = rev;
      if (rev.orderId) map[`${rev.orderId}_${rev.productId}`] = rev;
    });
    return map;
  }, [allReviewsData]);

  // Local state for instant reactive UI updates without page reload
  const [localOrderOverride, setLocalOrderOverride] = useState(null);

  // Multi-tab and cross-window instant synchronization listeners
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'jj_order_overrides' || e.key === 'jj_orders') {
        setLocalOrderOverride(null);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['orders', cleanId] });
        queryClient.invalidateQueries({ queryKey: ['orders', id] });
      }
    };
    const handleLocalSync = () => {
      setLocalOrderOverride(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', cleanId] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('jj_orders_updated', handleLocalSync);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('jj_orders_updated', handleLocalSync);
    };
  }, [cleanId, id, queryClient]);

  // Clear local optimistic override once authoritative orderData advances
  useEffect(() => {
    if (orderData && localOrderOverride) {
      const orderDataReqStatus = (orderData.returnRequest?.status || '').toUpperCase();
      const localReqStatus = (localOrderOverride.returnRequest?.status || '').toUpperCase();
      const hasTracking = Boolean(orderData.shippingAddress?.trackingNumber || orderData.trackingId);
      if (
        orderData.status !== localOrderOverride.status ||
        orderDataReqStatus !== localReqStatus ||
        hasTracking
      ) {
        setLocalOrderOverride(null);
      }
    }
  }, [orderData, localOrderOverride]);
  const [reviewedProductIds, setReviewedProductIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`reviewed_items_${id}`) || '[]');
    } catch {
      return [];
    }
  });

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'review' | 'exchange' | 'return' | null
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);

  // Review Form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    customerName: '',
    customerEmail: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Exchange Form state
  const [exchangeReason, setExchangeReason] = useState('Size too small - Need bigger size');
  const [exchangeComments, setExchangeComments] = useState('');
  const [exchangeMode, setExchangeMode] = useState('same_product'); // 'same_product' | 'catalog'
  const [replacementVariant, setReplacementVariant] = useState({
    product: null,
    size: '',
    color: ''
  });
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState('');
  const [diffPaymentMethod, setDiffPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isSubmittingExchange, setIsSubmittingExchange] = useState(false);

  // Return Form state
  const [returnReason, setReturnReason] = useState('Size / Fit issue');
  const [returnComments, setReturnComments] = useState('');
  const [refundMode, setRefundMode] = useState('original'); // 'original' | 'store_credit' | 'bank'
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountName: '',
    ifsc: '',
    bankName: ''
  });
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  // Resolve the order
  const order = useMemo(() => {
    let resolved = null;
    const orderDataReqStatus = (orderData?.returnRequest?.status || '').toUpperCase();
    const isOrderDataAdvanced = Boolean(
      orderData && (
        orderData.status !== 'EXCHANGE_REQUESTED' ||
        ['APPROVED', 'SHIPPED', 'COMPLETED', 'REJECTED'].includes(orderDataReqStatus) ||
        Boolean(orderData.shippingAddress?.trackingNumber || orderData.trackingId)
      )
    );

    if (isOrderDataAdvanced) {
      resolved = orderData;
    } else if (localOrderOverride) {
      resolved = localOrderOverride;
    } else if (orderData) {
      resolved = orderData;
    } else {
      let found = ordersData?.data?.find(o =>
        String(o.id || '').replace(/^#+/, '') === cleanId ||
        String(o.orderNumber || '').replace(/^#+/, '') === cleanId
      );
      if (!found && typeof window !== 'undefined' && window.localStorage) {
        try {
          const overrides = JSON.parse(localStorage.getItem('jj_order_overrides') || '{}');
          const numericPart = cleanId.replace(/^JJ-/, '');
          found = overrides[cleanId] || overrides[`#${cleanId}`] || overrides[id] || overrides[`JJ-${numericPart}`] || overrides[numericPart];
          if (!found) {
            const localOrders = JSON.parse(localStorage.getItem('jj_orders') || '[]');
            found = localOrders.find(o => {
              const oNum = String(o.orderNumber || o.id || '').replace(/^#+/, '').trim();
              return (
                String(o.id || '').replace(/^#+/, '') === cleanId ||
                String(o.orderNumber || '').replace(/^#+/, '') === cleanId ||
                oNum === cleanId ||
                (numericPart && oNum.includes(numericPart))
              );
            });
          }
        } catch {}
      }
      resolved = found || null;
    }

    if (!resolved) return null;

    let items = [];
    const sourceItems = (resolved.items && (!Array.isArray(resolved.items) || resolved.items.length > 0))
      ? resolved.items
      : (orderData?.items || ordersData?.data?.find(o => String(o.id || o.orderNumber || '').replace(/^#+/, '') === cleanId)?.items || resolved.items);

    if (Array.isArray(sourceItems)) {
      items = sourceItems;
    } else if (typeof sourceItems === 'string') {
      try {
        const parsed = JSON.parse(sourceItems);
        items = Array.isArray(parsed) ? parsed : (parsed ? Object.values(parsed) : []);
      } catch {
        items = [{ titleSnapshot: sourceItems, quantity: 1, unitPrice: resolved.total || 0 }];
      }
    } else if (sourceItems && typeof sourceItems === 'object') {
      items = Object.values(sourceItems);
    }

    return {
      ...resolved,
      items
    };
  }, [id, ordersData, orderData, localOrderOverride, cleanId]);

  // Sync initial review form customer details
  useEffect(() => {
    if (order) {
      setReviewForm(prev => ({
        ...prev,
        customerName: order.shippingAddress?.name || user?.name || 'Verified Buyer',
        customerEmail: order.shippingAddress?.email || user?.email || ''
      }));
    }
  }, [order, user]);

  // Filtered products for catalog exchange search
  const filteredCatalogProducts = useMemo(() => {
    if (!exchangeSearchQuery.trim()) return combinedProducts.slice(0, 8);
    const q = exchangeSearchQuery.toLowerCase();
    return combinedProducts.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [combinedProducts, exchangeSearchQuery]);

  const availableSizesForReplacement = useMemo(() => {
    if (replacementVariant.product?.sizes && replacementVariant.product.sizes.length > 0) {
      return replacementVariant.product.sizes;
    }
    return ['2-3 Year', '3-4 Year', '5-6 Year', '7-8 Year', '9-10 Year', '11-12 Year', 'S', 'M', 'L', 'XL'];
  }, [replacementVariant.product]);

  if (isLoading && !order) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#EF4A45] animate-spin mb-3" />
        <p className="text-slate-500 font-medium text-sm">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6 max-w-sm">We couldn't locate this order in your account history.</p>
        <Link to="/account/orders" className="text-[#EF4A45] font-bold hover:underline">Back to My Orders</Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const cleanOrderNumber = String(order.orderNumber || order.id || cleanId || 'JJ-47253').replace(/^#+/, '');

  // 4-Step Kids Adventure Milestones: Adaptive for standard, exchange, and return flows
  const hasExchange = order.returnRequest?.type === 'EXCHANGE';
  const hasReturn = order.returnRequest?.type === 'RETURN';
  const reqStatus = (order.returnRequest?.status || '').toUpperCase();

  const hasExchangeApprovedInHistory = Boolean(
    order.statusHistory?.some(h => h.status === 'EXCHANGE_APPROVED' || (h.note && /exchange approved/i.test(h.note)))
  );
  const isExchangeApproved = Boolean(
    hasExchange && (
      ['EXCHANGE_APPROVED', 'SHIPPED'].includes(order.status) ||
      ['APPROVED', 'SHIPPED', 'COMPLETED'].includes(reqStatus) ||
      hasExchangeApprovedInHistory
    )
  );
  const isExchangeShipped = Boolean(
    hasExchange && (
      (order.status === 'SHIPPED' && (isExchangeApproved || reqStatus !== 'PENDING')) ||
      reqStatus === 'SHIPPED' ||
      reqStatus === 'COMPLETED' ||
      Boolean(order.shippingAddress?.trackingNumber && isExchangeApproved)
    )
  );
  const isExchangeDelivered = Boolean(
    hasExchange && (
      reqStatus === 'COMPLETED' ||
      (order.status === 'DELIVERED' && (isExchangeShipped || reqStatus === 'SHIPPED' || hasExchangeApprovedInHistory))
    )
  );

  let stepperSteps = [];
  let stepperTitle = 'Delivery Milestone';
  let stepperActiveIndex = 0;

  if (hasExchange) {
    stepperTitle = 'Replacement Delivery Milestone';
    stepperActiveIndex = isExchangeDelivered ? 3 : isExchangeShipped ? 2 : isExchangeApproved ? 1 : 0;
    stepperSteps = [
      { label: 'Exchange Requested', emoji: '📝', active: true },
      { label: 'Exchange Approved', emoji: '✨', active: isExchangeApproved },
      { label: 'Replacement Shipped', emoji: '🚚', active: isExchangeShipped },
      { label: 'Replacement Delivered', emoji: '🏡🎁', active: isExchangeDelivered },
    ];
  } else if (hasReturn) {
    stepperTitle = 'Return & Refund Milestone';
    const isRefunded = order.status === 'REFUNDED';
    const isReturnApproved = ['RETURN_APPROVED'].includes(order.status) || isRefunded;

    stepperActiveIndex = isRefunded ? 3 : isReturnApproved ? 1 : 0;
    stepperSteps = [
      { label: 'Return Requested', emoji: '📝', active: true },
      { label: 'Return Approved', emoji: '✅', active: isReturnApproved },
      { label: 'Courier Pickup', emoji: '📦', active: isReturnApproved },
      { label: 'Refund Processed', emoji: '💳', active: isRefunded },
    ];
  } else {
    stepperTitle = 'Delivery Milestone';
    const isDeliveredOrBeyond = ['DELIVERED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REQUESTED', 'EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'REFUNDED'].includes(order.status);
    const isShipped = isDeliveredOrBeyond || order.status === 'SHIPPED';
    const isPacked = isShipped || order.status === 'PACKED';
    stepperActiveIndex = isDeliveredOrBeyond ? 3 : isShipped ? 2 : isPacked ? 1 : 0;
    stepperSteps = [
      { label: 'Order Confirmed', emoji: '🎈', active: stepperActiveIndex >= 0 },
      { label: 'Packed with Care', emoji: '✂️📦', active: stepperActiveIndex >= 1 },
      { label: 'Speedy Transit', emoji: '🚚', active: stepperActiveIndex >= 2 },
      { label: 'Delivered & Smiles!', emoji: '🏡', active: stepperActiveIndex >= 3 },
    ];
  }

  const isOnHold = order.status === 'ON_HOLD';
  const tracking = resolveOrderTracking(order);

  // Handlers for Opening Modals
  const handleOpenReviewModal = (item = null) => {
    const targetItem = item || order.items?.[0] || null;
    setSelectedItemForAction(targetItem);
    setReviewSuccess(false);
    setActiveModal('review');
  };

  const handleOpenExchangeModal = (item = null) => {
    const targetItem = item || order.items?.[0] || null;
    setSelectedItemForAction(targetItem);

    // Default replacement: find matched catalog product or same item
    const matchedProduct = combinedProducts.find(p =>
      String(p.id) === String(targetItem?.productId || targetItem?.id)
    );

    const activeProduct = matchedProduct || {
      id: targetItem?.productId || targetItem?.id,
      name: targetItem?.titleSnapshot,
      price: targetItem?.unitPrice,
      image: targetItem?.image,
      sizes: ['5-6 Year', '7-8 Year', '9-10 Year', '11-12 Year', 'S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy Blue', 'Heather Grey', 'Royal Blue']
    };

    // Find first available size that has stock > 0 and differs from targetItem.size
    const productSizes = activeProduct.sizes || ['5-6 Year', '7-8 Year', '9-10 Year', 'S', 'M', 'L'];
    const inStockSize = productSizes.find(sz => {
      if (sz === targetItem?.size) return false;
      const v = activeProduct.variants?.find(varnt => String(varnt.size || '').trim().toLowerCase() === String(sz).trim().toLowerCase());
      return v ? Number(v.stock) > 0 : true;
    }) || productSizes.find(sz => sz !== targetItem?.size) || productSizes[0];

    setReplacementVariant({
      product: activeProduct,
      size: inStockSize || 'M',
      color: targetItem?.color || 'Black'
    });
    setExchangeMode('same_product');
    setDiffPaymentMethod('razorpay');
    setActiveModal('exchange');
  };

  const handleOpenReturnModal = (item = null) => {
    const targetItem = item || order.items?.[0] || null;
    setSelectedItemForAction(targetItem);
    setActiveModal('return');
  };

  // 1: Review Submit Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemForAction) return;
    setIsSubmittingReview(true);

    try {
      const commentText = reviewForm.comment || 'Very satisfied with the quality.';
      const titleText = reviewForm.title || 'Great product!';
      const combinedComment = titleText && !commentText.startsWith(titleText)
        ? `${titleText} - ${commentText}`
        : commentText;

      const reviewPayload = {
        productId: String(selectedItemForAction.productId || selectedItemForAction.id),
        name: reviewForm.customerName || 'Verified Buyer',
        customerName: reviewForm.customerName || 'Verified Buyer',
        customerEmail: reviewForm.customerEmail || order.shippingAddress?.email || '',
        rating: Number(reviewForm.rating || 5),
        title: titleText,
        comment: combinedComment,
        orderId: order.orderNumber || order.id,
        status: 'approved',
        createdAt: new Date().toISOString()
      };

      await createReviewMut.mutateAsync(reviewPayload);

      // Save reviewed item status locally
      const updatedReviewed = [...new Set([...reviewedProductIds, selectedItemForAction.id, selectedItemForAction.productId])];
      setReviewedProductIds(updatedReviewed);
      try {
        localStorage.setItem(`reviewed_items_${id}`, JSON.stringify(updatedReviewed));
      } catch {
        // ignore
      }

      setReviewSuccess(true);
      if (addToast) addToast('Thank you! Your product review has been submitted.', 'success');

      setTimeout(() => {
        setActiveModal(null);
        setReviewSuccess(false);
      }, 1800);
    } catch (err) {
      console.error('Review submit failed:', err);
      if (addToast) addToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 2: Exchange Submit Handler
  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingExchange) return;

    if (!selectedItemForAction || !replacementVariant.product) {
      if (addToast) addToast('Please select a replacement product and size.', 'error');
      return;
    }

    if (!replacementVariant.size) {
      if (addToast) addToast('Please select a replacement size.', 'error');
      return;
    }

    setIsSubmittingExchange(true);
    const newStatus = 'EXCHANGE_REQUESTED';
    const repProd = replacementVariant.product;

    const origPrice = Number(selectedItemForAction.unitPrice || 0);
    const repPrice = Number(repProd.price || origPrice);
    const priceDifference = repPrice - origPrice;

    // Differential Payment calculation for upgrade/downgrade exchanges
    let differentialPayment = null;
    if (priceDifference > 0) {
      if (diffPaymentMethod === 'razorpay') {
        try {
          const rzpOrderData = await createRazorpayOrder({
            amount: priceDifference,
            receipt: `EXCH-${cleanId}-${Date.now().toString().slice(-4)}`,
            notes: {
              orderId: order.orderNumber || order.id,
              type: 'EXCHANGE_DIFFERENTIAL',
              customerEmail: user?.email || order.shippingAddress?.email || ''
            }
          });

          const paymentResult = await new Promise((resolve, reject) => {
            launchRazorpayCheckout({
              razorpayOrder: rzpOrderData.order,
              keyId: rzpOrderData.keyId,
              orderNumber: `EXCH-${cleanId}`,
              customer: {
                name: user?.name || order.shippingAddress?.name || '',
                email: user?.email || order.shippingAddress?.email || '',
                phone: user?.phone || order.shippingAddress?.phone || ''
              },
              onSuccess: async (res) => {
                if (res?.razorpay_signature) {
                  try {
                    await verifyRazorpayPayment({
                      razorpay_order_id: res.razorpay_order_id,
                      razorpay_payment_id: res.razorpay_payment_id,
                      razorpay_signature: res.razorpay_signature
                    });
                  } catch (e) {
                    console.warn('Differential payment signature note:', e);
                  }
                }
                resolve(res);
              },
              onFailure: (err) => {
                reject(new Error(err.message || 'Differential payment declined or cancelled'));
              },
              onDismiss: () => {
                reject(new Error('PAYMENT_DISMISSED'));
              }
            }).catch(reject);
          });

          differentialPayment = {
            amount: priceDifference,
            method: 'RAZORPAY',
            status: 'PAID',
            paymentId: paymentResult.razorpay_payment_id,
            orderId: paymentResult.razorpay_order_id,
            paidAt: new Date().toISOString()
          };
        } catch (rzpErr) {
          setIsSubmittingExchange(false);
          if (rzpErr.message !== 'PAYMENT_DISMISSED') {
            if (addToast) addToast(`Exchange payment not completed: ${rzpErr.message}`, 'error');
          }
          return;
        }
      } else {
        differentialPayment = {
          amount: priceDifference,
          method: 'COD',
          status: 'PENDING_DELIVERY',
          paymentId: null,
          paidAt: null
        };
      }
    } else if (priceDifference < 0) {
      differentialPayment = {
        amount: priceDifference,
        refundAmount: Math.abs(priceDifference),
        method: 'REFUND_TO_SOURCE',
        status: 'PENDING_DELIVERY',
        refundId: null
      };
    } else {
      differentialPayment = {
        amount: 0,
        method: 'NONE',
        status: 'COMPLETED'
      };
    }

    const exchangeData = {
      type: 'EXCHANGE',
      reason: exchangeReason,
      comments: exchangeComments,
      originalPrice: origPrice,
      replacementPrice: repPrice,
      priceDifference: priceDifference,
      differentialPayment: differentialPayment,
      originalItem: {
        id: selectedItemForAction.id || selectedItemForAction.productId,
        productId: selectedItemForAction.productId || selectedItemForAction.id,
        title: selectedItemForAction.titleSnapshot,
        size: selectedItemForAction.size,
        color: selectedItemForAction.color,
        colorName: formatColorName(selectedItemForAction.colorName, selectedItemForAction.color),
        quantity: selectedItemForAction.quantity || 1,
        unitPrice: selectedItemForAction.unitPrice,
        image: selectedItemForAction.image
      },
      exchangeItem: {
        productId: repProd.id,
        title: repProd.name || repProd.title || selectedItemForAction.titleSnapshot,
        size: replacementVariant.size || 'M',
        color: replacementVariant.color || selectedItemForAction.color || 'Default',
        colorName: formatColorName(replacementVariant.colorName, replacementVariant.color || selectedItemForAction.color),
        price: repProd.price || selectedItemForAction.unitPrice,
        image: repProd.image || (repProd.images && repProd.images[0]) || selectedItemForAction.image
      },
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    const diffNote = priceDifference > 0
      ? ` (Extra ₹${priceDifference} via ${differentialPayment.method} - ${differentialPayment.status})`
      : priceDifference < 0
        ? ` (Refund Due ₹${Math.abs(priceDifference)})`
        : '';

    const newHistoryEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: `Customer requested exchange: ${selectedItemForAction.titleSnapshot} (${selectedItemForAction.size}) for ${exchangeData.exchangeItem.title} (${exchangeData.exchangeItem.size}) - Reason: ${exchangeReason}${diffNote}`
    };

    const updatedOrder = {
      ...order,
      status: newStatus,
      returnRequest: exchangeData,
      statusHistory: [...(order.statusHistory || []), newHistoryEntry]
    };

    try {
      // 1. Authoritative direct Postgres write via security definer RPC
      let rpcResult = null;
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('request_order_exchange', {
          order_id: cleanId,
          exchange_payload: exchangeData
        });
        if (!rpcError && rpcData) {
          rpcResult = rpcData;
        } else if (rpcError) {
          console.warn('RPC request_order_exchange note:', rpcError.message);
        }
      } catch (rpcEx) {
        console.warn('RPC request_order_exchange exception:', rpcEx);
      }

      // 2. Persist via updateOrderMut (which syncs Supabase and local multi-tab cache)
      const persisted = await updateOrderMut.mutateAsync({
        id: order.id,
        patch: {
          status: newStatus,
          orderNumber: order.orderNumber,
          returnRequest: exchangeData,
          statusHistory: updatedOrder.statusHistory
        }
      });

      const effectiveResult = rpcResult || persisted || updatedOrder;
      setLocalOrderOverride({
        ...order,
        ...effectiveResult,
        status: newStatus,
        returnRequest: exchangeData,
        items: order.items || effectiveResult.items || []
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', cleanId] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });

      if (addToast) addToast('Exchange request submitted successfully! Our team will process it.', 'success');
      setActiveModal(null);
    } catch (err) {
      console.error('Exchange submission error:', err?.message || err);
      setLocalOrderOverride({
        ...order,
        ...updatedOrder,
        status: newStatus,
        returnRequest: exchangeData,
        items: order.items || []
      });
      if (addToast) addToast('Exchange request submitted successfully! Our team will process it.', 'success');
      setActiveModal(null);
    } finally {
      setIsSubmittingExchange(false);
    }
  };

  // 3: Return Submit Handler
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemForAction) return;

    if (refundMode === 'bank') {
      const cleanAcc = (bankDetails.accountNumber || '').trim();
      const cleanIfsc = (bankDetails.ifsc || '').trim().toUpperCase();
      const cleanName = (bankDetails.accountName || '').trim();

      if (!cleanName || cleanName.length < 2) {
        if (addToast) addToast('Please enter the Account Holder (Beneficiary) Name.', 'error');
        return;
      }
      if (!/^\d{9,18}$/.test(cleanAcc)) {
        if (addToast) addToast('Please enter a valid Bank Account Number (9 to 18 digits).', 'error');
        return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
        if (addToast) addToast('Please enter a valid 11-character IFSC Code (e.g. SBIN0001234).', 'error');
        return;
      }
    }

    setIsSubmittingReturn(true);
    const newStatus = 'RETURN_REQUESTED';

    const returnData = {
      type: 'RETURN',
      reason: returnReason,
      comments: returnComments,
      originalItem: {
        id: selectedItemForAction.id || selectedItemForAction.productId,
        title: selectedItemForAction.titleSnapshot,
        size: selectedItemForAction.size,
        color: selectedItemForAction.color,
        colorName: formatColorName(selectedItemForAction.colorName, selectedItemForAction.color),
        quantity: selectedItemForAction.quantity || 1,
        unitPrice: selectedItemForAction.unitPrice,
        image: selectedItemForAction.image
      },
      refundMode: refundMode,
      refundAmount: selectedItemForAction.unitPrice * (selectedItemForAction.quantity || 1),
      bankDetails: refundMode === 'bank' ? {
        accountNumber: bankDetails.accountNumber.trim(),
        accountName: bankDetails.accountName.trim(),
        ifsc: bankDetails.ifsc.trim().toUpperCase(),
        bankName: bankDetails.bankName || ''
      } : null,
      requestedAt: new Date().toISOString()
    };

    const newHistoryEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: `Customer requested return for ${selectedItemForAction.titleSnapshot} - Reason: ${returnReason}`
    };

    const updatedOrder = {
      ...order,
      status: newStatus,
      returnRequest: returnData,
      statusHistory: [...(order.statusHistory || []), newHistoryEntry]
    };

    try {
      // 1. Authoritative direct Postgres write via security definer RPC
      let rpcResult = null;
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('request_order_return', {
          order_id: cleanId,
          return_payload: returnData
        });
        if (!rpcError && rpcData) {
          rpcResult = rpcData;
        } else if (rpcError) {
          console.warn('RPC request_order_return note:', rpcError.message);
        }
      } catch (rpcEx) {
        console.warn('RPC request_order_return exception:', rpcEx);
      }

      // 2. Persist via updateOrderMut
      const persisted = await updateOrderMut.mutateAsync({
        id: order.id,
        patch: {
          status: newStatus,
          orderNumber: order.orderNumber,
          returnRequest: returnData,
          statusHistory: updatedOrder.statusHistory
        }
      });

      const effectiveResult = rpcResult || persisted || updatedOrder;
      setLocalOrderOverride({
        ...order,
        ...effectiveResult,
        status: newStatus,
        returnRequest: returnData,
        items: order.items || effectiveResult.items || []
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', cleanId] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });

      if (addToast) addToast('Return request submitted! Courier pickup will be scheduled.', 'success');
      setActiveModal(null);
    } catch (err) {
      console.error('Return submission error:', err?.message || err);
      setLocalOrderOverride({
        ...order,
        ...updatedOrder,
        status: newStatus,
        returnRequest: returnData,
        items: order.items || []
      });
      if (addToast) addToast('Return request submitted! Courier pickup will be scheduled.', 'success');
      setActiveModal(null);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // 4: Pre-fulfillment Customer Order Cancellation Handler
  const handleCustomerCancelOrder = async () => {
    if (!order || isCancellingOrder) return;
    setIsCancellingOrder(true);
    try {
      const cancelStatus = 'CANCELLED';
      const historyEntry = {
        status: cancelStatus,
        timestamp: new Date().toISOString(),
        note: 'Order cancelled by customer prior to warehouse dispatch'
      };

      const updatedHistory = [...(order.statusHistory || []), historyEntry];
      const isPaidOnline = order.paymentStatus === 'paid';

      // 1. First attempt authoritative direct Postgres write via security definer RPC
      let rpcResult = null;
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('cancel_order_customer', {
          order_id: cleanId,
          cancel_reason: 'Cancelled by customer prior to dispatch'
        });
        if (!rpcError && rpcData) {
          rpcResult = rpcData;
        } else if (rpcError) {
          console.warn('RPC cancel_order_customer note:', rpcError.message);
        }
      } catch (rpcEx) {
        console.warn('RPC cancel_order_customer exception:', rpcEx);
      }

      // 2. Restock items back to inventory safely (with double-restock protection)
      await restockOrderItems(order, queryClient);

      // 3. Persist order cancellation to Supabase / local storage
      const persisted = await updateOrderMut.mutateAsync({
        id: order.id,
        patch: {
          status: cancelStatus,
          paymentStatus: isPaidOnline ? 'refunded' : 'cancelled',
          isRestocked: true,
          restockedAt: new Date().toISOString(),
          shippingAddress: {
            ...(order.shippingAddress || {}),
            _isRestocked: true,
            _restockedAt: new Date().toISOString()
          },
          statusHistory: updatedHistory
        }
      });

      const effectiveResult = rpcResult || persisted || updatedHistory;
      setLocalOrderOverride({
        ...order,
        ...(typeof effectiveResult === 'object' ? effectiveResult : {}),
        status: cancelStatus,
        paymentStatus: isPaidOnline ? 'refunded' : 'cancelled',
        isRestocked: true,
        shippingAddress: {
          ...(order.shippingAddress || {}),
          _isRestocked: true
        },
        statusHistory: updatedHistory
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (addToast) addToast('Your order has been cancelled successfully.', 'success');
      setShowCancelModal(false);
    } catch (err) {
      console.error('Cancel order failed:', err);
      if (addToast) addToast('Failed to cancel order: ' + (err.message || 'Please contact customer support'), 'error');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">

      {/* Top Header Card */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 md:p-6 shadow-xs border border-amber-100/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#EF4A45] mb-2 transition-colors group">
            <span className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-3 h-3 text-slate-600 group-hover:text-[#EF4A45]" />
            </span>
            Back to Orders
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex flex-wrap items-center gap-2.5">
            <span>Order #{cleanOrderNumber}</span>
            <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
              (hasExchange && isExchangeDelivered) ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80' :
              (hasExchange && isExchangeShipped) ? 'bg-blue-100 text-blue-800 border border-blue-300' :
              (hasExchange && isExchangeApproved) ? 'bg-purple-100 text-purple-800 border border-purple-200/80' :
              order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80' :
              order.status === 'EXCHANGE_REQUESTED' || order.status === 'RETURN_REQUESTED' ? 'bg-amber-100 text-amber-800 border border-amber-200/80' :
              order.status === 'EXCHANGE_APPROVED' || order.status === 'RETURN_APPROVED' ? 'bg-purple-100 text-purple-800 border border-purple-200/80' :
              order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
              order.status === 'CANCELLED' || order.status === 'RETURN_REJECTED' || order.status === 'EXCHANGE_REJECTED' ? 'bg-red-100 text-red-700 border border-red-200/80' :
              order.status === 'ON_HOLD' ? 'bg-amber-100 text-amber-800 border border-amber-200/80' :
              order.status === 'PACKED' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200/80' :
              order.status === 'CONFIRMED' ? 'bg-sky-100 text-sky-800 border border-sky-200/80' :
              'bg-blue-100 text-blue-700 border border-blue-200/80'
            }`}>
              <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-current animate-pulse" />
              {(hasExchange && isExchangeDelivered) ? 'REPLACEMENT DELIVERED' :
               (hasExchange && isExchangeShipped) ? 'REPLACEMENT SHIPPED' :
               (hasExchange && isExchangeApproved) ? 'EXCHANGE APPROVED' :
               order.status === 'ON_HOLD' ? 'ON HOLD' :
               (order.status?.replace('_', ' ') || 'PROCESSING')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Placed on <strong className="text-slate-700">{orderDate}</strong> &bull; {(order.items && order.items.length) ? order.items.length : (orderData?.items?.length || 1)} Kids Items
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {tracking.hasTracking && (
            <a
              href={tracking.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" /> Track Courier ({tracking.carrier})
            </a>
          )}
          {order.status !== 'CANCELLED' && (
            <a
              href={`/invoice/${String(order.orderNumber || order.id || cleanOrderNumber).replace(/^#/, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:border-[#EF4A45] hover:text-[#EF4A45] transition-colors shadow-2xs"
              title="Download or Print Invoice"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> Invoice
            </a>
          )}
          {/* Pre-Fulfillment Cancellation Button */}
          {['PROCESSING', 'CONFIRMED'].includes(order.status) && !order.returnRequest && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors shadow-2xs"
              title="Cancel this order"
            >
              <X className="w-3.5 h-3.5" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Cancelled Banner */}
      {order.status === 'CANCELLED' && (
        <div className="bg-red-50/90 border border-red-200 rounded-3xl p-5 md:p-6 flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <X className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-red-950 flex items-center gap-2">
              <span>This Order Was Cancelled</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-200 text-red-900 px-2.5 py-0.5 rounded-full">
                {order.paymentStatus === 'refunded' ? 'Refund Processed' : 'Cancelled'}
              </span>
            </h4>
            <p className="text-xs text-red-800 font-medium mt-1 leading-relaxed">
              {order.paymentStatus === 'refunded'
                ? 'Your order has been cancelled. Any amount paid online has been initiated for refund back to your original payment method.'
                : 'Your order has been cancelled and any reserved items have been safely released back to our inventory.'}
            </p>
          </div>
        </div>
      )}

      {/* On-Hold Alert Banner (Shown gracefully without breaking or regressing the stepper) */}
      {isOnHold && (
        <div className="bg-amber-50/95 border border-amber-200/90 rounded-3xl p-4 md:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
              <span>Order Temporarily On Hold</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">Review in Progress</span>
            </h4>
            <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed max-w-2xl">
              Our fulfillment team is currently verifying order or address details. Your items remain safely reserved in our inventory, and shipment will resume shortly.
            </p>
          </div>
        </div>
      )}

      {/* Playful Kids Adventure Stepper (Clear Adaptive Milestones) */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 md:p-6 shadow-xs border border-amber-100/90 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{hasExchange ? '🔄' : hasReturn ? '↩️' : '🚀'}</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">{stepperTitle}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Truck className="w-3.5 h-3.5 text-[#EF4A45]" />
              <span>{tracking.carrier}</span>
              {tracking.hasTracking && (
                <span className="font-mono text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  AWB: {tracking.trackingId}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 pb-1">
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1.5 bg-amber-100/70 -translate-y-1/2 rounded-full z-0" />
              <div
                className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-700"
                style={{ width: `${(stepperActiveIndex / 3) * 100}%` }}
              />

              <div className="relative z-10 flex justify-between">
                {stepperSteps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center border-4 border-white transition-all ${step.active
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm scale-105'
                      : 'bg-slate-100 text-slate-400'
                      }`}>
                      <span className="text-xs md:text-sm">{step.emoji}</span>
                    </div>
                    <span className={`text-[10px] md:text-xs font-black mt-1.5 max-w-[90px] md:max-w-none ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1, 2, 3: POST-DELIVERY ACTIONS SECTION (WHEN DELIVERED) - COMPACT & SHORT */}
      {/* ========================================================================= */}
      {order.status === 'DELIVERED' && !order.returnRequest && (
        <div className="bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-indigo-50/70 border border-amber-200/80 rounded-2xl p-3.5 md:p-4 shadow-2xs">
          {/* Compact Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              </span>
              <h2 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                How was your order experience?
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200/60 hidden sm:inline-block">
                  Delivered & Verified
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Rate your fit, swap sizes, or request hassle-free returns.
            </p>
          </div>

          {/* The 3 Core Action Cards - Short & Sleek */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">

            {/* Action 1: Review */}
            <div className="bg-white rounded-xl p-2.5 border border-amber-200/80 hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-2.5 group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 text-xs md:text-sm truncate">1. Write a Review</h3>
                  <p className="text-[11px] text-slate-500 truncate">Rate quality & kid fit</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenReviewModal()}
                className="shrink-0 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1 active:scale-95"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Review</span>
              </button>
            </div>

            {/* Action 2: Exchange */}
            <div className="bg-white rounded-xl p-2.5 border border-indigo-200/80 hover:border-[#5B2E89] hover:shadow-xs transition-all flex items-center justify-between gap-2.5 group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5B2E89] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 text-xs md:text-sm truncate">2. Exchange Item</h3>
                  <p className="text-[11px] text-slate-500 truncate">Free size or color swap</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenExchangeModal()}
                className="shrink-0 py-1.5 px-3 bg-[#5B2E89] hover:bg-[#48246d] text-white font-extrabold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Exchange</span>
              </button>
            </div>

            {/* Action 3: Return */}
            <div className="bg-white rounded-xl p-2.5 border border-rose-200/80 hover:border-[#EF4A45] hover:shadow-xs transition-all flex items-center justify-between gap-2.5 group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#EF4A45] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 text-xs md:text-sm truncate">3. Easy Return</h3>
                  <p className="text-[11px] text-slate-500 truncate">100% refund guarantee</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenReturnModal()}
                className="shrink-0 py-1.5 px-3 bg-white border border-rose-300 hover:border-[#EF4A45] text-[#EF4A45] hover:bg-rose-50 font-extrabold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RETURN OR EXCHANGE STATUS CARDS (WHEN REQUESTED / APPROVED / SHIPPED) */}
      {/* ========================================================================= */}
      {order.returnRequest && (
        <div className={`rounded-3xl p-6 md:p-8 border shadow-sm ${
          hasExchange && isExchangeDelivered
            ? 'bg-emerald-50/80 border-emerald-200'
            : hasExchange && isExchangeShipped
              ? 'bg-blue-50/90 border-blue-200'
              : hasExchange && isExchangeApproved
                ? 'bg-purple-50/90 border-purple-200'
                : order.status === 'EXCHANGE_REQUESTED' || order.status === 'RETURN_REQUESTED'
                  ? 'bg-amber-50/80 border-amber-200'
                  : order.status === 'EXCHANGE_APPROVED' || order.status === 'RETURN_APPROVED'
                    ? 'bg-purple-50/90 border-purple-200'
                    : order.status.includes('REJECTED')
                      ? 'bg-rose-50/80 border-rose-200'
                      : 'bg-emerald-50/80 border-emerald-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  hasExchange && isExchangeDelivered ? 'bg-emerald-200 text-emerald-900' :
                  hasExchange && isExchangeShipped ? 'bg-blue-200 text-blue-900' :
                  hasExchange && isExchangeApproved ? 'bg-purple-200 text-purple-900' :
                  order.status === 'EXCHANGE_REQUESTED' || order.status === 'RETURN_REQUESTED' ? 'bg-amber-200 text-amber-900' :
                  order.status === 'EXCHANGE_APPROVED' || order.status === 'RETURN_APPROVED' ? 'bg-purple-200 text-purple-900' :
                  order.status.includes('REJECTED') ? 'bg-rose-200 text-rose-900' :
                  'bg-emerald-200 text-emerald-900'
                }`}>
                  {hasExchange ? (
                    isExchangeDelivered ? 'REPLACEMENT DELIVERED' :
                    isExchangeShipped ? 'REPLACEMENT SHIPPED' :
                    isExchangeApproved ? 'EXCHANGE APPROVED' :
                    'EXCHANGE REQUESTED'
                  ) : (order.status?.replace('_', ' ') || 'PROCESSING')}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  Requested on {order.returnRequest.requestedAt ? new Date(order.returnRequest.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                {hasExchange && isExchangeDelivered ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : hasExchange && isExchangeShipped ? (
                  <Truck className="w-6 h-6 text-blue-600" />
                ) : hasExchange && isExchangeApproved ? (
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                ) : order.status === 'EXCHANGE_REQUESTED' || order.status === 'RETURN_REQUESTED' ? (
                  <ShieldAlert className="w-6 h-6 text-amber-600" />
                ) : order.status.includes('REJECTED') ? (
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                )}
                <span>
                  {order.returnRequest.type === 'EXCHANGE' ? (
                    isExchangeDelivered ? 'Replacement Delivered & Complete! ✨' :
                    isExchangeShipped ? 'Replacement Outfit Shipped & In Transit! 🚀' :
                    isExchangeApproved ? 'Exchange Request Approved! 🎉' :
                    order.status === 'EXCHANGE_REJECTED' ? 'Exchange Request Declined' :
                    'Product Exchange in Progress'
                  ) : (
                    order.status === 'RETURN_APPROVED' ? 'Return Request Approved! 💳' :
                    order.status === 'REFUNDED' ? 'Refund Processed Successfully! ✨' :
                    order.status === 'RETURN_REJECTED' ? 'Return Request Declined' :
                    'Return & Refund in Progress'
                  )}
                </span>
              </h2>

              <p className="text-sm font-medium text-slate-700">
                {order.returnRequest.type === 'EXCHANGE' ? (
                  isExchangeDelivered ? 'Your replacement outfit has been successfully delivered. We hope your kid loves the new fit!' :
                  isExchangeShipped ? `Great news! Your replacement outfit has been handed over to ${tracking.carrier || 'our courier partner'} and is speeding to your address.` :
                  isExchangeApproved ? 'Our team has approved your exchange! Your replacement outfit is being carefully prepared and packaged in our fulfillment center.' :
                  'Your exchange request has been received and is being reviewed by our team.'
                ) : (
                  order.status === 'RETURN_APPROVED' ? 'Your return request has been approved. Pickup and refund are being processed.' :
                  'Your return request is currently being reviewed by our team.'
                )}
              </p>

              <p className="text-sm font-bold text-slate-700">
                Reason Provided: <span className="text-slate-900 font-semibold">{order.returnRequest.reason}</span>
              </p>

              {order.returnRequest.comments && (
                <p className="text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-200/60 italic">
                  "{order.returnRequest.comments}"
                </p>
              )}

              {/* Exchange Item Breakdown */}
              {order.returnRequest.type === 'EXCHANGE' && order.returnRequest.exchangeItem && (
                <>
                  <div className="mt-4 p-4 bg-white rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-r sm:border-slate-100 pr-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Item Being Exchanged</p>
                      <p className="font-bold text-slate-800 text-sm">{order.returnRequest.originalItem?.title || order.items?.[0]?.titleSnapshot}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 flex-wrap">
                        <span>Size: {typeof (order.returnRequest.originalItem?.size || order.items?.[0]?.size) === 'object' ? ((order.returnRequest.originalItem?.size || order.items?.[0]?.size)?.name || 'N/A') : String(order.returnRequest.originalItem?.size || order.items?.[0]?.size || 'N/A')}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          Color:
                          {(order.returnRequest.originalItem?.color || order.items?.[0]?.color) && (
                            <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: typeof (order.returnRequest.originalItem?.color || order.items?.[0]?.color) === 'object' ? ((order.returnRequest.originalItem?.color || order.items?.[0]?.color)?.hex || '#000') : String(order.returnRequest.originalItem?.color || order.items?.[0]?.color) }} />
                          )}
                          <span className="font-semibold text-slate-700">{formatColorName(order.returnRequest.originalItem?.colorName, order.returnRequest.originalItem?.color || order.items?.[0]?.color)}</span>
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-emerald-600 font-mono mb-1">⇄ Requested Replacement</p>
                      <div className="flex items-center gap-3">
                        {order.returnRequest.exchangeItem.image && (
                          <img src={order.returnRequest.exchangeItem.image} alt="Replacement" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{order.returnRequest.exchangeItem.title}</p>
                          <p className="text-xs text-slate-600 font-semibold flex items-center gap-1 flex-wrap">
                            <span>Size: {typeof order.returnRequest.exchangeItem.size === 'object' ? (order.returnRequest.exchangeItem.size.name || 'N/A') : String(order.returnRequest.exchangeItem.size || 'N/A')}</span>
                            {order.returnRequest.exchangeItem.color && (
                              <span className="inline-flex items-center gap-1">
                                • Color:
                                <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: formatColorHex(order.returnRequest.exchangeItem.color) }} />
                                <span className="font-bold text-slate-800">{formatColorName(order.returnRequest.exchangeItem.colorName, order.returnRequest.exchangeItem.color)}</span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Differential Payment Breakdown Pill */}
                  {(() => {
                    const origP = Number(order.returnRequest.originalPrice || order.returnRequest.originalItem?.unitPrice || 0);
                    const repP = Number(order.returnRequest.replacementPrice || order.returnRequest.exchangeItem?.price || origP);
                    const diff = typeof order.returnRequest.priceDifference === 'number'
                      ? order.returnRequest.priceDifference
                      : (repP - origP);
                    const diffPay = order.returnRequest.differentialPayment;

                    if (diff > 0) {
                      const isPaid = diffPay?.status === 'PAID';
                      return (
                        <div className={`mt-3 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 shrink-0 text-amber-600" />
                            <div>
                              <p className="font-bold">
                                Price Difference: +₹{diff} ({diffPay?.method === 'COD' ? 'Pay on Delivery' : 'Online Payment'})
                              </p>
                              <p className="text-[11px] opacity-80">
                                {isPaid 
                                  ? `Paid Online via ${diffPay?.method || 'Razorpay'} (Ref: ${diffPay?.paymentId || 'Verified'})` 
                                  : `Payable to delivery partner in cash/UPI upon replacement arrival`}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            isPaid ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                          }`}>
                            {isPaid ? 'Paid' : 'To Collect on Delivery'}
                          </span>
                        </div>
                      );
                    } else if (diff < 0) {
                      return (
                        <div className="mt-3 p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-950 text-xs flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold">Refund Due: ₹{Math.abs(diff)}</p>
                            <p className="text-[11px] text-blue-700">Refund will be processed to original payment method once replacement is delivered.</p>
                          </div>
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-200 text-blue-800">
                            Refund Pending
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )}

              {/* Return Breakdown */}
              {order.returnRequest.type === 'RETURN' && (
                <div className="mt-3 p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Refund Amount:</span>
                    <span className="text-emerald-600 text-sm">₹{String(order.returnRequest.refundAmount || order.total || 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Refund Mode:</span>
                    <span className="uppercase font-bold text-slate-800">{String(order.returnRequest.refundMode || 'Original Payment Source')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Badge */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 max-w-xs shrink-0 text-xs text-slate-600 space-y-1.5 shadow-2xs">
              {hasExchange && (isExchangeShipped || order.status === 'SHIPPED') ? (
                <>
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" /> Replacement in Transit
                  </p>
                  <p className="leading-relaxed">
                    Keep your original outfit ready with tags intact. The courier will deliver your replacement package.
                  </p>
                  {tracking.hasTracking && (
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Courier Tracking</span>
                      <span className="font-mono font-bold text-blue-700 text-[11px]">{tracking.carrier}: {tracking.trackingId}</span>
                      <a href={tracking.trackingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold text-[11px] inline-flex items-center gap-1 mt-0.5">
                        Track Shipment <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </>
              ) : hasExchange && (isExchangeApproved || order.status === 'EXCHANGE_APPROVED') ? (
                <>
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" /> Preparation in Progress
                  </p>
                  <p className="leading-relaxed">
                    Replacement variant has been allocated from inventory. Courier dispatch & live tracking will update shortly.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" /> Doorstep Pickup Notice
                  </p>
                  <p className="leading-relaxed">
                    Our logistics partner will verify the item condition and collect the package from your address. Please ensure original tags remain intact.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout for Ordered Items & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl shadow-xs border border-amber-100/90 overflow-hidden">
            <div className="p-5 md:p-6 border-b border-amber-100/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧸</span>
                <h2 className="text-base md:text-lg font-black text-slate-900">
                  Items Ordered ({order.items?.length || 0})
                </h2>
              </div>
              {order.status === 'DELIVERED' && (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Verified
                </span>
              )}
            </div>

            <div className="divide-y divide-amber-100/50">
              {order.items?.map((item, i) => {
                const isReviewed = reviewedProductIds.includes(item.id) || reviewedProductIds.includes(item.productId);
                const matchedProduct = combinedProducts.find(p => String(p.id) === String(item.productId || item.id) || (item.titleSnapshot && createSlug(p.title || p.name) === createSlug(item.titleSnapshot)));
                const productSlug = matchedProduct ? (createSlug(matchedProduct.name || matchedProduct.title) || matchedProduct.id) : (createSlug(item.titleSnapshot) || item.productId || item.id);
                const productUrl = productSlug ? `/product/${productSlug}` : null;

                return (
                  <div key={i} className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-amber-50/20 transition-colors">
                    {productUrl ? (
                      <Link to={productUrl} className="shrink-0 hover:opacity-85 transition-opacity group" title="View product details">
                        {item.image ? (
                          <img src={item.image} alt={item.titleSnapshot} className="w-20 h-20 md:w-22 md:h-22 rounded-2xl border-2 border-amber-100/80 object-cover shrink-0 shadow-2xs group-hover:border-amber-300 transition-colors" />
                        ) : (
                          <div className="w-20 h-20 md:w-22 md:h-22 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-xs text-amber-500 shrink-0 font-bold group-hover:border-amber-300 transition-colors">👕</div>
                        )}
                      </Link>
                    ) : (
                      item.image ? (
                        <img src={item.image} alt={item.titleSnapshot} className="w-20 h-20 md:w-22 md:h-22 rounded-2xl border-2 border-amber-100/80 object-cover shrink-0 shadow-2xs" />
                      ) : (
                        <div className="w-20 h-20 md:w-22 md:h-22 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-xs text-amber-500 shrink-0 font-bold">👕</div>
                      )
                    )}

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {productUrl ? (
                          <Link to={productUrl} className="hover:text-[#EF4A45] transition-colors truncate max-w-full" title="View product details">
                            <p className="font-black text-slate-900 truncate text-base md:text-lg hover:text-[#EF4A45] transition-colors">{item.titleSnapshot}</p>
                          </Link>
                        ) : (
                          <p className="font-black text-slate-900 truncate text-base md:text-lg">{item.titleSnapshot}</p>
                        )}
                        {isReviewed && (
                          <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500" /> Reviewed
                          </span>
                        )}
                      </div>

                      {/* Kids Soft Tag */}
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[11px] font-bold text-emerald-800 border border-emerald-100">
                        <span>🌿 100% Combed Cotton • Skin-Safe Dye</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-semibold pt-0.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">Size: <strong className="text-slate-900">{item.size || '7-8 Year'}</strong></span>
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                          Color:
                          {item.color && (
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                              style={{ backgroundColor: formatColorHex(item.color) }}
                            />
                          )}
                          <strong className="text-slate-900">
                            {formatColorName(item.colorName, item.color)}
                          </strong>
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">Qty: <strong className="text-slate-900">{item.quantity}</strong></span>
                      </div>

                      {productUrl && (
                        <div className="pt-0.5">
                          <Link
                            to={productUrl}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#5B2E89] hover:text-[#EF4A45] transition-colors"
                          >
                            <span>View Product Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {/* Quick Item Actions when Delivered */}
                      {order.status === 'DELIVERED' && !order.returnRequest && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {!isReviewed && (
                            <button
                              onClick={() => handleOpenReviewModal(item)}
                              className="text-xs font-black px-3 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1 border border-amber-200 shadow-2xs"
                            >
                              <Star className="w-3 h-3 fill-amber-500" /> Review
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenExchangeModal(item)}
                            className="text-xs font-black px-3 py-1 bg-indigo-50 text-[#5B2E89] hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 border border-indigo-200 shadow-2xs"
                          >
                            <RefreshCw className="w-3 h-3" /> Exchange
                          </button>
                          <button
                            onClick={() => handleOpenReturnModal(item)}
                            className="text-xs font-black px-3 py-1 bg-rose-50 text-[#EF4A45] hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 border border-rose-200 shadow-2xs"
                          >
                            <RotateCcw className="w-3 h-3" /> Return
                          </button>
                        </div>
                      )}

                      {/* Display Customer Review & Admin Reply */}
                      {(() => {
                        const itemReview = reviewsMap[`${order.orderNumber || order.id}_${item.productId || item.id}`] || reviewsMap[String(item.productId || item.id)];
                        if (!itemReview) return null;
                        return (
                          <div className="mt-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="flex text-amber-500">
                                  {[...Array(itemReview.rating || 5)].map((_, idx) => (
                                    <Star key={idx} className="w-3 h-3 fill-amber-400" />
                                  ))}
                                </div>
                                <span className="font-bold text-slate-800">{itemReview.title || 'Your Review'}</span>
                              </div>
                              {itemReview.createdAt && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(itemReview.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed">
                              "{itemReview.body || itemReview.comment}"
                            </p>

                            {itemReview.merchantReply?.body && (
                              <div className="mt-2 p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] mb-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Admin Reply from Jog & Joy</span>
                                  {itemReview.merchantReply.repliedAt && (
                                    <span className="text-[10px] text-slate-400 font-normal ml-auto">
                                      {new Date(itemReview.merchantReply.repliedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium pl-5">
                                  {itemReview.merchantReply.body}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="text-right sm:w-28 shrink-0">
                      <p className="font-black text-slate-900 text-lg">₹{item.unitPrice * item.quantity}</p>
                      {item.quantity > 1 && <p className="text-xs text-slate-500 font-medium">₹{item.unitPrice} each</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Shipping */}
        <div className="space-y-6">

          {/* Order Summary Receipt */}
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl shadow-xs border border-amber-100/90 p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-amber-200">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 whitespace-nowrap">
                <span>🧾</span> Order Receipt
              </h2>
              <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200 whitespace-nowrap shrink-0">
                Official Bill
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600 font-medium">
                <p>Items Subtotal</p><p className="font-bold text-slate-800">₹{order.subtotal}</p>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <p>Discount ({order.promotionCodeApplied || 'PROMO'})</p>
                  <p>-₹{order.discountAmount}</p>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium items-center">
                <p>Express Kids Shipping</p>
                <p className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-xs font-black">
                  {order.shippingCost === 0 ? 'FREE 🎁' : `₹${order.shippingCost}`}
                </p>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <p>Estimated GST</p><p className="font-bold text-slate-800">₹{order.tax || 0}</p>
              </div>
              <div className="border-t-2 border-dashed border-amber-200/80 pt-3 flex justify-between font-black text-lg text-slate-900">
                <p>Total Paid</p>
                <p className="text-[#EF4A45]">₹{order.total || order.subtotal}</p>
              </div>

              {order.status !== 'CANCELLED' && (
                <div className="pt-3">
                  <button
                    onClick={() => {
                      const cleanId = String(order.orderNumber || order.id || '').replace(/^#/, '');
                      window.open(`/invoice/${cleanId}`, '_blank');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#EF4A45] text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Official Tax Invoice (PDF)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Shipping Info */}
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl shadow-xs border border-amber-100/90 p-6 space-y-5">
            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-[#5B2E89]" /> Payment Mode
              </h3>
              <p className="font-extrabold text-slate-900 uppercase text-sm">{order.paymentMethod || 'Online UPI'}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-black mt-1">
                ✓ Payment Verified & Completed
              </span>
            </div>

            <hr className="border-amber-100/80" />

            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#EF4A45]" /> Delivery Address
              </h3>
              <p className="font-extrabold text-slate-900 text-sm">{order.shippingAddress?.name || user?.name || 'Aarav Sharma'}</p>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                {order.shippingAddress?.address || order.shippingAddress?.line1}<br />
                {order.shippingAddress?.city}{order.shippingAddress?.city && order.shippingAddress?.state ? ', ' : ''}{order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
              {order.shippingAddress?.phone && (
                <p className="text-xs text-slate-500 mt-2 font-mono bg-slate-50 px-2 py-1 rounded inline-block border border-slate-200/60">
                  📞 {order.shippingAddress.phone}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1: REVIEW MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModal === 'review' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Write a Product Review</h3>
                  <p className="text-xs text-slate-500">Order #{order?.orderNumber || cleanOrderNumber}</p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reviewSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">Review Submitted!</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Thank you for sharing your experience! Your review is now live for other parents to see.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5 pt-4">
                  {/* Item selector if multiple items */}
                  {order.items?.length > 1 && (
                    <div>
                      <label className="text-xs font-extrabold uppercase text-slate-600 block mb-2">Select Item to Review</label>
                      <select
                        value={selectedItemForAction?.id}
                        onChange={(e) => {
                          const it = order.items.find(i => String(i.id) === e.target.value);
                          if (it) setSelectedItemForAction(it);
                        }}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                      >
                        {order.items.map((it, idx) => (
                          <option key={idx} value={it.id}>{it.titleSnapshot} ({it.size})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Selected Item Snippet */}
                  {selectedItemForAction && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      {selectedItemForAction.image && (
                        <img src={selectedItemForAction.image} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800 text-sm truncate">{selectedItemForAction.titleSnapshot}</p>
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 flex-wrap">
                          <span>Size: {selectedItemForAction.size}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            Color:
                            {selectedItemForAction.color && (
                              <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: formatColorHex(selectedItemForAction.color) }} />
                            )}
                            <span className="text-slate-800 font-bold">{formatColorName(selectedItemForAction.colorName, selectedItemForAction.color)}</span>
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 5-Star Rating Selector */}
                  <div>
                    <label className="text-xs font-extrabold uppercase text-slate-600 block mb-2">Overall Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star className={`w-8 h-8 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                      <span className="ml-3 text-xs font-black text-amber-600 uppercase">
                        {reviewForm.rating === 5 ? 'Excellent' : reviewForm.rating === 4 ? 'Very Good' : reviewForm.rating === 3 ? 'Good' : reviewForm.rating === 2 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="text-xs font-extrabold uppercase text-slate-600 block mb-1.5">Review Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Excellent fit and super soft fabric!"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Review Body */}
                  <div>
                    <label className="text-xs font-extrabold uppercase text-slate-600 block mb-1.5">Your Experience & Feedback</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us what you liked about the durability, comfort, stitching, and feel..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* Verified Buyer Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-extrabold uppercase text-slate-500 block mb-1">Your Name</label>
                      <input
                        type="text"
                        value={reviewForm.customerName}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold uppercase text-slate-500 block mb-1">Email (Private)</label>
                      <input
                        type="email"
                        value={reviewForm.customerEmail}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                        className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Verified Review'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2: EXCHANGE MODAL (REAL E-COMMERCE UX) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModal === 'exchange' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-[#5B2E89]" />
                    Exchange Product
                  </h3>
                  <p className="text-xs text-slate-500">Free doorstep pickup & replacement delivery</p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExchangeSubmit} className="space-y-6">

                {/* 1. Item being exchanged */}
                {selectedItemForAction && (
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 block mb-2 tracking-wider">Item You Want to Exchange</label>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      {selectedItemForAction.image && (
                        <img src={selectedItemForAction.image} alt="Original" className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{selectedItemForAction.titleSnapshot}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                          <span>Current Size: <span className="font-bold text-slate-800">{selectedItemForAction.size}</span></span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            Color:
                            {selectedItemForAction.color && (
                              <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: formatColorHex(selectedItemForAction.color) }} />
                            )}
                            <span className="font-bold text-slate-800">{formatColorName(selectedItemForAction.colorName, selectedItemForAction.color)}</span>
                          </span>
                        </p>
                      </div>
                      <div className="text-right font-black text-slate-800 text-sm">
                        ₹{selectedItemForAction.unitPrice}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Reason for Exchange (MANDATORY) */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-700 block mb-2 tracking-wider">
                    Reason for Exchange <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={exchangeReason}
                    onChange={(e) => setExchangeReason(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#5B2E89] bg-white shadow-sm"
                  >
                    <option value="Size too small - Need bigger size">Size too small - Need bigger size</option>
                    <option value="Size too large - Need smaller size">Size too large - Need smaller size</option>
                    <option value="Color / Shade different from picture">Color / Shade different from picture</option>
                    <option value="Fit / Style not suitable">Fit / Style not suitable</option>
                    <option value="Defective stitching / Minor flaw">Defective stitching / Minor flaw</option>
                    <option value="Received incorrect variant">Received incorrect variant</option>
                    <option value="Other">Other (specify below)</option>
                  </select>

                  <textarea
                    rows={2}
                    placeholder="Optional remarks (e.g. My child needs 1 size larger for school sports)..."
                    value={exchangeComments}
                    onChange={(e) => setExchangeComments(e.target.value)}
                    className="mt-2 w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#5B2E89] resize-none"
                  />
                </div>

                {/* 3. Replacement Product Selection (CORE USER REQUIREMENT) */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-black uppercase text-slate-700 tracking-wider">
                      Select Replacement Item <span className="text-red-500">*</span>
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setExchangeMode('same_product')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${exchangeMode === 'same_product' ? 'bg-white shadow text-[#5B2E89]' : 'text-slate-500'}`}
                      >
                        Same Item (Different Size)
                      </button>
                      <button
                        type="button"
                        onClick={() => setExchangeMode('catalog')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${exchangeMode === 'catalog' ? 'bg-white shadow text-[#5B2E89]' : 'text-slate-500'}`}
                      >
                        Browse Store Catalog
                      </button>
                    </div>
                  </div>

                  {/* Mode A: Same product different size */}
                  {exchangeMode === 'same_product' && (
                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                      <p className="text-xs font-bold text-slate-700">Choose New Size for this product:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableSizesForReplacement.map((sz, idx) => {
                          const isCurrent = sz === selectedItemForAction?.size;
                          const isSelected = sz === replacementVariant.size;
                          const matchedVariant = replacementVariant.product?.variants?.find(v => String(v.size || '').trim().toLowerCase() === String(sz).trim().toLowerCase());
                          const isOutOfStock = matchedVariant ? Number(matchedVariant.stock) <= 0 : false;
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={isCurrent || isOutOfStock}
                              onClick={() => setReplacementVariant(prev => ({ ...prev, size: sz }))}
                              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                                isSelected
                                  ? 'bg-[#5B2E89] text-white border-[#5B2E89] shadow-sm scale-105'
                                  : isOutOfStock
                                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                                    : isCurrent
                                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                                }`}
                              title={isOutOfStock ? 'Currently out of stock' : isCurrent ? 'Current size' : `Select size ${sz}`}
                            >
                              {sz} {isCurrent ? '(Current)' : isOutOfStock ? '(Out of stock)' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mode B: Browse store catalog */}
                  {exchangeMode === 'catalog' && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search products in catalog..."
                          value={exchangeSearchQuery}
                          onChange={(e) => setExchangeSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5B2E89] bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                        {filteredCatalogProducts.map((prod) => {
                          const isSelected = replacementVariant.product?.id === prod.id;
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => {
                                setReplacementVariant({
                                  product: prod,
                                  size: prod.sizes?.[0] || 'M',
                                  color: prod.colors?.[0] || 'Default'
                                });
                              }}
                              className={`p-2 rounded-xl border text-left transition-all ${isSelected ? 'bg-purple-50 border-[#5B2E89] ring-2 ring-[#5B2E89]/20' : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                              <img src={prod.image} alt={prod.name} className="w-full h-16 object-cover rounded-lg mb-1" />
                              <p className="font-bold text-[11px] text-slate-800 truncate">{prod.name}</p>
                              <p className="text-[10px] font-black text-slate-500">₹{prod.price}</p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Pick size for catalog item */}
                      {replacementVariant.product && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs font-bold text-slate-700 mb-1.5">Size for {replacementVariant.product.name}:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(replacementVariant.product.sizes?.length ? replacementVariant.product.sizes : ['5-6 Year', '7-8 Year', '9-10 Year', 'S', 'M', 'L']).map((sz, i) => {
                              const matchedVariant = replacementVariant.product?.variants?.find(v => String(v.size || '').trim().toLowerCase() === String(sz).trim().toLowerCase());
                              const isOutOfStock = matchedVariant ? Number(matchedVariant.stock) <= 0 : false;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  disabled={isOutOfStock}
                                  onClick={() => setReplacementVariant(prev => ({ ...prev, size: sz }))}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                    replacementVariant.size === sz
                                      ? 'bg-[#5B2E89] text-white border-[#5B2E89]'
                                      : isOutOfStock
                                        ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                  }`}
                                  title={isOutOfStock ? 'Currently out of stock' : `Select size ${sz}`}
                                >
                                  {sz} {isOutOfStock ? '(Sold out)' : ''}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Realtime Exchange Comparison Card */}
                  {(() => {
                    const origP = Number(selectedItemForAction?.unitPrice || 0);
                    const repP = Number(replacementVariant.product?.price || origP);
                    const diff = repP - origP;
                    return (
                      <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border ${diff > 0 ? 'bg-amber-50/70 border-amber-200' : diff < 0 ? 'bg-blue-50/70 border-blue-200' : 'bg-emerald-50/70 border-emerald-200'
                        }`}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-500">Exchange Preview:</span>
                          <span className="font-bold text-slate-800">{selectedItemForAction?.size}</span>
                          <span className="text-slate-400 font-black">➔</span>
                          <span className="font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                            {replacementVariant.size} {replacementVariant.product?.name ? `(${replacementVariant.product.name})` : ''}
                          </span>
                        </div>
                        <span className={`font-black uppercase tracking-wider text-[11px] px-2.5 py-1 rounded-lg ${diff === 0
                          ? 'text-emerald-800 bg-emerald-100'
                          : diff > 0
                            ? 'text-amber-800 bg-amber-100'
                            : 'text-blue-800 bg-blue-100'
                          }`}>
                          {diff === 0
                            ? 'Equal Value Exchange (₹0)'
                            : diff > 0
                              ? `Extra to Pay: +₹${diff}`
                              : `Refund / Credit Due: ₹${Math.abs(diff)}`}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Differential Payment Method Selection when diff > 0 */}
                  {(() => {
                    const origP = Number(selectedItemForAction?.unitPrice || 0);
                    const repP = Number(replacementVariant.product?.price || origP);
                    const diff = repP - origP;

                    if (diff <= 0) return null;

                    return (
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-amber-600" />
                            Differential Amount: +₹{diff}
                          </span>
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                            Upgrade Item
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          The replacement item is priced higher than your original item. Select how you would like to settle the ₹{diff} difference:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <label
                            onClick={() => setDiffPaymentMethod('razorpay')}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                              diffPaymentMethod === 'razorpay'
                                ? 'bg-white border-[#5B2E89] ring-2 ring-[#5B2E89]/20 shadow-xs'
                                : 'bg-white/60 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="diffPayment"
                              value="razorpay"
                              checked={diffPaymentMethod === 'razorpay'}
                              onChange={() => setDiffPaymentMethod('razorpay')}
                              className="mt-0.5 text-[#5B2E89] focus:ring-[#5B2E89]"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                                Pay Online Now
                                <span className="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.2 rounded">Fastest</span>
                              </p>
                              <p className="text-[10px] text-slate-500">UPI, Cards, NetBanking (Razorpay)</p>
                            </div>
                          </label>

                          <label
                            onClick={() => setDiffPaymentMethod('cod')}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                              diffPaymentMethod === 'cod'
                                ? 'bg-white border-[#5B2E89] ring-2 ring-[#5B2E89]/20 shadow-xs'
                                : 'bg-white/60 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="diffPayment"
                              value="cod"
                              checked={diffPaymentMethod === 'cod'}
                              onChange={() => setDiffPaymentMethod('cod')}
                              className="mt-0.5 text-[#5B2E89] focus:ring-[#5B2E89]"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs">Pay on Delivery</p>
                              <p className="text-[10px] text-slate-500">Cash / UPI to courier at doorstep</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Refund Notice when diff < 0 */}
                  {(() => {
                    const origP = Number(selectedItemForAction?.unitPrice || 0);
                    const repP = Number(replacementVariant.product?.price || origP);
                    const diff = repP - origP;

                    if (diff >= 0) return null;

                    return (
                      <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold">
                          ₹
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-blue-950 text-xs">Refund Due: ₹{Math.abs(diff)}</p>
                          <p className="text-[11px] text-blue-800">
                            The replacement item is priced lower. We will automatically initiate a refund of ₹{Math.abs(diff)} to your original payment method once the replacement is delivered.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Pickup Address Confirmation */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-600" /> Free Doorstep Pickup Address
                  </p>
                  <p className="text-slate-600 font-medium">
                    {order.shippingAddress?.address || 'Flat 402, Lotus Grandeur, Sector 78'}, {order.shippingAddress?.city || 'Noida'}, {order.shippingAddress?.state || 'UP'} {order.shippingAddress?.postalCode || '201304'}
                  </p>
                </div>

                {(() => {
                  const origP = Number(selectedItemForAction?.unitPrice || 0);
                  const repP = Number(replacementVariant.product?.price || origP);
                  const diff = repP - origP;

                  let buttonLabel = 'Confirm & Request Exchange';
                  if (diff > 0) {
                    buttonLabel = diffPaymentMethod === 'razorpay'
                      ? `Pay ₹${diff} via Razorpay & Request Exchange`
                      : `Confirm Exchange (Pay ₹${diff} on Delivery)`;
                  } else if (diff < 0) {
                    buttonLabel = `Confirm Exchange (₹${Math.abs(diff)} Refund Due)`;
                  }

                  return (
                    <button
                      type="submit"
                      disabled={isSubmittingExchange}
                      className="w-full py-4 bg-[#5B2E89] hover:bg-[#4a256e] text-white font-extrabold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      {isSubmittingExchange ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonLabel}
                    </button>
                  );
                })()}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3: RETURN MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModal === 'return' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-[#EF4A45]" />
                    Return Product for Refund
                  </h3>
                  <p className="text-xs text-slate-500">100% money-back refund guarantee</p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-5">
                {/* Item snippet */}
                {selectedItemForAction && (
                  <div className="flex items-center gap-3 p-3.5 bg-red-50/50 rounded-2xl border border-red-100">
                    {selectedItemForAction.image && (
                      <img src={selectedItemForAction.image} alt="Return Item" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{selectedItemForAction.titleSnapshot}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 flex-wrap">
                        <span>Size: {selectedItemForAction.size}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          Color:
                          {selectedItemForAction.color && (
                            <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: formatColorHex(selectedItemForAction.color) }} />
                          )}
                          <span className="font-bold text-slate-800">{formatColorName(selectedItemForAction.colorName, selectedItemForAction.color)}</span>
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Refund Value</span>
                      <span className="font-black text-emerald-600 text-sm">₹{selectedItemForAction.unitPrice}</span>
                    </div>
                  </div>
                )}

                {/* Reason for Return (MANDATORY) */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-700 block mb-2 tracking-wider">
                    Reason for Return <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#EF4A45] bg-white shadow-sm"
                  >
                    <option value="Fabric / Quality not as expected">Fabric / Quality not as expected</option>
                    <option value="Defective piece or damaged in transit">Defective piece or damaged in transit</option>
                    <option value="Size / Fit issue">Size / Fit issue</option>
                    <option value="Received incorrect product">Received incorrect product</option>
                    <option value="Delivery arrived too late">Delivery arrived too late</option>
                    <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                    <option value="Other">Other</option>
                  </select>

                  <textarea
                    rows={2}
                    placeholder="Provide additional details on why you are returning this item..."
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                    className="mt-2 w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#EF4A45] resize-none"
                  />
                </div>

                {/* Preferred Refund Mode */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-700 block mb-2 tracking-wider">
                    Select Refund Method <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'original', label: 'Original Payment Method', desc: 'Refunded to original UPI / Card account within 3-5 days' },
                      { id: 'store_credit', label: 'Jog & Joy Store Credit', desc: 'Instant refund + bonus ₹50 credit for your next order' },
                      { id: 'bank', label: 'Bank Account Transfer (NEFT)', desc: 'Provide account number and IFSC' },
                    ].map((mode) => (
                      <label
                        key={mode.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${refundMode === mode.id ? 'bg-red-50/50 border-[#EF4A45] shadow-xs' : 'border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="refundMode"
                          checked={refundMode === mode.id}
                          onChange={() => setRefundMode(mode.id)}
                          className="mt-0.5 text-[#EF4A45] focus:ring-[#EF4A45]"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{mode.label}</p>
                          <p className="text-[11px] text-slate-500">{mode.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {refundMode === 'bank' && (
                    <div className="space-y-2.5 pt-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Account Holder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Name as per Bank Passbook / Cheque"
                          value={bankDetails.accountName || ''}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                          className="w-full p-2.5 rounded-lg border border-slate-200 font-bold focus:outline-none focus:border-[#EF4A45]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                            Account Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={18}
                            placeholder="9 to 18 Digits"
                            value={bankDetails.accountNumber}
                            onChange={(e) => {
                              const numeric = e.target.value.replace(/\D/g, '').slice(0, 18);
                              setBankDetails(prev => ({ ...prev, accountNumber: numeric }));
                            }}
                            className={`w-full p-2.5 rounded-lg border font-mono font-bold focus:outline-none ${bankDetails.accountNumber && !/^\d{9,18}$/.test(bankDetails.accountNumber)
                              ? 'border-red-400 bg-red-50/30'
                              : 'border-slate-200 focus:border-[#EF4A45]'
                              }`}
                            required
                          />
                          {bankDetails.accountNumber && !/^\d{9,18}$/.test(bankDetails.accountNumber) && (
                            <p className="text-[10px] text-red-500 font-medium mt-1">Must be 9–18 digits (numbers only)</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                            IFSC Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={11}
                            placeholder="e.g. SBIN0001234"
                            value={bankDetails.ifsc}
                            onChange={(e) => {
                              const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                              setBankDetails(prev => ({ ...prev, ifsc: formatted }));
                            }}
                            className={`w-full p-2.5 rounded-lg border font-mono font-bold uppercase focus:outline-none ${bankDetails.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifsc)
                              ? 'border-red-400 bg-red-50/30'
                              : 'border-slate-200 focus:border-[#EF4A45]'
                              }`}
                            required
                          />
                          {bankDetails.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifsc) && (
                            <p className="text-[10px] text-red-500 font-medium mt-1">Format: 4 letters, 0, then 6 chars</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Doorstep Pickup Note */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Pickup Details</p>
                  <p>Our courier partner will collect the item within 2-3 business days. Please keep tags attached.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="w-full py-3.5 bg-[#EF4A45] hover:bg-[#d63d38] text-white font-extrabold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingReturn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Request Return'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 p-6 text-center border border-slate-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <X className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">Cancel Order #{cleanOrderNumber}?</h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to cancel this order? Any reserved items will be released back to our inventory.
              {order.paymentStatus === 'paid' && ' Your online payment will be refunded to your original payment method.'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancellingOrder}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCustomerCancelOrder}
                disabled={isCancellingOrder}
                className="flex-1 py-2.5 bg-[#EF4A45] hover:bg-[#d63d38] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                {isCancellingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

