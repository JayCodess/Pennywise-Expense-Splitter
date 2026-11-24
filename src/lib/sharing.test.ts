import { describe, it, expect } from 'vitest';
import { buildTextSummary, buildSocialShareUrls } from './sharing';
import { Person, Settlement } from './types';

describe('sharing - buildTextSummary', () => {
  const people: Person[] = [
    { id: 'p1', name: 'Ben' },
    { id: 'p2', name: 'Anna' },
    { id: 'p3', name: 'Chris' },
  ];

  it('builds summary for normal settlements with date and origin', () => {
    const settlements: Settlement[] = [
      { from: 'p1', to: 'p2', amountMinor: 7800 },
      { from: 'p3', to: 'p2', amountMinor: 7200 },
    ];

    const result = buildTextSummary({
      people,
      settlements,
      totalSpentMinor: 47400,
      currency: 'INR',
      date: '2026-11-25',
      origin: 'https://pennywise.app',
    });

    expect(result).toBe(
      '🎈 Pennywise: 2026-11-25\n' +
      'Total spent: ₹474.00\n' +
      'Who pays whom:\n' +
      '• Ben → Anna: ₹78.00\n' +
      '• Chris → Anna: ₹72.00\n' +
      'https://pennywise.app'
    );
  });

  it('formats correctly when all settled', () => {
    const result = buildTextSummary({
      people,
      settlements: [],
      totalSpentMinor: 2000,
      currency: 'USD',
      date: '2026-11-25',
      origin: 'https://pennywise.app',
    });

    expect(result).toBe(
      '🎈 Pennywise: 2026-11-25\n' +
      'Total spent: $20.00\n' +
      'All settled. For now. 🎈\n' +
      'https://pennywise.app'
    );
  });

  it('caps at 15 settlements and adds "+N more"', () => {
    const manyPeople: Person[] = [];
    const manySettlements: Settlement[] = [];
    for (let i = 1; i <= 20; i++) {
      manyPeople.push({ id: `user_${i}`, name: `Person ${i}` });
    }
    for (let i = 1; i <= 18; i++) {
      manySettlements.push({
        from: `user_${i}`,
        to: 'user_20',
        amountMinor: 1000 * i,
      });
    }

    const result = buildTextSummary({
      people: manyPeople,
      settlements: manySettlements,
      totalSpentMinor: 150000,
      currency: 'USD',
      date: '2026-11-25',
      origin: 'https://pennywise.app',
    });

    const lines = result.split('\n');
    expect(lines).toContain('+3 more');
    // 15 items + 1 "+3 more"
    const settlementLines = lines.filter((l) => l.startsWith('• '));
    expect(settlementLines).toHaveLength(15);
  });

  it('handles extremely long names safely', () => {
    const longPeople: Person[] = [
      { id: 'p1', name: 'Sir Alexander Bartholomew of Carnival Woods' },
      { id: 'p2', name: 'Lady Genevieve Evangeline Montgomery' },
    ];
    const settlements: Settlement[] = [
      { from: 'p1', to: 'p2', amountMinor: 5000 },
    ];

    const result = buildTextSummary({
      people: longPeople,
      settlements,
      totalSpentMinor: 5000,
      currency: 'GBP',
      date: '2026-11-25',
      origin: 'https://pennywise.app',
    });

    expect(result).toContain('• Sir Alexander Bartholomew of Carnival Woods → Lady Genevieve Evangeline Montgomery: £50.00');
  });
});

describe('sharing - buildSocialShareUrls', () => {
  it('encodes URLs for WhatsApp, Telegram, SMS, and mailto', () => {
    const summary = '🎈 Pennywise: 2026-11-25\nTotal: $10';
    const urls = buildSocialShareUrls(summary, 'https://pennywise.app');

    expect(urls.whatsappUrl).toContain('https://wa.me/?text=');
    expect(urls.whatsappUrl).toContain(encodeURIComponent(summary));

    expect(urls.telegramUrl).toContain('https://t.me/share/url?url=https%3A%2F%2Fpennywise.app&text=');

    expect(urls.smsUrl).toMatch(/^sms:[&?]body=/);

    expect(urls.mailtoUrl).toContain('mailto:?subject=');
    expect(urls.mailtoUrl).toContain('&body=');
  });
});
