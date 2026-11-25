import React, { useMemo } from 'react';
import {
  generateHorizontalBloodEdge,
  generateVerticalBloodTrickle,
  createPRNG,
  DripSpec,
} from './bloodUtils';

interface BloodDripsProps {
  edge?: 'top' | 'bottom' | 'left' | 'right';
  seed?: number;
  width?: number;
  height?: number;
  maxDripLength?: number;
  className?: string;
}

export const BloodDrips: React.FC<BloodDripsProps> = ({
  edge = 'top',
  seed = 42,
  width = 240,
  height = 50,
  maxDripLength = 22,
  className = '',
}) => {
  const rand = useMemo(() => createPRNG(seed), [seed]);

  const bloodData = useMemo(() => {
    if (edge === 'top' || edge === 'bottom') {
      // Generate 2-4 irregular drips positioned along width
      const numDrips = 2 + Math.floor(rand() * 3);
      const drips: DripSpec[] = [];

      for (let i = 0; i < numDrips; i++) {
        // Space them across the edge with clustering
        const xPos = 20 + ((width - 40) / numDrips) * i + (rand() - 0.5) * 16;
        const dLen = 10 + rand() * (maxDripLength - 10);
        const stemW = 3.2 + rand() * 3.5;
        const bulbR = stemW * (0.85 + rand() * 0.45);
        const hasDetached = dLen > 28 && rand() > 0.6;

        drips.push({
          x: Math.max(12, Math.min(width - 12, xPos)),
          length: Math.max(12, dLen),
          stemWidth: stemW,
          bulbRadius: Math.max(2.8, bulbR),
          hasDetachedDroplet: hasDetached,
          detachedY: dLen + 6 + rand() * 8,
          detachedRadius: 1.5 + rand() * 1.2,
        });
      }

      return {
        type: 'horizontal' as const,
        ...generateHorizontalBloodEdge(width, 5 + rand() * 3, drips, seed),
      };
    } else {
      // Side vertical trickle running down the outer border
      return {
        type: 'vertical' as const,
        ...generateVerticalBloodTrickle(height, edge, seed),
      };
    }
  }, [edge, seed, width, height, maxDripLength, rand]);

  return (
    <svg
      aria-hidden="true"
      viewBox={
        bloodData.type === 'horizontal' ? `0 0 ${width} ${maxDripLength + 20}` : `0 0 24 ${height}`
      }
      className={`pointer-events-none select-none overflow-visible animate-drip-grow ${className}`}
      style={{
        filter: 'url(#bloodContactShadow)',
      }}
    >
      {/* Base blood path with ragged organic filter */}
      <path
        d={bloodData.path}
        fill="url(#bloodRealGrad)"
        className="dark:fill-[url(#bloodRealGrad)] fill-[url(#bloodDriedGrad)]"
        filter="url(#bloodOrganicEdge)"
      />

      {/* Specular stem highlights (wet reflection on the left side) */}
      {bloodData.type === 'horizontal' &&
        bloodData.stemHighlights.map((d, idx) => (
          <path
            key={`stem-${idx}`}
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeLinecap="round"
            className="opacity-25 dark:opacity-30"
          />
        ))}

      {/* Specular bulb highlights (glossy reflections on bulbs) */}
      {bloodData.type === 'horizontal' &&
        bloodData.bulbHighlights.map((b, idx) => (
          <ellipse
            key={`bulb-${idx}`}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            transform={`rotate(-20 ${b.cx} ${b.cy})`}
            fill="#ffffff"
            className="opacity-40 dark:opacity-50"
          />
        ))}

      {/* Detached falling droplets */}
      {bloodData.type === 'horizontal' &&
        bloodData.detachedDroplets.map((drop, idx) => (
          <g key={`detached-${idx}`} className="animate-drip-creep">
            <circle
              cx={drop.cx}
              cy={drop.cy}
              r={drop.r}
              fill="url(#bloodRealGrad)"
              className="dark:fill-[url(#bloodRealGrad)] fill-[url(#bloodDriedGrad)]"
            />
            <ellipse
              cx={drop.highlight.cx}
              cy={drop.highlight.cy}
              rx={drop.highlight.rx}
              ry={drop.highlight.ry}
              fill="#ffffff"
              className="opacity-40"
            />
          </g>
        ))}

      {/* Side vertical trickle highlight */}
      {bloodData.type === 'vertical' && bloodData.highlight && (
        <ellipse
          cx={bloodData.highlight.cx}
          cy={bloodData.highlight.cy}
          rx={bloodData.highlight.rx}
          ry={bloodData.highlight.ry}
          fill="#ffffff"
          className="opacity-35"
        />
      )}
    </svg>
  );
};
