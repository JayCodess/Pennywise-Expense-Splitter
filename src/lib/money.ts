/**
 * Money utilities: parsing user input into minor units (cents/paise) and formatting.
 */

/**
 * Parses user input string into integer minor units (e.g. cents/paise).
 * Handles thousands separators and decimal points across standard locales:
 * - "1,234.50" -> 123450
 * - "1.234,50" -> 123450
 * - "1,234" -> 123400 (thousands separator)
 * - "12,50" -> 1250 (decimal comma)
 * - "12.5" / "12" -> 1250 / 1200
 * Rejects (returns null):
 * - "1,2345" (invalid thousands grouping / >2 decimals)
 * - negative numbers, zero, NaN, empty strings, and numbers with >2 decimals
 */
export function parseAmountToMinor(input: string): number | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Reject signs or non-numeric starts
  if (trimmed.startsWith('-') || trimmed.startsWith('+')) return null;

  const hasComma = trimmed.includes(',');
  const hasDot = trimmed.includes('.');

  let integerStr = '';
  let decimalStr = '';

  if (hasComma && hasDot) {
    const lastComma = trimmed.lastIndexOf(',');
    const lastDot = trimmed.lastIndexOf('.');

    if (lastComma < lastDot) {
      // Format: 1,234,567.89 (comma = thousands, dot = decimal)
      if (trimmed.indexOf('.') !== lastDot) return null; // Only one decimal dot allowed
      const intPart = trimmed.slice(0, lastDot);
      if (!/^\d{1,3}(,\d{3})+$/.test(intPart)) return null;

      const decPart = trimmed.slice(lastDot + 1);
      if (!/^\d{1,2}$/.test(decPart)) return null;

      integerStr = intPart.replace(/,/g, '');
      decimalStr = decPart;
    } else {
      // Format: 1.234.567,89 (dot = thousands, comma = decimal)
      if (trimmed.indexOf(',') !== lastComma) return null; // Only one decimal comma allowed
      const intPart = trimmed.slice(0, lastComma);
      if (!/^\d{1,3}(\.\d{3})+$/.test(intPart)) return null;

      const decPart = trimmed.slice(lastComma + 1);
      if (!/^\d{1,2}$/.test(decPart)) return null;

      integerStr = intPart.replace(/\./g, '');
      decimalStr = decPart;
    }
  } else if (hasComma) {
    // Only comma(s) present
    const commaCount = (trimmed.match(/,/g) || []).length;
    if (commaCount > 1) {
      // Multiple commas must be thousands separators: e.g. 1,234,567
      if (!/^\d{1,3}(,\d{3})+$/.test(trimmed)) return null;
      integerStr = trimmed.replace(/,/g, '');
      decimalStr = '';
    } else {
      // Exactly one comma: could be thousands ("1,234") or decimal ("12,50", "12,5")
      const parts = trimmed.split(',');
      const before = parts[0];
      const after = parts[1];

      // If after has 3 digits and before has 1-3 digits: e.g. "1,234" -> thousands
      if (/^\d{3}$/.test(after) && /^\d{1,3}$/.test(before)) {
        integerStr = before + after;
        decimalStr = '';
      } else if (/^\d{1,2}$/.test(after) && /^\d+$/.test(before)) {
        // 1 or 2 decimal digits: e.g. "12,50", "12,5", "1234,50" -> decimal comma
        integerStr = before;
        decimalStr = after;
      } else {
        // e.g. "1,2345" -> rejected
        return null;
      }
    }
  } else if (hasDot) {
    // Only dot(s) present
    const dotCount = (trimmed.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Multiple dots: e.g. 1.234.567 (European thousands)
      if (!/^\d{1,3}(\.\d{3})+$/.test(trimmed)) return null;
      integerStr = trimmed.replace(/\./g, '');
      decimalStr = '';
    } else {
      // Exactly one dot: standard decimal dot (e.g. "12.5", "12.50")
      const parts = trimmed.split('.');
      const before = parts[0];
      const after = parts[1];

      // Reject if >2 decimals (e.g. "1.234" -> rejected)
      if (!/^\d+$/.test(before) || !/^\d{1,2}$/.test(after)) {
        return null;
      }
      integerStr = before;
      decimalStr = after;
    }
  } else {
    // Only digits
    if (!/^\d+$/.test(trimmed)) return null;
    integerStr = trimmed;
    decimalStr = '';
  }

  const integerPart = parseInt(integerStr, 10);
  if (Number.isNaN(integerPart)) return null;

  const fractionalString = decimalStr.padEnd(2, '0');
  const fractionalPart = fractionalString ? parseInt(fractionalString, 10) : 0;
  if (Number.isNaN(fractionalPart)) return null;

  const minor = integerPart * 100 + fractionalPart;

  if (minor <= 0) return null;
  if (!Number.isSafeInteger(minor)) return null;

  return minor;
}

/**
 * Money utilities: parsing user input into minor units (cents/paise) and formatting.
 */

/**
 * Formats minor units (cents/paise) into localized currency string using Intl.NumberFormat.
 */
export function formatMoney(
  minor: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    // Fallback if an exotic currency code or locale fails
    const sign = major < 0 ? '-' : '';
    const abs = Math.abs(major).toFixed(2);
    return `${sign}${currency} ${abs}`;
  }
}
