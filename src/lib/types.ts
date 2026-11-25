/**
 * Domain types for people, expenses, settlements, and net balances.
 */

export interface Person {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amountMinor: number; // integer minor units (cents, pence, paise, etc.)
  paidBy: string; // personId
  participants: string[]; // personId[]
}

export interface Settlement {
  from: string; // personId of debtor
  to: string; // personId of creditor
  amountMinor: number;
}

export interface PersonBalance {
  personId: string;
  balanceMinor: number; // positive = gets back, negative = owes, 0 = settled
  totalPaidMinor: number;
  totalShareMinor: number;
}
