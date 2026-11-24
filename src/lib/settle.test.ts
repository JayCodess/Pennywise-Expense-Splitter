import { describe, it, expect } from 'vitest';
import { Person, Expense } from './types';
import { splitExpense, computeBalances, computeSettlements } from './settle';

describe('Settlement and Balance Calculations', () => {
  // Test 1: Anna, Ben, Chris standard scenario
  it('1. correctly computes settlements: Anna paid 300, Ben paid 60 and 24, Chris paid 90 -> Ben pays Anna 78.00, Chris pays Anna 72.00', () => {
    const anna: Person = { id: 'anna', name: 'Anna' };
    const ben: Person = { id: 'ben', name: 'Ben' };
    const chris: Person = { id: 'chris', name: 'Chris' };
    const people = [anna, ben, chris];

    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Apartment',
        amountMinor: 30000, // $300.00
        paidBy: 'anna',
        participants: ['anna', 'ben', 'chris'],
      },
      {
        id: 'e2',
        description: 'Fuel',
        amountMinor: 6000, // $60.00
        paidBy: 'ben',
        participants: ['anna', 'ben', 'chris'],
      },
      {
        id: 'e3',
        description: 'Museum',
        amountMinor: 2400, // $24.00
        paidBy: 'ben',
        participants: ['ben', 'chris'],
      },
      {
        id: 'e4',
        description: 'Dinner',
        amountMinor: 9000, // $90.00
        paidBy: 'chris',
        participants: ['anna', 'ben', 'chris'],
      },
    ];

    const balances = computeBalances(people, expenses);
    const balanceMap = new Map(balances.map((b) => [b.personId, b.balanceMinor]));

    // Balances: Anna +15000, Ben -7800, Chris -7200
    expect(balanceMap.get('anna')).toBe(15000);
    expect(balanceMap.get('ben')).toBe(-7800);
    expect(balanceMap.get('chris')).toBe(-7200);

    // Sum of balances must be exactly 0
    const sumBalances = balances.reduce((sum, b) => sum + b.balanceMinor, 0);
    expect(sumBalances).toBe(0);

    const settlements = computeSettlements(people, expenses);
    expect(settlements).toHaveLength(2);

    expect(settlements).toEqual(
      expect.arrayContaining([
        { from: 'ben', to: 'anna', amountMinor: 7800 },
        { from: 'chris', to: 'anna', amountMinor: 7200 },
      ])
    );
  });

  // Test 2: Payer not in participant list
  it('2. correctly handles a payer who is not in the participant list', () => {
    const dave: Person = { id: 'dave', name: 'Dave' };
    const anna: Person = { id: 'anna', name: 'Anna' };
    const ben: Person = { id: 'ben', name: 'Ben' };
    const people = [dave, anna, ben];

    // Dave pays $60 for Anna and Ben
    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Concert tickets',
        amountMinor: 6000,
        paidBy: 'dave',
        participants: ['anna', 'ben'],
      },
    ];

    const balances = computeBalances(people, expenses);
    const balanceMap = new Map(balances.map((b) => [b.personId, b.balanceMinor]));

    expect(balanceMap.get('dave')).toBe(6000);
    expect(balanceMap.get('anna')).toBe(-3000);
    expect(balanceMap.get('ben')).toBe(-3000);

    const sumBalances = balances.reduce((sum, b) => sum + b.balanceMinor, 0);
    expect(sumBalances).toBe(0);

    const settlements = computeSettlements(people, expenses);
    expect(settlements).toHaveLength(2);
    expect(settlements).toEqual(
      expect.arrayContaining([
        { from: 'anna', to: 'dave', amountMinor: 3000 },
        { from: 'ben', to: 'dave', amountMinor: 3000 },
      ])
    );
  });

  // Test 3: 10.00 split 3 ways gives 3.34 / 3.33 / 3.33, summing to 10.00
  it('3. 10.00 split 3 ways distributes remainder deterministically to sum to exactly 10.00', () => {
    const expense: Expense = {
      id: 'e1',
      description: 'Snacks',
      amountMinor: 1000, // $10.00
      paidBy: 'p1',
      participants: ['p1', 'p2', 'p3'],
    };

    const shares = splitExpense(expense);
    expect(shares.get('p1')).toBe(334);
    expect(shares.get('p2')).toBe(333);
    expect(shares.get('p3')).toBe(333);

    const sumShares = Array.from(shares.values()).reduce((sum, s) => sum + s, 0);
    expect(sumShares).toBe(1000);
  });

  // Test 4: Everyone already square returns no settlements
  it('4. returns no settlements when everyone is already square', () => {
    const anna: Person = { id: 'anna', name: 'Anna' };
    const ben: Person = { id: 'ben', name: 'Ben' };
    const people = [anna, ben];

    // Anna paid $20 for Ben, Ben paid $20 for Anna
    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Lunch',
        amountMinor: 2000,
        paidBy: 'anna',
        participants: ['ben'],
      },
      {
        id: 'e2',
        description: 'Coffee',
        amountMinor: 2000,
        paidBy: 'ben',
        participants: ['anna'],
      },
    ];

    const balances = computeBalances(people, expenses);
    for (const b of balances) {
      expect(b.balanceMinor).toBe(0);
    }

    const settlements = computeSettlements(people, expenses);
    expect(settlements).toEqual([]);
  });

  // Test 5: A single-person expense paid by that person
  it('5. handles a single-person expense paid by that person with zero net debt', () => {
    const anna: Person = { id: 'anna', name: 'Anna' };
    const ben: Person = { id: 'ben', name: 'Ben' };
    const people = [anna, ben];

    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Personal souvenir',
        amountMinor: 4500,
        paidBy: 'anna',
        participants: ['anna'],
      },
    ];

    const balances = computeBalances(people, expenses);
    const annaBal = balances.find((b) => b.personId === 'anna');
    expect(annaBal?.balanceMinor).toBe(0);
    expect(annaBal?.totalPaidMinor).toBe(4500);
    expect(annaBal?.totalShareMinor).toBe(4500);

    const settlements = computeSettlements(people, expenses);
    expect(settlements).toEqual([]);
  });

  // Test 6: A group of 6+ people with chained debts
  it('6. for 6+ people with chained debts, balances sum to 0 and payments <= people - 1', () => {
    const people: Person[] = [
      { id: 'p1', name: 'Person 1' },
      { id: 'p2', name: 'Person 2' },
      { id: 'p3', name: 'Person 3' },
      { id: 'p4', name: 'Person 4' },
      { id: 'p5', name: 'Person 5' },
      { id: 'p6', name: 'Person 6' },
      { id: 'p7', name: 'Person 7' },
    ];

    // Chained cycle of expenses: P1 pays for P2, P2 pays for P3, etc.
    const expenses: Expense[] = [
      { id: 'e1', description: 'Item 1', amountMinor: 7000, paidBy: 'p1', participants: ['p2', 'p3'] },
      { id: 'e2', description: 'Item 2', amountMinor: 5000, paidBy: 'p2', participants: ['p3', 'p4', 'p5'] },
      { id: 'e3', description: 'Item 3', amountMinor: 9500, paidBy: 'p3', participants: ['p1', 'p6', 'p7'] },
      { id: 'e4', description: 'Item 4', amountMinor: 4200, paidBy: 'p4', participants: ['p5', 'p6'] },
      { id: 'e5', description: 'Item 5', amountMinor: 6300, paidBy: 'p5', participants: ['p1', 'p2', 'p7'] },
      { id: 'e6', description: 'Item 6', amountMinor: 8100, paidBy: 'p6', participants: ['p2', 'p4'] },
    ];

    const balances = computeBalances(people, expenses);

    // Invariant 1: Balances must sum to exactly 0
    const sumBalances = balances.reduce((sum, b) => sum + b.balanceMinor, 0);
    expect(sumBalances).toBe(0);

    const settlements = computeSettlements(people, expenses);

    // Invariant 2: Greedy settlement algorithm produces at most (people - 1) transactions
    expect(settlements.length).toBeLessThanOrEqual(people.length - 1);

    // Invariant 3: Applying settlements fully satisfies all net balances
    const simulatedNet = new Map<string, number>();
    for (const p of people) {
      simulatedNet.set(p.id, 0);
    }
    for (const s of settlements) {
      simulatedNet.set(s.from, simulatedNet.get(s.from)! - s.amountMinor);
      simulatedNet.set(s.to, simulatedNet.get(s.to)! + s.amountMinor);
    }

    for (const b of balances) {
      expect(simulatedNet.get(b.personId)).toBe(b.balanceMinor);
    }
  });
});
