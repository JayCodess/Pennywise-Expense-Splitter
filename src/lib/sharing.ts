import { Person, Settlement } from './types';
import { formatMoney } from './money';

export interface TextSummaryOptions {
  people: Person[];
  settlements: Settlement[];
  totalSpentMinor: number;
  currency: string;
  date?: string; // Optional override for deterministic tests, e.g. "2026-11-25"
  origin?: string; // App URL, e.g. "https://pennywise.app"
  maxSettlements?: number; // default 15
}

/**
 * Builds a readable text summary suitable for chat apps and messaging.
 * Format:
 * 🎈 Pennywise: <date>
 * Total spent: <amount>
 * Who pays whom:
 * • Ben → Anna: ₹78.00
 * • Chris → Anna: ₹72.00
 * (then the app URL on its own line).
 * If all settled: "All settled. For now. 🎈"
 */
export function buildTextSummary(options: TextSummaryOptions): string {
  const {
    people,
    settlements,
    totalSpentMinor,
    currency,
    date = new Date().toISOString().split('T')[0],
    origin = typeof window !== 'undefined' ? window.location.origin : '',
    maxSettlements = 15,
  } = options;

  const getPersonName = (id: string): string => {
    return people.find((p) => p.id === id)?.name || id;
  };

  const lines: string[] = [
    `🎈 Pennywise: ${date}`,
    `Total spent: ${formatMoney(totalSpentMinor, currency)}`,
  ];

  if (settlements.length === 0) {
    lines.push('All settled. For now. 🎈');
  } else {
    lines.push('Who pays whom:');
    const displayCount = Math.min(settlements.length, maxSettlements);
    for (let i = 0; i < displayCount; i++) {
      const s = settlements[i];
      const fromName = getPersonName(s.from);
      const toName = getPersonName(s.to);
      const amountStr = formatMoney(s.amountMinor, currency);
      lines.push(`• ${fromName} → ${toName}: ${amountStr}`);
    }

    if (settlements.length > maxSettlements) {
      const remaining = settlements.length - maxSettlements;
      lines.push(`+${remaining} more`);
    }
  }

  if (origin) {
    lines.push(origin);
  }

  return lines.join('\n');
}

/**
 * Robust detection of iOS (iPhone, iPod, and iPad including iPadOS running desktop Safari).
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // Standard iOS UA check
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ pretending to be MacIntel with touch support
  if (platform === 'MacIntel' && maxTouchPoints > 1) return true;

  return false;
}

/**
 * Builds standard social/communication links with proper escaping.
 */
export function buildSocialShareUrls(summaryText: string, origin?: string) {
  const encodedText = encodeURIComponent(summaryText);
  const appOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const encodedOrigin = encodeURIComponent(appOrigin || 'https://pennywise.app');

  // WhatsApp
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;

  // Telegram needs non-empty url parameter
  const telegramUrl = `https://t.me/share/url?url=${encodedOrigin}&text=${encodedText}`;

  // SMS: iOS uses "&body=", Android uses "?body="
  const smsSeparator = isIOS() ? '&' : '?';
  const smsUrl = `sms:${smsSeparator}body=${encodedText}`;

  // Email: mailto
  const subject = encodeURIComponent('🎈 Pennywise Tab Summary');
  const mailtoUrl = `mailto:?subject=${subject}&body=${encodedText}`;

  return {
    whatsappUrl,
    telegramUrl,
    smsUrl,
    mailtoUrl,
  };
}
