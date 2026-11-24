import React from 'react';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { formatMoney } from '../lib/money';
import { SUPPORTED_CURRENCIES } from '../lib/constants';

export const DebugPanel: React.FC = () => {
  const {
    people,
    expenses,
    currency,
    deletedExpense,
    balances,
    settlements,
    totalSpentMinor,
    addPerson,
    loadExample,
    clearAll,
    restoreExpense,
    setCurrency,
  } = useExpenseStore();

  const handleAddSamplePerson = () => {
    const names = ['Pennywise', 'Georgie', 'Beverly', 'Bill', 'Eddie', 'Richie', 'Stan', 'Mike'];
    const available = names.find(
      (n) => !people.some((p) => p.name.toLowerCase() === n.toLowerCase())
    );
    if (available) {
      addPerson(available);
    }
  };

  const getPersonName = (id: string) => {
    return people.find((p) => p.id === id)?.name || id;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 text-xs font-mono">
      {/* Action Controls */}
      <div className="bg-surface border border-border rounded-card p-4 shadow-carnival space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-sans font-bold text-sm text-text-base">
            🔧 Step 2: Temporary Debug Control Panel
          </span>
          <span className="text-[10px] text-text-muted bg-background px-2 py-0.5 rounded border border-border">
            Temporary (Removed in Step 3)
          </span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={loadExample}
            className="px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover font-sans font-medium transition-colors"
          >
            🎈 Load Example (Anna, Ben, Chris)
          </button>

          <button
            type="button"
            onClick={handleAddSamplePerson}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-text-base hover:border-accent-text font-sans font-medium transition-colors"
          >
            + Add Test Person
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-text-muted hover:text-negative-text font-sans font-medium transition-colors"
          >
            Banish Everything
          </button>

          {deletedExpense && (
            <button
              type="button"
              onClick={restoreExpense}
              className="px-3 py-1.5 rounded-lg border border-accent-text bg-background text-accent-text font-sans font-medium transition-colors"
            >
              ↩ Undo Delete ({deletedExpense.description})
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <label htmlFor="currency-select" className="text-text-muted font-sans">
              Currency:
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-text-base"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Derived Results (Settlements & Balances) */}
      <div className="bg-surface border border-border rounded-card p-4 shadow-carnival space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-sans font-bold text-sm text-text-base">
            Derived Settlements & Balances
          </span>
          <span className="text-text-muted">
            Total Spent: <strong className="text-text-base">{formatMoney(totalSpentMinor, currency)}</strong>
          </span>
        </div>

        <div>
          <h4 className="text-text-muted font-bold mb-1">Settlements ({settlements.length}):</h4>
          {settlements.length === 0 ? (
            <p className="text-text-muted italic">All settled. For now. 🎈</p>
          ) : (
            <ul className="space-y-1">
              {settlements.map((s, idx) => (
                <li
                  key={idx}
                  className="px-2.5 py-1.5 rounded bg-background border border-border flex items-center justify-between"
                >
                  <span className="font-sans text-text-base">
                    <strong>{getPersonName(s.from)}</strong> owes{' '}
                    <strong>{getPersonName(s.to)}</strong>
                  </span>
                  <span className="font-tabular font-bold text-negative-text">
                    {formatMoney(s.amountMinor, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-text-muted font-bold mb-1">Balances ({balances.length}):</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {balances.map((b) => (
              <div
                key={b.personId}
                className="p-2 rounded bg-background border border-border flex flex-col justify-between"
              >
                <span className="font-sans font-semibold text-text-base truncate">
                  {getPersonName(b.personId)}
                </span>
                <span
                  className={`font-tabular font-bold ${
                    b.balanceMinor > 0
                      ? 'text-positive-text'
                      : b.balanceMinor < 0
                      ? 'text-negative-text'
                      : 'text-text-muted'
                  }`}
                >
                  {b.balanceMinor > 0 ? '+' : ''}
                  {formatMoney(b.balanceMinor, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raw State JSON Inspector */}
      <div className="bg-surface border border-border rounded-card p-4 shadow-carnival space-y-2">
        <h4 className="font-sans font-bold text-sm text-text-base">
          Raw State Inspector (Persisted in localStorage)
        </h4>
        <pre className="p-3 bg-background border border-border rounded-lg overflow-x-auto text-[11px] text-text-muted max-h-56">
          {JSON.stringify({ people, expenses, currency, deletedExpense }, null, 2)}
        </pre>
      </div>
    </div>
  );
};
