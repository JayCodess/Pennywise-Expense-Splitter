import React, { useState } from 'react';
import { ShareablePayload } from '../lib/linkCodec';
import { useExpenseStore } from '../hooks/useExpenseStore';

interface SharedTripBannerProps {
  payload?: ShareablePayload | null;
  errorMessage?: string | null;
  onImport: () => void;
  onExit: () => void;
  onDismissError?: () => void;
}

export const SharedTripBanner: React.FC<SharedTripBannerProps> = ({
  payload,
  errorMessage,
  onImport,
  onExit,
  onDismissError,
}) => {
  const { hasSavedData } = useExpenseStore();
  const [showConfirmReplace, setShowConfirmReplace] = useState(false);

  // If there's an error decoding the link
  if (errorMessage) {
    return (
      <aside
        role="alert"
        aria-label="Shared trip error"
        className="mb-4 p-4 rounded-card border border-negative/60 bg-surface/95 backdrop-blur-md shadow-carnival text-text-base animate-card-in"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none" aria-hidden="true">⚠️</span>
            <div>
              <p className="font-semibold text-sm text-negative-text">
                Could not load shared link
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {errorMessage}
              </p>
            </div>
          </div>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="min-h-[44px] px-4 py-1.5 rounded-xl border border-border bg-background text-text-base text-xs font-semibold hover:border-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
            >
              Dismiss
            </button>
          )}
        </div>
      </aside>
    );
  }

  if (!payload) return null;

  const handleImportClick = () => {
    if (hasSavedData) {
      setShowConfirmReplace(true);
    } else {
      onImport();
    }
  };

  const personCount = payload.people.length;
  const expenseCount = payload.expenses.length;

  return (
    <aside
      role="region"
      aria-label="Shared trip notification"
      className="mb-4 p-4 rounded-card border border-accent/60 bg-surface/95 backdrop-blur-md shadow-carnival text-text-base animate-card-in"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none" aria-hidden="true">🎈</span>
          <div>
            <p className="font-semibold text-sm text-text-base">
              You're viewing a shared trip ({personCount} {personCount === 1 ? 'person' : 'people'}, {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}).
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Read-only view. Your saved data is untouched.
            </p>
          </div>
        </div>

        {showConfirmReplace ? (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end bg-background/80 p-2 rounded-xl border border-border">
            <span className="text-xs font-medium text-negative-text">Replace your current expenses?</span>
            <button
              type="button"
              onClick={onImport}
              className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-negative text-white text-xs font-semibold hover:bg-accent-hover transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
            >
              Yes, replace
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmReplace(false)}
              className="min-h-[44px] px-3 py-1.5 rounded-lg border border-border bg-surface text-text-base text-xs font-medium hover:border-accent-text transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleImportClick}
              className="min-h-[44px] px-4 py-1.5 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
            >
              Import
            </button>

            <button
              type="button"
              onClick={onExit}
              className="min-h-[44px] px-4 py-1.5 rounded-xl border border-border bg-background text-text-base hover:border-accent-text text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
            >
              Exit
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
