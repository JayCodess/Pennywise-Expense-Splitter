import React, { useState, useRef, useEffect } from 'react';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { Expense } from '../lib/types';
import { formatMoney, parseAmountToMinor } from '../lib/money';
import { MAX_DESC_LENGTH } from '../lib/expenseReducer';
import { StormDrain } from './StormDrain';
import { CardTopBlood } from './decor/CardTopBlood';

export const ExpensesCard: React.FC = () => {
  const { people, expenses, currency, totalSpentMinor, updateExpense, deleteExpense } =
    useExpenseStore();

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPayer, setEditPayer] = useState('');
  const [editParticipants, setEditParticipants] = useState<string[]>([]);
  const [editAmountError, setEditAmountError] = useState<string | null>(null);

  const editDescInputRef = useRef<HTMLInputElement>(null);
  const editButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const returnFocusIdRef = useRef<string | null>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingExpenseId && editDescInputRef.current) {
      editDescInputRef.current.focus();
    }
  }, [editingExpenseId]);

  // Return focus to the edit button when editing closes
  useEffect(() => {
    if (editingExpenseId === null && returnFocusIdRef.current) {
      const btn = editButtonRefs.current.get(returnFocusIdRef.current);
      if (btn) {
        btn.focus();
      }
      returnFocusIdRef.current = null;
    }
  }, [editingExpenseId]);

  // Handle Escape key to cancel editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingExpenseId) {
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingExpenseId]);

  const handleStartEdit = (exp: Expense) => {
    returnFocusIdRef.current = exp.id;
    setEditingExpenseId(exp.id);
    setEditDesc(exp.description);
    // Plain editable decimal string: e.g. "1234.50"
    setEditAmount((exp.amountMinor / 100).toFixed(2));
    setEditPayer(exp.paidBy);
    setEditParticipants([...exp.participants]);
    setEditAmountError(null);
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setEditAmountError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpenseId) return;

    const trimmed = editDesc.trim();
    if (!trimmed) {
      editDescInputRef.current?.focus();
      return;
    }

    const minor = parseAmountToMinor(editAmount);
    if (minor === null) {
      setEditAmountError('Enter a valid amount > 0');
      return;
    }

    if (!people.some((p) => p.id === editPayer)) {
      return;
    }

    const validParticipants = editParticipants.filter((id) =>
      people.some((p) => p.id === id)
    );
    if (validParticipants.length === 0) {
      return;
    }

    updateExpense({
      id: editingExpenseId,
      description: trimmed,
      amountMinor: minor,
      paidBy: editPayer,
      participants: validParticipants,
    });

    setEditingExpenseId(null);
  };

  const handleToggleEditParticipant = (personId: string) => {
    setEditParticipants((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
    );
  };

  const getPersonName = (id: string): string => {
    return people.find((p) => p.id === id)?.name || 'Unknown';
  };

  const formatSplitWith = (exp: Expense): string => {
    const payerName = getPersonName(exp.paidBy);
    const isAll =
      people.length > 0 &&
      people.length === exp.participants.length &&
      exp.participants.every((id) => people.some((p) => p.id === id));

    if (isAll) {
      return `Paid by ${payerName} · split with everyone`;
    }

    const participantNames = exp.participants.map(getPersonName).join(', ');
    return `Paid by ${payerName} · split with ${participantNames}`;
  };

  return (
    <section
      aria-labelledby="expenses-section-title"
      className="relative bg-surface border border-border rounded-card p-4 sm:p-5 pt-8 sm:pt-9 shadow-carnival animate-card-in overflow-hidden"
    >
      <div
        data-testid="card-blood-layer"
        className="absolute top-0 left-0 right-0 h-[18px] overflow-hidden pointer-events-none z-0"
      >
        <CardTopBlood seed={103} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <h2 id="expenses-section-title" className="font-display text-2xl text-text-base tracking-wide">
            Carnival Costs
          </h2>
          <div className="text-right">
            <span className="text-xs text-text-muted block">Total spent</span>
            <span data-testid="total-spent" className="font-sans font-tabular text-lg font-bold text-text-base">
              {formatMoney(totalSpentMinor, currency)}
            </span>
          </div>
        </div>

      {expenses.length === 0 ? (
        <div className="py-8 px-4 rounded-xl border border-dashed border-border/80 bg-background/50 text-center flex flex-col items-center justify-center gap-2">
          <StormDrain size={36} peekingBalloon />
          <p className="text-sm text-text-muted">Not a single coin. Suspicious.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border" aria-label="Expenses list">
          {expenses.map((exp) => {
            const isEditing = editingExpenseId === exp.id;

            if (isEditing) {
              return (
                <li key={exp.id} className="py-4 animate-card-in">
                  <form
                    onSubmit={handleSaveEdit}
                    className="p-3.5 rounded-xl bg-background border border-accent-text/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs uppercase tracking-wider text-text-muted">
                        Edit Expense
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Esc to cancel · Enter to save
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label htmlFor={`edit-desc-${exp.id}`} className="sr-only">
                          Description
                        </label>
                        <input
                          id={`edit-desc-${exp.id}`}
                          ref={editDescInputRef}
                          type="text"
                          maxLength={MAX_DESC_LENGTH}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="What for?"
                          className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-surface border border-border text-text-base text-sm focus:outline-none focus:border-accent-text"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label htmlFor={`edit-amount-${exp.id}`} className="sr-only">
                          Amount
                        </label>
                        <input
                          id={`edit-amount-${exp.id}`}
                          type="text"
                          inputMode="decimal"
                          value={editAmount}
                          onChange={(e) => {
                            setEditAmount(e.target.value);
                            if (editAmountError) setEditAmountError(null);
                          }}
                          placeholder="Amount"
                          className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-surface border border-border text-text-base font-sans font-tabular text-sm focus:outline-none focus:border-accent-text"
                        />
                      </div>
                    </div>
                    {editAmountError && (
                      <p role="alert" className="text-xs text-negative-text font-medium">
                        {editAmountError}
                      </p>
                    )}

                    {/* Edit Payer */}
                    <div>
                      <span className="block text-xs font-semibold text-text-muted mb-1.5">
                        Who paid:
                      </span>
                      <div className="flex flex-wrap gap-1.5" role="radiogroup">
                        {people.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            role="radio"
                            aria-checked={editPayer === p.id}
                            onClick={() => setEditPayer(p.id)}
                            className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              editPayer === p.id
                                ? 'bg-accent text-white border-accent'
                                : 'bg-surface text-text-muted border-border hover:text-text-base'
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Edit Participants */}
                    <div>
                      <span className="block text-xs font-semibold text-text-muted mb-1.5">
                        Split with:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {people.map((p) => {
                          const isSelected = editParticipants.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              role="button"
                              aria-pressed={isSelected}
                              onClick={() => handleToggleEditParticipant(p.id)}
                              className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                isSelected
                                  ? 'bg-surface text-text-base border-accent-text'
                                  : 'bg-surface/50 text-text-muted border-border/60 opacity-60'
                              }`}
                            >
                              {isSelected ? '✓ ' : ''}
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text-base text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </li>
              );
            }

            return (
              <li
                key={exp.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group animate-card-in"
              >
                <div className="min-w-0 flex-1">
                  <h3
                    title={exp.description}
                    className="font-semibold text-sm sm:text-base text-text-base truncate"
                  >
                    {exp.description}
                  </h3>
                  <p
                    title={formatSplitWith(exp)}
                    className="text-xs text-text-muted truncate mt-0.5"
                  >
                    {formatSplitWith(exp)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-sans font-tabular text-sm sm:text-base font-bold text-text-base">
                    {formatMoney(exp.amountMinor, currency)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      ref={(el) => {
                        if (el) editButtonRefs.current.set(exp.id, el);
                        else editButtonRefs.current.delete(exp.id);
                      }}
                      type="button"
                      onClick={() => handleStartEdit(exp)}
                      aria-label={`Edit ${exp.description}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-text-muted hover:text-text-base hover:bg-background transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
                      title="Edit expense"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteExpense(exp.id)}
                      aria-label={`Delete ${exp.description}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-text-muted hover:text-negative-text hover:bg-negative/10 hover:border hover:border-negative-text/40 transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
                      title="Delete expense"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </section>
  );
};
