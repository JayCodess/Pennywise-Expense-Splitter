import { Person, Expense, Settlement, PersonBalance } from './types';

/**
 * Splits an expense evenly among its participants.
 * Distributes remainder minor units deterministically:
 * the first N participants in the stable participant order get +1 minor unit,
 * ensuring the sum of shares always equals expense.amountMinor exactly.
 */
export function splitExpense(expense: Expense): Map<string, number> {
  const shares = new Map<string, number>();
  const count = expense.participants.length;

  if (count === 0 || expense.amountMinor <= 0) {
    return shares;
  }

  const baseShare = Math.floor(expense.amountMinor / count);
  const remainder = expense.amountMinor % count;

  expense.participants.forEach((personId, index) => {
    const extra = index < remainder ? 1 : 0;
    shares.set(personId, baseShare + extra);
  });

  return shares;
}

/**
 * Computes individual balances for each person.
 * Balance = total paid − total own share.
 * The sum of all balances across all participants is guaranteed to be 0.
 */
export function computeBalances(
  people: Person[],
  expenses: Expense[]
): PersonBalance[] {
  const personMap = new Map<string, PersonBalance>();

  for (const person of people) {
    personMap.set(person.id, {
      personId: person.id,
      balanceMinor: 0,
      totalPaidMinor: 0,
      totalShareMinor: 0,
    });
  }

  for (const expense of expenses) {
    if (expense.amountMinor <= 0) continue;

    // Credit payer
    const payer = personMap.get(expense.paidBy);
    if (payer) {
      payer.totalPaidMinor += expense.amountMinor;
    }

    // Debit participants
    const shares = splitExpense(expense);
    for (const [participantId, shareMinor] of shares.entries()) {
      const participant = personMap.get(participantId);
      if (participant) {
        participant.totalShareMinor += shareMinor;
      }
    }
  }

  // Calculate net balance for each person: total paid - total share
  const balances: PersonBalance[] = [];
  for (const person of people) {
    const entry = personMap.get(person.id)!;
    entry.balanceMinor = entry.totalPaidMinor - entry.totalShareMinor;
    balances.push(entry);
  }

  return balances;
}

/**
 * Computes the minimum number of transactions needed to settle all debts
 * using a greedy largest-debtor to largest-creditor matching algorithm.
 * Repeatedly matches the largest debtor with the largest creditor,
 * transfers min(debt, credit), and repeats until all balances are zero.
 * Returns an array of Settlements: [{ from, to, amountMinor }].
 * Ignores zero balances.
 */
export function computeSettlements(
  people: Person[],
  expenses: Expense[]
): Settlement[] {
  const balances = computeBalances(people, expenses);

  // Separate into debtors (negative balance) and creditors (positive balance)
  interface BalHolder {
    id: string;
    amount: number; // positive magnitude of debt or credit
  }

  const debtors: BalHolder[] = [];
  const creditors: BalHolder[] = [];

  for (const b of balances) {
    if (b.balanceMinor < 0) {
      debtors.push({ id: b.personId, amount: -b.balanceMinor });
    } else if (b.balanceMinor > 0) {
      creditors.push({ id: b.personId, amount: b.balanceMinor });
    }
  }

  const settlements: Settlement[] = [];

  // Greedy loop: repeatedly match largest debtor with largest creditor
  while (debtors.length > 0 && creditors.length > 0) {
    // Sort descending by remaining balance amount
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const largestDebtor = debtors[0];
    const largestCreditor = creditors[0];

    const transfer = Math.min(largestDebtor.amount, largestCreditor.amount);

    settlements.push({
      from: largestDebtor.id,
      to: largestCreditor.id,
      amountMinor: transfer,
    });

    largestDebtor.amount -= transfer;
    largestCreditor.amount -= transfer;

    if (largestDebtor.amount === 0) {
      debtors.shift();
    }
    if (largestCreditor.amount === 0) {
      creditors.shift();
    }
  }

  return settlements;
}
