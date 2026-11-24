import { Person, Expense } from './types';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, EXAMPLE_PEOPLE, EXAMPLE_EXPENSES } from './constants';

export interface ExpenseState {
  people: Person[];
  expenses: Expense[];
  currency: string;
  deletedExpense: Expense | null;
}

export type ExpenseAction =
  | { type: 'ADD_PERSON'; payload: { id: string; name: string } }
  | { type: 'REMOVE_PERSON'; payload: { id: string } }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: { id: string } }
  | { type: 'RESTORE_EXPENSE' }
  | { type: 'SET_CURRENCY'; payload: { currency: string } }
  | { type: 'LOAD_EXAMPLE' }
  | { type: 'CLEAR_ALL' }
  | { type: 'HYDRATE'; payload: { people: Person[]; expenses: Expense[]; currency: string } };

export const INITIAL_STATE: ExpenseState = {
  people: [],
  expenses: [],
  currency: DEFAULT_CURRENCY,
  deletedExpense: null,
};

/**
 * Validates raw data from localStorage.
 * Enforces:
 * - amountMinor is a positive integer
 * - every expense's paidBy exists in people
 * - every participant exists in people, and each expense has at least one participant
 * - no duplicate person IDs or duplicate names (case-insensitive)
 * - currency is one of the supported list, otherwise defaults to USD
 * If anything is invalid, returns null (fall back to empty state).
 */
export function validateHydratedState(
  raw: unknown
): { people: Person[]; expenses: Expense[]; currency: string } | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj.people) || !Array.isArray(obj.expenses)) {
    return null;
  }

  // Currency validation
  let currency: string = DEFAULT_CURRENCY;
  if (
    typeof obj.currency === 'string' &&
    SUPPORTED_CURRENCIES.includes(obj.currency as (typeof SUPPORTED_CURRENCIES)[number])
  ) {
    currency = obj.currency;
  }

  // Validate people
  const personIds = new Set<string>();
  const personNames = new Set<string>();
  const people: Person[] = [];

  for (const item of obj.people) {
    if (!item || typeof item !== 'object') return null;
    const p = item as Record<string, unknown>;
    if (typeof p.id !== 'string' || !p.id.trim()) return null;
    if (typeof p.name !== 'string' || !p.name.trim()) return null;

    const trimmedId = p.id.trim();
    const trimmedName = p.name.trim();

    // Reject duplicate ID
    if (personIds.has(trimmedId)) return null;
    // Reject duplicate case-insensitive name
    const lowerName = trimmedName.toLowerCase();
    if (personNames.has(lowerName)) return null;

    personIds.add(trimmedId);
    personNames.add(lowerName);
    people.push({ id: trimmedId, name: trimmedName });
  }

  // Validate expenses
  const expenses: Expense[] = [];
  const expenseIds = new Set<string>();

  for (const item of obj.expenses) {
    if (!item || typeof item !== 'object') return null;
    const exp = item as Record<string, unknown>;
    if (typeof exp.id !== 'string' || !exp.id.trim()) return null;
    if (typeof exp.description !== 'string') return null;

    // amountMinor must be a positive integer
    if (
      typeof exp.amountMinor !== 'number' ||
      !Number.isInteger(exp.amountMinor) ||
      exp.amountMinor <= 0
    ) {
      return null;
    }

    // paidBy must exist in people
    if (typeof exp.paidBy !== 'string' || !personIds.has(exp.paidBy)) {
      return null;
    }

    // participants must be non-empty array of valid people
    if (!Array.isArray(exp.participants) || exp.participants.length === 0) {
      return null;
    }

    const participants: string[] = [];
    for (const pId of exp.participants) {
      if (typeof pId !== 'string' || !personIds.has(pId)) {
        return null;
      }
      if (!participants.includes(pId)) {
        participants.push(pId);
      }
    }

    if (participants.length === 0) return null;

    const trimmedId = exp.id.trim();
    if (expenseIds.has(trimmedId)) return null;
    expenseIds.add(trimmedId);

    expenses.push({
      id: trimmedId,
      description: exp.description.trim(),
      amountMinor: exp.amountMinor,
      paidBy: exp.paidBy,
      participants,
    });
  }

  return { people, expenses, currency };
}

/**
 * Pure reducer for managing expense splitter state.
 * IDs are generated outside the reducer to avoid React StrictMode double-execution bugs.
 */
export function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'ADD_PERSON': {
      const trimmedName = action.payload.name.trim();
      const id = action.payload.id.trim();
      if (!trimmedName || !id) return state;

      // Check duplicate name (case-insensitive)
      const isDuplicate = state.people.some(
        (p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) return state;

      // Check duplicate ID
      if (state.people.some((p) => p.id === id)) return state;

      return {
        ...state,
        people: [...state.people, { id, name: trimmedName }],
      };
    }

    case 'REMOVE_PERSON': {
      const personId = action.payload.id;
      if (!state.people.some((p) => p.id === personId)) return state;

      const updatedPeople = state.people.filter((p) => p.id !== personId);

      // Remove person from all expenses:
      // 1. Delete any expense they paid for
      // 2. Remove that person from remaining expenses' participants
      // 3. If an expense is left with 0 participants, delete that expense
      const updatedExpenses: Expense[] = [];
      for (const exp of state.expenses) {
        if (exp.paidBy === personId) {
          // Delete expenses paid by the removed person
          continue;
        }

        const remainingParticipants = exp.participants.filter((p) => p !== personId);
        if (remainingParticipants.length === 0) {
          // No participants remaining -> delete expense
          continue;
        }

        updatedExpenses.push({
          ...exp,
          participants: remainingParticipants,
        });
      }

      // Check if deletedExpense relied on the removed person
      let updatedDeletedExpense = state.deletedExpense;
      if (
        updatedDeletedExpense &&
        (updatedDeletedExpense.paidBy === personId ||
          !updatedDeletedExpense.participants.some((p) => p !== personId))
      ) {
        updatedDeletedExpense = null;
      }

      return {
        ...state,
        people: updatedPeople,
        expenses: updatedExpenses,
        deletedExpense: updatedDeletedExpense,
      };
    }

    case 'ADD_EXPENSE': {
      const exp = action.payload;
      // Validation: amount > 0 and integer
      if (!Number.isInteger(exp.amountMinor) || exp.amountMinor <= 0) return state;

      // Payer must exist
      if (!state.people.some((p) => p.id === exp.paidBy)) return state;

      // At least one participant, and all participants must exist
      if (!exp.participants || exp.participants.length === 0) return state;
      const validParticipants = exp.participants.filter((pId) =>
        state.people.some((p) => p.id === pId)
      );
      if (validParticipants.length === 0) return state;

      // Ensure no duplicate IDs
      if (state.expenses.some((e) => e.id === exp.id)) return state;

      const newExpense: Expense = {
        id: exp.id,
        description: exp.description.trim(),
        amountMinor: exp.amountMinor,
        paidBy: exp.paidBy,
        participants: Array.from(new Set(validParticipants)),
      };

      return {
        ...state,
        expenses: [newExpense, ...state.expenses],
      };
    }

    case 'UPDATE_EXPENSE': {
      const exp = action.payload;
      // Must exist in state
      if (!state.expenses.some((e) => e.id === exp.id)) return state;

      // Amount must be positive integer
      if (!Number.isInteger(exp.amountMinor) || exp.amountMinor <= 0) return state;

      // Payer must exist
      if (!state.people.some((p) => p.id === exp.paidBy)) return state;

      // At least one participant, all must exist
      if (!exp.participants || exp.participants.length === 0) return state;
      const validParticipants = exp.participants.filter((pId) =>
        state.people.some((p) => p.id === pId)
      );
      if (validParticipants.length === 0) return state;

      const updated = state.expenses.map((e) =>
        e.id === exp.id
          ? {
              ...e,
              description: exp.description.trim(),
              amountMinor: exp.amountMinor,
              paidBy: exp.paidBy,
              participants: Array.from(new Set(validParticipants)),
            }
          : e
      );

      return {
        ...state,
        expenses: updated,
      };
    }

    case 'DELETE_EXPENSE': {
      const expToDelete = state.expenses.find((e) => e.id === action.payload.id);
      if (!expToDelete) return state;

      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload.id),
        deletedExpense: expToDelete, // Stored for session-only single-level undo
      };
    }

    case 'RESTORE_EXPENSE': {
      if (!state.deletedExpense) return state;
      const toRestore = state.deletedExpense;

      // Check if payer still exists in people
      if (!state.people.some((p) => p.id === toRestore.paidBy)) {
        return { ...state, deletedExpense: null };
      }

      // Check that at least one participant still exists
      const validParticipants = toRestore.participants.filter((pId) =>
        state.people.some((p) => p.id === pId)
      );
      if (validParticipants.length === 0) {
        return { ...state, deletedExpense: null };
      }

      const restoredExpense: Expense = {
        ...toRestore,
        participants: validParticipants,
      };

      return {
        ...state,
        expenses: [restoredExpense, ...state.expenses],
        deletedExpense: null,
      };
    }

    case 'SET_CURRENCY': {
      const nextCurrency = action.payload.currency.toUpperCase();
      if (!SUPPORTED_CURRENCIES.includes(nextCurrency as (typeof SUPPORTED_CURRENCIES)[number])) {
        return state;
      }
      return {
        ...state,
        currency: nextCurrency,
      };
    }

    case 'LOAD_EXAMPLE': {
      return {
        ...state,
        people: [...EXAMPLE_PEOPLE],
        expenses: [...EXAMPLE_EXPENSES],
        deletedExpense: null,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        people: [],
        expenses: [],
        deletedExpense: null,
        // Keep current currency as instructed
        currency: state.currency,
      };
    }

    case 'HYDRATE': {
      return {
        ...state,
        people: action.payload.people,
        expenses: action.payload.expenses,
        currency: action.payload.currency,
        deletedExpense: null,
      };
    }

    default:
      return state;
  }
}
