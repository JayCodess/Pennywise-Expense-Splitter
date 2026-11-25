import { Person, Expense, Settlement } from './types';

export interface GenerateCSVOptions {
  people: Person[];
  expenses: Expense[];
  settlements: Settlement[];
  currency: string;
  date?: string; // e.g. "2026-11-25"
}

/**
 * Escapes a single CSV cell according to RFC 4180 and prevents CSV formula injection.
 * If a cell starts with =, +, -, @, \t, or \r, prefixes with a single quote (')
 * before escaping. Encloses in quotes if cell contains commas, quotes, or newlines,
 * doubling any existing quotes.
 */
export function escapeCSVCell(value: string | number): string {
  let str = String(value);

  // Prevent CSV / Excel formula injection (CWE-1236)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Returns a standardized CSV filename: pennywise-<yyyy-mm-dd>.csv
 */
export function getCSVFileName(dateStr?: string): string {
  const d = dateStr || new Date().toISOString().split('T')[0];
  return `pennywise-${d}.csv`;
}

/**
 * Generates CSV content with two sections (Expenses and Settlements),
 * prefixed with UTF-8 Byte Order Mark (\uFEFF) for Microsoft Excel compatibility.
 */
export function generateExpensesCSV(options: GenerateCSVOptions): string {
  const { people, expenses, settlements, currency } = options;

  const getPersonName = (id: string) => people.find((p) => p.id === id)?.name || id;

  const lines: string[] = [];

  // Title
  lines.push('Pennywise: expense summary');
  lines.push('');

  // Section 1: Expenses
  lines.push('EXPENSES');
  lines.push(['Description', `Amount (${currency})`, 'Paid By', 'Split With'].map(escapeCSVCell).join(','));

  for (const exp of expenses) {
    const desc = exp.description;
    const amt = (exp.amountMinor / 100).toFixed(2);
    const paidBy = getPersonName(exp.paidBy);
    const splitWith = exp.participants.map(getPersonName).join('; ');

    lines.push([desc, amt, paidBy, splitWith].map(escapeCSVCell).join(','));
  }

  lines.push(''); // Blank row separator

  // Section 2: Settlements
  lines.push('SETTLEMENTS');
  lines.push(['From (Debtor)', 'To (Creditor)', `Amount (${currency})`].map(escapeCSVCell).join(','));

  for (const s of settlements) {
    const fromName = getPersonName(s.from);
    const toName = getPersonName(s.to);
    const amt = (s.amountMinor / 100).toFixed(2);

    lines.push([fromName, toName, amt].map(escapeCSVCell).join(','));
  }

  // Prepend UTF-8 BOM so Excel opens non-Latin and special characters properly
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Initiates browser download of the generated CSV file
 */
export function downloadCSVFile(content: string, fileName: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
