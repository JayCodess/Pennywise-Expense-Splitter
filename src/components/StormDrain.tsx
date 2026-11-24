import React from 'react';

interface StormDrainProps {
  className?: string;
  size?: number;
}

export const StormDrain: React.FC<StormDrainProps> = ({
  className = '',
  size = 40,
}) => {
  return (
    <svg
      role="img"
      aria-label="Storm drain sewer grate"
      viewBox="0 0 64 36"
      width={size * (64 / 36)}
      height={size}
      className={`inline-block select-none overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id="grateFrameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#433b40" />
          <stop offset="100%" stopColor="#1a1618" />
        </linearGradient>
      </defs>

      {/* Drain frame / concrete kerb */}
      <rect x="2" y="2" width="60" height="32" rx="4" fill="url(#grateFrameGrad)" stroke="#2b2427" strokeWidth="1.5" />
      {/* Dark sewer opening void */}
      <rect x="6" y="6" width="52" height="24" rx="2" fill="#080708" />

      {/* Iron grate bars */}
      <line x1="13" y1="6" x2="13" y2="30" stroke="#5a5056" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="21" y1="6" x2="21" y2="30" stroke="#5a5056" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="29" y1="6" x2="29" y2="30" stroke="#5a5056" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="37" y1="6" x2="37" y2="30" stroke="#5a5056" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="45" y1="6" x2="45" y2="30" stroke="#5a5056" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="53" y1="6" x2="53" y2="30" stroke="#5a5056" strokeWidth="2.5" strokeLinecap="round" />

      {/* Faint eerie glowing pair of eyes peering out from between middle bars */}
      <circle cx="28" cy="18" r="1.1" fill="#f5d020" opacity="0.85" />
      <circle cx="38" cy="18" r="1.1" fill="#f5d020" opacity="0.85" />
    </svg>
  );
};
