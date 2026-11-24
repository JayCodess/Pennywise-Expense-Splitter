import React, { useState, useEffect } from 'react';
import { useExpenseStore } from '../hooks/useExpenseStore';

export const ResultsScrollPill: React.FC = () => {
  const { people, expenses } = useExpenseStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if there's actual data
    if (people.length === 0 || expenses.length === 0) {
      setIsVisible(false);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const target = document.getElementById('results-card');
    if (!target) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // Pill is visible only when the results card is NOT in viewport
          setIsVisible(!entry.isIntersecting);
        },
        {
          root: null,
          threshold: 0.1,
        }
      );

      observer.observe(target);
      return () => observer.disconnect();
    } catch {
      // Fallback if IntersectionObserver fails to initialize
      return;
    }
  }, [people.length, expenses.length]);

  const handleScrollToResults = () => {
    const el = document.getElementById('results-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-40 pointer-events-none lg:hidden">
      <button
        type="button"
        onClick={handleScrollToResults}
        className="pointer-events-auto min-h-[44px] px-4 py-2 rounded-full bg-accent text-white font-semibold text-xs shadow-carnival hover:bg-accent-hover transition-all duration-200 border border-white/20 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent-text animate-card-in"
        aria-label="Scroll to results section"
      >
        <span>See who pays whom</span>
        <span aria-hidden="true">↓</span>
      </button>
    </div>
  );
};
