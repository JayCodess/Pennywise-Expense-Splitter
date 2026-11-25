import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';

interface ImageCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerButtonRef?: React.RefObject<HTMLButtonElement>;
}

export const ImageCardPreviewModal: React.FC<ImageCardPreviewModalProps> = ({
  isOpen,
  onClose,
  triggerButtonRef,
}) => {
  const { people, settlements, expenses, totalSpentMinor, currency } = useExpenseStore();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileToShare, setFileToShare] = useState<File | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Lazy load imageCard.ts and render on open
  useEffect(() => {
    if (!isOpen) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setFileToShare(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const generate = async () => {
      try {
        // Dynamic lazy import to preserve initial bundle size
        const { renderReceiptCardBlob, getImageFileName } = await import('../lib/imageCard');
        const fileName = getImageFileName();

        const blob = await renderReceiptCardBlob({
          people,
          settlements,
          expenses,
          totalSpentMinor,
          currency,
          theme,
        });

        if (!isMounted) return;

        const file = new File([blob], fileName, { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        setBlobUrl(url);
        setFileToShare(file);

        // Check navigator.canShare for files
        if (
          typeof navigator !== 'undefined' &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] })
        ) {
          setCanShareFiles(true);
        } else {
          setCanShareFiles(false);
        }
      } catch (err) {
        if (!isMounted) return;
        showToast('Could not generate receipt image', '⚠️');
        onClose();
        triggerButtonRef?.current?.focus();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    generate();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, people, settlements, totalSpentMinor, currency, theme]);

  // Lock body scroll and handle keyboard accessibility (Escape, focus trap)
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button initially
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        triggerButtonRef?.current?.focus();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>(
            'button:not([disabled]), a[download]'
          )
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerButtonRef]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleShareFile = () => {
    if (fileToShare && navigator.share) {
      navigator.share({
        files: [fileToShare],
        title: 'Pennywise: expense summary',
      }).then(() => {
        showToast('Image shared', '🎈');
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          showToast('Could not share image', '⚠️');
        }
      });
    }
  };

  const fileName = `pennywise-${new Date().toISOString().split('T')[0]}.png`;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-card-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          triggerButtonRef?.current?.focus();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-card-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎈</span>
            <h3 id="image-card-modal-title" className="font-display text-lg text-text-base tracking-wide">
              Receipt Image Card
            </h3>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => {
              onClose();
              triggerButtonRef?.current?.focus();
            }}
            aria-label="Close image preview"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-text-base hover:bg-background/80 transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 flex flex-col items-center justify-center overflow-y-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-text-muted">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <p className="text-sm font-medium">Drawing receipt card…</p>
            </div>
          ) : blobUrl ? (
            <div className="relative max-h-[58vh] overflow-hidden rounded-xl border border-border/80 shadow-md">
              <img
                src={blobUrl}
                alt="Pennywise settlement receipt card preview"
                className="max-h-[58vh] w-auto object-contain mx-auto select-none"
              />
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border bg-background/40 flex items-center justify-end gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {canShareFiles && fileToShare && (
            <button
              type="button"
              onClick={handleShareFile}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-accent-text bg-surface text-accent-text hover:bg-accent-text/10 text-xs font-semibold flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
            >
              <span>Share image</span>
            </button>
          )}

          {blobUrl && (
            <a
              href={blobUrl}
              download={fileName}
              onClick={() => {
                showToast('Image saved', '✓');
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent-text shadow-sm"
            >
              <span>Save image</span>
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
