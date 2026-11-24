import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  icon?: string;
  duration?: number;
}

interface ToastContextType {
  toast: ToastMessage | null;
  showToast: (text: string, icon?: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<number | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback((text: string, icon = '🎈', duration = 3000) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, text, icon, duration });

    timerRef.current = window.setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
      timerRef.current = null;
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
