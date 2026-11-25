import React, { useState, useEffect, useRef } from 'react';

interface ClownMascotProps {
  className?: string;
  glow?: boolean;
  grinWiden?: boolean;
}

export const ClownMascot: React.FC<ClownMascotProps> = ({
  className = '',
  glow = false,
  grinWiden = false,
}) => {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Desktop-only pupil follow cursor (pointer: fine, throttled)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const fineMql = window.matchMedia('(pointer: fine)');
    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isFinePointer = fineMql ? fineMql.matches : false;
    const isReducedMotion = motionMql ? motionMql.matches : false;
    if (!isFinePointer || isReducedMotion) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const angle = Math.atan2(deltaY, deltaX);
        const dist = Math.min(Math.hypot(deltaX, deltaY), 300);

        // Max pupil offset of 2px
        const maxOffset = 2.0;
        const offset = (dist / 300) * maxOffset;

        setPupilOffset({
          x: Math.cos(angle) * offset,
          y: Math.sin(angle) * offset,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label="Creepy clown mascot"
      viewBox="0 0 120 120"
      className={`inline-block select-none overflow-visible w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] animate-clown-breathe ${className}`}
    >
      <defs>
        {/* Subtle, nuanced gradient for creepy corpse/chalk skin with hollow undertones */}
        <radialGradient id="clownSkinGrad" cx="48%" cy="42%" r="56%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f4efe6" />
          <stop offset="78%" stopColor="#d5cbbe" />
          <stop offset="100%" stopColor="#9b8e84" />
        </radialGradient>

        {/* Deep sunken eye socket shadow */}
        <radialGradient id="socketShadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1216" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#2c1f25" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#2c1f25" stopOpacity="0" />
        </radialGradient>

        {/* Glowing sickly yellow eye gradient */}
        <radialGradient id="eyeGlowGrad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fff8b3" />
          <stop offset="45%" stopColor="#f5d020" />
          <stop offset="85%" stopColor="#d99b00" />
          <stop offset="100%" stopColor="#805000" />
        </radialGradient>

        {/* Nose 3D gradient */}
        <radialGradient id="noseGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff4d5a" />
          <stop offset="50%" stopColor="#c1121f" />
          <stop offset="100%" stopColor="#54050b" />
        </radialGradient>

        {/* Eerie glow filter for yellow eyes */}
        <filter id="eyeGlowFilter" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={glow ? '2.8' : '1.2'} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ruffled accordion collar with deep shadows */}
      <g className="clown-collar" fill="#ded4c3" stroke="#2a2226" strokeWidth="1.4">
        <path d="M 24 108 Q 36 90 46 105 Q 60 88 74 105 Q 84 90 96 108 Q 60 122 24 108 Z" />
        <path
          d="M 34 104 Q 46 92 60 101 Q 74 92 86 104"
          fill="none"
          stroke="#685c54"
          strokeWidth="1"
        />
      </g>

      {/* Wild, unruly tufts of matted red circus hair */}
      <g className="clown-hair" fill="#a80f19" stroke="#3b0307" strokeWidth="1.2">
        {/* Left jagged hair tufts */}
        <path d="M 32 38 C 16 32 8 46 11 58 C 4 63 6 76 17 80 C 10 86 19 94 30 88 C 24 75 26 54 32 38 Z" />
        <path d="M 18 45 C 11 40 8 48 12 55" fill="none" stroke="#d9232e" strokeWidth="1.2" />
        <path d="M 22 66 C 14 68 15 76 21 78" fill="none" stroke="#d9232e" strokeWidth="0.8" />
        {/* Right jagged hair tufts */}
        <path d="M 88 38 C 104 32 112 46 109 58 C 116 63 114 76 103 80 C 110 86 101 94 90 88 C 96 75 94 54 88 38 Z" />
        <path d="M 102 45 C 109 40 112 48 108 55" fill="none" stroke="#d9232e" strokeWidth="1.2" />
        <path d="M 98 66 C 106 68 105 76 99 78" fill="none" stroke="#d9232e" strokeWidth="0.8" />
      </g>

      {/* Chalk-white head shape with subtle corpse gradient */}
      <ellipse
        cx="60"
        cy="58"
        rx="34"
        ry="39"
        fill="url(#clownSkinGrad)"
        stroke="#3a2e34"
        strokeWidth="1.8"
      />

      {/* Sunken cheek hollows */}
      <ellipse cx="34" cy="74" rx="4" ry="7" fill="#8e8076" opacity="0.25" />
      <ellipse cx="86" cy="74" rx="4" ry="7" fill="#8e8076" opacity="0.25" />

      {/* Sunken shadowed eye sockets */}
      <ellipse cx="45" cy="50" rx="10" ry="8" fill="url(#socketShadowGrad)" />
      <ellipse cx="75" cy="49" rx="9" ry="7" fill="url(#socketShadowGrad)" />

      {/* Piercing sinister eye makeup — vertical blood-red slashes extending above & below */}
      <g fill="#940b13" stroke="#480509" strokeWidth="0.6">
        {/* Left vertical makeup slash (curving sharply) */}
        <path d="M 45 28 L 49 43 L 41 43 Z" />
        <path d="M 41 57 L 49 57 L 44 72 Z" />
        {/* Right vertical makeup slash */}
        <path d="M 75 30 L 78 43 L 71 43 Z" />
        <path d="M 71 56 L 78 56 L 74 71 Z" />
      </g>

      {/* Asymmetrical eyes — left eye wide & unblinking, right eye narrower & squinting */}
      <g className="clown-eyes" filter="url(#eyeGlowFilter)">
        {/* Left eye: larger, rounder, fixed manic stare */}
        <ellipse
          cx="45"
          cy="50"
          rx="5.2"
          ry="4.2"
          fill="url(#eyeGlowGrad)"
          stroke="#1a1402"
          strokeWidth="0.8"
        />
        <circle cx={45 + pupilOffset.x} cy={50 + pupilOffset.y} r="1.6" fill="#140d02" />
        <circle
          cx={43.8 + pupilOffset.x * 0.8}
          cy={48.8 + pupilOffset.y * 0.8}
          r="0.6"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Right eye: slightly smaller, narrowed, subtly angled squint */}
        <ellipse
          cx="75"
          cy="49.5"
          rx="3.8"
          ry="2.8"
          transform="rotate(-6 75 49.5)"
          fill="url(#eyeGlowGrad)"
          stroke="#1a1402"
          strokeWidth="0.8"
        />
        <circle cx={75 + pupilOffset.x} cy={49.5 + pupilOffset.y} r="1.1" fill="#140d02" />
        <circle
          cx={74.2 + pupilOffset.x * 0.8}
          cy={48.8 + pupilOffset.y * 0.8}
          r="0.4"
          fill="#ffffff"
          opacity="0.8"
        />
      </g>

      {/* Bulbous red clown nose */}
      <circle cx="60" cy="62" r="6.2" fill="url(#noseGrad)" stroke="#3e0307" strokeWidth="0.8" />
      <circle cx="58" cy="60" r="1.6" fill="#ffffff" opacity="0.6" />

      {/* Creepy extended wide stitched grin reaching high toward the cheeks */}
      <g
        className="clown-mouth transition-transform duration-300 origin-[60px_76px]"
        style={{ transform: grinWiden ? 'scale(1.08, 1.14)' : 'scale(1)' }}
      >
        {/* Blood-red lacerated grin curving sharply upward toward cheekbones */}
        <path
          d="M 28 66 Q 38 88 60 93 Q 82 88 92 66 Q 80 82 60 84 Q 40 82 28 66 Z"
          fill="#940b13"
          stroke="#3d0307"
          strokeWidth="1.2"
        />

        {/* Dark void between lips */}
        <path
          d="M 32 68 Q 42 84 60 88 Q 78 84 88 68 Q 78 78 60 80 Q 42 78 32 68 Z"
          fill="#120608"
        />

        {/* Tiny sharp pointed teeth in the void */}
        <polygon points="46,80 48,77 50,80" fill="#ede5d8" />
        <polygon points="53,81 55,77 57,81" fill="#ede5d8" />
        <polygon points="62,81 64,77 66,81" fill="#ede5d8" />
        <polygon points="69,80 71,77 73,80" fill="#ede5d8" />

        {/* Prominent stitched suture lines cutting through lips */}
        <g stroke="#1b1216" strokeWidth="1.4" strokeLinecap="round">
          {/* Far left cheek stitches */}
          <line x1="28" y1="63" x2="31" y2="70" />
          <line x1="34" y1="67" x2="36" y2="74" />
          {/* Middle stitches */}
          <line x1="41" y1="72" x2="43" y2="79" />
          <line x1="48" y1="75" x2="49" y2="84" />
          <line x1="55" y1="77" x2="55" y2="86" />
          <line x1="61" y1="77" x2="61" y2="86" />
          <line x1="67" y1="75" x2="66" y2="84" />
          <line x1="74" y1="72" x2="73" y2="79" />
          {/* Far right cheek stitches */}
          <line x1="81" y1="67" x2="79" y2="74" />
          <line x1="87" y1="63" x2="84" y2="70" />
        </g>

        {/* Grotesque upward grin extensions carving deep into the cheeks */}
        <path
          d="M 28 65 Q 24 58 22 55"
          fill="none"
          stroke="#940b13"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 92 65 Q 96 58 98 55"
          fill="none"
          stroke="#940b13"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Thin glossy blood trickle from corner of grin */}
        <path
          d="M 28 66 C 26 71 27 76 26.5 81 C 26.5 83 25.5 84 24.5 84 C 23.5 84 22.8 83 23 81 C 23.5 76 25 71 26 66 Z"
          fill="#800a12"
        />
        <circle cx="24.5" cy="83" r="0.6" fill="#ffffff" opacity="0.5" />
      </g>

      {/* Thin blood trickle from lower edge of eye */}
      <path
        d="M 44.5 54 C 44 58 43.5 61 43.2 64 C 43 65.5 42 66.5 41 66.5 C 40 66.5 39.5 65.5 39.8 64 C 40.5 61 41.5 58 42.5 54 Z"
        fill="#7a0810"
      />
      <circle cx="41" cy="65.5" r="0.5" fill="#ffffff" opacity="0.45" />
    </svg>
  );
};
