import React, { useState } from 'react';
import { Star, Check, X, Search, MessageSquare, AlertTriangle, ShieldBan, Image as ImageIcon } from 'lucide-react';
import { useReviewsList, useUpdateReview } from '../../queries/useReviews';
import { useOrder } from '../../queries/useOrders';

export default function AdminReviews() {
  const [activeTab, setActiveTab] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);
  
  const { data: orderData, isLoading: isLoadingOrder } = useOrder(
    selectedReview?.orderId && !selectedReview.orderId.includes('ADMIN') ? selectedReview.orderId : null
  );

  const filters = {};
  if (search) filters.search = search;
  
  const { data, isLoading } = useReviewsList(filters);
  let reviews = data?.data || [];

  if (activeTab === 'answered') {
    reviews = reviews.filter(r => r.merchantReply?.body);
  } else if (activeTab === 'unanswered') {
    reviews = reviews.filter(r => r.status === 'pending' || (r.status === 'approved' && !r.merchantReply?.body));
  }

  if (filterRating !== 'all') {
    reviews = reviews.filter(r => r.rating === Number(filterRating));
  }

  if (search) {
    const q = search.toLowerCase();
    reviews = reviews.filter(r => 
      (r.customerName || '').toLowerCase().includes(q) ||
      (r.customerEmail || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.body || '').toLowerCase().includes(q)
    );
  }
  
  const updateMut = useUpdateReview();

  const handleOpenDetail = (review) => {
    setSelectedReview(review);
    setReplyText(review.merchantReply?.body || '');
    setReplySuccess(false);
  };

  const handleStatusChange = (status) => {
    if (selectedReview) {
      updateMut.mutate({ id: selectedReview.id, patch: { status } }, {
        onSuccess: (updated) => setSelectedReview(updated)
      });
    }
  };

  const handleSaveReply = () => {
    if (selectedReview) {
      updateMut.mutate({ 
        id: selectedReview.id, 
        patch: { merchantReply: { body: replyText, repliedAt: new Date().toISOString() } } 
      }, {
        onSuccess: (updated) => {
          setSelectedReview(updated);
          setReplySuccess(true);
          setTimeout(() => setReplySuccess(false), 3000);
        }
      });
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Feedback</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark mt-0.5">Reviews</h1>
          <p className="text-xs text-text-muted mt-1">Moderation queue and replies</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden flex flex-col md:flex-row min-h-150">
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${selectedReview ? 'hidden md:flex md:w-2/3 md:border-r border-slate-200' : 'w-full'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 bg-zinc-50/50 p-4 gap-4">
            <div className="flex overflow-x-auto w-full hide-scrollbar gap-2">
              {[
                { id: 'all', label: 'All Reviews' },
                { id: 'answered', label: 'Answered' },
                { id: 'unanswered', label: 'Needs Attention' }
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
            
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
              <select 
                value={filterRating} 
                onChange={e => setFilterRating(e.target.value)}
                className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto min-h-100">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-zinc-400 font-semibold">Loading reviews...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Rating</th>
                    <th className="px-5 py-3 font-medium">Review</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-12 text-center text-text-muted">
                        <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="font-bold text-text-dark">No reviews found.</p>
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr 
                        key={review.id} 
                        onClick={() => handleOpenDetail(review)} 
                        className={`transition-colors cursor-pointer group ${selectedReview?.id === review.id ? 'bg-primary-dark/5' : 'hover:bg-zinc-50/50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex text-blue-600">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-zinc-200'}`} />)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-text-dark line-clamp-1">{review.title || 'Untitled Review'}</p>
                          <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{review.body}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            review.status === 'approved' ? 'bg-green-500/15 text-green-700' : 
                            review.status === 'rejected' ? 'bg-red-500/10 text-red-700' : 
                            review.status === 'spam' ? 'bg-zinc-200 text-zinc-600' :
                            'bg-orange-500/15 text-orange-700'
                          }`}>
                            {review.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Sidebar */}
        {selectedReview && (
          <div className="w-full md:w-1/3 bg-zinc-50/50 flex flex-col h-full md:min-h-150 border-l border-slate-200 animate-in slide-in-from-right-8 duration-300">
            <div className="p-4 flex justify-between items-center border-b border-slate-200 bg-white">
              <h2 className="font-bold text-text-dark">Review Details</h2>
              <button onClick={() => setSelectedReview(null)} className="p-2 text-zinc-400 hover:text-text-dark rounded-lg hover:bg-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Verified Purchase</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="text-blue-700">
                    <span className="opacity-70 text-[10px] uppercase block mb-0.5">Product ID</span>
                    <span className="font-bold">{selectedReview.productId || 'N/A'}</span>
                  </div>
                  <div className="text-blue-700">
                    <span className="opacity-70 text-[10px] uppercase block mb-0.5">Customer Name / Email</span>
                    <span className="font-bold line-clamp-1">{selectedReview.customerName || selectedReview.customerEmail || 'N/A'}</span>
                  </div>
                  <div className="text-blue-700">
                    <span className="opacity-70 text-[10px] uppercase block mb-0.5">Order ID</span>
                    <span className="font-bold">{selectedReview.orderId || 'N/A'}</span>
                  </div>
                </div>

                {isLoadingOrder && (
                  <div className="text-xs text-blue-500 font-bold animate-pulse mt-2">Loading order details...</div>
                )}
                
                {orderData && (
                  <div className="pt-3 border-t border-blue-200/60 mt-2 space-y-3 text-xs text-blue-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="opacity-70 uppercase block mb-0.5">Order Date</span>
                        <span className="font-semibold">{new Date(orderData.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="opacity-70 uppercase block mb-0.5">Status</span>
                        <span className="font-semibold capitalize">{orderData.status || orderData.fulfillmentStatus}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="opacity-70 uppercase block mb-0.5">Shipping Name</span>
                      <span className="font-semibold">{orderData.shippingAddress?.fullName || orderData.customerInfo?.name || 'N/A'}</span>
                    </div>

                    {orderData.items?.length > 0 && (
                      <div className="mt-3 bg-white/50 p-2.5 rounded-lg">
                        <span className="opacity-70 uppercase block mb-1.5">Items in Order</span>
                        <ul className="space-y-1.5">
                          {orderData.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 font-medium">
                              <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                              <span className="line-clamp-2 flex-1 leading-tight">{item.name || item.title} <span className="opacity-75 block text-[10px]">({item.size}, {item.colorName || item.color}) x{item.quantity}</span></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-blue-600">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < selectedReview.rating ? 'fill-current' : 'text-zinc-200'}`} />)}
                  </div>
                  <span className="font-bold text-sm text-text-dark ml-2">{selectedReview.rating}/5</span>
                </div>
                <h3 className="text-lg font-bold text-text-dark mb-2">{selectedReview.title || 'Untitled'}</h3>
                <p className="text-sm text-text-muted leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all">
                  {selectedReview.body}
                </p>
                {selectedReview.media?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {selectedReview.media.map((m, i) => (
                      <div key={i} className="w-16 h-16 bg-zinc-100 rounded-lg border border-slate-200 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-zinc-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedReview.status === 'pending' && (
                <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm transition-all space-y-3">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Moderation Actions</h4>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleStatusChange('approved')} className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors">
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleStatusChange('rejected')} className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-red-500 text-red-500 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors">
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => handleStatusChange('spam')} className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 text-zinc-600 rounded-lg font-bold text-sm hover:bg-zinc-50">
                      <ShieldBan className="w-4 h-4" /> Mark as Spam
                    </button>
                  </div>
                </div>
              )}

              {selectedReview.status === 'approved' && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Merchant Reply</h4>
                  <textarea 
                    rows="3"
                    value={replyText}
                    onChange={e => { setReplyText(e.target.value); setReplySuccess(false); }}
                    placeholder="Write a public reply..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  ></textarea>
                  <button 
                    onClick={handleSaveReply}
                    disabled={updateMut.isPending || !replyText.trim()}
                    className={`px-4 py-2 text-white rounded-lg font-bold text-sm shadow-sm disabled:opacity-50 w-full transition-colors ${replySuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-dark hover:bg-primary-hover'}`}
                  >
                    {updateMut.isPending ? 'Saving...' : replySuccess ? '✓ Reply Posted!' : (selectedReview.merchantReply ? 'Update Reply' : 'Post Reply')}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
