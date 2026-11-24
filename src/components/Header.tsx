import React from 'react';
import { ClownMascot } from './ClownMascot';
import { Balloon } from './Balloon';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  glowMascot?: boolean;
  grinWiden?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ glowMascot = false, grinWiden = false }) => {
  return (
    <header className="relative w-full max-w-xl mx-auto pt-2 sm:pt-6 pb-3 sm:pb-4 px-3 sm:px-4 select-none">
      {/* Unobtrusive theme toggle anchored cleanly in the top right; does not collide with title on 360px */}
      <div className="flex justify-end mb-1 sm:mb-0 sm:absolute sm:top-4 sm:right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {/* Mascot (90px mobile, 120px desktop) & Bobbing Balloon */}
        <div className="flex items-center shrink-0 relative">
          <ClownMascot glow={glowMascot} grinWiden={grinWiden} />
          <div className="-ml-4 -mt-8 sm:-ml-6 sm:-mt-12">
            <Balloon size={58} className="w-[34px] sm:w-[46px]" />
          </div>
        </div>

        {/* Brand Headings */}
        <div className="text-left min-w-0">
          <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl tracking-wide text-text-base animate-title-flicker truncate">
            Pennywise
          </h1>
          <p className="text-text-muted text-xs sm:text-base font-medium tracking-tight mt-0.5">
            Everyone pays in the end.
          </p>
        </div>
      </div>
    </header>
  );
};
