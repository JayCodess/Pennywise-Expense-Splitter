import React from 'react';

interface BloodDividerProps {
  className?: string;
}

export const BloodDivider: React.FC<BloodDividerProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full h-2.5 my-2.5 select-none pointer-events-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 400 10"
        preserveAspectRatio="none"
        className="w-full h-full opacity-70 dark:opacity-80"
        style={{ filter: 'url(#bloodContactShadow)' }}
      >
        {/* Organic, thin uneven blood smear streak */}
        <path
          d="M 0 5 Q 50 2 100 6 Q 160 1 220 5 Q 280 8 330 4 Q 370 7 400 5 Q 350 7 300 6 Q 220 9 150 4 Q 80 8 0 5 Z"
          fill="url(#bloodRealGrad)"
          className="dark:fill-[url(#bloodRealGrad)] fill-[url(#bloodDriedGrad)]"
          filter="url(#bloodOrganicEdge)"
        />
      </svg>
    </div>
  );
};
