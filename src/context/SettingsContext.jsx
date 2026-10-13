import React, { createContext, useContext } from 'react';
import { useSettings } from '../queries/useSettings';
import { format } from 'date-fns';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { data: settings, isLoading } = useSettings();

  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'INR';
    
    // Check if it's a whole number, if so drop the decimals to keep UI clean,
    // otherwise show 2 decimals.
    const isWhole = amount % 1 === 0;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
    const currency = settings?.currency || 'INR';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (isoString, includeTime = false) => {
    if (!isoString) return '';
    const pattern = includeTime ? 'MMM dd, yyyy - hh:mm a' : 'MMM dd, yyyy';
    return format(new Date(isoString), pattern);
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, formatCurrency, formatCompactCurrency, formatDate }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
}
