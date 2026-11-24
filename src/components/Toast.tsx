import React, { useState, useEffect, useRef } from 'react';
import { useExpenseStore } from '../hooks/useExpenseStore';

export const Toast: React.FC = () => {
  const { deletedExpense, restoreExpense } = useExpenseStore();
  const [visible, setVisible] = useState(false);
  const [currentDesc, setCurrentDesc] = useState('');

  const timerRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(6000);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (deletedExpense) {
      setCurrentDesc(deletedExpense.description);
      setVisible(true);
      remainingTimeRef.current = 6000;
      startTimeRef.current = Date.now();

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, 6000);
    } else {
      setVisible(false);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [deletedExpense]);

  // Pause timer on hover or focus
  const handleMouseEnter = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    if (remainingTimeRef.current > 0) {
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, remainingTimeRef.current);
    }
  };

  const handleUndo = () => {
    restoreExpense();
    setVisible(false);
  };

  if (!visible || !currentDesc) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm mx-auto sm:mx-0 p-3.5 rounded-xl bg-surface border border-accent-text/60 shadow-carnival text-text-base flex items-center justify-between gap-3 animate-card-in"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base select-none shrink-0">🎈</span>
        <p className="text-xs text-text-base truncate font-medium">
          Deleted &ldquo;{currentDesc}&rdquo;
        </p>
      </div>

      <button
        type="button"
        onClick={handleUndo}
        className="min-h-[44px] px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        Undo
      </button>
    </div>
  );
};
