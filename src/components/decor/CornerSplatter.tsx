import React from 'react';

export const CornerSplatter: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* Top-Left Splatter: Main irregular impact blob with directional satellite droplets */}
      <svg
        viewBox="0 0 200 200"
        className="absolute top-0 left-0 w-44 h-44 sm:w-56 sm:h-56 opacity-20 dark:opacity-25"
      >
        <g
          fill="url(#bloodRealGrad)"
          className="dark:fill-[url(#bloodRealGrad)] fill-[url(#bloodDriedGrad)]"
          filter="url(#bloodOrganicEdge)"
        >
          {/* Main irregular impact blob */}
          <path d="M 32 18 C 50 12, 65 24, 72 38 C 78 52, 68 68, 54 75 C 42 82, 28 80, 20 68 C 12 56, 16 38, 22 28 Z" />

          {/* Radiating spikes / fingers */}
          <path d="M 68 32 Q 95 48 115 62 Q 90 52 64 42 Z" />
          <path d="M 52 70 Q 75 98 88 125 Q 70 94 48 76 Z" />
          <path d="M 38 78 Q 44 112 48 140 Q 40 108 32 80 Z" />

          {/* Elongated satellite droplets flying downward-right */}
          <ellipse cx="132" cy="74" rx="3.5" ry="7" transform="rotate(58 132 74)" />
          <ellipse cx="148" cy="85" rx="2.5" ry="5.5" transform="rotate(62 148 85)" />
          <ellipse cx="98" cy="138" rx="3" ry="6.5" transform="rotate(35 98 138)" />
          <ellipse cx="112" cy="162" rx="2" ry="4.5" transform="rotate(32 112 162)" />
          <ellipse cx="56" cy="158" rx="2.2" ry="5" transform="rotate(12 56 158)" />

          {/* Micro speckles */}
          <circle cx="165" cy="98" r="1.5" />
          <circle cx="122" cy="180" r="1.2" />
          <circle cx="85" cy="170" r="1" />
          <circle cx="140" cy="120" r="1.8" />
          <circle cx="108" cy="100" r="1.4" />
          <circle cx="78" cy="148" r="1.6" />
        </g>
      </svg>

      {/* Mid-Left Subtle Splatter (Desktop only) */}
      <svg
        viewBox="0 0 160 160"
        className="hidden md:block absolute top-[45%] left-4 w-32 h-32 opacity-15 dark:opacity-20"
      >
        <g
          fill="url(#bloodRealGrad)"
          className="dark:fill-[url(#bloodRealGrad)] fill-[url(#bloodDriedGrad)]"
          filter="url(#bloodOrganicEdge)"
        >
          <path d="M 28 20 C 40 16, 52 26, 56 36 C 60 46, 54 58, 44 62 C 34 66, 22 62, 18 52 C 14 42, 18 28, 28 20 Z" />
          <ellipse cx="78" cy="52" rx="2.5" ry="5" transform="rotate(65 78 52)" />
          <ellipse cx="95" cy="62" rx="1.8" ry="3.8" transform="rotate(68 95 62)" />
          <ellipse cx="62" cy="88" rx="2.2" ry="4.5" transform="rotate(35 62 88)" />
          <circle cx="108" cy="72" r="1.2" />
          <circle cx="74" cy="104" r="1" />
          <circle cx="48" cy="95" r="1.4" />
        </g>
      </svg>

      {/* Bottom-Right Splatter */}
      <svg
        viewBox="0 0 200 200"
        className="absolute bottom-0 right-0 w-44 h-44 sm:w-56 sm:h-56 opacity-20 dark:opacity-25 rotate-180"
      >
        <g
          fill="url(#bloodRealGrad)"
          className="dark:fill-[url(#bloodRealGrad)] fill-[url(#bloodDriedGrad)]"
          filter="url(#bloodOrganicEdge)"
        >
          <path d="M 36 22 C 54 18, 68 28, 74 44 C 80 58, 70 72, 56 80 C 42 86, 28 82, 22 70 C 14 58, 20 38, 36 22 Z" />
          <path d="M 72 38 Q 102 54 122 70 Q 94 58 68 46 Z" />
          <path d="M 56 74 Q 82 105 95 132 Q 74 100 50 82 Z" />
          <ellipse cx="140" cy="82" rx="3.2" ry="6.8" transform="rotate(55 140 82)" />
          <ellipse cx="106" cy="148" rx="2.8" ry="6" transform="rotate(30 106 148)" />
          <circle cx="158" cy="94" r="1.4" />
          <circle cx="118" cy="168" r="1.2" />
          <circle cx="132" cy="128" r="1.6" />
        </g>
      </svg>
    </div>
  );
};
