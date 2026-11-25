import React, { useMemo } from 'react';
import { generateHorizontalBloodEdge, DripSpec } from './bloodUtils';

export const ViewportBloodLip: React.FC = () => {
  const bloodData = useMemo(() => {
    const width = 1200;
    const drips: DripSpec[] = [
      // Left outer flank (heavy, long drips: 40px - 170px)
      { x: 45, length: 110, stemWidth: 5.5, bulbRadius: 7, hasDetachedDroplet: true, detachedY: 126, detachedRadius: 2.2 },
      { x: 110, length: 55, stemWidth: 4, bulbRadius: 5, hasDetachedDroplet: false },
      { x: 175, length: 165, stemWidth: 6.2, bulbRadius: 8.5, hasDetachedDroplet: true, detachedY: 184, detachedRadius: 2.8 },
      { x: 235, length: 70, stemWidth: 4.5, bulbRadius: 5.8, hasDetachedDroplet: false },
      { x: 290, length: 35, stemWidth: 3.5, bulbRadius: 4.2, hasDetachedDroplet: false },

      // Center safe zone (x: 340 to 860) — strictly short (< 20px) so title and mascot are 100% clear
      { x: 380, length: 14, stemWidth: 3.2, bulbRadius: 3.2, hasDetachedDroplet: false },
      { x: 490, length: 16, stemWidth: 3, bulbRadius: 3.4, hasDetachedDroplet: false },
      { x: 600, length: 12, stemWidth: 2.8, bulbRadius: 3, hasDetachedDroplet: false },
      { x: 710, length: 15, stemWidth: 3, bulbRadius: 3.2, hasDetachedDroplet: false },
      { x: 820, length: 18, stemWidth: 3.5, bulbRadius: 3.6, hasDetachedDroplet: false },

      // Right outer flank (heavy, long drips: 40px - 160px)
      { x: 910, length: 45, stemWidth: 4, bulbRadius: 4.8, hasDetachedDroplet: false },
      { x: 965, length: 140, stemWidth: 5.8, bulbRadius: 7.8, hasDetachedDroplet: true, detachedY: 156, detachedRadius: 2.4 },
      { x: 1030, length: 80, stemWidth: 4.8, bulbRadius: 6, hasDetachedDroplet: false },
      { x: 1100, length: 160, stemWidth: 6.5, bulbRadius: 8.2, hasDetachedDroplet: true, detachedY: 178, detachedRadius: 2.6 },
      { x: 1160, length: 95, stemWidth: 5, bulbRadius: 6.4, hasDetachedDroplet: false },
    ];

    return generateHorizontalBloodEdge(width, 7, drips, 777);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 right-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1200 210"
        preserveAspectRatio="none"
        className="w-full h-24 sm:h-36 md:h-44 overflow-visible animate-drip-grow"
        style={{
          filter: 'url(#bloodContactShadow)',
        }}
      >
        {/* Continuous top pooled blood path */}
        <path
          d={bloodData.path}
          fill="url(#bloodRealGrad)"
          className="dark:fill-[url(#bloodRealGrad)] fill-[url(#bloodDriedGrad)]"
          filter="url(#bloodOrganicEdge)"
        />

        {/* Stem specular highlights */}
        {bloodData.stemHighlights.map((d, idx) => (
          <path
            key={`v-stem-${idx}`}
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.9"
            strokeLinecap="round"
            className="opacity-25 dark:opacity-30"
          />
        ))}

        {/* Bulb glossy highlights */}
        {bloodData.bulbHighlights.map((b, idx) => (
          <ellipse
            key={`v-bulb-${idx}`}
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
        {bloodData.detachedDroplets.map((drop, idx) => (
          <g key={`v-detached-${idx}`} className="animate-drip-creep">
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
              className="opacity-45"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
