import React from 'react';

interface CardBalloonProps {
  className?: string;
}

export const CardBalloon: React.FC<CardBalloonProps> = ({ className = '' }) => {
  return (
    <div aria-hidden="true" className={`absolute select-none pointer-events-none z-0 ${className}`}>
      <div className="animate-bob [animation-duration:5s] relative -top-7 -right-2">
        <svg viewBox="0 0 40 90" className="w-8 h-20 overflow-visible drop-shadow-sm">
          <defs>
            <radialGradient id="cardBalloonGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#b0101b" />
              <stop offset="100%" stopColor="#3d0307" />
            </radialGradient>
          </defs>

          {/* Balloon shape */}
          <path
            d="M 20 2 C 30 2 37 10 37 22 C 37 32 29 40 22 42 L 18 42 C 11 40 3 32 3 22 C 3 10 10 2 20 2 Z"
            fill="url(#cardBalloonGrad)"
          />

          {/* Glossy highlight */}
          <ellipse
            cx="14"
            cy="14"
            rx="4.5"
            ry="8"
            transform="rotate(-20 14 14)"
            fill="#ffffff"
            opacity="0.4"
          />

          {/* Knot */}
          <polygon points="18,42 22,42 24,45 16,45" fill="#800a12" />

          {/* String tied behind card edge */}
          <path
            d="M 20 45 Q 17 55 22 65 Q 26 75 19 88"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="0.9"
            strokeOpacity="0.45"
          />
        </svg>
      </div>
    </div>
  );
};
