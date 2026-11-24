import React from 'react';

export const BloodDefs: React.FC = () => {
  return (
    <svg
      aria-hidden="true"
      className="absolute w-0 h-0 pointer-events-none select-none overflow-hidden"
    >
      <defs>
        {/* Dark crimson arterial gradient with coagulated edges */}
        <linearGradient id="bloodRealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8a0b14" />
          <stop offset="45%" stopColor="#730810" />
          <stop offset="85%" stopColor="#450408" />
          <stop offset="100%" stopColor="#220204" />
        </linearGradient>

        {/* Horizontal slice gradient for pooled lips */}
        <linearGradient id="bloodPoolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#220204" />
          <stop offset="25%" stopColor="#7a0a12" />
          <stop offset="70%" stopColor="#8a0b14" />
          <stop offset="92%" stopColor="#54050b" />
          <stop offset="100%" stopColor="#200204" />
        </linearGradient>

        {/* Dried brownish-crimson gradient for light mode */}
        <linearGradient id="bloodDriedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#631418" />
          <stop offset="40%" stopColor="#520e12" />
          <stop offset="85%" stopColor="#36080b" />
          <stop offset="100%" stopColor="#1e0304" />
        </linearGradient>

        {/* Soft contact shadow beneath blood pool and drips */}
        <filter id="bloodContactShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow
            dx="0"
            dy="2.5"
            stdDeviation="2"
            floodColor="#0f0102"
            floodOpacity="0.32"
          />
        </filter>

        {/* Organic edge displacement: subtle feTurbulence for natural micro-irregularities */}
        <filter id="bloodOrganicEdge" x="-10%" y="-10%" width="120%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
};
