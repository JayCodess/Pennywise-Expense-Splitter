import { describe, it, expect } from 'vitest';
import {
  expenseReducer,
  INITIAL_STATE,
  validateHydratedState,
  ExpenseState,
  MAX_PEOPLE,
  MAX_EXPENSES,
  MAX_NAME_LENGTH,
  MAX_DESC_LENGTH,
} from '../lib/expenseReducer';
import { Expense } from '../lib/types';
import { computeSettlements } from '../lib/settle';

describe('expenseReducer and Store State', () => {
  it('adds a person and rejects empty or duplicate case-insensitive names', () => {
    let state = expenseReducer(INITIAL_STATE, {
      type: 'ADD_PERSON',
      payload: { id: 'p1', name: 'Pennywise' },
    });
    expect(state.people).toHaveLength(1);
    expect(state.people[0]).toEqual({ id: 'p1', name: 'Pennywise' });

    // Reject duplicate name case-insensitive ("pennywise")
    state = expenseReducer(state, {
      type: 'ADD_PERSON',
      payload: { id: 'p2', name: 'pennywise' },
    });
    expect(state.people).toHaveLength(1);

    // Reject duplicate ID
    state = expenseReducer(state, {
      type: 'ADD_PERSON',
      payload: { id: 'p1', name: 'Georgie' },
    });
    expect(state.people).toHaveLength(1);

    // Reject empty or whitespace-only name
    state = expenseReducer(state, {
      type: 'ADD_PERSON',
      payload: { id: 'p3', name: '   ' },
    });
    expect(state.people).toHaveLength(1);

    // Add unique person
    state = expenseReducer(state, {
      type: 'ADD_PERSON',
      payload: { id: 'p4', name: 'Beverly' },
    });
    expect(state.people).toHaveLength(2);
  });

  it('cascades removePerson: deletes expenses paid by them, removes them from participant lists, deletes orphaned expenses', () => {
    let state: ExpenseState = {
      people: [
        { id: 'anna', name: 'Anna' },
        { id: 'ben', name: 'Ben' },
        { id: 'chris', name: 'Chris' },
      ],
      expenses: [
        {
          id: 'e1',
          description: 'Paid by Ben',
          amountMinor: 5000,
          paidBy: 'ben',
          participants: ['anna', 'ben'],
        },
        {
          id: 'e2',
          description: 'Paid by Anna for Ben and Chris',
          amountMinor: 3000,
          paidBy: 'anna',
          participants: ['ben', 'chris'],
        },
        {
          id: 'e3',
          description: 'Paid by Anna exclusively for Ben',
          amountMinor: 1000,
          paidBy: 'anna',
          participants: ['ben'],
        },
      ],
      currency: 'USD',
      deletedExpense: null,
    };

    // Remove Ben
    state = expenseReducer(state, {
      type: 'REMOVE_PERSON',
      payload: { id: 'ben' },
    });

    // 1. Ben removed from people
    expect(state.people.map((p) => p.id)).toEqual(['anna', 'chris']);

    // 2. e1 (paid by Ben) deleted
    expect(state.expenses.some((e) => e.id === 'e1')).toBe(false);

    // 3. e2 still exists, but Ben removed from participants -> now only Chris
    const e2 = state.expenses.find((e) => e.id === 'e2');
    expect(e2).toBeDefined();
    expect(e2?.participants).toEqual(['chris']);

    // 4. e3 was exclusively for Ben -> participant list becomes empty -> e3 deleted
    expect(state.expenses.some((e) => e.id === 'e3')).toBe(false);
  });

  it('validates addExpense: requires positive integer amount, valid payer, and valid participants', () => {
    const baseState: ExpenseState = {
      people: [
        { id: 'anna', name: 'Anna' },
        { id: 'ben', name: 'Ben' },
      ],
      expenses: [],
      currency: 'USD',
      deletedExpense: null,
    };

    // Valid add
    const state = expenseReducer(baseState, {
      type: 'ADD_EXPENSE',
      payload: {
        id: 'e1',
        description: 'Pizza',
        amountMinor: 2500,
        paidBy: 'anna',
        participants: ['anna', 'ben'],
      },
    });
    expect(state.expenses).toHaveLength(1);

    // Reject non-positive amount
    let failed = expenseReducer(state, {
      type: 'ADD_EXPENSE',
      payload: {
        id: 'e2',
        description: 'Free',
        amountMinor: 0,
        paidBy: 'anna',
        participants: ['ben'],
      },
    });
    expect(failed.expenses).toHaveLength(1);

    // Reject non-integer amount
    failed = expenseReducer(state, {
      type: 'ADD_EXPENSE',
      payload: {
        id: 'e2',
        description: 'Float',
        amountMinor: 25.5,
        paidBy: 'anna',
        participants: ['ben'],
      },
    });
    expect(failed.expenses).toHaveLength(1);

    // Reject non-existent payer
    failed = expenseReducer(state, {
      type: 'ADD_EXPENSE',
      payload: {
        id: 'e3',
        description: 'Ghost payer',
        amountMinor: 2000,
        paidBy: 'ghost',
        participants: ['anna'],
      },
    });
    expect(failed.expenses).toHaveLength(1);

    // Reject empty participants
    failed = expenseReducer(state, {
      type: 'ADD_EXPENSE',
      payload: {
        id: 'e4',
        description: 'Nobody',
        amountMinor: 2000,
        paidBy: 'anna',
        participants: [],
      },
    });
    expect(failed.expenses).toHaveLength(1);
  });

  it('handles updateExpense for both valid and invalid payloads', () => {
    const initialExpense: Expense = {
      id: 'e1',
      description: 'Lunch',
      amountMinor: 2000,
      paidBy: 'anna',
      participants: ['anna', 'ben'],
    };

    let state: ExpenseState = {
      people: [
        { id: 'anna', name: 'Anna' },
        { id: 'ben', name: 'Ben' },
      ],
      expenses: [initialExpense],
      currency: 'USD',
      deletedExpense: null,
    };

    // Valid update
    state = expenseReducer(state, {
      type: 'UPDATE_EXPENSE',
      payload: {
        id: 'e1',
        description: 'Carnival Feast',
        amountMinor: 4500,
        paidBy: 'ben',
        participants: ['anna'],
      },
    });
    expect(state.expenses[0].description).toBe('Carnival Feast');
    expect(state.expenses[0].amountMinor).toBe(4500);
    expect(state.expenses[0].paidBy).toBe('ben');
    expect(state.expenses[0].participants).toEqual(['anna']);

    // Invalid update: non-existent id
    let failed = expenseReducer(state, {
      type: 'UPDATE_EXPENSE',
      payload: {
        id: 'non_existent',
        description: 'No',
        amountMinor: 1000,
        paidBy: 'anna',
        participants: ['anna'],
      },
    });
    expect(failed.expenses[0].description).toBe('Carnival Feast');

    // Invalid update: non-positive amount
    failed = expenseReducer(state, {
      type: 'UPDATE_EXPENSE',
      payload: {
        id: 'e1',
        description: 'Negative',
        amountMinor: -500,
        paidBy: 'anna',
        participants: ['anna'],
      },
    });
    expect(failed.expenses[0].amountMinor).toBe(4500);

    // Invalid update: non-integer amount
    failed = expenseReducer(state, {
      type: 'UPDATE_EXPENSE',
      payload: {
        id: 'e1',
        description: 'Float',
        amountMinor: 45.5,
        paidBy: 'anna',
        participants: ['anna'],
      },
    });
    expect(failed.expenses[0].amountMinor).toBe(4500);

    // Invalid update: non-existent payer
    failed = expenseReducer(state, {
      type: 'UPDATE_EXPENSE',
      payload: {
        id: 'e1',
        description: 'Bad Payer',
        amountMinor: 3000,
        paidBy: 'unknown',
        participants: ['anna'],
      },
    });
    expect(failed.expenses[0].paidBy).toBe('ben');
  });

  it('handles deleteExpense and restoreExpense single-level undo roundtrip', () => {
    const exp: Expense = {
      id: 'e1',
      description: 'Balloons',
      amountMinor: 1500,
      paidBy: 'anna',
      participants: ['anna', 'ben'],
    };

    let state: ExpenseState = {
      people: [
        { id: 'anna', name: 'Anna' },
        { id: 'ben', name: 'Ben' },
      ],
      expenses: [exp],
      currency: 'USD',
      deletedExpense: null,
    };

    // Delete
    state = expenseReducer(state, { type: 'DELETE_EXPENSE', payload: { id: 'e1' } });
    expect(state.expenses).toHaveLength(0);
    expect(state.deletedExpense).toEqual(exp);

    // Restore
    state = expenseReducer(state, { type: 'RESTORE_EXPENSE' });
    expect(state.expenses).toHaveLength(1);
    expect(state.expenses[0]).toEqual(exp);
    expect(state.deletedExpense).toBeNull();
  });

  it('loads example data for Anna, Ben, and Chris producing Step 1 Test 1 settlements', () => {
    const state = expenseReducer(INITIAL_STATE, { type: 'LOAD_EXAMPLE' });
    expect(state.people).toHaveLength(3);
    expect(state.expenses).toHaveLength(4);

    const settlements = computeSettlements(state.people, state.expenses);
    expect(settlements).toHaveLength(2);

    const benSettlement = settlements.find((s) => s.from === 'person_ben');
    const chrisSettlement = settlements.find((s) => s.from === 'person_chris');

    expect(benSettlement).toEqual({
      from: 'person_ben',
      to: 'person_anna',
      amountMinor: 7800,
    });
    expect(chrisSettlement).toEqual({
      from: 'person_chris',
      to: 'person_anna',
      amountMinor: 7200,
    });
  });

  it('clearAll resets people, expenses, and deletedExpense but preserves chosen currency', () => {
    let state: ExpenseState = {
      people: [{ id: 'p1', name: 'Georgie' }],
      expenses: [
        {
          id: 'e1',
          description: 'Boat',
          amountMinor: 100,
          paidBy: 'p1',
          participants: ['p1'],
        },
      ],
      currency: 'EUR',
      deletedExpense: null,
    };

    state = expenseReducer(state, { type: 'CLEAR_ALL' });
    expect(state.people).toEqual([]);
    expect(state.expenses).toEqual([]);
    expect(state.deletedExpense).toBeNull();
    expect(state.currency).toBe('EUR'); // Preserved!
  });

  describe('Hydration and Corruption Validation (validateHydratedState)', () => {
    it('returns null on missing, corrupt or invalid raw objects', () => {
      expect(validateHydratedState(null)).toBeNull();
      expect(validateHydratedState(undefined)).toBeNull();
      expect(validateHydratedState('string')).toBeNull();
      expect(validateHydratedState(123)).toBeNull();
      expect(validateHydratedState({})).toBeNull();
      expect(validateHydratedState({ people: 'bad' })).toBeNull();
    });

    it('rejects an expense that references a missing person (payer)', () => {
      const corruptData = {
        people: [{ id: 'p1', name: 'Anna' }],
        expenses: [
          {
            id: 'e1',
            description: 'Ghost payment',
            amountMinor: 1000,
            paidBy: 'missing_payer_id',
            participants: ['p1'],
          },
        ],
        currency: 'USD',
      };
      expect(validateHydratedState(corruptData)).toBeNull();
    });

    it('rejects an expense that references a missing participant', () => {
      const corruptData = {
        people: [{ id: 'p1', name: 'Anna' }],
        expenses: [
          {
            id: 'e1',
            description: 'Lunch',
            amountMinor: 1000,
            paidBy: 'p1',
            participants: ['p1', 'missing_person'],
          },
        ],
        currency: 'USD',
      };
      expect(validateHydratedState(corruptData)).toBeNull();
    });

    it('rejects an expense with a non-integer amountMinor', () => {
      const corruptData = {
        people: [{ id: 'p1', name: 'Anna' }],
        expenses: [
          {
            id: 'e1',
            description: 'Float amount',
            amountMinor: 12.5, // Not integer!
            paidBy: 'p1',
            participants: ['p1'],
          },
        ],
        currency: 'USD',
      };
      expect(validateHydratedState(corruptData)).toBeNull();
    });

    it('rejects an expense with zero or negative amountMinor', () => {
      const corruptZero = {
        people: [{ id: 'p1', name: 'Anna' }],
        expenses: [
          {
            id: 'e1',
            description: 'Zero',
            amountMinor: 0,
            paidBy: 'p1',
            participants: ['p1'],
          },
        ],
        currency: 'USD',
      };
      expect(validateHydratedState(corruptZero)).toBeNull();

      const corruptNegative = {
        people: [{ id: 'p1', name: 'Anna' }],
        expenses: [
          {
            id: 'e1',
            description: 'Negative',
            amountMinor: -100,
            paidBy: 'p1',
            participants: ['p1'],
          },
        ],
        currency: 'USD',
      };
      expect(validateHydratedState(corruptNegative)).toBeNull();
    });

    it('rejects duplicate person IDs or duplicate case-insensitive names', () => {
      const dupId = {
        people: [
          { id: 'p1', name: 'Anna' },
          { id: 'p1', name: 'Ben' },
        ],
        expenses: [],
        currency: 'USD',
      };
      expect(validateHydratedState(dupId)).toBeNull();

      const dupName = {
        people: [
          { id: 'p1', name: 'Anna' },
          { id: 'p2', name: 'ANNA' },
        ],
        expenses: [],
        currency: 'USD',
      };
      expect(validateHydratedState(dupName)).toBeNull();
    });

    it('falls back to default currency USD if unsupported currency is supplied', () => {
      const dataWithWeirdCurrency = {
        people: [{ id: 'p1', name: 'Anna' }],
        expenses: [],
        currency: 'BITCOIN_XYZ',
      };
      const result = validateHydratedState(dataWithWeirdCurrency);
      expect(result).not.toBeNull();
      expect(result?.currency).toBe('USD');
    });

    it('hydrates valid data cleanly', () => {
      const validData = {
        people: [
          { id: 'p1', name: 'Anna' },
          { id: 'p2', name: 'Ben' },
        ],
        expenses: [
          {
            id: 'e1',
            description: 'Hotel',
            amountMinor: 10000,
            paidBy: 'p1',
            participants: ['p1', 'p2'],
          },
        ],
        currency: 'EUR',
      };
      const result = validateHydratedState(validData);
      expect(result).not.toBeNull();
      expect(result?.currency).toBe('EUR');
      expect(result?.people).toHaveLength(2);
      expect(result?.expenses).toHaveLength(1);
    });

    it('enforces limit: 51st person is rejected in reducer', () => {
      let state = INITIAL_STATE;
      for (let i = 1; i <= MAX_PEOPLE; i++) {
        state = expenseReducer(state, {
          type: 'ADD_PERSON',
          payload: { id: `p_${i}`, name: `Person ${i}` },
        });
      }
      expect(state.people).toHaveLength(MAX_PEOPLE);

      // Attempt 51st person
      const state51 = expenseReducer(state, {
        type: 'ADD_PERSON',
        payload: { id: 'p_51', name: 'Person 51' },
      });
      expect(state51.people).toHaveLength(MAX_PEOPLE);
    });

    it('enforces limit: 501st expense is rejected in reducer and restoreExpense', () => {
      let state = INITIAL_STATE;
      state = expenseReducer(state, {
        type: 'ADD_PERSON',
        payload: { id: 'p1', name: 'Anna' },
      });
      state = expenseReducer(state, {
        type: 'ADD_PERSON',
        payload: { id: 'p2', name: 'Ben' },
      });

      for (let i = 1; i <= MAX_EXPENSES; i++) {
        state = expenseReducer(state, {
          type: 'ADD_EXPENSE',
          payload: {
            id: `e_${i}`,
            description: `Expense ${i}`,
            amountMinor: 1000,
            paidBy: 'p1',
            participants: ['p1', 'p2'],
          },
        });
      }
      expect(state.expenses).toHaveLength(MAX_EXPENSES);

      // Attempt 501st expense
      const state501 = expenseReducer(state, {
        type: 'ADD_EXPENSE',
        payload: {
          id: 'e_501',
          description: 'Expense 501',
          amountMinor: 1000,
          paidBy: 'p1',
          participants: ['p1', 'p2'],
        },
      });
      expect(state501.expenses).toHaveLength(MAX_EXPENSES);

      // restoreExpense also rejected when at limit
      const stateWithDeleted: ExpenseState = {
        ...state,
        deletedExpense: {
          id: 'e_del',
          description: 'Del',
          amountMinor: 500,
          paidBy: 'p1',
          participants: ['p1'],
        },
      };
      const restoredState = expenseReducer(stateWithDeleted, { type: 'RESTORE_EXPENSE' });
      expect(restoredState.expenses).toHaveLength(MAX_EXPENSES);
    });

    it('enforces limit: 61-character name and 121-character description are rejected', () => {
      // 61-char name
      const name61 = 'A'.repeat(61);
      const state1 = expenseReducer(INITIAL_STATE, {
        type: 'ADD_PERSON',
        payload: { id: 'p1', name: name61 },
      });
      expect(state1.people).toHaveLength(0);

      // 60-char name is accepted
      const name60 = 'A'.repeat(60);
      const state2 = expenseReducer(INITIAL_STATE, {
        type: 'ADD_PERSON',
        payload: { id: 'p1', name: name60 },
      });
      expect(state2.people).toHaveLength(1);

      // 121-char description
      const desc121 = 'B'.repeat(121);
      const state3 = expenseReducer(state2, {
        type: 'ADD_EXPENSE',
        payload: {
          id: 'e1',
          description: desc121,
          amountMinor: 100,
          paidBy: 'p1',
          participants: ['p1'],
        },
      });
      expect(state3.expenses).toHaveLength(0);

      // 120-char description is accepted
      const desc120 = 'B'.repeat(120);
      const state4 = expenseReducer(state2, {
        type: 'ADD_EXPENSE',
        payload: {
          id: 'e1',
          description: desc120,
          amountMinor: 100,
          paidBy: 'p1',
          participants: ['p1'],
        },
      });
      expect(state4.expenses).toHaveLength(1);
    });

    it('state at exactly the limits (50 people, 500 expenses, 60-char name, 120-char desc) survives a save and reload round trip', () => {
      const maxPeopleList = Array.from({ length: MAX_PEOPLE }, (_, i) => ({
        id: `p_${i + 1}`,
        name: i === 0 ? 'X'.repeat(MAX_NAME_LENGTH) : `Person ${i + 1}`,
      }));

      const maxExpensesList = Array.from({ length: MAX_EXPENSES }, (_, i) => ({
        id: `e_${i + 1}`,
        description: i === 0 ? 'Y'.repeat(MAX_DESC_LENGTH) : `Expense ${i + 1}`,
        amountMinor: 1000 + i,
        paidBy: 'p_1',
        participants: ['p_1', 'p_2'],
      }));

      const fullState = {
        people: maxPeopleList,
        expenses: maxExpensesList,
        currency: 'USD',
      };

      // Simulate JSON save
      const serialized = JSON.stringify(fullState);
      const parsed = JSON.parse(serialized);

      // Validate reload via validateHydratedState
      const reloaded = validateHydratedState(parsed);
      expect(reloaded).not.toBeNull();
      expect(reloaded?.people).toHaveLength(50);
      expect(reloaded?.expenses).toHaveLength(500);
      expect(reloaded?.people[0].name).toBe('X'.repeat(60));
      expect(reloaded?.expenses[0].description).toBe('Y'.repeat(120));
    });
  });
});
