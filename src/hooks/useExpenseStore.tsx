/**
 * React Context provider and store hook for application state, persistence, and derived settlements.
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import { Person, Expense, Settlement, PersonBalance } from '../lib/types';
import {
  ExpenseState,
  INITIAL_STATE,
  expenseReducer,
  validateHydratedState,
  MAX_PEOPLE,
  MAX_EXPENSES,
  MAX_NAME_LENGTH,
  MAX_DESC_LENGTH,
} from '../lib/expenseReducer';
import { computeBalances, computeSettlements } from '../lib/settle';
import { ShareablePayload } from '../lib/linkCodec';

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
  viewModePayload: ShareablePayload | null;
  isViewMode: boolean;
  hasSavedData: boolean;
  setViewModePayload: (payload: ShareablePayload | null) => void;
  importViewModePayload: (payload: ShareablePayload) => void;
  exitViewMode: () => void;
  addPerson: (name: string) => string | null;
  removePerson: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => string | null;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  restoreExpense: () => boolean;
  setCurrency: (currency: string) => void;
  loadExample: () => void;
  clearAll: () => void;
  hydrate: (data: { people: Person[]; expenses: Expense[]; currency: string }) => void;
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
  const [viewModePayload, setViewModePayload] = useState<ShareablePayload | null>(null);

  const isViewMode = viewModePayload !== null;
  const currentPeople = viewModePayload ? viewModePayload.people : state.people;
  const currentExpenses = viewModePayload ? viewModePayload.expenses : state.expenses;
  const currentCurrency = viewModePayload ? viewModePayload.currency : state.currency;

  const hasSavedData = state.people.length > 0 || state.expenses.length > 0;

  // Persist only saved state in localStorage (NEVER view mode data)
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
    () => computeBalances(currentPeople, currentExpenses),
    [currentPeople, currentExpenses]
  );

  const settlements = useMemo(
    () => computeSettlements(currentPeople, currentExpenses),
    [currentPeople, currentExpenses]
  );

  const totalSpentMinor = useMemo(
    () => currentExpenses.reduce((sum, e) => sum + e.amountMinor, 0),
    [currentExpenses]
  );

  const importViewModePayload = useCallback((payload: ShareablePayload) => {
    dispatch({ type: 'HYDRATE', payload });
    setViewModePayload(null);
  }, []);

  const exitViewMode = useCallback(() => {
    setViewModePayload(null);
  }, []);

  // Action helpers (generating IDs outside reducer)
  const addPerson = useCallback(
    (name: string): string | null => {
      if (isViewMode) return null;
      if (state.people.length >= MAX_PEOPLE) return null;
      const trimmed = name.trim();
      if (!trimmed || trimmed.length > MAX_NAME_LENGTH) return null;
      // Check duplicate
      if (state.people.some((p) => p.name.trim().toLowerCase() === trimmed.toLowerCase())) {
        return null;
      }
      const newId = generateId();
      dispatch({ type: 'ADD_PERSON', payload: { id: newId, name: trimmed } });
      return newId;
    },
    [state.people, isViewMode]
  );

  const removePerson = useCallback(
    (id: string) => {
      if (isViewMode) return;
      dispatch({ type: 'REMOVE_PERSON', payload: { id } });
    },
    [isViewMode]
  );

  const addExpense = useCallback(
    (expense: Omit<Expense, 'id'>): string | null => {
      if (isViewMode) return null;
      if (state.expenses.length >= MAX_EXPENSES) return null;
      if (!expense.description || expense.description.trim().length > MAX_DESC_LENGTH) return null;
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
    [state.people, state.expenses, isViewMode]
  );

  const updateExpense = useCallback(
    (expense: Expense) => {
      if (isViewMode) return;
      if (expense.description.trim().length > MAX_DESC_LENGTH) return;
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    },
    [isViewMode]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      if (isViewMode) return;
      dispatch({ type: 'DELETE_EXPENSE', payload: { id } });
    },
    [isViewMode]
  );

  const restoreExpense = useCallback((): boolean => {
    if (isViewMode) return false;
    if (state.expenses.length >= MAX_EXPENSES) return false;
    dispatch({ type: 'RESTORE_EXPENSE' });
    return true;
  }, [state.expenses.length, isViewMode]);

  const setCurrency = useCallback(
    (currency: string) => {
      if (isViewMode) return;
      dispatch({ type: 'SET_CURRENCY', payload: { currency } });
    },
    [isViewMode]
  );

  const loadExample = useCallback(() => {
    if (isViewMode) return;
    dispatch({ type: 'LOAD_EXAMPLE' });
  }, [isViewMode]);

  const clearAll = useCallback(() => {
    if (isViewMode) return;
    dispatch({ type: 'CLEAR_ALL' });
  }, [isViewMode]);

  const hydrate = useCallback((data: { people: Person[]; expenses: Expense[]; currency: string }) => {
    dispatch({ type: 'HYDRATE', payload: data });
  }, []);

  const value = useMemo(
    () => ({
      state,
      people: currentPeople,
      expenses: currentExpenses,
      currency: currentCurrency,
      deletedExpense: isViewMode ? null : state.deletedExpense,
      balances,
      settlements,
      totalSpentMinor,
      viewModePayload,
      isViewMode,
      hasSavedData,
      setViewModePayload,
      importViewModePayload,
      exitViewMode,
      addPerson,
      removePerson,
      addExpense,
      updateExpense,
      deleteExpense,
      restoreExpense,
      setCurrency,
      loadExample,
      clearAll,
      hydrate,
    }),
    [
      state,
      currentPeople,
      currentExpenses,
      currentCurrency,
      balances,
      settlements,
      totalSpentMinor,
      viewModePayload,
      isViewMode,
      hasSavedData,
      importViewModePayload,
      exitViewMode,
      addPerson,
      removePerson,
      addExpense,
      updateExpense,
      deleteExpense,
      restoreExpense,
      setCurrency,
      loadExample,
      clearAll,
      hydrate,
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
