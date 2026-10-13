import React, { useState } from 'react';
import { MessageSquare, Search, Filter, Clock, MoreVertical, Send, FileText, ChevronDown, CheckCircle2, User, HelpCircle, FileTerminal } from 'lucide-react';
import { useMessagesList, useUpdateMessage } from '../../queries/useMessages';

export default function AdminMessages() {
  const [activeTab, setActiveTab] = useState('open');
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const filters = {};
  if (activeTab !== 'all') filters.status = activeTab;
  if (search) filters.search = search;
  
  const { data, isLoading } = useMessagesList(filters);
  const threads = data?.data || [];
  
  const updateMut = useUpdateMessage();

  const handleOpenThread = (thread) => {
    setSelectedThread(thread);
    setReplyText('');
  };

  const handleStatusChange = (status) => {
    if (selectedThread) {
      updateMut.mutate({ id: selectedThread.id, patch: { status } }, {
        onSuccess: (updated) => setSelectedThread(updated)
      });
    }
  };

  const handleAssignToMe = () => {
    if (selectedThread) {
      updateMut.mutate({ id: selectedThread.id, patch: { assignedTo: 'admin' } }, {
        onSuccess: (updated) => setSelectedThread(updated)
      });
    }
  };

  const handleInsertCanned = () => {
    setReplyText((prev) => prev + (prev ? '\n\n' : '') + 'Hello,\n\nThank you for reaching out to us. How can we help you today?\n\nBest regards,\nSupport Team');
  };

  const handleSendReply = () => {
    if (selectedThread && replyText.trim()) {
      const newMessage = {
        sender: 'admin',
        body: replyText,
        timestamp: new Date().toISOString(),
        internal: isInternal
      };
      
      updateMut.mutate({ 
        id: selectedThread.id, 
        patch: { 
          messages: [...(selectedThread.messages || []), newMessage],
          updatedAt: new Date().toISOString()
        } 
      }, {
        onSuccess: (updated) => {
          setSelectedThread(updated);
          setReplyText('');
          setIsInternal(false);
        }
      });
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300 pb-12 h-screen flex flex-col pt-4">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Support</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark mt-0.5">Inbox</h1>
          <p className="text-xs text-text-muted mt-1">Ticketing & customer communications</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden flex flex-col md:flex-row flex-1 min-h-125">
        {/* Left Pane: Conversation List */}
        <div className="w-full md:w-80 flex flex-col border-r border-slate-200 bg-zinc-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative w-full mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-zinc-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 text-sm transition-colors"
              />
            </div>
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              {['all', 'open', 'pending', 'resolved'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                    activeTab === tab ? 'bg-white text-text-dark shadow-sm' : 'text-zinc-500 hover:text-text-dark'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-400 text-sm font-semibold">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-text-dark text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {threads.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => handleOpenThread(thread)}
                    className={`w-full text-left p-4 transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-primary-dark/5 border-l-2 border-primary-dark' : 'hover:bg-zinc-50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-text-dark line-clamp-1">{thread.subject || 'No Subject'}</span>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-2">2h</span>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2">
                      {thread.messages?.[thread.messages.length - 1]?.body || 'No messages'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                        thread.priority === 'high' ? 'bg-error/10 text-error' : 'bg-zinc-200 text-zinc-600'
                      }`}>{thread.priority || 'normal'}</span>
                      {thread.orderId && <span className="flex items-center gap-1 text-[10px] font-semibold text-text-muted"><FileText className="w-3 h-3" /> {thread.orderId}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Active Conversation */}
        <div className="flex-1 flex flex-col bg-white relative">
          {selectedThread ? (
            <>
              {/* Action Bar */}
              <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-bold text-lg text-text-dark">{selectedThread.subject || 'No Subject'}</h2>
                  <p className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                    <User className="w-3 h-3" /> {selectedThread.customerId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleAssignToMe} className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Assign to me
                  </button>
                  {selectedThread.status !== 'resolved' && (
                    <button onClick={() => handleStatusChange('resolved')} className="px-3 py-1.5 bg-success text-white rounded-lg text-xs font-bold hover:bg-success-dark transition-colors flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" /> Resolve
                    </button>
                  )}
                  <div className="relative group">
                    <button className="p-1.5 text-zinc-400 hover:text-text-dark rounded-lg hover:bg-zinc-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="p-1">
                        <button onClick={() => handleStatusChange('closed')} className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-zinc-50 rounded-lg text-error">
                          Close Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30">
                {selectedThread.messages?.map((msg, i) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={i} className={`flex flex-col max-w-[80%] ${isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold text-text-muted">{isAdmin ? 'Agent' : 'Customer'}</span>
                        <span className="text-[10px] text-zinc-400">10:45 AM</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.internal ? 'bg-warning/20 border-warning/30 border text-text-dark rounded-tr-sm' :
                        isAdmin ? 'bg-primary-dark text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-text-dark rounded-tl-sm shadow-sm transition-all'
                      }`}>
                        {msg.internal && <span className="block text-[10px] font-extrabold uppercase tracking-widest text-warning-dark mb-1">Internal Note</span>}
                        {msg.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-shadow">
                  <div className="flex items-center gap-2 p-2 border-b border-slate-200 bg-zinc-50">
                    <button onClick={handleInsertCanned} className="p-1.5 text-zinc-500 hover:text-text-dark hover:bg-zinc-200 rounded-lg" title="Insert Canned Response"><FileTerminal className="w-4 h-4" /></button>
                    <label className="flex items-center gap-1.5 ml-auto text-xs font-bold text-zinc-500 cursor-pointer">
                      <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded text-warning focus:ring-warning" />
                      Internal Note
                    </label>
                  </div>
                  <textarea 
                    rows="3"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={isInternal ? "Write an internal note..." : "Reply to customer..."}
                    className={`w-full p-3 text-sm focus:outline-none resize-none ${isInternal ? 'bg-warning/5' : 'bg-white'}`}
                  ></textarea>
                  <div className="p-2 flex justify-between items-center bg-white">
                    <span className="text-[10px] text-zinc-400">Press Cmd+Enter to send</span>
                    <button 
                      onClick={handleSendReply}
                      disabled={updateMut.isPending || !replyText.trim()}
                      className={`px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
                        isInternal ? 'bg-warning text-text-dark hover:bg-warning-dark' : 'bg-primary-dark text-white hover:bg-primary-hover'
                      } disabled:opacity-50`}
                    >
                      <Send className="w-4 h-4" /> {isInternal ? 'Add Note' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-400">
              <HelpCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold text-text-dark text-lg">No conversation selected</p>
              <p className="text-sm mt-1">Choose a ticket from the left pane to view details and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
