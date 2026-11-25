import React from 'react';

interface SingleBalloonProps {
  size: number;
  color: string;
  highlightColor?: string;
  opacity?: number;
  blur?: boolean;
  className?: string;
}

const BalloonShape: React.FC<SingleBalloonProps> = ({
  size,
  color,
  highlightColor = 'rgba(255, 255, 255, 0.45)',
  opacity = 0.35,
  blur = false,
  className = '',
}) => {
  return (
    <div
      className={`absolute select-none pointer-events-none transition-transform ${blur ? 'filter blur-[1px]' : ''} ${className}`}
      style={{ width: size, height: size * 1.5, opacity }}
    >
      <svg viewBox="0 0 50 75" className="w-full h-full overflow-visible drop-shadow-sm">
        <defs>
          <radialGradient
            id={`balloon-grad-${size}-${color.replace('#', '')}`}
            cx="35%"
            cy="30%"
            r="65%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="30%" stopColor={color} />
            <stop offset="100%" stopColor="#250306" />
          </radialGradient>
        </defs>

        {/* Balloon Body */}
        <path
          d="M 25 3 C 38 3 47 14 47 28 C 47 40 37 50 27 53 L 23 53 C 13 50 3 40 3 28 C 3 14 12 3 25 3 Z"
          fill={`url(#balloon-grad-${size}-${color.replace('#', '')})`}
        />

        {/* Soft glossy reflection */}
        <ellipse
          cx="17"
          cy="18"
          rx="6"
          ry="11"
          transform="rotate(-22 17 18)"
          fill={highlightColor}
        />

        {/* Knotted tie at bottom */}
        <polygon points="23,52 27,52 29,56 21,56" fill={color} />

        {/* Trailing string */}
        <path
          d="M 25 56 Q 22 64 26 71 Q 29 78 24 84"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
      </svg>
    </div>
  );
};

export const FloatingBalloons: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* Balloon 1: Top-left edge (Visible on mobile & desktop) */}
      <BalloonShape
        size={38}
        color="#c1121f"
        opacity={0.3}
        className="-top-4 -left-3 animate-bob"
      />

      {/* Balloon 2: Mid-right edge (Visible on mobile & desktop) */}
      <BalloonShape
        size={46}
        color="#8f0d17"
        opacity={0.35}
        className="top-1/3 -right-4 animate-bob [animation-delay:2.5s] [animation-duration:6s]"
      />

      {/* Balloon 3: Bottom-left edge (Visible on mobile & desktop) */}
      <BalloonShape
        size={34}
        color="#a80f19"
        opacity={0.25}
        className="bottom-16 -left-2 animate-bob [animation-delay:1.2s] [animation-duration:5.2s]"
      />

      {/* Balloon 4: Top-right upper background (Desktop only) */}
      <BalloonShape
        size={54}
        color="#54050b"
        blur
        opacity={0.2}
        className="hidden sm:block top-12 right-12 animate-bob [animation-delay:3.8s] [animation-duration:7.5s]"
      />

      {/* Balloon 5: Mid-left background (Desktop only) */}
      <BalloonShape
        size={30}
        color="#d85d68" // Faded pinkish-red
        opacity={0.22}
        className="hidden sm:block top-1/2 left-8 animate-bob [animation-delay:4.5s] [animation-duration:5.8s]"
      />

      {/* Balloon 6: Bottom-right background (Desktop only) */}
      <BalloonShape
        size={48}
        color="#b0101b"
        opacity={0.25}
        className="hidden sm:block bottom-32 right-16 animate-bob [animation-delay:2s] [animation-duration:6.8s]"
      />
    </div>
  );
};
