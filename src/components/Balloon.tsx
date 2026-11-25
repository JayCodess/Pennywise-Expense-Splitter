import React from 'react';

interface BalloonProps {
  className?: string;
  size?: number;
}

export const Balloon: React.FC<BalloonProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      role="img"
      aria-label="Floating red balloon"
      viewBox="0 0 60 110"
      width={size * (60 / 110)}
      height={size}
      className={`inline-block select-none overflow-visible animate-bob ${className}`}
    >
      <defs>
        <radialGradient id="balloonGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ff4d5a" />
          <stop offset="35%" stopColor="#c1121f" />
          <stop offset="85%" stopColor="#7a050e" />
          <stop offset="100%" stopColor="#3d0106" />
        </radialGradient>
        <filter id="balloonShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Balloon body */}
      <g filter="url(#balloonShadow)">
        <ellipse cx="30" cy="34" rx="22" ry="26" fill="url(#balloonGrad)" />
      </g>

      {/* Balloon specular highlight */}
      <path
        d="M 18 20 Q 24 16 32 18"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Balloon tied knot */}
      <polygon points="28,60 32,60 34,63 26,63" fill="#8f0d17" stroke="#480509" strokeWidth="0.6" />

      {/* Dangling balloon string with eerie gentle curves */}
      <path
        d="M 30 63 Q 27 75 33 85 T 28 106"
        fill="none"
        stroke="#9b8f86"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
};
