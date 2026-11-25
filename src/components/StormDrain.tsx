import React from 'react';

interface StormDrainProps {
  className?: string;
  size?: number;
  peekingBalloon?: boolean;
  blinkingEyes?: boolean;
}

export const StormDrain: React.FC<StormDrainProps> = ({
  className = '',
  size = 40,
  peekingBalloon = false,
  blinkingEyes = true,
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
        {peekingBalloon && (
          <radialGradient id="peekBalloonGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ff4d5a" />
            <stop offset="40%" stopColor="#c1121f" />
            <stop offset="100%" stopColor="#3d0307" />
          </radialGradient>
        )}
      </defs>

      {/* Drain frame / concrete kerb */}
      <rect
        x="2"
        y="2"
        width="60"
        height="32"
        rx="4"
        fill="url(#grateFrameGrad)"
        stroke="#2b2427"
        strokeWidth="1.5"
      />
      {/* Dark sewer opening void */}
      <rect x="6" y="6" width="52" height="24" rx="2" fill="#080708" />

      {/* Peeking balloon behind grate bars in empty states */}
      {peekingBalloon && (
        <g>
          {/* Top curve of red balloon peering up from the darkness */}
          <path d="M 22 28 C 22 14 42 14 42 28 Z" fill="url(#peekBalloonGrad)" />
          <ellipse
            cx="28"
            cy="18"
            rx="2.5"
            ry="4"
            transform="rotate(-20 28 18)"
            fill="#ffffff"
            opacity="0.35"
          />
        </g>
      )}

      {/* Iron grate bars */}
      <line
        x1="13"
        y1="6"
        x2="13"
        y2="30"
        stroke="#5a5056"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="21"
        y1="6"
        x2="21"
        y2="30"
        stroke="#5a5056"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="29"
        y1="6"
        x2="29"
        y2="30"
        stroke="#5a5056"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="37"
        y1="6"
        x2="37"
        y2="30"
        stroke="#5a5056"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="45"
        y1="6"
        x2="45"
        y2="30"
        stroke="#5a5056"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="53"
        y1="6"
        x2="53"
        y2="30"
        stroke="#5a5056"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Faint eerie glowing pair of eyes peering out from between middle bars */}
      <g className={blinkingEyes ? 'animate-drain-blink' : ''}>
        <circle cx="28" cy="18" r="1.1" fill="#f5d020" />
        <circle cx="38" cy="18" r="1.1" fill="#f5d020" />
      </g>
    </svg>
  );
};
