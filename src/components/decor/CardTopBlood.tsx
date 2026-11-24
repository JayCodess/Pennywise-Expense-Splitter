import React, { useMemo } from 'react';
import { createPRNG } from './bloodUtils';

interface CardTopBloodProps {
  seed?: number;
  className?: string;
}

/**
 * CardTopBlood: A single, strictly clipped blood layer for the top edge of cards.
 * - Sits entirely within an 18px height strip (clipped with overflow: hidden).
 * - Continuous pooled lip is 3-5px thick.
 * - Gentle short drips reach at most 11-12px, leaving a 6px buffer inside the 18px strip.
 * - Desaturated crimson so it accents the card without overpowering text.
 * - 100% deterministic using seeded PRNG.
 */
export const CardTopBlood: React.FC<CardTopBloodProps> = ({
  seed = 101,
  className = '',
}) => {
  const { path, highlights } = useMemo(() => {
    const rand = createPRNG(seed);
    const width = 600;
    const baseH = 3.5;

    // Generate 4-6 gentle short drips across the 600px width
    // max drip length is 12px
    const numDrips = 4 + Math.floor(rand() * 3);
    const dripPositions: { x: number; len: number; w: number; r: number }[] = [];

    for (let i = 0; i < numDrips; i++) {
      const x = 30 + (i * (width - 60)) / numDrips + (rand() - 0.5) * 25;
      const len = 7 + rand() * 4.8; // 7px to 11.8px (strictly under 12px!)
      const w = 2.5 + rand() * 1.5; // narrow 2.5-4px stem
      const r = w * 0.7; // rounded bulb
      dripPositions.push({ x, len, w, r });
    }

    // Build path starting at (0, 0), moving along top to (600, 0), then tracing bottom lip with drips
    let p = `M 0 0 L ${width} 0 L ${width} ${baseH + rand() * 1.5} `;

    // Walk backwards from width to 0
    const sorted = [...dripPositions].sort((a, b) => b.x - a.x);

    const hl: { cx: number; cy: number; rx: number; ry: number }[] = [];

    for (const drip of sorted) {
      const halfRoot = drip.w * 1.5;
      const rightX = drip.x + halfRoot;
      const leftX = drip.x - halfRoot;
      const bulbY = drip.len - drip.r;

      // Curve down to drip
      p += `Q ${rightX + 5} ${baseH + 1} ${rightX} ${baseH + 2} `;
      p += `C ${drip.x + drip.w / 2} ${baseH + 3}, ${drip.x + drip.r} ${bulbY - 1}, ${drip.x} ${drip.len} `;
      p += `C ${drip.x - drip.r} ${bulbY - 1}, ${drip.x - drip.w / 2} ${baseH + 3}, ${leftX} ${baseH + 2} `;

      hl.push({
        cx: drip.x - drip.r * 0.3,
        cy: bulbY,
        rx: 0.6,
        ry: 1.1,
      });
    }

    p += `L 0 ${baseH + 1} Z`;

    return { path: p, highlights: hl };
  }, [seed]);

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 18"
      preserveAspectRatio="none"
      className={`w-full h-[18px] pointer-events-none select-none block overflow-hidden ${className}`}
    >
      <defs>
        {/* Soft, slightly desaturated crimson gradient for cards */}
        <linearGradient id={`cardBloodGrad-${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a0305" />
          <stop offset="25%" stopColor="#5c0b11" />
          <stop offset="70%" stopColor="#6e0e15" />
          <stop offset="100%" stopColor="#300407" />
        </linearGradient>

        <linearGradient id={`cardBloodDriedGrad-${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#160304" />
          <stop offset="30%" stopColor="#481014" />
          <stop offset="75%" stopColor="#541418" />
          <stop offset="100%" stopColor="#240507" />
        </linearGradient>
      </defs>

      {/* Pooled lip and short drips path */}
      <path
        d={path}
        fill={`url(#cardBloodGrad-${seed})`}
        className={`dark:fill-[url(#cardBloodGrad-${seed})] fill-[url(#cardBloodDriedGrad-${seed})] opacity-85 dark:opacity-90`}
      />

      {/* Tiny specular highlights on drip bulbs */}
      {highlights.map((h, idx) => (
        <ellipse
          key={idx}
          cx={h.cx}
          cy={h.cy}
          rx={h.rx}
          ry={h.ry}
          fill="#ffffff"
          className="opacity-30 dark:opacity-40"
        />
      ))}
    </svg>
  );
};
