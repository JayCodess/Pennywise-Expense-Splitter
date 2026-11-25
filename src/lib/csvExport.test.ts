import { describe, it, expect } from 'vitest';
import { escapeCSVCell, getCSVFileName, generateExpensesCSV } from './csvExport';
import { Person, Expense, Settlement } from './types';

describe('csvExport - pure helpers', () => {
  it('formats CSV file name with date', () => {
    expect(getCSVFileName('2026-11-25')).toBe('pennywise-2026-11-25.csv');
    expect(getCSVFileName()).toMatch(/^pennywise-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('escapes cells containing commas, quotes, and newlines per RFC 4180', () => {
    expect(escapeCSVCell('Simple')).toBe('Simple');
    expect(escapeCSVCell('Carnival, Fair')).toBe('"Carnival, Fair"');
    expect(escapeCSVCell('Say "Hello"')).toBe('"Say ""Hello"""');
    expect(escapeCSVCell('Line1\nLine2')).toBe('"Line1\nLine2"');
  });

  it('prevents CSV formula injection by prepending single quote for dangerous prefixes', () => {
    expect(escapeCSVCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(escapeCSVCell('+12345')).toBe("'+12345");
    expect(escapeCSVCell('-cmd|calc')).toBe("'-cmd|calc");
    expect(escapeCSVCell('@cmd')).toBe("'@cmd");
    expect(escapeCSVCell('\talert(1)')).toBe("'\talert(1)");
    expect(escapeCSVCell('\rnotice')).toBe('"\'\rnotice"');
    // If it has dangerous prefix AND commas/quotes, it is prepended AND enclosed in quotes
    expect(escapeCSVCell('=1+1,2')).toBe('"\'=1+1,2"');
    expect(escapeCSVCell('=cmd"quote"')).toBe('"\'=cmd""quote"""');
  });

  it('generates CSV with UTF-8 BOM, decimal amounts, and proper sections', () => {
    const people: Person[] = [
      { id: '1', name: 'Anna "The Boss"' },
      { id: '2', name: 'Ben, Jr.' },
      { id: '3', name: 'कबीर (Kabir)' },
    ];

    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Apartment, 3 Nights',
        amountMinor: 30050, // 300.50
        paidBy: '1',
        participants: ['1', '2', '3'],
      },
    ];

    const settlements: Settlement[] = [
      {
        from: '2',
        to: '1',
        amountMinor: 7800, // 78.00
      },
    ];

    const csv = generateExpensesCSV({
      people,
      expenses,
      settlements,
      currency: 'USD',
    });

    // Check UTF-8 BOM
    expect(csv.charCodeAt(0)).toBe(0xfeff);

    // Check Title and Sections
    expect(csv).toContain('Pennywise: expense summary');
    expect(csv).toContain('EXPENSES');
    expect(csv).toContain(
      '"Apartment, 3 Nights",300.50,"Anna ""The Boss""","Anna ""The Boss""; Ben, Jr.; कबीर (Kabir)"'
    );
    expect(csv).toContain('SETTLEMENTS');
    expect(csv).toContain('"Ben, Jr.","Anna ""The Boss""",78.00');
  });
});
