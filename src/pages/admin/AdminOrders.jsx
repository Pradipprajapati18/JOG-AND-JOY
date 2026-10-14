import React, { useState, useEffect } from 'react';
import { Search, X, CreditCard, Package, AlertCircle, ArrowLeft, MoreHorizontal, ShieldAlert, FileText, CheckCircle2, RefreshCw, RotateCcw } from 'lucide-react';
import { useOrdersList, useUpdateOrder } from '../../queries/useOrders';
import { useQueryClient } from '@tanstack/react-query';
import { useSettingsContext } from '../../context/SettingsContext';
import { useUIContext } from '../../context/UIContext';
import { restockOrderItems } from '../../utils/inventory';

import { useSearchParams, Link } from 'react-router-dom';
import { getColorName, formatColorName, formatColorHex } from '../../utils/helpers';

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
  if (['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'ON_HOLD', 'RETURNS'].includes(activeTab)) {
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
        const q = filters.search.toLowerCase();
        const searchStr = `${o.orderNumber || ''} ${o.id || ''} ${o.shippingAddress?.name || ''} ${o.shippingAddress?.email || ''} ${o.shippingAddress?.phone || ''} ${o.shippingAddress?.trackingNumber || ''}`.toLowerCase();
        if (!searchStr.includes(q)) matches = false;
      }
      if (filters.returns && !['RETURN_REQUESTED', 'EXCHANGE_REQUESTED', 'RETURN_APPROVED', 'EXCHANGE_APPROVED', 'RETURN_REJECTED'].includes(o.status)) {
        matches = false;
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
        o.total || 0
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

  const handleStatusChange = (newStatus) => {
    if (selectedOrder) {
      const historyEntry = { status: newStatus, timestamp: new Date().toISOString(), note: 'Status updated by admin' };
      
      const patchData = { 
        status: newStatus,
        statusHistory: [...(selectedOrder.statusHistory || []), historyEntry]
      };

      // Auto-sync payment status based on the new lifecycle state
      if (newStatus === 'DELIVERED') {
        patchData.paymentStatus = 'paid';
      } else if (newStatus === 'RETURN_APPROVED' || newStatus === 'REFUNDED') {
        patchData.paymentStatus = 'refunded';
      } else if (newStatus === 'CANCELLED') {
        patchData.paymentStatus = selectedOrder.paymentStatus === 'paid' ? 'refunded' : 'cancelled';
      }

      // Automatically restock items if order is cancelled or return is approved
      let didRestock = false;
      if ((newStatus === 'CANCELLED' || newStatus === 'RETURN_APPROVED') && !selectedOrder.isRestocked) {
        patchData.isRestocked = true;
        patchData.restockedAt = new Date().toISOString();
        restockOrderItems(selectedOrder, queryClient);
        didRestock = true;
      }
      
      updateMut.mutate({ 
        id: selectedOrder.id, 
        patch: patchData 
      }, {
        onSuccess: (updated) => {
          setSelectedOrder(prev => (prev ? { ...prev, ...updated } : updated));
          setIsMenuOpen(false);
          const restockMsg = didRestock ? ' & items restocked into inventory' : '';
          addToast(`Order marked as ${newStatus.replace('_', ' ')}${restockMsg}!`, 'success');
        }
      });
    }
  };

  const handleQuickStatusChange = (orderToUpdate, newStatus) => {
    if (!orderToUpdate) return;
    if (newStatus === 'SHIPPED' && !orderToUpdate.shippingAddress?.trackingNumber) {
      addToast('Please open order details and add a tracking number first', 'error');
      return;
    }

    const isApproval = newStatus.includes('APPROVED');
    const isRejection = newStatus === 'RETURN_REJECTED';
    const note = isApproval 
      ? `Request approved by admin via orders table (${newStatus})` 
      : isRejection 
      ? 'Return/Exchange request rejected by admin' 
      : `Status changed to ${newStatus} by admin via orders table`;

    const historyEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note
    };

    const patchData = {
      status: newStatus,
      statusHistory: [...(orderToUpdate.statusHistory || []), historyEntry]
    };

    if (newStatus === 'DELIVERED') {
      patchData.paymentStatus = 'paid';
    } else if (newStatus === 'RETURN_APPROVED' || newStatus === 'REFUNDED') {
      patchData.paymentStatus = 'refunded';
    } else if (newStatus === 'CANCELLED') {
      patchData.paymentStatus = orderToUpdate.paymentStatus === 'paid' ? 'refunded' : 'cancelled';
    }

    // Automatically restock items if order is cancelled or return is approved
    let didRestock = false;
    if ((newStatus === 'CANCELLED' || newStatus === 'RETURN_APPROVED') && !orderToUpdate.isRestocked) {
      patchData.isRestocked = true;
      patchData.restockedAt = new Date().toISOString();
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
        const restockMsg = didRestock ? ' & items restocked' : '';
        addToast(`Order ${orderToUpdate.orderNumber || orderToUpdate.id.slice(0, 8)} updated to ${newStatus.replace('_', ' ')}${restockMsg}!`, 'success');
      }
    });
  };

  const handlePrintPackingSlip = () => {
    if (!selectedOrder) return;
    window.open(`/invoice/${selectedOrder.id}?type=packing_slip`, '_blank');
  };

  const executeRefund = () => {
    if (selectedOrder) {
      const historyEntry = { status: 'REFUNDED', timestamp: new Date().toISOString(), note: 'Order refunded by admin' };
      const patchData = {
        paymentStatus: 'refunded',
        status: 'REFUNDED',
        statusHistory: [...(selectedOrder.statusHistory || []), historyEntry]
      };
      if (!selectedOrder.isRestocked) {
        patchData.isRestocked = true;
        patchData.restockedAt = new Date().toISOString();
        restockOrderItems(selectedOrder, queryClient);
      }
      updateMut.mutate({
        id: selectedOrder.id,
        patch: patchData
      }, {
        onSuccess: (updated) => {
          setSelectedOrder(prev => (prev ? { ...prev, ...updated } : updated));
          setShowRefundModal(false);
          addToast('Order refunded and items restocked successfully', 'success');
        }
      });
    }
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

  if (view === 'detail' && selectedOrder) {
    const o = selectedOrder;
    return (
      <div className="w-full max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => {
            if (searchParams.has('orderId')) {
              searchParams.delete('orderId');
              setSearchParams(searchParams);
            }
            setView('list');
          }} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-zinc-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-text-dark">{o.orderNumber || o.id}</h1>
              <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${
                o.status === 'DELIVERED' ? 'bg-green-500/15 text-green-700' : 
                o.status === 'SHIPPED' ? 'bg-blue-500/15 text-blue-700' : 
                ['CANCELLED', 'RETURN_REJECTED'].includes(o.status) ? 'bg-red-500/10 text-red-700' : 
                ['ON_HOLD', 'RETURN_REQUESTED', 'EXCHANGE_REQUESTED'].includes(o.status) ? 'bg-orange-500/15 text-orange-700' : 
                ['RETURN_APPROVED', 'EXCHANGE_APPROVED'].includes(o.status) ? 'bg-purple-100 text-purple-700' :
                'bg-zinc-200 text-zinc-600'
              }`}>
                {o.status.replace('_', ' ')}
              </span>
              <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${
                o.paymentStatus === 'paid' ? 'bg-green-500/15 text-green-700' : 'bg-orange-500/15 text-orange-700'
              }`}>
                {o.paymentStatus}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-1">{formatDate(o.createdAt, true)} from {o.channel?.replace('_', ' ')}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowRefundModal(true)} className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-zinc-50">Refund</button>
            <button 
              onClick={() => {
                setEditFormData(o.shippingAddress || {});
                setShowEditModal(true);
              }} 
              className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-zinc-50"
            >
              Edit
            </button>
            <div className="flex gap-2">
              <button onClick={handlePrintPackingSlip} className="px-4 py-2 bg-white border border-slate-200 text-text-dark font-bold rounded-xl shadow-sm hover:bg-zinc-50 transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Print Packing Slip
              </button>
              {!['CANCELLED', 'REFUNDED', 'RETURN_REJECTED'].includes(o.status) && (
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="p-2 bg-primary-dark text-white rounded-xl shadow-sm hover:bg-primary-hover"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20">
                        <div className="p-1">
                          {['PROCESSING', 'SHIPPED', 'DELIVERED', 'ON_HOLD', 'EXCHANGE_APPROVED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'CANCELLED', 'REFUNDED'].filter(st => {
                            if (st === o.status) return false;
                            if (o.status === 'PROCESSING') return ['SHIPPED', 'DELIVERED', 'ON_HOLD', 'CANCELLED'].includes(st);
                            if (o.status === 'ON_HOLD') return ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(st);
                            if (o.status === 'SHIPPED') return ['DELIVERED', 'CANCELLED'].includes(st);
                            if (o.status === 'EXCHANGE_REQUESTED') return ['EXCHANGE_APPROVED', 'RETURN_REJECTED', 'CANCELLED'].includes(st);
                            if (o.status === 'RETURN_REQUESTED') return ['RETURN_APPROVED', 'RETURN_REJECTED', 'CANCELLED'].includes(st);
                            if (o.status === 'EXCHANGE_APPROVED') return ['SHIPPED', 'DELIVERED'].includes(st);
                            if (o.status === 'RETURN_APPROVED') return ['REFUNDED'].includes(st);
                            if (o.status === 'DELIVERED') return ['SHIPPED', 'EXCHANGE_APPROVED', 'RETURN_APPROVED', 'CANCELLED'].includes(st);
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Return / Exchange Request Banner */}
            {o.returnRequest && (
              <div className={`border rounded-2xl p-5 ${
                o.status === 'RETURN_REQUESTED' || o.status === 'EXCHANGE_REQUESTED' 
                  ? 'bg-amber-50 border-amber-200'
                  : o.status.includes('APPROVED')
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
                      <ShieldAlert className={`w-5 h-5 ${o.status.includes('REQUESTED') ? 'text-amber-600' : o.status.includes('APPROVED') ? 'text-emerald-600' : 'text-slate-500'}`} />
                      {o.returnRequest.type === 'RETURN' ? 'Return & Refund' : 'Product Exchange'} Request
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        o.status.includes('REQUESTED') ? 'bg-amber-200 text-amber-800' :
                        o.status.includes('APPROVED') ? 'bg-emerald-200 text-emerald-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </h2>

                    <p className="text-sm font-bold text-slate-700">Reason: <span className="text-slate-900 font-medium">{o.returnRequest.reason}</span></p>
                    
                    {o.returnRequest.comments && (
                      <p className="text-sm text-slate-600 italic">"{o.returnRequest.comments}"</p>
                    )}

                    {/* Exchange Item Details */}
                    {o.returnRequest.type === 'EXCHANGE' && o.returnRequest.exchangeItem && (
                      <div className="mt-3 p-3 bg-white border border-amber-200 rounded-xl flex items-center gap-4">
                        {o.returnRequest.exchangeItem.image && (
                          <img src={o.returnRequest.exchangeItem.image} alt={o.returnRequest.exchangeItem.title} className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                        )}
                        <div>
                          <p className="text-[10px] font-black uppercase text-amber-700">Requested Replacement</p>
                          <p className="font-bold text-slate-800 text-sm">{o.returnRequest.exchangeItem.title}</p>
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

                            if (diff === 0) {
                              return (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                                  <span>Equal Value Exchange (Price Difference: ₹0)</span>
                                </div>
                              );
                            } else if (diff > 0) {
                              return (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                                  <span>Balance Due from Customer: +₹{diff}</span>
                                  <span className="text-[10px] text-amber-700 font-normal">(Collect via COD / Payment Link)</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                                  <span>Refund Due to Customer: ₹{Math.abs(diff)}</span>
                                  <span className="text-[10px] text-blue-700 font-normal">(Credit / UPI Refund)</span>
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
                  {(o.status === 'RETURN_REQUESTED' || o.status === 'EXCHANGE_REQUESTED') && (
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                      <button 
                        onClick={() => handleStatusChange(o.returnRequest.type === 'RETURN' ? 'RETURN_APPROVED' : 'EXCHANGE_APPROVED')}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Approve {o.returnRequest.type}
                      </button>
                      <button 
                        onClick={() => handleStatusChange('RETURN_REJECTED')}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-50 transition-colors"
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden p-6">
              <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Ordered Items ({o.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {o.items?.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-zinc-50 border border-slate-200 rounded-xl items-center">
                    {item.image ? (
                      <img src={item.image} alt={item.titleSnapshot} className="w-12 h-12 rounded-lg border border-slate-200 object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex shrink-0 items-center justify-center text-xs font-bold text-zinc-300">IMG</div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-text-dark">{item.titleSnapshot}</p>
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
                      <p className="text-xs text-text-muted font-mono mt-0.5">{formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-dark">x{item.quantity}</p>
                      <p className="text-sm font-bold mt-0.5">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all p-6">
              <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" /> Payment
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-muted"><p>Method</p><p className="uppercase font-bold">{o.paymentMethod || 'Online'}</p></div>
                <div className="flex justify-between text-text-muted"><p>Subtotal</p><p>{formatCurrency(o.subtotal)}</p></div>
                {o.discountAmount > 0 && <div className="flex justify-between text-text-muted"><p>Discount ({o.promotionCodeApplied})</p><p>-{formatCurrency(o.discountAmount)}</p></div>}
                <div className="flex justify-between text-text-muted"><p>Shipping</p><p>{formatCurrency(o.shippingCost)}</p></div>
                <div className="flex justify-between text-text-muted"><p>Tax</p><p>{formatCurrency(o.tax)}</p></div>
                <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold text-lg text-text-dark">
                  <p>Total</p><p>{formatCurrency(o.total)}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all p-6">
              <h2 className="text-lg font-bold text-text-dark mb-4">Timeline</h2>
              <div className="space-y-4">
                {o.statusHistory?.map((evt, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-dark">{evt.note || `Status changed to ${evt.status}`}</p>
                      <p className="text-xs text-text-muted">{formatDate(evt.timestamp, true)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all p-6">
              <h2 className="text-lg font-bold text-text-dark mb-4">Customer</h2>
              <p className="font-bold text-text-dark">{o.shippingAddress?.name || 'Customer'}</p>
              <p className="text-sm text-text-muted">0 orders</p>
              
              <hr className="border-slate-200 my-4" />
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Contact</h3>
              <p className="text-sm text-text-dark font-medium cursor-pointer hover:underline">{o.shippingAddress?.email || 'No Email Provided'}</p>
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
                    <br/>
                    {o.shippingAddress.city || ''}{o.shippingAddress.city && o.shippingAddress.state ? ', ' : ''}{o.shippingAddress.state || ''} {o.shippingAddress.postalCode || ''}
                  </>
                )}
                {o.shippingAddress?.country && <><br/>{o.shippingAddress.country}</>}
              </p>
              
              <hr className="border-slate-200 my-4" />
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between items-center">
                Tracking Information
                {o.shippingAddress?.trackingNumber && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
              </h3>
              <div className="flex gap-2 mt-2">
                <input 
                  id="tracking-input"
                  type="text" 
                  placeholder="Enter tracking number..."
                  defaultValue={o.shippingAddress?.trackingNumber || ''}
                  className="w-full px-3 py-2 bg-zinc-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button 
                  onClick={() => {
                    const val = document.getElementById('tracking-input').value;
                    if (val !== o.shippingAddress?.trackingNumber) {
                      const newShippingAddress = { ...(o.shippingAddress || {}), trackingNumber: val };
                      const newStatus = val && o.status === 'PROCESSING' ? 'SHIPPED' : o.status;
                      const historyEntry = { status: newStatus, timestamp: new Date().toISOString(), note: 'Tracking added via Admin' };
                      updateMut.mutate({ 
                        id: o.id, 
                        patch: { 
                          shippingAddress: newShippingAddress, 
                          ...(val && o.status === 'PROCESSING' ? { status: 'SHIPPED', statusHistory: [...(o.statusHistory || []), historyEntry] } : {}) 
                        } 
                      }, {
                        onSuccess: (updated) => {
                          setSelectedOrder(updated);
                          addToast('Tracking saved & order updated!', 'success');
                        }
                      });
                    }
                  }}
                  className="px-3 py-2 bg-primary-dark text-white text-sm font-bold rounded-lg hover:bg-primary-hover whitespace-nowrap"
                >
                  Save
                </button>
              </div>
              {o.shippingAddress?.trackingNumber && o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REFUNDED' && (
                <button 
                  onClick={() => {
                    const historyEntry = { status: 'DELIVERED', timestamp: new Date().toISOString(), note: 'Marked delivered via Admin' };
                    updateMut.mutate({ id: o.id, patch: { status: 'DELIVERED', statusHistory: [...(o.statusHistory || []), historyEntry] } }, {
                      onSuccess: (updated) => {
                        setSelectedOrder(updated);
                        addToast('Order marked as Delivered!', 'success');
                      }
                    });
                  }}
                  className="w-full mt-3 px-3 py-2 bg-green-500/15 text-green-700 text-sm font-bold rounded-lg hover:bg-green-500/25 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Delivered
                </button>
              )}
            </div>

            {/* Tags & Risk */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all p-6">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-text-dark">Edit Order Details</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5 text-text-muted" /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-1">Customer Name</label>
                  <input required type="text" value={editFormData.name || ''} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-1">Address</label>
                  <input required type="text" value={editFormData.line1 || ''} onChange={e => setEditFormData({...editFormData, line1: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-1">City</label>
                    <input required type="text" value={editFormData.city || ''} onChange={e => setEditFormData({...editFormData, city: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-1">State</label>
                    <input required type="text" value={editFormData.state || ''} onChange={e => setEditFormData({...editFormData, state: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-1">Pincode</label>
                  <input required type="text" value={editFormData.postalCode || ''} onChange={e => setEditFormData({...editFormData, postalCode: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-slate-200 text-text-dark font-bold rounded-xl hover:bg-zinc-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-primary-dark text-white font-bold rounded-xl hover:bg-primary-hover">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 p-6 text-center">
              <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-text-dark mb-2">Process Refund?</h2>
              <p className="text-sm text-text-muted mb-6">Are you sure you want to refund this order? This action cannot be undone and will mark the order as cancelled.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowRefundModal(false)} className="flex-1 py-2.5 border border-slate-200 text-text-dark font-bold rounded-xl hover:bg-zinc-50">Cancel</button>
                <button onClick={executeRefund} className="flex-1 py-2.5 bg-error text-white font-bold rounded-xl hover:bg-red-600">Refund</button>
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
  const returnRequests = allOrders.filter(o => o.status === 'RETURN_REQUESTED' || o.status === 'EXCHANGE_REQUESTED').length;
  const totalRevenue = allOrders
    .filter(o => !['CANCELLED', 'REFUNDED', 'RETURN_APPROVED'].includes(o.status))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // LIST VIEW
  return (
    <div className="w-full animate-in fade-in duration-300 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Operations</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark mt-0.5">Orders</h1>
          <p className="text-xs text-text-muted mt-1">Lifecycle, fulfillment, and returns</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-text-dark font-bold rounded-xl shadow-sm hover:bg-zinc-50 transition-colors">
          <FileText className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex overflow-x-auto hide-scrollbar gap-4 mb-8 pb-2">
        <button onClick={() => setActiveTab('all')} className="min-w-[200px] text-left bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-blue-600">Total Orders</p>
          <p className="text-3xl font-extrabold text-text-dark">{totalOrders}</p>
        </button>
        <Link to="/admin/financials" className="min-w-[200px] text-left block bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-blue-600">Total Revenue</p>
          <p className="text-3xl font-extrabold text-blue-600">{formatCompactCurrency(totalRevenue)}</p>
        </Link>
        <button onClick={() => setActiveTab('PROCESSING')} className="min-w-[200px] text-left bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:border-warning hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-warning-dark">Processing</p>
          <p className="text-3xl font-extrabold text-warning-dark">{pendingOrders}</p>
        </button>
        <button onClick={() => setActiveTab('SHIPPED')} className="min-w-[200px] text-left bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:border-info hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-info-dark">Shipped</p>
          <p className="text-3xl font-extrabold text-info-dark">{shippedOrders}</p>
        </button>
        <button onClick={() => setActiveTab('DELIVERED')} className="min-w-[200px] text-left bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:border-success hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-success-dark">Delivered</p>
          <p className="text-3xl font-extrabold text-success-dark">{deliveredOrders}</p>
        </button>
        <button onClick={() => setActiveTab('RETURNS')} className="min-w-[200px] text-left bg-white border border-amber-200 bg-amber-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          {returnRequests > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse m-4"></span>}
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2 group-hover:text-amber-900">Returns</p>
          <p className="text-3xl font-extrabold text-amber-900">{returnRequests}</p>
        </button>
        <button onClick={() => setActiveTab('CANCELLED')} className="min-w-[200px] text-left bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:border-error hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-error">Cancelled</p>
          <p className="text-3xl font-extrabold text-error">{cancelledOrders}</p>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1 overflow-hidden w-full">
            <div className="flex overflow-x-auto w-full hide-scrollbar gap-2 pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'PROCESSING', label: 'Processing' },
                { id: 'SHIPPED', label: 'Shipped' },
                { id: 'DELIVERED', label: 'Delivered' },
                { id: 'RETURNS', label: 'Returns & Exchanges' },
                { id: 'CANCELLED', label: 'Cancelled' },
                { id: 'ON_HOLD', label: 'On Hold' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white border border-slate-200 shadow-sm text-text-dark' 
                      : 'text-text-muted hover:text-text-primary hover:bg-zinc-100/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-center bg-zinc-50/50 p-4 rounded-xl border border-slate-200">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
            <select 
              value={filterPayment} 
              onChange={e => setFilterPayment(e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <select 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
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
              placeholder="Search orders..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-600 text-sm transition-colors shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden">
        <div className="overflow-x-auto min-h-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-zinc-400 font-semibold">Loading orders...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Payment</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Total</th>
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
                  orders.map((order) => (
                    <tr key={order.id} onClick={() => handleOpenDetail(order)} className="hover:bg-zinc-50/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-text-dark group-hover:text-blue-600 transition-colors">{order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className="text-xs text-text-muted mt-0.5">{order.items?.length || 0} items</p>
                      </td>
                      <td className="px-6 py-4 text-text-muted font-medium">
                        {formatDate(order.createdAt, true)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-text-dark">{order.shippingAddress?.name || 'Guest'}</p>
                        <p className="text-xs text-text-muted">{order.shippingAddress?.city || order.shippingAddress?.line1 || order.shippingAddress?.address || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {/* 1. Return Requested: badge + Approve Return + Reject */}
                        {order.status === 'RETURN_REQUESTED' && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-800 border border-amber-300">
                              <RotateCcw className="w-3 h-3 text-amber-600" />
                              Return Req.
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleQuickStatusChange(order, 'RETURN_APPROVED')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded shadow-sm transition-colors whitespace-nowrap"
                                title="Approve Return Request"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleQuickStatusChange(order, 'RETURN_REJECTED')}
                                className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded border border-rose-200 transition-colors"
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 2. Exchange Requested: badge + Approve Exchange + Reject */}
                        {order.status === 'EXCHANGE_REQUESTED' && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-800 border border-amber-300">
                              <RefreshCw className="w-3 h-3 text-amber-600" />
                              Exchange Req.
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleQuickStatusChange(order, 'EXCHANGE_APPROVED')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase rounded shadow-sm transition-colors whitespace-nowrap"
                                title="Approve Exchange Request"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleQuickStatusChange(order, 'RETURN_REJECTED')}
                                className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded border border-rose-200 transition-colors"
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. Return Approved */}
                        {order.status === 'RETURN_APPROVED' && (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Return Approved
                            </span>
                          </div>
                        )}

                        {/* 4. Exchange Approved: badge + Ship Replacement */}
                        {order.status === 'EXCHANGE_APPROVED' && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-800 border border-purple-300">
                              <CheckCircle2 className="w-3 h-3 text-purple-600" />
                              Exchange Approved
                            </span>
                            <button
                              onClick={() => handleQuickStatusChange(order, 'SHIPPED')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded shadow-sm transition-colors whitespace-nowrap"
                              title="Mark Replacement Package Shipped"
                            >
                              Ship Replacement
                            </button>
                          </div>
                        )}

                        {/* 5. Return / Exchange Rejected */}
                        {order.status === 'RETURN_REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-700 border border-rose-200">
                            <X className="w-3 h-3" />
                            Rejected
                          </span>
                        )}

                        {/* 6. Delivered, Cancelled, Refunded */}
                        {['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            order.status === 'DELIVERED' ? 'bg-green-500/15 text-green-700' : 'bg-red-500/10 text-red-700'
                          }`}>
                            {order.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                            {order.status}
                          </span>
                        )}

                        {/* 7. In-flight Standard statuses (PROCESSING, ON_HOLD, SHIPPED) */}
                        {['PROCESSING', 'ON_HOLD', 'SHIPPED'].includes(order.status) && (
                          <div className="relative inline-block">
                            <select
                              value={order.status || 'PROCESSING'}
                              onChange={(e) => handleQuickStatusChange(order, e.target.value)}
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider cursor-pointer border-none outline-none focus:ring-2 focus:ring-blue-600/50 pr-6 ${
                                order.status === 'SHIPPED' ? 'bg-blue-500/15 text-blue-700' : 'bg-orange-500/15 text-orange-700'
                              }`}
                            >
                              <option value="PROCESSING">Processing</option>
                              <option value="ON_HOLD">On Hold</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
                              <svg className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                          order.paymentStatus === 'paid' ? 'bg-green-500/15 text-green-700' : 'bg-orange-500/15 text-orange-700'
                        }`}>
                          {order.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-dark">{formatCurrency(order.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
