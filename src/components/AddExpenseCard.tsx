import React, { useState, useEffect, useRef } from 'react';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { parseAmountToMinor } from '../lib/money';
import { SUPPORTED_CURRENCIES } from '../lib/constants';
import { MAX_EXPENSES, MAX_DESC_LENGTH } from '../lib/expenseReducer';

export const AddExpenseCard: React.FC = () => {
  const { people, expenses, currency, setCurrency, addExpense } = useExpenseStore();

  const [payerId, setPayerId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [expenseLimitError, setExpenseLimitError] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [hasManuallyModifiedParticipants, setHasManuallyModifiedParticipants] = useState(false);
  const [showAddBalloon, setShowAddBalloon] = useState(false);

  const descInputRef = useRef<HTMLInputElement>(null);

  // Sync payerId with people list
  useEffect(() => {
    if (people.length === 0) {
      setPayerId('');
      return;
    }
    // If current payerId is invalid or empty, fall back to first person
    if (!people.some((p) => p.id === payerId)) {
      setPayerId(people[0].id);
    }
  }, [people, payerId]);

  // Sync participants with people list
  useEffect(() => {
    const validPeopleIds = new Set(people.map((p) => p.id));

    setSelectedParticipants((prev) => {
      // Remove people who no longer exist
      const filtered = prev.filter((id) => validPeopleIds.has(id));

      // If user hasn't manually deselected participants, keep everyone selected by default
      if (!hasManuallyModifiedParticipants) {
        return people.map((p) => p.id);
      }

      // If everyone was previously selected, continue including newly added people
      if (filtered.length === people.length - 1 && people.length > 0) {
        return people.map((p) => p.id);
      }

      return filtered;
    });
  }, [people, hasManuallyModifiedParticipants]);

  const handleToggleParticipant = (personId: string) => {
    setHasManuallyModifiedParticipants(true);
    setSelectedParticipants((prev) => {
      if (prev.includes(personId)) {
        return prev.filter((id) => id !== personId);
      } else {
        return [...prev, personId];
      }
    });
  };

  const handleSelectAllParticipants = () => {
    setSelectedParticipants(people.map((p) => p.id));
    setHasManuallyModifiedParticipants(false);
  };

  const handleDeselectAllParticipants = () => {
    setSelectedParticipants([]);
    setHasManuallyModifiedParticipants(true);
  };

  const handleAmountBlur = () => {
    if (!amountInput.trim()) {
      setAmountError(null);
      return;
    }
    const minor = parseAmountToMinor(amountInput);
    if (minor === null) {
      setAmountError('Enter a valid amount > 0 (e.g. 12.50)');
    } else {
      setAmountError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (people.length < 2) return;

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      descInputRef.current?.focus();
      return;
    }

    const minor = parseAmountToMinor(amountInput);
    if (minor === null) {
      setAmountError('Enter a valid amount > 0 (e.g. 12.50)');
      return;
    }

    if (!people.some((p) => p.id === payerId)) {
      return;
    }

    if (selectedParticipants.length === 0) {
      return;
    }

    if (expenses.length >= MAX_EXPENSES) {
      setExpenseLimitError("That's the limit for one trip: 500 expenses.");
      return;
    }

    if (trimmedDesc.length > MAX_DESC_LENGTH) {
      setExpenseLimitError('Description cannot exceed 120 characters.');
      return;
    }

    // Add expense
    const newId = addExpense({
      description: trimmedDesc,
      amountMinor: minor,
      paidBy: payerId,
      participants: selectedParticipants,
    });

    if (!newId) {
      if (expenses.length >= MAX_EXPENSES) {
        setExpenseLimitError("That's the limit for one trip: 500 expenses.");
      }
      return;
    }

    // Trigger ephemeral rising balloon animation from button
    setShowAddBalloon(true);
    setTimeout(() => setShowAddBalloon(false), 1200);

    // Clear description and amount, keep payer and participants
    setDescription('');
    setAmountInput('');
    setAmountError(null);
    setExpenseLimitError(null);

    // Refocus description input
    descInputRef.current?.focus();
  };

  const isFormValid =
    people.length >= 2 &&
    description.trim().length > 0 &&
    amountInput.trim().length > 0 &&
    selectedParticipants.length > 0 &&
    people.some((p) => p.id === payerId);

  return (
    <section
      aria-labelledby="add-expense-title"
      className="relative bg-surface border border-border rounded-card p-4 sm:p-5 shadow-carnival animate-card-in overflow-hidden"
    >
      <div className="relative z-10">
        <h2
          id="add-expense-title"
          className="font-display text-2xl text-text-base tracking-wide mb-3"
        >
          Add an Expense
        </h2>

        {people.length < 2 ? (
          <div className="py-4 px-4 rounded-xl border border-dashed border-border/80 bg-background/50 text-center text-sm text-text-muted">
            <p>Need at least 2 people down here to split expenses.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Who Paid? */}
            <div>
              <label
                id="payer-group-label"
                className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2"
              >
                Who paid?
              </label>
              <div
                role="radiogroup"
                aria-labelledby="payer-group-label"
                className="flex flex-wrap gap-2"
              >
                {people.map((person) => {
                  const isSelected = payerId === person.id;
                  return (
                    <button
                      key={person.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setPayerId(person.id)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium transition-colors border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent-text ${
                        isSelected
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-background text-text-muted border-border hover:text-text-base hover:border-accent-text'
                      }`}
                    >
                      <span className="truncate max-w-[140px] sm:max-w-[180px]" title={person.name}>
                        {person.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description & Amount Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* What for? */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="expense-description-input"
                  className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5"
                >
                  What for?
                </label>
                <input
                  id="expense-description-input"
                  ref={descInputRef}
                  type="text"
                  maxLength={MAX_DESC_LENGTH}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (expenseLimitError) setExpenseLimitError(null);
                  }}
                  placeholder="e.g. Carnival tickets, cotton candy"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-background border border-border text-text-base placeholder:text-text-muted text-sm transition-colors focus:outline-none focus:border-accent-text focus-visible:ring-2 focus-visible:ring-accent-text"
                />
              </div>

              {/* Amount and Currency */}
              <div className="sm:col-span-1">
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="expense-amount-input"
                    className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
                  >
                    Amount
                  </label>
                  <label
                    htmlFor="currency-select"
                    className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
                  >
                    Currency
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    id="expense-amount-input"
                    type="text"
                    inputMode="decimal"
                    value={amountInput}
                    onChange={(e) => {
                      setAmountInput(e.target.value);
                      if (amountError) setAmountError(null);
                    }}
                    onBlur={handleAmountBlur}
                    placeholder="0.00"
                    className="flex-1 min-w-0 min-h-[44px] px-3.5 py-2 rounded-xl bg-background border border-border text-text-base font-sans font-tabular text-sm placeholder:text-text-muted transition-colors focus:outline-none focus:border-accent-text focus-visible:ring-2 focus-visible:ring-accent-text"
                  />

                  {/* Themed Currency Select with Custom Chevron */}
                  <div className="relative shrink-0">
                    <select
                      id="currency-select"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="min-h-[44px] pl-3 pr-8 rounded-xl bg-surface border border-border text-text-base text-sm font-semibold transition-colors focus:outline-none focus:border-accent-text focus-visible:ring-2 focus-visible:ring-accent-text appearance-none cursor-pointer"
                      title="Session Currency"
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c} value={c} className="bg-surface text-text-base py-1">
                          {c}
                        </option>
                      ))}
                    </select>
                    <span
                      className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-text-muted"
                      aria-hidden="true"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                {amountError && (
                  <p role="alert" className="mt-1 text-xs text-negative-text font-medium">
                    {amountError}
                  </p>
                )}
              </div>
            </div>

            {/* For Whom? (Participant chips) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  id="participants-label"
                  className="text-xs font-semibold text-text-muted uppercase tracking-wider"
                >
                  For whom?
                </span>

                {/* Baseline-aligned text buttons with 44px-high touch targets and clear spacing */}
                <div className="flex items-center gap-1 -my-2">
                  <button
                    type="button"
                    onClick={handleSelectAllParticipants}
                    className="text-xs text-accent-text hover:underline min-h-[44px] px-2 flex items-center font-medium rounded focus-visible:ring-2 focus-visible:ring-accent-text"
                  >
                    Select all
                  </button>
                  <span className="text-border select-none text-xs" aria-hidden="true">
                    /
                  </span>
                  <button
                    type="button"
                    onClick={handleDeselectAllParticipants}
                    className="text-xs text-text-muted hover:text-text-base min-h-[44px] px-2 flex items-center font-medium rounded focus-visible:ring-2 focus-visible:ring-accent-text"
                  >
                    None
                  </button>
                </div>
              </div>

              <div
                role="group"
                aria-labelledby="participants-label"
                className="flex flex-wrap gap-2"
              >
                {people.map((person) => {
                  const isSelected = selectedParticipants.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      type="button"
                      role="button"
                      aria-pressed={isSelected}
                      onClick={() => handleToggleParticipant(person.id)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium transition-colors border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent-text ${
                        isSelected
                          ? 'bg-background text-text-base border-accent-text shadow-sm'
                          : 'bg-background/40 text-text-muted border-border/80 opacity-60 hover:opacity-100 hover:border-border'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] border ${
                          isSelected
                            ? 'bg-accent border-accent text-white font-bold'
                            : 'border-border bg-surface'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="truncate max-w-[130px] sm:max-w-[180px]" title={person.name}>
                        {person.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedParticipants.length === 0 && (
                <p role="alert" className="mt-1 text-xs text-negative-text font-medium">
                  Select at least one participant to split with.
                </p>
              )}
            </div>

            {/* Submit Button (Accessible contrast when disabled, hover blood drip, balloon rise) */}
            <div className="pt-2 relative">
              {showAddBalloon && (
                <div
                  aria-hidden="true"
                  className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none animate-btn-balloon z-20"
                >
                  <svg viewBox="0 0 24 36" className="w-6 h-9 drop-shadow">
                    <ellipse cx="12" cy="11" rx="9" ry="11" fill="#c1121f" />
                    <ellipse cx="9" cy="8" rx="2.5" ry="4" fill="#ffffff" opacity="0.45" />
                    <polygon points="10,22 14,22 15,24 9,24" fill="#8f0d17" />
                    <path
                      d="M 12 24 Q 10 29 13 35"
                      fill="none"
                      stroke="var(--color-text-muted)"
                      strokeWidth="0.8"
                    />
                  </svg>
                </div>
              )}

              {expenseLimitError && (
                <p
                  role="alert"
                  className="text-xs text-negative-text font-medium flex items-center gap-1"
                >
                  <span>⚠️</span> {expenseLimitError}
                </p>
              )}

              <button
                type="submit"
                disabled={!isFormValid}
                className="group relative w-full min-h-[44px] py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-accent-text bg-accent text-white hover:bg-accent-hover disabled:bg-surface disabled:text-text-muted disabled:border disabled:border-border disabled:opacity-90 disabled:cursor-not-allowed overflow-visible"
              >
                <span>Add expense</span>

                {/* Hover blood drip along bottom edge */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 40 10"
                  className="absolute -bottom-2 right-10 w-7 h-2 pointer-events-none select-none opacity-0 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all duration-500"
                >
                  <path
                    d="M 5 0 C 5 3 6 5 6 7 C 6 9 5 10 3 10 C 1 10 0 9 0 7 C 0 5 1 3 1 0 Z"
                    fill="var(--color-blood-primary)"
                  />
                  <path
                    d="M 25 0 C 25 2 26 4 26 5 C 26 6 25 7 24 7 C 23 7 22 6 22 5 C 22 4 23 2 23 0 Z"
                    fill="var(--color-blood-primary)"
                  />
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
