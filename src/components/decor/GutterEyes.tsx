import React from 'react';

export const GutterEyes: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="hidden 2xl:block fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* Pair 1: Left gutter, upper third */}
      <div className="absolute top-[28%] left-6 xl:left-14 opacity-20 dark:opacity-25 animate-gutter-blink-1">
        <svg viewBox="0 0 28 12" className="w-6 h-3">
          <ellipse cx="6" cy="6" rx="4.5" ry="3.2" fill="#d99b00" />
          <ellipse cx="6" cy="6" rx="1.5" ry="2.8" fill="#120c02" />
          <ellipse cx="22" cy="6" rx="4.5" ry="3.2" fill="#d99b00" />
          <ellipse cx="22" cy="6" rx="1.5" ry="2.8" fill="#120c02" />
        </svg>
      </div>

      {/* Pair 2: Right gutter, lower third */}
      <div className="absolute top-[68%] right-6 xl:right-16 opacity-15 dark:opacity-20 animate-gutter-blink-2">
        <svg viewBox="0 0 28 12" className="w-5 h-2.5">
          <ellipse cx="6" cy="6" rx="4" ry="2.8" fill="#bfa004" />
          <ellipse cx="6" cy="6" rx="1.2" ry="2.5" fill="#120c02" />
          <ellipse cx="22" cy="6" rx="4" ry="2.8" fill="#bfa004" />
          <ellipse cx="22" cy="6" rx="1.2" ry="2.5" fill="#120c02" />
        </svg>
      </div>
    </div>
  );
};
