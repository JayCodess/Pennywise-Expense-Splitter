import { describe, it, expect } from 'vitest';
import { parseAmountToMinor, formatMoney } from './money';

describe('Money Utilities (Parsing and Formatting)', () => {
  // Test 7: Parsing and formatting edge cases
  describe('7. parseAmountToMinor', () => {
    it('accepts valid integers and decimals', () => {
      expect(parseAmountToMinor('12')).toBe(1200);
      expect(parseAmountToMinor('12.5')).toBe(1250);
      expect(parseAmountToMinor('12.50')).toBe(1250);
      expect(parseAmountToMinor('12,50')).toBe(1250);
      expect(parseAmountToMinor('0.99')).toBe(99);
      expect(parseAmountToMinor('0,05')).toBe(5);
      expect(parseAmountToMinor(' 45.6 ')).toBe(4560);
      expect(parseAmountToMinor('1000')).toBe(100000);
      expect(parseAmountToMinor('999999.99')).toBe(99999999);
    });

    it('handles thousands separators across US and European formats', () => {
      expect(parseAmountToMinor('1,234.50')).toBe(123450);
      expect(parseAmountToMinor('1.234,50')).toBe(123450);
      expect(parseAmountToMinor('1,234')).toBe(123400);
      expect(parseAmountToMinor('12,345')).toBe(1234500);
      expect(parseAmountToMinor('12,50')).toBe(1250);
      expect(parseAmountToMinor('1,234,567.89')).toBe(123456789);
      expect(parseAmountToMinor('1.234.567,89')).toBe(123456789);
      expect(parseAmountToMinor('10,000')).toBe(1000000);
      expect(parseAmountToMinor('10.000.000')).toBe(1000000000);
    });

    it('rejects malformed thousands grouping or excess decimals', () => {
      expect(parseAmountToMinor('1,2345')).toBeNull(); // 4 digits after comma: rejected
      expect(parseAmountToMinor('1.234')).toBeNull(); // 3 decimal places without comma decimal: rejected
      expect(parseAmountToMinor('12,3456.78')).toBeNull(); // invalid grouping
      expect(parseAmountToMinor('12.345')).toBeNull(); // >2 decimals: rejected
    });

    it('rejects zero, negative, and invalid values', () => {
      expect(parseAmountToMinor('0')).toBeNull();
      expect(parseAmountToMinor('0.00')).toBeNull();
      expect(parseAmountToMinor('0,0')).toBeNull();
      expect(parseAmountToMinor('-12')).toBeNull();
      expect(parseAmountToMinor('-0.50')).toBeNull();
      expect(parseAmountToMinor('')).toBeNull();
      expect(parseAmountToMinor('   ')).toBeNull();
      expect(parseAmountToMinor('abc')).toBeNull();
      expect(parseAmountToMinor('12abc')).toBeNull();
      expect(parseAmountToMinor('NaN')).toBeNull();
    });

    it('rejects multiple decimal separators or currency symbols', () => {
      expect(parseAmountToMinor('12.3.4')).toBeNull();
      expect(parseAmountToMinor('12,3,4')).toBeNull();
      expect(parseAmountToMinor('$12')).toBeNull();
      expect(parseAmountToMinor('12€')).toBeNull();
    });
  });

  describe('7. formatMoney', () => {
    it('formats minor units accurately for various currencies', () => {
      expect(formatMoney(7800, 'USD', 'en-US')).toBe('$78.00');
      expect(formatMoney(7200, 'USD', 'en-US')).toBe('$72.00');
      expect(formatMoney(334, 'USD', 'en-US')).toBe('$3.34');
      expect(formatMoney(100000, 'USD', 'en-US')).toBe('$1,000.00');
      expect(formatMoney(0, 'USD', 'en-US')).toBe('$0.00');
    });

    it('handles negative values gracefully', () => {
      expect(formatMoney(-7800, 'USD', 'en-US')).toBe('-$78.00');
    });

    it('falls back safely on unknown currency or Intl error', () => {
      const eurFormatted = formatMoney(5000, 'EUR', 'en-US');
      expect(eurFormatted).toContain('50.00');

      const fallbackResult = formatMoney(2500, 'XYZ', 'en-US');
      expect(fallbackResult).toContain('25.00');
    });
  });
});
