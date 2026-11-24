import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { useToast } from '../hooks/useToast';
import { buildTextSummary, buildSocialShareUrls } from '../lib/sharing';

interface ShareMenuProps {
  buttonRef: React.RefObject<HTMLButtonElement>;
  isOpen: boolean;
  onClose: () => void;
  onOpenImageCard?: () => void;
  onCopyLink?: () => void;
  onDownloadCsv?: () => void;
}

export const ShareMenu: React.FC<ShareMenuProps> = ({
  buttonRef,
  isOpen,
  onClose,
  onOpenImageCard,
  onCopyLink,
  onDownloadCsv,
}) => {
  const { people, settlements, totalSpentMinor, currency } = useExpenseStore();
  const { showToast } = useToast();

  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; flipUp: boolean }>({
    top: 0,
    left: 0,
    width: 260,
    flipUp: false,
  });

  const [canWebShare, setCanWebShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check Web Share API and mobile screen size
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanWebShare(true);
    }
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Compute popover position relative to button
  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !isOpen || isMobile) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 360; // Estimated max height
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < menuHeight && rect.top > menuHeight;

    const top = flipUp ? rect.top - 8 : rect.bottom + 8;
    // Align menu right edge with button right edge if possible
    const menuWidth = 260;
    const left = Math.max(12, Math.min(window.innerWidth - menuWidth - 12, rect.right - menuWidth));

    setCoords({ top, left, width: menuWidth, flipUp });
  }, [buttonRef, isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Lock body scroll on mobile bottom sheet
  useEffect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMobile]);

  // Trap focus and keyboard navigation inside menu
  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the first focusable item
    const timer = setTimeout(() => {
      if (menuRef.current) {
        const firstBtn = menuRef.current.querySelector<HTMLButtonElement>('button:not([disabled])');
        firstBtn?.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        buttonRef.current?.focus();
        return;
      }

      if (!menuRef.current) return;
      const items = Array.from(menuRef.current.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
      if (items.length === 0) return;

      const activeIndex = items.indexOf(document.activeElement as HTMLButtonElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = activeIndex >= items.length - 1 ? 0 : activeIndex + 1;
        items[nextIndex].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
        items[prevIndex].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (e.key === 'Tab') {
        // Trap focus inside modal
        if (e.shiftKey && document.activeElement === items[0]) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, buttonRef]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen || typeof document === 'undefined') return null;

  const summary = buildTextSummary({
    people,
    settlements,
    totalSpentMinor,
    currency,
  });

  const { whatsappUrl, telegramUrl, smsUrl, mailtoUrl } = buildSocialShareUrls(summary);

  // Handlers
  const handleNativeShare = () => {
    // Calling navigator.share directly synchronously to retain user activation
    if (navigator.share) {
      navigator.share({
        title: 'Pennywise Tab Summary',
        text: summary,
      }).catch((err) => {
        // AbortError is user cancellation - silent no-op
        if (err.name !== 'AbortError') {
          showToast("Couldn't open system share", '⚠️');
        }
      });
      onClose();
      buttonRef.current?.focus();
    }
  };

  const handleOpenApp = (url: string, name: string, isLinkOut = true) => {
    showToast(`Opening ${name}…`, '🎈');
    onClose();
    buttonRef.current?.focus();

    if (isLinkOut) {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = url;
      }
    } else {
      window.location.href = url;
    }
  };

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summary);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = summary;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast("Copied… they'll see it.", '✓');
    } catch {
      showToast('Could not copy text', '⚠️');
    }
    onClose();
    buttonRef.current?.focus();
  };

  const menuContent = (
    <div
      role="menu"
      aria-label="Share damage options"
      className="p-1.5 flex flex-col gap-0.5 text-text-base text-sm"
    >
      {/* 1. Native Web Share (if supported) */}
      {canWebShare && (
        <button
          type="button"
          role="menuitem"
          onClick={handleNativeShare}
          className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
        >
          <svg className="w-5 h-5 text-accent-text shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="font-medium">Share…</span>
        </button>
      )}

      {/* 2. WhatsApp */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOpenApp(whatsappUrl, 'WhatsApp', true)}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        <svg className="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.68-1.4 1.26-1.93 1.34-.51.08-1.17.11-3.37-.8-2.65-1.1-4.36-3.79-4.49-3.97-.13-.18-1.07-1.42-1.07-2.71 0-1.29.68-1.92.92-2.18.24-.26.53-.33.71-.33.18 0 .35 0 .5.01.16.01.38-.06.59.45.22.53.75 1.83.82 1.97.07.13.11.29.02.47-.09.18-.14.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.54.16.26.7 1.15 1.5 1.87 1.03.92 1.89 1.21 2.16 1.34.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.59.75 1.86.89.27.13.45.2.52.31.07.12.07.69-.17 1.37z" />
        </svg>
        <span>WhatsApp</span>
      </button>

      {/* 3. Telegram */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOpenApp(telegramUrl, 'Telegram', true)}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        <svg className="w-5 h-5 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
        <span>Telegram</span>
      </button>

      {/* 4. SMS */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOpenApp(smsUrl, 'SMS', false)}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>SMS message</span>
      </button>

      {/* 5. Email */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOpenApp(mailtoUrl, 'Email', false)}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Email</span>
      </button>

      <div className="h-px bg-border my-1" />

      {/* 6. Copy Text */}
      <button
        type="button"
        role="menuitem"
        onClick={handleCopyText}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        <svg className="w-5 h-5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Copy text summary</span>
      </button>

      {/* 7. Image card (PNG) */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onOpenImageCard?.();
        }}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Image card (PNG)</span>
      </button>

      {/* 8. Copy Link */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onCopyLink?.();
        }}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        <svg className="w-5 h-5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span>Copy shareable link</span>
      </button>

      {/* 9. Download CSV */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onDownloadCsv?.();
        }}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center gap-3 hover:bg-background/80 hover:text-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
      >
        <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Download CSV</span>
      </button>
    </div>
  );

  // Render Portal in document.body
  return createPortal(
    isMobile ? (
      // Mobile Bottom Sheet
      <div
        className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-card-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
            buttonRef.current?.focus();
          }
        }}
      >
        <div
          ref={menuRef}
          className="w-full bg-surface border-t border-border rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl animate-card-in max-h-[85vh] overflow-y-auto"
        >
          {/* Sheet Handle */}
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-3 opacity-60" />

          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <h3 className="font-display text-lg text-text-base tracking-wide flex items-center gap-2">
              <span>🎈 Share the damage</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                buttonRef.current?.focus();
              }}
              aria-label="Close share menu"
              className="p-1 text-text-muted hover:text-text-base min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
            >
              ✕
            </button>
          </div>

          {menuContent}
        </div>
      </div>
    ) : (
      // Desktop Popover Dropdown
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          width: coords.width,
        }}
        className={`z-[100] bg-surface border border-border rounded-2xl shadow-2xl animate-card-in overflow-hidden transition-all duration-150 ${
          coords.flipUp ? '-translate-y-full' : ''
        }`}
      >
        <div className="px-3.5 py-2.5 border-b border-border bg-background/40 flex items-center justify-between">
          <span className="font-display text-sm tracking-wide text-text-base flex items-center gap-1.5">
            <span>🎈</span> Share the damage
          </span>
          <span className="text-[11px] text-text-muted">Esc to close</span>
        </div>
        {menuContent}
      </div>
    ),
    document.body
  );
};
