import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  formatCurrency: (amount: number | undefined | null) => string;
  convertCurrency: (amount: number, toCurrency: 'USD' | 'Bs') => number;
  needsVerification: boolean;
  needsDollarRateUpdate: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('appSettings');
    return stored ? JSON.parse(stored) : {
      currency: 'Bs',
      dollarRate: 35.00,
      lastInventoryVerification: new Date().toISOString().split('T')[0],
      lastDollarRateUpdate: new Date().toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // If updating dollar rate, update the last update date
      if (newSettings.dollarRate !== undefined) {
        updated.lastDollarRateUpdate = new Date().toISOString().split('T')[0];
      }
      
      return updated;
    });
  };

  const convertCurrency = (amount: number, toCurrency: 'USD' | 'Bs') => {
    if (toCurrency === 'USD') {
      return amount / settings.dollarRate;
    } else {
      return amount * settings.dollarRate;
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    // Handle undefined, null, or NaN values
    if (amount === undefined || amount === null || isNaN(amount)) {
      return settings.currency === 'USD' ? '$0.00' : 'Bs. 0.00';
    }

    if (settings.currency === 'USD') {
      return `$${(amount / settings.dollarRate).toFixed(2)}`;
    }
    return `Bs. ${amount.toFixed(2)}`;
  };

  const needsVerification = () => {
    const today = new Date().toISOString().split('T')[0];
    return today !== settings.lastInventoryVerification;
  };

  const needsDollarRateUpdate = () => {
    const today = new Date().toISOString().split('T')[0];
    return today !== settings.lastDollarRateUpdate;
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      formatCurrency,
      convertCurrency,
      needsVerification: needsVerification(),
      needsDollarRateUpdate: needsDollarRateUpdate()
    }}>
      {children}
    </SettingsContext.Provider>
  );
};