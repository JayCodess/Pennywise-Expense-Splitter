import React from 'react';

export const FogAndNoise: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* Subtle Film Grain Noise Overlay (inline SVG filter) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] dark:opacity-[0.045]">
        <filter id="horrorNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#horrorNoise)" />
      </svg>

      {/* Slow breathing vignette dim and recover every ~15s (smooth opacity fade, no flash) */}
      <div className="absolute inset-0 pointer-events-none select-none bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.4)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.6)_100%)] animate-vignette-dim" />

      {/* Low Drifting Fog at Bottom of Page */}
      <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent opacity-75 dark:opacity-85 pointer-events-none" />

      {/* Organic Fog Mist Gradient */}
      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-[140%] h-24 sm:h-36 opacity-20 dark:opacity-25 animate-fog-drift"
      >
        <defs>
          <linearGradient id="mistGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="var(--color-blood-dark)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="var(--color-text-muted)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M 0 120 C 150 70 300 110 500 80 C 700 50 850 90 1000 70 L 1000 120 Z"
          fill="url(#mistGrad)"
        />
      </svg>
    </div>
  );
};
