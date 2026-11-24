import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { Person, Expense, Settlement, PersonBalance } from '../lib/types';
import {
  ExpenseState,
  INITIAL_STATE,
  expenseReducer,
  validateHydratedState,
} from '../lib/expenseReducer';
import { computeBalances, computeSettlements } from '../lib/settle';

const STORAGE_KEY = 'pennywise_data_v1';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

interface ExpenseStoreContextType {
  state: ExpenseState;
  people: Person[];
  expenses: Expense[];
  currency: string;
  deletedExpense: Expense | null;
  balances: PersonBalance[];
  settlements: Settlement[];
  totalSpentMinor: number;
  addPerson: (name: string) => string | null;
  removePerson: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => string | null;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  restoreExpense: () => void;
  setCurrency: (currency: string) => void;
  loadExample: () => void;
  clearAll: () => void;
}

const ExpenseStoreContext = createContext<ExpenseStoreContextType | null>(null);

function loadInitialState(): ExpenseState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    const validated = validateHydratedState(parsed);
    if (!validated) {
      return INITIAL_STATE;
    }
    return {
      people: validated.people,
      expenses: validated.expenses,
      currency: validated.currency,
      deletedExpense: null,
    };
  } catch {
    return INITIAL_STATE;
  }
}

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, undefined, loadInitialState);

  // Persist only people, expenses, currency (deletedExpense is session-only)
  useEffect(() => {
    try {
      const dataToStore = {
        people: state.people,
        expenses: state.expenses,
        currency: state.currency,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch {
      // Ignore localStorage write failures
    }
  }, [state.people, state.expenses, state.currency]);

  // Derived calculations with useMemo
  const balances = useMemo(
    () => computeBalances(state.people, state.expenses),
    [state.people, state.expenses]
  );

  const settlements = useMemo(
    () => computeSettlements(state.people, state.expenses),
    [state.people, state.expenses]
  );

  const totalSpentMinor = useMemo(
    () => state.expenses.reduce((sum, e) => sum + e.amountMinor, 0),
    [state.expenses]
  );

  // Action helpers (generating IDs outside reducer)
  const addPerson = useCallback(
    (name: string): string | null => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      // Check duplicate
      if (state.people.some((p) => p.name.trim().toLowerCase() === trimmed.toLowerCase())) {
        return null;
      }
      const newId = generateId();
      dispatch({ type: 'ADD_PERSON', payload: { id: newId, name: trimmed } });
      return newId;
    },
    [state.people]
  );

  const removePerson = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PERSON', payload: { id } });
  }, []);

  const addExpense = useCallback(
    (expense: Omit<Expense, 'id'>): string | null => {
      if (!Number.isInteger(expense.amountMinor) || expense.amountMinor <= 0) return null;
      if (!state.people.some((p) => p.id === expense.paidBy)) return null;
      if (!expense.participants || expense.participants.length === 0) return null;

      const newId = generateId();
      dispatch({
        type: 'ADD_EXPENSE',
        payload: {
          ...expense,
          id: newId,
        },
      });
      return newId;
    },
    [state.people]
  );

  const updateExpense = useCallback((expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: { id } });
  }, []);

  const restoreExpense = useCallback(() => {
    dispatch({ type: 'RESTORE_EXPENSE' });
  }, []);

  const setCurrency = useCallback((currency: string) => {
    dispatch({ type: 'SET_CURRENCY', payload: { currency } });
  }, []);

  const loadExample = useCallback(() => {
    dispatch({ type: 'LOAD_EXAMPLE' });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const value = useMemo(
    () => ({
      state,
      people: state.people,
      expenses: state.expenses,
      currency: state.currency,
      deletedExpense: state.deletedExpense,
      balances,
      settlements,
      totalSpentMinor,
      addPerson,
      removePerson,
      addExpense,
      updateExpense,
      deleteExpense,
      restoreExpense,
      setCurrency,
      loadExample,
      clearAll,
    }),
    [
      state,
      balances,
      settlements,
      totalSpentMinor,
      addPerson,
      removePerson,
      addExpense,
      updateExpense,
      deleteExpense,
      restoreExpense,
      setCurrency,
      loadExample,
      clearAll,
    ]
  );

  return <ExpenseStoreContext.Provider value={value}>{children}</ExpenseStoreContext.Provider>;
};

export function useExpenseStore(): ExpenseStoreContextType {
  const context = useContext(ExpenseStoreContext);
  if (!context) {
    throw new Error('useExpenseStore must be used within an ExpenseProvider');
  }
  return context;
}
