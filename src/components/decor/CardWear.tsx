import React from 'react';

interface CardWearProps {
  className?: string;
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const CardWear: React.FC<CardWearProps> = ({ className = '', corner = 'bottom-right' }) => {
  const getCornerClasses = () => {
    switch (corner) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0 rotate-90';
      case 'bottom-left':
        return 'bottom-0 left-0 -rotate-90';
      case 'bottom-right':
      default:
        return 'bottom-0 right-0 rotate-180';
    }
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className={`absolute pointer-events-none select-none w-10 h-10 opacity-15 dark:opacity-20 text-[var(--color-border)] ${getCornerClasses()} ${className}`}
    >
      {/* Barely noticeable scratch / fracture hairline cracks */}
      <path
        d="M 4 36 L 14 26 L 19 28 L 29 18 M 14 26 L 12 16 M 19 28 L 24 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
};
