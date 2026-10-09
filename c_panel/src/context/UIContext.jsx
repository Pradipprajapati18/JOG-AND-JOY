import React, { createContext, useContext, useState } from 'react';
import ToastContainer from '../components/ui/ToastContainer';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', description = '') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, msg: message, type, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen, toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} position="bottom-right" />
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIContext must be used within UIProvider');
  return ctx;
}
