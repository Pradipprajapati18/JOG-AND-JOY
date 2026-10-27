import React, { useState, useEffect } from 'react';
import { Search, X, CreditCard, Package, AlertCircle, ArrowLeft, MoreHorizontal, ShieldAlert, FileText, CheckCircle2, RefreshCw, RotateCcw, ChevronRight, ChevronLeft, Truck, ExternalLink } from 'lucide-react';
import { useUIContext } from '../../context/UIContext';
import { COURIER_PARTNERS, generateTrackingUrl, resolveOrderTracking } from '../../utils/shipping';
import { useOrdersList, useUpdateOrder } from '../../queries/useOrders';
import { useQueryClient } from '@tanstack/react-query';
import { useSettingsContext } from '../../context/SettingsContext';
import { restockOrderItems, deductInventoryItem, restockInventoryItem } from '../../utils/inventory';
import { initiateRazorpayRefund } from '../../utils/razorpay';

import { useSearchParams, Link } from 'react-router-dom';
import { getColorName, formatColorName, formatColorHex } from '../../utils/helpers';
import { parseNumericAmount } from '../../api/mockApi';

export default function AdminOrders() {
  const { addToast } = useUIContext();
  const [activeTab, setActiveTab] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingForm, setTrackingForm] = useState({ carrier: 'shiprocket', awb: '', customUrl: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterPayment, filterDate, search]);

  useEffect(() => {
    if (selectedOrder) {
      const tracking = resolveOrderTracking(selectedOrder);
      const matchedPartner = COURIER_PARTNERS.find(p =>
        p.id === (selectedOrder.carrier || '').toLowerCase() ||
        p.name.toLowerCase().includes((selectedOrder.carrier || '').toLowerCase())
      );
      setTrackingForm({
        carrier: matchedPartner?.id || 'shiprocket',
        awb: tracking.trackingId || '',
        customUrl: selectedOrder.trackingUrl || selectedOrder.shippingAddress?.trackingUrl || ''
      });
    }
  }, [selectedOrder?.id]);

  const { formatCurrency, formatCompactCurrency, formatDate } = useSettingsContext();

  const { data, isLoading } = useOrdersList({ pageSize: 1000 });

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam && data?.data && view === 'list') {
      const target = data.data.find(o => o.id === orderIdParam || o.orderNumber === orderIdParam);
      if (target) {
        setSelectedOrder(target);
        setView('detail');
      }
    }
  }, [searchParams, data, view]);

  const filters = {};
  if (['PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'ON_HOLD', 'RETURNS'].includes(activeTab)) {
    if (activeTab === 'RETURNS') {
      filters.returns = true;
    } else {
      filters.status = activeTab;
    }
  }
  if (search) filters.search = search;

  let orders = data?.data || [];
  if (Object.keys(filters).length > 0) {
    orders = orders.filter(o => {
      let matches = true;
      if (filters.status && o.status !== filters.status) matches = false;
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const qClean = q.replace(/^#+/, '').replace(/^jj-/, '');
        const orderNum = String(o.orderNumber || '').toLowerCase();
        const orderId = String(o.id || '').toLowerCase();
        const searchStr = `${orderNum} ${orderId} ${o.shippingAddress?.name || ''} ${o.shippingAddress?.email || ''} ${o.shippingAddress?.phone || ''} ${o.shippingAddress?.trackingNumber || ''}`.toLowerCase();
        if (!searchStr.includes(q) && (!qClean || (!orderNum.includes(qClean) && !orderId.includes(qClean)))) {
          matches = false;
        }
      }
      if (filters.returns) {
        const hasReturnOrEx = Boolean(
          ['RETURN_REQUESTED', 'EXCHANGE_REQUESTED', 'RETURN_APPROVED', 'EXCHANGE_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REJECTED'].includes(o.status) ||
          o.returnRequest ||
          (o.notes && typeof o.notes === 'string' && (o.notes.includes('EXCHANGE') || o.notes.includes('RETURN') || o.notes.startsWith('{'))) ||
          o.shippingAddress?._returnRequest ||
          o.statusHistory?.some(h => h.status?.includes('RETURN') || h.status?.includes('EXCHANGE') || (h.note && /exchange|return/i.test(h.note)))
        );
        if (!hasReturnOrEx) matches = false;
      }
      return matches;
    });
  }

  if (filterPayment !== 'all') {
    orders = orders.filter(o => o.paymentStatus === filterPayment);
  }

  if (filterDate !== 'all') {
    const now = new Date();
    orders = orders.filter(o => {
      const d = new Date(o.createdAt);
      if (filterDate === 'today') return d.toDateString() === now.toDateString();
      if (filterDate === '7days') return (now - d) <= 7 * 24 * 60 * 60 * 1000;
      if (filterDate === '30days') return (now - d) <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  }

  // Pagination Calculations
  const totalOrdersCount = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrdersCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = orders.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  const startIndex = totalOrdersCount === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalOrdersCount);

  const updateMut = useUpdateOrder();
  const queryClient = useQueryClient();

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setView('detail');
  };

  const exportToCSV = () => {
    if (!orders || orders.length === 0) {
      addToast("No orders to export", "error");
      return;
    }

    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Status", "Payment", "Total (INR)"];

    const rows = orders.map(o => {
      const date = new Date(o.createdAt).toLocaleDateString();
      const name = o.shippingAddress?.name ? `"${o.shippingAddress.name.replace(/"/g, '""')}"` : 'Guest';
      const email = o.userId || 'Guest'; // Fallback if no email
      return [
        o.orderNumber || o.id,
        date,
        name,
        email,
        o.status || 'PROCESSING',
        o.paymentStatus || 'pending',
        parseNumericAmount(o.total || 0)
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("CSV Exported successfully!", "success");
  };

  // Unified Order Status & Restocking Controller (eliminates code duplication)
  const handleUpdateOrderStatus = async (orderToUpdate, newStatus, customNote = null, extraPatch = {}) => {
    if (!orderToUpdate) return;
    const hasTracking = Boolean(
      orderToUpdate.shippingAddress?.trackingNumber ||
      orderToUpdate.trackingId ||
      extraPatch.shippingAddress?.trackingNumber ||
      extraPatch.shippingAddress?.trackingId
    );
    if (newStatus === 'SHIPPED' && !hasTracking) {
      addToast('Please enter and save a tracking number first', 'error');
      return;
    }

    const isApproval = newStatus.includes('APPROVED');
    const isRejection = ['RETURN_REJECTED', 'EXCHANGE_REJECTED'].includes(newStatus);
    const note = customNote || (isApproval
      ? `Request approved by admin (${newStatus})`
      : isRejection
        ? `${newStatus === 'EXCHANGE_REJECTED' ? 'Exchange' : 'Return'} request rejected by admin`
        : `Status changed to ${newStatus} by admin`);

    const historyEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note
    };

    const patchData = {
      status: newStatus,
      orderNumber: orderToUpdate.orderNumber,
      statusHistory: [...(orderToUpdate.statusHistory || []), historyEntry],
      ...extraPatch,
      shippingAddress: {
        ...(orderToUpdate.shippingAddress || {}),
        ...(extraPatch.shippingAddress || {})
      }
    };

    // Auto-update returnRequest status to keep lifecycle in sync
    if (orderToUpdate.returnRequest) {
      const isReturn = orderToUpdate.returnRequest.type === 'RETURN';
      const isExchange = orderToUpdate.returnRequest.type === 'EXCHANGE';

      let newReqStatus = orderToUpdate.returnRequest.status || 'PENDING';

      if (newStatus === 'EXCHANGE_APPROVED' || newStatus === 'RETURN_APPROVED') {
        newReqStatus = 'APPROVED';
      } else if (newStatus === 'EXCHANGE_REJECTED' || newStatus === 'RETURN_REJECTED') {
        newReqStatus = 'REJECTED';
      } else if (newStatus === 'SHIPPED' && isExchange) {
        newReqStatus = 'SHIPPED';
        // Deduct replacement product variant from inventory upon shipping replacement package
        const repItem = orderToUpdate.returnRequest?.exchangeItem;
        const alreadyDeducted = Boolean(
          orderToUpdate.shippingAddress?._replacementDeducted ||
          orderToUpdate.returnRequest?._replacementDeducted ||
          orderToUpdate.statusHistory?.some(h => /replacement.*deducted/i.test(h.note || ''))
        );
        if (repItem && !alreadyDeducted) {
          deductInventoryItem(repItem, queryClient);
          patchData.shippingAddress = {
            ...(patchData.shippingAddress || orderToUpdate.shippingAddress || {}),
            _replacementDeducted: true,
            _replacementDeductedAt: new Date().toISOString()
          };
          historyEntry.note = `${note} (Replacement item ${repItem.title || ''} [${typeof repItem.size === 'object' ? (repItem.size?.name || 'M') : (repItem.size || 'M')}] deducted from stock)`;
        }
      } else if (newStatus === 'DELIVERED') {
        const hadInFlightExchange = isExchange && (
          ['APPROVED', 'SHIPPED'].includes(orderToUpdate.returnRequest.status) ||
          orderToUpdate.status === 'EXCHANGE_APPROVED' ||
          orderToUpdate.statusHistory?.some(h => h.status === 'EXCHANGE_APPROVED')
        );
        if (hadInFlightExchange) {
          newReqStatus = 'COMPLETED';
          if (orderToUpdate.returnRequest.differentialPayment?.method === 'COD') {
            orderToUpdate.returnRequest.differentialPayment = {
              ...orderToUpdate.returnRequest.differentialPayment,
              status: 'PAID',
              collectedAt: new Date().toISOString()
            };
          }

          // Restock the returned original item upon exchange delivery confirmation
          const origItem = orderToUpdate.returnRequest?.originalItem || orderToUpdate.items?.[0];
          const alreadyExRestocked = Boolean(
            orderToUpdate.shippingAddress?._exchangeRestocked ||
            orderToUpdate.returnRequest?._exchangeRestocked ||
            orderToUpdate.statusHistory?.some(h => /exchanged.*restocked/i.test(h.note || ''))
          );
          if (origItem && !alreadyExRestocked) {
            restockInventoryItem(origItem, queryClient);
            patchData.shippingAddress = {
              ...(patchData.shippingAddress || orderToUpdate.shippingAddress || {}),
              _exchangeRestocked: true,
              _exchangeRestockedAt: new Date().toISOString()
            };
            historyEntry.note = `${note} (Returned item ${origItem.title || origItem.titleSnapshot || ''} restocked into inventory)`;
          }
        }
      } else if (newStatus === 'REFUNDED' && isReturn) {
        newReqStatus = 'COMPLETED';
      }

      patchData.returnRequest = {
        ...orderToUpdate.returnRequest,
        status: newReqStatus,
        ...(newReqStatus === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {})
      };
    }

    // Auto-sync payment status and process real gateway refund if online paid
    if (newStatus === 'DELIVERED') {
      patchData.paymentStatus = 'paid';
    } else if (newStatus === 'REFUNDED' || (newStatus === 'CANCELLED' && orderToUpdate.paymentStatus === 'paid')) {
      const isOnlinePaid = orderToUpdate.paymentStatus === 'paid';
      const paymentId = orderToUpdate.razorpayPaymentId || orderToUpdate.paymentInfo?.razorpay_payment_id || orderToUpdate.paymentId;

      if (isOnlinePaid && paymentId) {
        try {
          const refundRes = await initiateRazorpayRefund({
            paymentId,
            amount: Number(orderToUpdate.total || 0),
            notes: {
              orderId: orderToUpdate.orderNumber || orderToUpdate.id,
              reason: `Admin marked order ${newStatus}`
            }
          });
          if (refundRes && refundRes.success) {
            patchData.paymentStatus = 'refunded';
            historyEntry.note = `${historyEntry.note} (Razorpay refund executed: ID ${refundRes.refund?.id || refundRes.id || 'Confirmed'})`;
            addToast('Razorpay refund processed successfully.', 'success');
          } else {
            patchData.paymentStatus = 'refund_pending';
            historyEntry.note = `${historyEntry.note} (Refund pending gateway response: ${refundRes?.message || 'Processing'})`;
            addToast('Order status updated. Razorpay returned: ' + (refundRes?.message || 'Pending gateway verification'), 'warning');
          }
        } catch (refErr) {
          console.warn('Admin gateway refund note:', refErr);
          patchData.paymentStatus = 'refund_pending';
          historyEntry.note = `${historyEntry.note} (Refund pending manual processing: ${refErr.message})`;
          addToast('Order status updated. Manual refund verification recommended.', 'warning');
        }
      } else {
        patchData.paymentStatus = newStatus === 'REFUNDED' ? 'refunded' : (isOnlinePaid ? 'refunded' : 'cancelled');
      }
    } else if (newStatus === 'CANCELLED') {
      patchData.paymentStatus = 'cancelled';
    }

    // Multi-layer double-restock protection (persisted across DB reloads in shippingAddress & history)
    const alreadyRestocked = Boolean(
      orderToUpdate.isRestocked ||
      orderToUpdate.shippingAddress?._isRestocked ||
      orderToUpdate.statusHistory?.some(h => /inventory restocked|restock/i.test(h.note || ''))
    );

    // Auto-restock items only on CANCELLED (pre-fulfillment) or REFUNDED (post-inspection)
    let didRestock = false;
    if ((newStatus === 'CANCELLED' || newStatus === 'REFUNDED') && !alreadyRestocked) {
      patchData.isRestocked = true;
      patchData.restockedAt = new Date().toISOString();
      patchData.shippingAddress = {
        ...(patchData.shippingAddress || orderToUpdate.shippingAddress || {}),
        _isRestocked: true,
        _restockedAt: new Date().toISOString()
      };
      historyEntry.note = `${note} (Inventory restocked: items added back to stock)`;
      restockOrderItems(orderToUpdate, queryClient);
      didRestock = true;
    }

    updateMut.mutate({
      id: orderToUpdate.id,
      patch: patchData
    }, {
      onSuccess: (updated) => {
        if (selectedOrder && (selectedOrder.id === orderToUpdate.id || selectedOrder.orderNumber === orderToUpdate.orderNumber)) {
          setSelectedOrder(prev => (prev ? { ...prev, ...updated } : updated));
        }
        setIsMenuOpen(false);
        setShowRefundModal(false);
        const restockMsg = didRestock ? ' & inventory restocked' : '';
        const orderLabel = orderToUpdate.orderNumber || (orderToUpdate.id ? orderToUpdate.id.slice(0, 8) : 'Order');
        const isExDelivered = newStatus === 'DELIVERED' && (orderToUpdate.returnRequest?.type === 'EXCHANGE');
        addToast(`${orderLabel} updated to ${isExDelivered ? 'Exchange Delivered' : newStatus.replace('_', ' ')}${restockMsg}!`, 'success');
      }
    });
  };

  const handleStatusChange = (newStatus) => handleUpdateOrderStatus(selectedOrder, newStatus);
  const handleQuickStatusChange = (orderToUpdate, newStatus) => handleUpdateOrderStatus(orderToUpdate, newStatus);
  const executeRefund = () => handleUpdateOrderStatus(selectedOrder, 'REFUNDED', 'Order refunded by admin');

  const handlePrintPackingSlip = () => {
    if (!selectedOrder) return;
    const cleanId = String(selectedOrder.orderNumber || selectedOrder.id || '').replace(/^#+/, '');
    window.open(`/invoice/${encodeURIComponent(cleanId)}?type=packing_slip`, '_blank');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (selectedOrder) {
      updateMut.mutate({
        id: selectedOrder.id,
        patch: {
          shippingAddress: {
            ...selectedOrder.shippingAddress,
            ...editFormData
          }
        }
      }, {
        onSuccess: (updated) => {
          setSelectedOrder(updated);
          setShowEditModal(false);
          addToast('Order details updated', 'success');
        }
      });
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const newTag = e.target.value.trim();
      const currentTags = selectedOrder.tags || [];
      if (!currentTags.includes(newTag)) {
        updateMut.mutate({
          id: selectedOrder.id,
          patch: { tags: [...currentTags, newTag] }
        }, {
          onSuccess: (updated) => setSelectedOrder(updated)
        });
      }
      e.target.value = '';
    }
  };

  // Reusable Status & Quick Action Controls for Table and Mobile Cards
  const renderStatusControls = (order, isMobile = false) => {
    const hasCompletedExchange = Boolean(
      order.returnRequest?.type === 'EXCHANGE' && (
        (order.returnRequest?.status || '').toUpperCase() === 'COMPLETED' ||
        (order.status === 'DELIVERED' && (
          ['APPROVED', 'SHIPPED'].includes((order.returnRequest?.status || '').toUpperCase()) ||
          order.statusHistory?.some(h => h.status === 'EXCHANGE_APPROVED')
        ))
      )
    );
    const hasCompletedReturn = Boolean(
      order.returnRequest?.type === 'RETURN' && (
        (order.returnRequest?.status || '').toUpperCase() === 'COMPLETED' ||
        order.status === 'REFUNDED'
      )
    );

    const isPendingReturn = !hasCompletedReturn && (order.status === 'RETURN_REQUESTED' || (order.returnRequest?.type === 'RETURN' && !['RETURN_APPROVED', 'RETURN_REJECTED', 'REFUNDED', 'CANCELLED'].includes(order.status) && !['APPROVED', 'REJECTED', 'COMPLETED'].includes((order.returnRequest?.status || '').toUpperCase())));
    const isPendingExchange = !hasCompletedExchange && (order.status === 'EXCHANGE_REQUESTED' || (order.returnRequest?.type === 'EXCHANGE' && !['EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'SHIPPED', 'CANCELLED'].includes(order.status) && !['APPROVED', 'SHIPPED', 'REJECTED', 'COMPLETED'].includes((order.returnRequest?.status || '').toUpperCase())));

    return (
      <div onClick={(e) => e.stopPropagation()} className={isMobile ? "flex flex-wrap items-center gap-2" : "flex items-center"}>
        {/* 1. Return Requested */}
        {isPendingReturn && (
          <div className={`flex items-center gap-1.5 ${isMobile ? 'flex-wrap' : 'flex-col sm:flex-row items-start sm:items-center'}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-800 border border-amber-300">
              <RotateCcw className="w-3 h-3 text-amber-600 shrink-0" />
              Return Req.
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuickStatusChange(order, 'RETURN_APPROVED')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded shadow-sm transition-colors whitespace-nowrap"
                title="Approve Return Request"
              >
                Approve
              </button>
              <button
                onClick={() => handleQuickStatusChange(order, 'RETURN_REJECTED')}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded border border-rose-200 transition-colors"
                title="Reject Request"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* 2. Exchange Requested */}
        {isPendingExchange && (
          <div className={`flex items-center gap-1.5 ${isMobile ? 'flex-wrap' : 'flex-col sm:flex-row items-start sm:items-center'}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-800 border border-amber-300">
              <RefreshCw className="w-3 h-3 text-amber-600 shrink-0" />
              Exchange Req.
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuickStatusChange(order, 'EXCHANGE_APPROVED')}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase rounded shadow-sm transition-colors whitespace-nowrap"
                title="Approve Exchange Request"
              >
                Approve
              </button>
              <button
                onClick={() => handleQuickStatusChange(order, 'EXCHANGE_REJECTED')}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded border border-rose-200 transition-colors"
                title="Reject Request"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* 3. Return Approved */}
        {order.status === 'RETURN_APPROVED' && (
          <div className={`flex items-center gap-1.5 ${isMobile ? 'flex-wrap' : 'flex-col sm:flex-row items-start sm:items-center'}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              Return Approved
            </span>
            <button
              onClick={() => handleQuickStatusChange(order, 'REFUNDED')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded shadow-sm transition-colors whitespace-nowrap"
              title="Process Refund & Restock Inventory"
            >
              Process Refund
            </button>
          </div>
        )}

        {/* 4. Exchange Approved */}
        {order.status === 'EXCHANGE_APPROVED' && (
          <div className={`flex items-center gap-1.5 ${isMobile ? 'flex-wrap' : 'flex-col sm:flex-row items-start sm:items-center'}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-800 border border-purple-300">
              <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />
              Exchange Approved
            </span>
            <button
              onClick={() => handleQuickStatusChange(order, 'SHIPPED')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded shadow-sm transition-colors whitespace-nowrap"
              title="Mark Replacement Package Shipped"
            >
              Ship Replacement
            </button>
          </div>
        )}

        {/* 5. Return / Exchange Rejected */}
        {['RETURN_REJECTED', 'EXCHANGE_REJECTED'].includes(order.status) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-700 border border-rose-200">
            <X className="w-3 h-3 shrink-0" />
            {order.status === 'EXCHANGE_REJECTED' ? 'Exchange Rejected' : 'Return Rejected'}
          </span>
        )}

        {/* 6. Delivered, Cancelled, Refunded */}
        {!isPendingReturn && !isPendingExchange && ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
            order.status === 'DELIVERED' && hasCompletedExchange ? 'bg-purple-100 text-purple-800 border border-purple-300' :
            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
              'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
            {order.status === 'DELIVERED' && (
              hasCompletedExchange ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-purple-600" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            )}
            {order.status === 'DELIVERED' && hasCompletedExchange ? 'Exchange Delivered' : order.status}
          </span>
        )}

        {/* 7. Standard In-flight statuses - Sleek, unified dropdown pill */}
        {!isPendingReturn && !isPendingExchange && ['PROCESSING', 'CONFIRMED', 'PACKED', 'ON_HOLD', 'SHIPPED'].includes(order.status) && (
          <div className="relative inline-block">
            <select
              value={order.status || 'PROCESSING'}
              onChange={(e) => handleQuickStatusChange(order, e.target.value)}
              className={`appearance-none inline-flex items-center pl-3 pr-7 py-1 rounded-full text-[11px] font-bold cursor-pointer border transition-all shadow-2xs outline-none focus:ring-2 focus:ring-blue-500/20 ${order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
                order.status === 'PACKED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' :
                  order.status === 'CONFIRMED' ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' :
                    order.status === 'ON_HOLD' ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' :
                      'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
            >
              <option value="PROCESSING">Processing</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PACKED">Packed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  };

  // DETAIL VIEW
  if (view === 'detail' && selectedOrder) {
    const o = selectedOrder;
    const oHasCompletedExchange = Boolean(
      o.returnRequest?.type === 'EXCHANGE' && (
        (o.returnRequest?.status || '').toUpperCase() === 'COMPLETED' ||
        (o.status === 'DELIVERED' && (
          ['APPROVED', 'SHIPPED'].includes((o.returnRequest?.status || '').toUpperCase()) ||
          o.statusHistory?.some(h => h.status === 'EXCHANGE_APPROVED')
        ))
      )
    );

    return (
      <div className="w-full max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (searchParams.has('orderId')) {
                  searchParams.delete('orderId');
                  setSearchParams(searchParams);
                }
                setView('list');
              }}
              className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-zinc-50 transition-colors shrink-0 mt-0.5 sm:mt-0"
              title="Back to Orders"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-text-dark break-all sm:break-normal">{o.orderNumber || o.id}</h1>
                <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${
                  o.status === 'DELIVERED' && oHasCompletedExchange ? 'bg-purple-100 text-purple-800 border border-purple-300 inline-flex items-center gap-1' :
                  o.status === 'DELIVERED' ? 'bg-green-500/15 text-green-700' :
                  o.status === 'SHIPPED' ? 'bg-blue-500/15 text-blue-700' :
                    ['CANCELLED', 'RETURN_REJECTED', 'EXCHANGE_REJECTED'].includes(o.status) ? 'bg-red-500/10 text-red-700' :
                      ['ON_HOLD', 'RETURN_REQUESTED', 'EXCHANGE_REQUESTED'].includes(o.status) ? 'bg-orange-500/15 text-orange-700' :
                        ['RETURN_APPROVED', 'EXCHANGE_APPROVED'].includes(o.status) ? 'bg-purple-100 text-purple-700' :
                          'bg-zinc-200 text-zinc-600'
                  }`}>
                  {o.status === 'DELIVERED' && oHasCompletedExchange ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />
                      EXCHANGE DELIVERED
                    </>
                  ) : o.status.replace('_', ' ')}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${o.paymentStatus === 'paid' ? 'bg-green-500/15 text-green-700' : 'bg-orange-500/15 text-orange-700'
                  }`}>
                  {o.paymentStatus}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-1">{formatDate(o.createdAt, true)} from {o.channel?.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {o.status === 'PROCESSING' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStatusChange('CONFIRMED')}
                  className="px-3 py-2 text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  Confirm Order 🎈
                </button>
                <button
                  onClick={() => handleStatusChange('PACKED')}
                  className="px-3 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  Mark as Packed 📦
                </button>
              </div>
            )}
            {o.status === 'CONFIRMED' && (
              <button
                onClick={() => handleStatusChange('PACKED')}
                className="px-3 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                Mark as Packed 📦
              </button>
            )}
            {o.status === 'EXCHANGE_APPROVED' && (
              <button
                onClick={() => {
                  if (!o.shippingAddress?.trackingNumber && !o.trackingId) {
                    addToast('Please enter and save a tracking number first', 'error');
                    return;
                  }
                  handleStatusChange('SHIPPED');
                }}
                className="px-3 py-2 text-xs font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                Ship Replacement 🚚
              </button>
            )}
            <button
              onClick={() => setShowRefundModal(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-zinc-50 text-center"
            >
              Refund
            </button>
            <button
              onClick={() => {
                setEditFormData(o.shippingAddress || {});
                setShowEditModal(true);
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-zinc-50 text-center"
            >
              Edit
            </button>
            <button
              onClick={handlePrintPackingSlip}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white border border-slate-200 text-text-dark font-bold rounded-xl shadow-sm hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Packing Slip</span>
            </button>
            {!['CANCELLED', 'REFUNDED', 'RETURN_REJECTED', 'EXCHANGE_REJECTED'].includes(o.status) && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 bg-primary-dark text-white rounded-xl shadow-sm hover:bg-primary-hover flex items-center justify-center"
                  title="More Status Options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20">
                      <div className="p-1">
                        {['PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'ON_HOLD', 'EXCHANGE_APPROVED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REJECTED', 'CANCELLED', 'REFUNDED'].filter(st => {
                          if (st === o.status) return false;
                          if (o.status === 'PROCESSING') return ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'ON_HOLD', 'CANCELLED'].includes(st);
                          if (o.status === 'CONFIRMED') return ['PACKED', 'SHIPPED', 'DELIVERED', 'ON_HOLD', 'CANCELLED'].includes(st);
                          if (o.status === 'PACKED') return ['SHIPPED', 'DELIVERED', 'ON_HOLD', 'CANCELLED'].includes(st);
                          if (o.status === 'ON_HOLD') return ['PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(st);
                          if (o.status === 'SHIPPED') return ['DELIVERED', 'CANCELLED'].includes(st);
                          if (o.status === 'EXCHANGE_REQUESTED') return ['EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'CANCELLED'].includes(st);
                          if (o.status === 'RETURN_REQUESTED') return ['RETURN_APPROVED', 'RETURN_REJECTED', 'CANCELLED'].includes(st);
                          if (o.status === 'EXCHANGE_APPROVED') return ['SHIPPED', 'DELIVERED'].includes(st);
                          if (o.status === 'RETURN_APPROVED') return ['REFUNDED'].includes(st);
                          if (o.status === 'DELIVERED') return ['SHIPPED', 'EXCHANGE_APPROVED', 'RETURN_APPROVED'].includes(st);
                          return true;
                        }).map(st => (
                          <button
                            key={st}
                            onClick={() => {
                              if (st === 'SHIPPED' && !o.shippingAddress?.trackingNumber) {
                                addToast('Please enter and save a tracking number first', 'error');
                                setIsMenuOpen(false);
                                return;
                              }
                              handleStatusChange(st);
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-zinc-50 rounded-lg"
                          >
                            Mark as {st.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Grid: 2-column on desktop (lg:grid-cols-3), stacked on tablet/mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Return / Exchange Request Banner */}
            {o.returnRequest && (
              <div className={`border rounded-2xl p-4 sm:p-5 ${o.status === 'RETURN_REQUESTED' || o.status === 'EXCHANGE_REQUESTED'
                ? 'bg-amber-50 border-amber-200'
                : o.status.includes('APPROVED')
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
                }`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 mb-1 flex-wrap">
                      <ShieldAlert className={`w-5 h-5 shrink-0 ${o.status.includes('REQUESTED') ? 'text-amber-600' : o.status.includes('APPROVED') ? 'text-emerald-600' : 'text-slate-500'}`} />
                      <span>{o.returnRequest.type === 'RETURN' ? 'Return & Refund' : 'Product Exchange'} Request</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        o.status === 'DELIVERED' && oHasCompletedExchange ? 'bg-purple-200 text-purple-900 border border-purple-300' :
                        o.status.includes('REQUESTED') ? 'bg-amber-200 text-amber-800' :
                        o.status.includes('APPROVED') ? 'bg-emerald-200 text-emerald-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                        {o.status === 'DELIVERED' && oHasCompletedExchange ? 'EXCHANGE DELIVERED' : o.status.replace('_', ' ')}
                      </span>
                    </h2>

                    <p className="text-sm font-bold text-slate-700">Reason: <span className="text-slate-900 font-medium">{o.returnRequest.reason}</span></p>

                    {o.returnRequest.comments && (
                      <p className="text-sm text-slate-600 italic">"{o.returnRequest.comments}"</p>
                    )}

                    {/* Exchange Item Details */}
                    {o.returnRequest.type === 'EXCHANGE' && o.returnRequest.exchangeItem && (
                      <div className="mt-3 p-3 bg-white border border-amber-200 rounded-xl flex items-center gap-3 sm:gap-4">
                        {o.returnRequest.exchangeItem.image && (
                          <img src={o.returnRequest.exchangeItem.image} alt={o.returnRequest.exchangeItem.title} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase text-amber-700">Requested Replacement</p>
                          <p className="font-bold text-slate-800 text-sm truncate">{o.returnRequest.exchangeItem.title}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 flex-wrap">
                            <span>Size: <span className="font-semibold text-slate-700">{typeof o.returnRequest.exchangeItem.size === 'object' ? (o.returnRequest.exchangeItem.size.name || o.returnRequest.exchangeItem.size.label || 'N/A') : String(o.returnRequest.exchangeItem.size || 'N/A')}</span></span>
                            {o.returnRequest.exchangeItem.color && (
                              <span className="inline-flex items-center gap-1">
                                • Color:
                                <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: formatColorHex(o.returnRequest.exchangeItem.color) }} />
                                <span className="font-semibold text-slate-700">{formatColorName(o.returnRequest.exchangeItem.colorName, o.returnRequest.exchangeItem.color)}</span>
                              </span>
                            )}
                            {o.returnRequest.exchangeItem.price ? ` • Price: ₹${o.returnRequest.exchangeItem.price}` : ''}
                          </p>

                          {/* Dynamic Price Difference Breakdown */}
                          {(() => {
                            const origP = Number(o.returnRequest.originalPrice || o.returnRequest.originalItem?.unitPrice || 0);
                            const repP = Number(o.returnRequest.replacementPrice || o.returnRequest.exchangeItem?.price || origP);
                            const diff = typeof o.returnRequest.priceDifference === 'number'
                              ? o.returnRequest.priceDifference
                              : (repP - origP);
                            const diffPay = o.returnRequest.differentialPayment;

                            if (diff === 0) {
                              return (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                                  <span>Equal Value Exchange (Price Difference: ₹0)</span>
                                </div>
                              );
                            } else if (diff > 0) {
                              const isPaid = diffPay?.status === 'PAID';
                              const isCOD = diffPay?.method === 'COD';
                              return (
                                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                                    <span>Balance Due: +₹{diff}</span>
                                  </div>
                                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${
                                    isPaid 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                      : 'bg-amber-100 text-amber-900 border-amber-300'
                                  }`}>
                                    {isPaid 
                                      ? `✓ Paid Online via ${diffPay?.method || 'Razorpay'} (${diffPay?.paymentId || 'Verified'})` 
                                      : isCOD 
                                        ? `🚚 Collect ₹${diff} on Delivery (COD)` 
                                        : `To Collect: ₹${diff} (COD / Payment Link)`}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                                  <span>Refund Due to Customer: ₹{Math.abs(diff)}</span>
                                  <span className="text-[10px] text-blue-700 font-normal">(Credit / UPI Refund upon delivery)</span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Return Details */}
                    {o.returnRequest.type === 'RETURN' && (
                      <div className="mt-2 text-xs text-slate-600 space-y-1">
                        {o.returnRequest.refundMode && (
                          <p><span className="font-bold">Refund Method:</span> <span className="uppercase">{String(o.returnRequest.refundMode)}</span></p>
                        )}
                        {o.returnRequest.refundAmount && (
                          <p><span className="font-bold">Refund Amount:</span> ₹{String(o.returnRequest.refundAmount)}</p>
                        )}
                        {o.returnRequest.bankDetails?.accountName && (
                          <p><span className="font-bold">Beneficiary:</span> {String(o.returnRequest.bankDetails.accountName)}</p>
                        )}
                        {o.returnRequest.bankDetails?.accountNumber && (
                          <p><span className="font-bold">Bank Account:</span> {String(o.returnRequest.bankDetails.accountNumber)} (IFSC: {String(o.returnRequest.bankDetails.ifsc || '')})</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Pending Requests */}
                  {((o.status === 'RETURN_REQUESTED' || o.status === 'EXCHANGE_REQUESTED' || (o.returnRequest && !['RETURN_APPROVED', 'EXCHANGE_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REJECTED', 'SHIPPED', 'REFUNDED', 'CANCELLED'].includes(o.status))) && o.returnRequest?.status !== 'COMPLETED' && !(o.status === 'DELIVERED' && (['APPROVED', 'SHIPPED', 'COMPLETED'].includes((o.returnRequest?.status || '').toUpperCase()) || o.statusHistory?.some(h => h.status === 'EXCHANGE_APPROVED')))) && (
                    <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleStatusChange(o.returnRequest?.type === 'RETURN' ? 'RETURN_APPROVED' : 'EXCHANGE_APPROVED')}
                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors shadow-sm text-center"
                      >
                        Approve {o.returnRequest?.type || 'Request'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(o.returnRequest?.type === 'EXCHANGE' || o.status === 'EXCHANGE_REQUESTED' ? 'EXCHANGE_REJECTED' : 'RETURN_REJECTED')}
                        className="flex-1 md:flex-none px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-50 transition-colors text-center"
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Ordered Items ({o.items?.length || 0})
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {o.items?.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3.5 sm:p-4 bg-zinc-50 border border-slate-200 rounded-xl sm:items-center">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      {item.image ? (
                        <img src={item.image} alt={item.titleSnapshot} className="w-12 h-12 rounded-lg border border-slate-200 object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex shrink-0 items-center justify-center text-xs font-bold text-zinc-300">IMG</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-text-dark text-sm sm:text-base">{typeof item.titleSnapshot === 'string' ? item.titleSnapshot : (item.name || item.title || 'Item')}</p>
                          {o.returnRequest?.type === 'EXCHANGE' && o.returnRequest.exchangeItem && (o.returnRequest.originalItem?.id === item.id || o.returnRequest.originalItem?.productId === item.productId || o.returnRequest.originalItem?.title === item.titleSnapshot) && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                              ⇄ Exchanged for {o.returnRequest.exchangeItem.title} ({o.returnRequest.exchangeItem.size})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>Size: <span className="font-medium text-slate-700">{typeof item.size === 'object' ? (item.size?.name || item.size?.label || 'N/A') : String(item.size || 'N/A')}</span></span>
                          <span>|</span>
                          <span className="inline-flex items-center gap-1">
                            Color:
                            {item.color && (
                              <span
                                className="inline-block w-3 h-3 rounded-full border border-slate-300 shrink-0"
                                style={{ backgroundColor: formatColorHex(item.color) }}
                              />
                            )}
                            <span className="font-semibold text-slate-800">
                              {formatColorName(item.colorName, item.color)}
                            </span>
                          </span>
                        </p>
                        <p className="text-xs text-text-muted font-mono mt-0.5">{formatCurrency(item.unitPrice)} each</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col justify-between sm:text-right items-center sm:items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <p className="font-bold text-text-dark text-sm">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary-dark sm:mt-0.5">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" /> Payment
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-muted"><p>Method</p><p className="uppercase font-bold">{o.paymentMethod || 'Online'}</p></div>
                <div className="flex justify-between text-text-muted"><p>Subtotal</p><p>{formatCurrency(o.subtotal)}</p></div>
                {o.discountAmount > 0 && <div className="flex justify-between text-text-muted"><p>Discount ({o.promotionCodeApplied})</p><p>-{formatCurrency(o.discountAmount)}</p></div>}
                <div className="flex justify-between text-text-muted"><p>Shipping</p><p>{formatCurrency(o.shippingCost)}</p></div>
                <div className="flex justify-between text-text-muted"><p>Tax</p><p>{formatCurrency(o.tax)}</p></div>
                <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold text-base sm:text-lg text-text-dark">
                  <p>Total</p><p>{formatCurrency(o.total)}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-text-dark mb-4">Timeline</h2>
              <div className="space-y-4">
                {o.statusHistory?.map((evt, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-text-dark">{evt.note || `Status changed to ${evt.status}`}</p>
                      <p className="text-xs text-text-muted mt-0.5">{formatDate(evt.timestamp, true)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-text-dark mb-4">Customer</h2>
              <p className="font-bold text-text-dark">{o.shippingAddress?.name || 'Customer'}</p>
              <p className="text-sm text-text-muted">0 orders</p>

              <hr className="border-slate-200 my-4" />
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Contact</h3>
              <p className="text-sm text-text-dark font-medium cursor-pointer hover:underline break-all">{o.shippingAddress?.email || 'No Email Provided'}</p>
              <p className="text-sm text-text-dark font-medium mt-1">{o.shippingAddress?.phone || 'No Phone Number'}</p>

              <hr className="border-slate-200 my-4" />
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between items-center">
                <span>Shipping Address</span>
                {o.shippingMethod && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">{o.shippingMethod}</span>}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {o.shippingAddress?.line1 || o.shippingAddress?.address || 'No Address Provided'}
                {(o.shippingAddress?.city || o.shippingAddress?.state || o.shippingAddress?.postalCode) && (
                  <>
                    <br />
                    {o.shippingAddress.city || ''}{o.shippingAddress.city && o.shippingAddress.state ? ', ' : ''}{o.shippingAddress.state || ''} {o.shippingAddress.postalCode || ''}
                  </>
                )}
                {o.shippingAddress?.country && <><br />{o.shippingAddress.country}</>}
              </p>

              <hr className="border-slate-200 my-4" />
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between items-center">
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-600" /> Courier & Tracking</span>
                {(trackingForm.awb || o.shippingAddress?.trackingNumber) && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              </h3>

              <div className="space-y-2.5 mt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Partner</label>
                  <select
                    value={trackingForm.carrier}
                    onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {COURIER_PARTNERS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">AWB / Tracking Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 14123456789"
                      value={trackingForm.awb}
                      onChange={(e) => setTrackingForm({ ...trackingForm, awb: e.target.value })}
                      className="flex-1 min-w-0 px-3 py-2 bg-zinc-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const cleanAwb = (trackingForm.awb || '').trim();
                        if (!cleanAwb) {
                          addToast('Please enter an AWB number first', 'error');
                          return;
                        }
                        const carrierObj = COURIER_PARTNERS.find(p => p.id === trackingForm.carrier) || { name: trackingForm.carrier };
                        const generatedUrl = generateTrackingUrl(trackingForm.carrier, cleanAwb, trackingForm.customUrl);
                        const isExchange = o.returnRequest?.type === 'EXCHANGE';
                        const newStatus = (o.status === 'CANCELLED' || o.status === 'REFUNDED') ? o.status : 'SHIPPED';
                        const shipNote = isExchange ? `Replacement outfit shipped via ${carrierObj.name} (AWB: ${cleanAwb})` : `Shipped via ${carrierObj.name} (AWB: ${cleanAwb})`;

                        const trackingPatch = {
                          shippingAddress: {
                            ...(o.shippingAddress || {}),
                            trackingNumber: cleanAwb,
                            trackingId: cleanAwb,
                            carrier: carrierObj.name,
                            trackingUrl: generatedUrl
                          }
                        };
                        const orderWithTracking = {
                          ...o,
                          shippingAddress: {
                            ...(o.shippingAddress || {}),
                            ...trackingPatch.shippingAddress
                          }
                        };
                        handleUpdateOrderStatus(orderWithTracking, newStatus, shipNote, trackingPatch);
                      }}
                      className="px-3.5 py-2 bg-primary-dark text-white text-xs font-bold rounded-lg hover:bg-primary-hover whitespace-nowrap shrink-0 shadow-sm"
                    >
                      Save & Ship
                    </button>
                  </div>
                </div>

                {/* Live Link Preview Button */}
                {trackingForm.awb && (
                  <div className="pt-1 flex items-center justify-between text-xs bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-blue-700 font-bold truncate max-w-[170px]">
                      {generateTrackingUrl(trackingForm.carrier, trackingForm.awb, trackingForm.customUrl)}
                    </span>
                    <a
                      href={generateTrackingUrl(trackingForm.carrier, trackingForm.awb, trackingForm.customUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-blue-700 hover:text-blue-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-blue-200"
                    >
                      Test Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Mark as Delivered Button */}
              {(o.shippingAddress?.trackingNumber || o.trackingId) && o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REFUNDED' && (
                <button
                  onClick={() => handleUpdateOrderStatus(o, 'DELIVERED', oHasCompletedExchange || o.returnRequest?.type === 'EXCHANGE' ? 'Exchange replacement delivered via Admin' : 'Marked delivered via Admin')}
                  className={`w-full mt-3 px-3 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    o.returnRequest?.type === 'EXCHANGE'
                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300'
                      : 'bg-green-500/15 text-green-700 hover:bg-green-500/25'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {o.returnRequest?.type === 'EXCHANGE' ? 'Mark Replacement Delivered 🎁' : 'Mark as Delivered'}
                </button>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all p-4 sm:p-6">
              <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Tags</h2>
              <input type="text" placeholder="Add a tag and press Enter..." onKeyDown={handleTagAdd} className="w-full px-3 py-2 bg-zinc-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 mb-2" />
              <div className="flex flex-wrap gap-2">
                {o.tags?.map(t => <span key={t} className="px-2 py-1 bg-zinc-100 rounded text-xs font-bold text-text-muted">{t}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200 shrink-0 bg-white">
                <h2 className="text-lg sm:text-xl font-bold text-text-dark">Edit Order Details</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5 text-text-muted" /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-text-muted mb-1">Customer Name</label>
                  <input required type="text" value={editFormData.name || ''} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-text-muted mb-1">Address</label>
                  <input required type="text" value={editFormData.line1 || ''} onChange={e => setEditFormData({ ...editFormData, line1: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-text-muted mb-1">City</label>
                    <input required type="text" value={editFormData.city || ''} onChange={e => setEditFormData({ ...editFormData, city: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-text-muted mb-1">State</label>
                    <input required type="text" value={editFormData.state || ''} onChange={e => setEditFormData({ ...editFormData, state: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-text-muted mb-1">Pincode</label>
                  <input required type="text" value={editFormData.postalCode || ''} onChange={e => setEditFormData({ ...editFormData, postalCode: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-slate-200 text-text-dark font-bold rounded-xl hover:bg-zinc-50 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-primary-dark text-white font-bold rounded-xl hover:bg-primary-hover text-sm">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 p-5 sm:p-6 text-center">
              <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-text-dark mb-2">Process Refund?</h2>
              <p className="text-xs sm:text-sm text-text-muted mb-6">Are you sure you want to refund this order? This action cannot be undone and will mark the order as cancelled.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowRefundModal(false)} className="flex-1 py-2.5 border border-slate-200 text-text-dark font-bold rounded-xl hover:bg-zinc-50 text-sm">Cancel</button>
                <button onClick={executeRefund} className="flex-1 py-2.5 bg-error text-white font-bold rounded-xl hover:bg-red-600 text-sm">Refund</button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Summary Metrics
  const allOrders = data?.data || [];
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter(o => o.status === 'PROCESSING' || o.status === 'PENDING').length;
  const shippedOrders = allOrders.filter(o => o.status === 'SHIPPED').length;
  const deliveredOrders = allOrders.filter(o => o.status === 'DELIVERED').length;
  const cancelledOrders = allOrders.filter(o => o.status === 'CANCELLED').length;
  const returnRequests = allOrders.filter(o => {
    if (o.status === 'RETURN_REQUESTED' || o.status === 'EXCHANGE_REQUESTED') return true;
    if (o.returnRequest) {
      const reqStatus = (o.returnRequest.status || '').toUpperCase();
      if (reqStatus === 'COMPLETED') return false;
      if (['RETURN_APPROVED', 'EXCHANGE_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REJECTED', 'SHIPPED', 'REFUNDED', 'CANCELLED'].includes(o.status)) return false;
      return true;
    }
    return false;
  }).length;
  const totalRevenue = allOrders
    .filter(o => !['CANCELLED', 'REFUNDED'].includes(o.status))
    .reduce((sum, o) => sum + parseNumericAmount(o.total || 0), 0);

  // LIST VIEW
  return (
    <div className="w-full animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Operations</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-dark mt-0.5">Orders</h1>
          <p className="text-xs text-text-muted mt-1">Lifecycle, fulfillment, and returns</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-text-dark font-bold rounded-xl shadow-sm hover:bg-zinc-50 transition-colors w-full sm:w-auto text-sm">
          <FileText className="w-4 h-4 shrink-0" />
          Export CSV
        </button>
      </div>

      {/* Summary Metrics Cards - Responsive Touch-Friendly Horizontal Scroll */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 md:gap-4 mb-6 md:mb-8 pb-2 snap-x snap-mandatory">
        <button onClick={() => setActiveTab('all')} className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] flex-1 snap-start text-left bg-white border border-slate-100 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 sm:mb-2 group-hover:text-blue-600">Total Orders</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-text-dark">{totalOrders}</p>
        </button>
        <Link to="/admin/financials" className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] flex-1 snap-start text-left block bg-white border border-slate-100 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 sm:mb-2 group-hover:text-blue-600">Total Revenue</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{formatCompactCurrency(totalRevenue)}</p>
        </Link>
        <button onClick={() => setActiveTab('PROCESSING')} className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] flex-1 snap-start text-left bg-white border border-slate-100 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:border-warning hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 sm:mb-2 group-hover:text-warning-dark">Processing</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-warning-dark">{pendingOrders}</p>
        </button>
        <button onClick={() => setActiveTab('SHIPPED')} className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] flex-1 snap-start text-left bg-white border border-slate-100 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:border-info hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 sm:mb-2 group-hover:text-info-dark">Shipped</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-info-dark">{shippedOrders}</p>
        </button>
        <button onClick={() => setActiveTab('DELIVERED')} className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] flex-1 snap-start text-left bg-white border border-slate-100 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:border-success hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 sm:mb-2 group-hover:text-success-dark">Delivered</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-success-dark">{deliveredOrders}</p>
        </button>
        <button onClick={() => setActiveTab('RETURNS')} className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] flex-1 snap-start text-left bg-white border border-amber-200 bg-amber-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          {returnRequests > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse m-3 sm:m-4"></span>}
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5 sm:mb-2 group-hover:text-amber-900">Returns</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900">{returnRequests}</p>
        </button>
        <button onClick={() => setActiveTab('CANCELLED')} className="min-w-[150px] sm:min-w-[180px] md:min-w-[200px] flex-1 snap-start text-left bg-white border border-slate-100 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:border-error hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 sm:mb-2 group-hover:text-error">Cancelled</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-error">{cancelledOrders}</p>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6">
        <div className="w-full overflow-hidden">
          <div className="flex overflow-x-auto w-full hide-scrollbar gap-1.5 sm:gap-2 pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'PROCESSING', label: 'Processing' },
              { id: 'CONFIRMED', label: 'Confirmed' },
              { id: 'PACKED', label: 'Packed' },
              { id: 'SHIPPED', label: 'Shipped' },
              { id: 'DELIVERED', label: 'Delivered' },
              { id: 'RETURNS', label: 'Returns & Exchanges' },
              { id: 'CANCELLED', label: 'Cancelled' },
              { id: 'ON_HOLD', label: 'On Hold' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 ${activeTab === tab.id
                  ? 'bg-white border border-slate-200 shadow-sm text-text-dark'
                  : 'text-text-muted hover:text-text-primary hover:bg-zinc-100/50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-between items-stretch sm:items-center bg-zinc-50/50 p-3 sm:p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            <select
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs sm:text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs sm:text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search orders, names, tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-600 text-xs sm:text-sm transition-colors shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* MOBILE / SMALL TABLET VIEW (< md) - Card Based */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-zinc-400 font-semibold text-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-text-muted">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-text-dark">No orders found</p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleOpenDetail(order)}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition-all cursor-pointer space-y-3"
            >
              {/* Order top line: ID and Total */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="min-w-0">
                  <span className="font-extrabold text-blue-600 text-sm block truncate">
                    {order.orderNumber || order.id.slice(0, 8)}
                  </span>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {formatDate(order.createdAt, true)} • {order.items?.length || 0} items
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-text-dark text-base">{formatCurrency(order.total)}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider mt-0.5 ${order.paymentStatus === 'paid' ? 'bg-green-500/15 text-green-700' : 'bg-orange-500/15 text-orange-700'
                    }`}>
                    {order.paymentStatus === 'paid' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer info & link */}
              <div className="flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="font-bold text-text-dark block truncate">{order.shippingAddress?.name || 'Guest'}</span>
                  <span className="text-[11px] text-text-muted block truncate">
                    {order.shippingAddress?.city || order.shippingAddress?.line1 || order.shippingAddress?.address || 'Unknown'}
                  </span>
                </div>
                <span className="text-blue-600 text-xs font-bold flex items-center gap-0.5 shrink-0">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Actions & Lifecycle Status */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status:</span>
                {renderStatusControls(order, true)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* TABLET / DESKTOP VIEW (>= md) - Comprehensive Table with Scroll */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden">
        <div className="overflow-x-auto min-h-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-zinc-400 font-semibold">Loading orders...</div>
          ) : (
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500 bg-zinc-50/50">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Order</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium">Customer</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium whitespace-nowrap">Payment</th>
                  <th className="px-5 py-3.5 font-medium whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-text-muted">
                      <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="font-bold text-text-dark">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} onClick={() => handleOpenDetail(order)} className="hover:bg-zinc-50/60 transition-colors cursor-pointer group">
                      <td className="px-5 py-4">
                        <p className="font-bold text-text-dark group-hover:text-blue-600 transition-colors">{order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className="text-xs text-text-muted mt-0.5">{order.items?.length || 0} items</p>
                      </td>
                      <td className="px-5 py-4 text-text-muted font-medium whitespace-nowrap text-xs">
                        {formatDate(order.createdAt, true)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-text-dark text-sm">{order.shippingAddress?.name || 'Guest'}</p>
                        <p className="text-xs text-text-muted truncate max-w-[180px]">{order.shippingAddress?.city || order.shippingAddress?.line1 || order.shippingAddress?.address || 'Unknown'}</p>
                      </td>
                      <td className="px-5 py-4">
                        {renderStatusControls(order, false)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'bg-green-500/15 text-green-700' : 'bg-orange-500/15 text-orange-700'
                          }`}>
                          {order.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-text-dark whitespace-nowrap">{formatCurrency(order.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Responsive Pagination Controls Bar */}
      {totalOrdersCount > 0 && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-xs">
          {/* Left: Item range */}
          <div className="text-xs text-text-muted font-medium text-center sm:text-left">
            Showing <span className="font-bold text-text-dark">{startIndex}</span> to <span className="font-bold text-text-dark">{endIndex}</span> of <span className="font-bold text-text-dark">{totalOrdersCount}</span> orders
          </div>

          {/* Center: Page numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-text-dark hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {(() => {
              const pages = [];
              const maxButtons = 5;
              let start = Math.max(1, safeCurrentPage - 2);
              let end = Math.min(totalPages, start + maxButtons - 1);
              if (end - start < maxButtons - 1) {
                start = Math.max(1, end - maxButtons + 1);
              }

              if (start > 1) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border border-slate-200 bg-white text-text-dark hover:bg-zinc-50"
                  >
                    1
                  </button>
                );
                if (start > 2) {
                  pages.push(<span key="dots-start" className="px-1 text-zinc-400 text-xs font-bold">...</span>);
                }
              }

              for (let p = start; p <= end; p++) {
                pages.push(
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      safeCurrentPage === p
                        ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                        : 'border border-slate-200 bg-white text-text-dark hover:bg-zinc-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              }

              if (end < totalPages) {
                if (end < totalPages - 1) {
                  pages.push(<span key="dots-end" className="px-1 text-zinc-400 text-xs font-bold">...</span>);
                }
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border border-slate-200 bg-white text-text-dark hover:bg-zinc-50"
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-text-dark hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Per page select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium whitespace-nowrap">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}


