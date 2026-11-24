import React, { useState, useEffect, useRef } from 'react';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { formatMoney } from '../lib/money';
import { StormDrain } from './StormDrain';
import { CardTopBlood } from './decor/CardTopBlood';
import { CardBalloon } from './decor/CardBalloon';

export const ResultsCard: React.FC = () => {
  const {
    people,
    expenses,
    currency,
    balances,
    settlements,
    totalSpentMinor,
    clearAll,
  } = useExpenseStore();

  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const banishTriggerBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBanishBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let timer: number;
    if (copied) {
      timer = window.setTimeout(() => setCopied(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  // Handle Escape key to cancel Banish confirmation and focus cancel button when open
  useEffect(() => {
    if (showClearConfirm && cancelBanishBtnRef.current) {
      cancelBanishBtnRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showClearConfirm) {
        setShowClearConfirm(false);
        banishTriggerBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showClearConfirm]);

  const getPersonName = (id: string) => {
    return people.find((p) => p.id === id)?.name || id;
  };

  const handleShare = async () => {
    const lines = [
      `🎈 Pennywise Tab — Everyone pays in the end.`,
      `Total spent: ${formatMoney(totalSpentMinor, currency)}`,
      '',
      'Settlements:',
      ...settlements.map((s) => `• ${getPersonName(s.from)} owes ${getPersonName(s.to)} ${formatMoney(s.amountMinor, currency)}`),
    ];
    const text = lines.join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
      }
    } catch {
      setCopied(false);
    }
  };

  const hasData = people.length > 0 && expenses.length > 0;
  const isAllSquare = hasData && settlements.length === 0;

  // Short concise summary for screen readers (aria-live="polite")
  const summaryText = !hasData
    ? 'Waiting for people and expenses'
    : isAllSquare
    ? 'All settled'
    : `${settlements.length} ${settlements.length === 1 ? 'payment' : 'payments'} to settle up`;

  return (
    <section
      id="results-card"
      aria-labelledby="results-title"
      className="relative bg-surface border border-border rounded-card p-4 sm:p-5 pt-8 sm:pt-9 shadow-carnival animate-card-in overflow-hidden"
    >
      <div
        data-testid="card-blood-layer"
        className="absolute top-0 left-0 right-0 h-[18px] overflow-hidden pointer-events-none z-0"
      >
        <CardTopBlood seed={104} />
      </div>

      {/* Decorative balloon positioned strictly outside the card content on top right */}
      <CardBalloon className="-top-3 -right-2" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 id="results-title" className="font-display text-2xl text-text-base tracking-wide flex items-center gap-2">
            <span>Who Pays Whom</span>
            {settlements.length > 0 && (
              <span className="font-sans text-xs bg-accent text-white px-2 py-0.5 rounded-full font-bold">
                {settlements.length}
              </span>
            )}
          </h2>
          {/* Concise aria-live summary so screen readers only hear concise updates */}
          <p aria-live="polite" className="text-xs text-text-muted mt-0.5">
            {summaryText}
          </p>
        </div>

        {settlements.length > 0 && (
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-text-base hover:border-accent-text hover:text-accent-text transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent-text shrink-0"
          >
            <span>{copied ? '✓' : '🎈'}</span>
            <span>{copied ? "Copied… they'll see it." : 'Share the damage'}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="py-8 px-4 rounded-xl border border-dashed border-border/80 bg-background/50 text-center flex flex-col items-center justify-center gap-2">
          <StormDrain size={36} peekingBalloon />
          <p className="text-sm text-text-muted">
            Add people and expenses to see who owes whom.
          </p>
        </div>
      )}

      {/* All Square State with balloon floating up and away */}
      {isAllSquare && (
        <div className="py-8 px-4 rounded-xl border border-dashed border-border/80 bg-background/50 text-center flex flex-col items-center justify-center gap-2 animate-card-in">
          <div className="animate-float-away select-none" aria-hidden="true">
            <svg viewBox="0 0 32 48" className="w-8 h-12 inline-block">
              <ellipse cx="16" cy="16" rx="13" ry="16" fill="#c1121f" />
              <ellipse cx="11" cy="11" rx="3.5" ry="6" fill="#ffffff" opacity="0.4" />
              <polygon points="13,32 19,32 20,34 12,34" fill="#8f0d17" />
              <path d="M 16 34 Q 14 40 17 48" fill="none" stroke="var(--color-text-muted)" strokeWidth="0.8" />
            </svg>
          </div>
          <p className="text-base font-semibold text-text-base">All settled. For now. 🎈</p>
          <p className="text-xs text-text-muted">Nobody owes a single coin.</p>
        </div>
      )}

      {/* Active Settlements Cards */}
      {settlements.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Settlement Payments
          </h3>
          <ul className="space-y-2" aria-label="Settlement payments">
            {settlements.map((s, idx) => {
              const fromName = getPersonName(s.from);
              const toName = getPersonName(s.to);
              const amountFormatted = formatMoney(s.amountMinor, currency);

              return (
                <li
                  key={idx}
                  className="p-3.5 rounded-xl bg-background border border-border/90 flex items-center justify-between gap-3 shadow-sm animate-card-in"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-base">
                      <span className="text-negative-text">{fromName}</span> owes{' '}
                      <span className="text-positive-text">{toName}</span>
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Direct payment to settle tab
                    </p>
                  </div>
                  <span className="font-sans font-tabular text-base sm:text-lg font-bold text-negative-text shrink-0 drop-shadow-[0_0_6px_rgba(193,18,31,0.35)]">
                    {amountFormatted}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Individual Balances */}
      {hasData && (
        <div className="pt-2 border-t border-border">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Net Balances
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label="Individual balances">
            {balances.map((b) => {
              const name = getPersonName(b.personId);
              const isPositive = b.balanceMinor > 0;
              const isNegative = b.balanceMinor < 0;

              return (
                <li
                  key={b.personId}
                  className="p-2.5 rounded-xl bg-background border border-border/80 flex items-center justify-between text-xs"
                >
                  <span title={name} className="font-medium text-text-base truncate max-w-[120px]">
                    {name}
                  </span>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-sans font-tabular font-bold block ${
                        isPositive
                          ? 'text-positive-text'
                          : isNegative
                          ? 'text-negative-text'
                          : 'text-text-muted'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatMoney(b.balanceMinor, currency)}
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      {isPositive ? 'gets back' : isNegative ? 'owes' : 'settled'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Collapsible How is this calculated? */}
      {hasData && (
        <details className="pt-2 border-t border-border group text-xs text-text-muted">
          <summary className="cursor-pointer font-medium hover:text-text-base transition-colors select-none py-1 flex items-center justify-between focus-visible:ring-2 focus-visible:ring-accent-text rounded">
            <span>How is this calculated?</span>
            <span className="text-sm transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-2 p-3 rounded-xl bg-background border border-border/80 space-y-2 leading-relaxed">
            <p className="font-mono text-[11px] text-text-base bg-surface px-2 py-1 rounded border border-border">
              Balance = total paid − own share
            </p>
            <p>
              Each expense is split evenly among its participants. We calculate everyone's net balance, then repeatedly match the largest debtor with the largest creditor to settle all debts in the fewest possible payments.
            </p>
          </div>
        </details>
      )}

      {/* Banish Everything (Quiet spot at bottom) */}
      {hasData && (
        <div className="pt-2 border-t border-border flex justify-end">
          {showClearConfirm ? (
            <div
              role="alertdialog"
              aria-labelledby="banish-title"
              aria-describedby="banish-desc"
              className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-background border border-negative-text/40 text-xs animate-card-in"
            >
              <span id="banish-desc" className="text-text-base font-medium">
                This will make everything disappear. Sure?
              </span>
              <div className="flex gap-1.5 ml-auto">
                <button
                  ref={cancelBanishBtnRef}
                  type="button"
                  onClick={() => {
                    setShowClearConfirm(false);
                    banishTriggerBtnRef.current?.focus();
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-base hover:border-accent-text text-xs font-medium focus-visible:ring-2 focus-visible:ring-accent-text"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    setShowClearConfirm(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-negative text-white hover:bg-accent-hover text-xs font-semibold focus-visible:ring-2 focus-visible:ring-accent-text"
                >
                  Yes, banish
                </button>
              </div>
            </div>
          ) : (
            <button
              ref={banishTriggerBtnRef}
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-text-muted hover:text-negative-text hover:bg-negative/10 hover:border hover:border-negative-text/40 transition-colors py-1.5 px-2.5 rounded-lg border border-transparent focus-visible:ring-2 focus-visible:ring-accent-text min-h-[36px]"
            >
              Banish everything
            </button>
          )}
        </div>
      )}
      </div>
    </section>
  );
};
