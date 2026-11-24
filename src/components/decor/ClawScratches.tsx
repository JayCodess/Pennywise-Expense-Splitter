import React from 'react';

export const ClawScratches: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="hidden 2xl:block fixed bottom-12 left-4 pointer-events-none select-none z-0 opacity-15 dark:opacity-20"
    >
      <svg viewBox="0 0 80 80" className="w-16 h-16 text-[var(--color-border)]">
        {/* 3 parallel curved claw gouges */}
        <path
          d="M 12 10 C 22 26, 32 46, 38 68"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 24 8 C 36 26, 46 48, 54 72"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 38 12 C 50 30, 60 52, 68 76"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
