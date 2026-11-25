import React, { useState, useEffect, useRef } from 'react';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { useToast } from '../hooks/useToast';

export const Toast: React.FC = () => {
  const { deletedExpense, restoreExpense } = useExpenseStore();
  const { toast, showToast, hideToast } = useToast();

  const [undoVisible, setUndoVisible] = useState(false);
  const [currentDesc, setCurrentDesc] = useState('');

  const undoTimerRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(6000);
  const startTimeRef = useRef<number>(Date.now());

  // Handle deleted expense undo toast
  useEffect(() => {
    if (deletedExpense) {
      setCurrentDesc(deletedExpense.description);
      setUndoVisible(true);
      remainingTimeRef.current = 6000;
      startTimeRef.current = Date.now();

      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = window.setTimeout(() => {
        setUndoVisible(false);
      }, 6000);
    } else {
      setUndoVisible(false);
    }

    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    };
  }, [deletedExpense]);

  // Pause undo timer on hover or focus
  const handleMouseEnter = () => {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    if (remainingTimeRef.current > 0) {
      undoTimerRef.current = window.setTimeout(() => {
        setUndoVisible(false);
      }, remainingTimeRef.current);
    }
  };

  const handleUndo = () => {
    const success = restoreExpense();
    if (!success) {
      showToast("That's the limit for one trip: 500 expenses.", '⚠️');
      return;
    }
    setUndoVisible(false);
  };

  // If Undo toast is active, show it (prioritized so undo functionality is never hidden)
  if (undoVisible && currentDesc) {
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
  }

  // Otherwise show general status toast (e.g. "Copied… they'll see it.", "Opening WhatsApp…")
  if (toast) {
    return (
      <div
        role="status"
        aria-live="polite"
        onClick={hideToast}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm mx-auto sm:mx-0 p-3.5 rounded-xl bg-surface border border-accent-text/60 shadow-carnival text-text-base flex items-center gap-2.5 animate-card-in cursor-pointer select-none"
      >
        <span className="text-base shrink-0">{toast.icon || '🎈'}</span>
        <p className="text-xs text-text-base font-medium truncate">{toast.text}</p>
      </div>
    );
  }

  return null;
};
