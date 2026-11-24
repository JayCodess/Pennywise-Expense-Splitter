import React from 'react';

interface FingerSmearProps {
  className?: string;
  side?: 'left' | 'right';
}

export const FingerSmear: React.FC<FingerSmearProps> = ({
  className = '',
  side = 'left',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none select-none z-0 ${className}`}
    >
      <svg
        viewBox="0 0 60 120"
        className={`w-12 h-24 opacity-25 dark:opacity-30 ${side === 'right' ? 'scale-x-[-1]' : ''}`}
      >
        <defs>
          <linearGradient id="fingerSmearGrad" x1="0%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%" stopColor="#8a0b14" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#450408" stopOpacity="0.5" />
            <stop offset="85%" stopColor="#220204" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g fill="url(#fingerSmearGrad)" filter="url(#bloodOrganicEdge)">
          {/* Finger 1 (Index) */}
          <path d="M 0 10 C 12 12, 22 28, 28 50 C 32 64, 30 78, 26 95 C 24 82, 24 64, 18 42 C 12 24, 6 15, 0 14 Z" />

          {/* Finger 2 (Middle - longest) */}
          <path d="M 0 24 C 14 26, 26 44, 34 72 C 38 88, 36 104, 31 118 C 29 102, 30 84, 24 62 C 18 38, 8 28, 0 28 Z" />

          {/* Finger 3 (Ring) */}
          <path d="M 0 38 C 12 40, 24 56, 30 80 C 33 94, 30 106, 25 114 C 23 100, 24 84, 19 66 C 14 48, 6 42, 0 42 Z" />

          {/* Finger 4 (Pinky - shortest) */}
          <path d="M 0 52 C 10 54, 18 66, 22 84 C 24 94, 21 100, 16 105 C 15 95, 17 84, 13 72 C 9 58, 4 55, 0 55 Z" />
        </g>
      </svg>
    </div>
  );
};
