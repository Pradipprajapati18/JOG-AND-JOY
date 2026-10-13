import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';

export default function LiveChatDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! 👋 Welcome to Jog & Joy Kids. How can I help you find the perfect outfit today?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'Track my order 📦',
    'Which size should I pick? 📐',
    'Fabric & Washing tips 🧼',
    'Wholesale inquiries 💼'
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputValue('');

    // Simulated Bot Reply
    setTimeout(() => {
      let botReply = "Thank you for reaching out! Our kids fashion specialists are available to assist you. You can also chat directly with us on WhatsApp at +91 94299 05118!";
      if (text.includes('size')) {
        botReply = "For kids sizing, we recommend choosing 1 size up if your child is in between ages. Check our official Size Guide modal on any product page!";
      } else if (text.includes('Track') || text.includes('order')) {
        botReply = "Please enter your 8-digit Order ID (e.g. #JJ-9482) or phone number to check live courier status.";
      } else if (text.includes('Fabric')) {
        botReply = "All our kids t-shirts and frocks are made from 100% bio-washed combed cotton with non-toxic Azo-free dyes!";
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-100"
        >
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-[#AEE6FF] via-[#FFD6BA] to-[#E6D6FF] flex items-center justify-between border-b border-white/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-[#EF4A45]" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                  JoyBot Support <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </h3>
                <p className="text-[11px] text-slate-700 font-extrabold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Online & ready to help
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="p-4 grow overflow-y-auto space-y-4 bg-[#FFF8EC]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user' ? 'bg-[#EF4A45] text-white' : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-[#EF4A45]" />}
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#EF4A45] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reply Chips */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#AEE6FF]/30 text-slate-800 hover:bg-[#AEE6FF] transition-colors border border-[#AEE6FF]/50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-full bg-[#EF4A45] text-white hover:bg-red-600 shadow-md transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
