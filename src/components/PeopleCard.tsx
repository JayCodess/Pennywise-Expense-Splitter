import React, { useState, useRef, useEffect } from 'react';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { StormDrain } from './StormDrain';
import { CardTopBlood } from './decor/CardTopBlood';

export const PeopleCard: React.FC = () => {
  const { people, expenses, addPerson, removePerson, loadExample } = useExpenseStore();
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [personToRemove, setPersonToRemove] = useState<{ id: string; name: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button when inline confirmation dialog opens
  useEffect(() => {
    if (personToRemove && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [personToRemove]);

  // Handle Escape key to dismiss confirmation dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && personToRemove) {
        setPersonToRemove(null);
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [personToRemove]);

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();

    if (!trimmed) {
      setError('Please enter a name.');
      inputRef.current?.focus();
      return;
    }

    const isDuplicate = people.some(
      (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setError(`"${trimmed}" is already at the carnival.`);
      inputRef.current?.focus();
      return;
    }

    addPerson(trimmed);
    setNameInput('');
    setError(null);
    inputRef.current?.focus();
  };

  const handleInitiateRemove = (id: string, name: string) => {
    // Check if person is in any expense (as payer or participant)
    const isInExpenses = expenses.some(
      (exp) => exp.paidBy === id || exp.participants.includes(id)
    );

    if (isInExpenses) {
      // Show inline confirmation
      setPersonToRemove({ id, name });
    } else {
      // Remove immediately without confirmation
      removePerson(id);
      inputRef.current?.focus();
    }
  };

  const handleConfirmRemove = () => {
    if (personToRemove) {
      removePerson(personToRemove.id);
      setPersonToRemove(null);
      inputRef.current?.focus();
    }
  };

  return (
    <section
      aria-labelledby="people-section-title"
      className="relative bg-surface border border-border rounded-card p-4 sm:p-5 pt-8 sm:pt-9 shadow-carnival animate-card-in overflow-hidden"
    >
      {/* Exactly ONE blood layer per card, anchored at top: 0, left: 0, right: 0 with 18px height clip */}
      <div
        data-testid="card-blood-layer"
        className="absolute top-0 left-0 right-0 h-[18px] overflow-hidden pointer-events-none z-0"
      >
        <CardTopBlood seed={101} />
      </div>

      <div className="relative z-10">
        <h2
          id="people-section-title"
          className="font-display text-2xl text-text-base tracking-wide mb-3 flex items-center justify-between"
        >
          <span>Carnival Troupe</span>
          <span className="font-sans text-xs text-text-muted font-normal">
            {people.length} {people.length === 1 ? 'person' : 'people'}
          </span>
        </h2>

      {/* Add Person Form */}
      <form onSubmit={handleAddPerson} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="person-name-input" className="sr-only">
              Person name
            </label>
            <input
              id="person-name-input"
              ref={inputRef}
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => {
                if (error) setError(null);
              }}
              placeholder="Who's joining the carnival?"
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-background border text-text-base placeholder:text-text-muted text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-text ${
                error ? 'border-negative-text' : 'border-border focus:border-accent-text'
              }`}
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-text shrink-0"
          >
            + Add
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-1.5 text-xs text-negative-text font-medium flex items-center gap-1 animate-card-in"
          >
            <span>⚠️</span> {error}
          </p>
        )}
      </form>

      {/* Inline Confirmation for Removing a Person in Expenses */}
      {personToRemove && (
        <div
          role="alertdialog"
          aria-labelledby="confirm-remove-title"
          aria-describedby="confirm-remove-desc"
          className="mb-4 p-3 rounded-xl bg-background border border-negative-text/40 text-xs animate-card-in"
        >
          <div className="flex items-start gap-2 mb-2.5">
            <span className="text-base">🎈</span>
            <div>
              <p id="confirm-remove-title" className="font-semibold text-text-base">
                Banish {personToRemove.name}?
              </p>
              <p id="confirm-remove-desc" className="text-text-muted mt-0.5">
                Removing {personToRemove.name} will delete any expense they paid for and remove them
                from splits.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={() => setPersonToRemove(null)}
              className="min-h-[36px] px-3 py-1.5 rounded-lg border border-border bg-surface text-text-base font-medium hover:border-accent-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemove}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-negative text-white font-medium hover:bg-accent-hover transition-colors"
            >
              Banish {personToRemove.name}
            </button>
          </div>
        </div>
      )}

      {/* People Chips List or Empty State */}
      {people.length === 0 ? (
        <div className="py-6 px-4 rounded-xl border border-dashed border-border/80 bg-background/50 text-center flex flex-col items-center justify-center gap-2">
          <StormDrain size={32} peekingBalloon />
          <p className="text-sm text-text-muted">Nobody's down here yet… how lonely.</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              loadExample();
            }}
            className="mt-1 inline-flex items-center gap-1 text-xs text-accent-text hover:underline focus-visible:ring-1 focus-visible:ring-accent-text rounded px-1.5 py-1 min-h-[32px]"
          >
            <span>🎈</span> Load example troupe
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2" role="list" aria-label="People in group">
          {people.map((person) => (
            <div
              key={person.id}
              role="listitem"
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-background border border-border text-sm min-h-[44px] max-w-full transition-all duration-150 animate-card-in"
            >
              <span
                title={person.name}
                className="truncate max-w-[150px] sm:max-w-[200px] text-text-base font-medium"
              >
                {person.name}
              </span>
              <button
                type="button"
                onClick={() => handleInitiateRemove(person.id, person.name)}
                aria-label={`Remove ${person.name}`}
                title={`Remove ${person.name}`}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-negative-text hover:bg-surface transition-colors focus-visible:ring-2 focus-visible:ring-accent-text"
              >
                <span className="text-base leading-none" aria-hidden="true">
                  ×
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </section>
  );
};
