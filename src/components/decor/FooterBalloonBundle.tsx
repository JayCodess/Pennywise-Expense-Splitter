import React from 'react';

interface FooterBalloonBundleProps {
  className?: string;
}

export const FooterBalloonBundle: React.FC<FooterBalloonBundleProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`select-none pointer-events-none ${className}`}
    >
      <div className="relative w-16 h-20">
        {/* Balloon 1: back, darker */}
        <div className="absolute left-0 top-2 animate-bob [animation-duration:5.5s] [animation-delay:0.5s]">
          <svg viewBox="0 0 30 50" className="w-7 h-12 overflow-visible">
            <defs>
              <radialGradient id="bundleGrad1" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ff4d5a" stopOpacity="0.4" />
                <stop offset="35%" stopColor="#750810" />
                <stop offset="100%" stopColor="#1f0204" />
              </radialGradient>
            </defs>
            <path d="M 15 2 C 22 2 28 8 28 17 C 28 25 22 31 16 33 L 14 33 C 8 31 2 25 2 17 C 2 8 8 2 15 2 Z" fill="url(#bundleGrad1)" />
            <polygon points="13,33 17,33 18,35 12,35" fill="#750810" />
            <path d="M 15 35 Q 18 42 16 50" fill="none" stroke="var(--color-text-muted)" strokeWidth="0.7" strokeOpacity="0.4" />
          </svg>
        </div>

        {/* Balloon 2: front, blood-red */}
        <div className="absolute right-0 top-0 animate-bob [animation-duration:4.8s]">
          <svg viewBox="0 0 32 54" className="w-8 h-14 overflow-visible">
            <defs>
              <radialGradient id="bundleGrad2" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                <stop offset="35%" stopColor="#c1121f" />
                <stop offset="100%" stopColor="#3d0307" />
              </radialGradient>
            </defs>
            <path d="M 16 2 C 24 2 30 9 30 19 C 30 28 24 35 18 37 L 14 37 C 8 35 2 28 2 19 C 2 9 8 2 16 2 Z" fill="url(#bundleGrad2)" />
            <ellipse cx="11" cy="12" rx="3.5" ry="7" transform="rotate(-20 11 12)" fill="#ffffff" opacity="0.35" />
            <polygon points="14,37 18,37 19,39 13,39" fill="#9e0c18" />
            <path d="M 16 39 Q 12 45 15 54" fill="none" stroke="var(--color-text-muted)" strokeWidth="0.8" strokeOpacity="0.45" />
          </svg>
        </div>
      </div>
    </div>
  );
};
