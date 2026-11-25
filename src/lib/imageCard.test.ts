import { describe, it, expect, vi } from 'vitest';
import { truncateText, getImageFileName, formatSubtitleDate, renderReceiptCardBlob } from './imageCard';
import { Person, Settlement, Expense } from './types';

describe('imageCard - pure helpers', () => {
  it('formats image file name with date', () => {
    expect(getImageFileName('2026-11-25')).toBe('pennywise-2026-11-25.png');
    expect(getImageFileName()).toMatch(/^pennywise-\d{4}-\d{2}-\d{2}\.png$/);
  });

  it('formats subtitle date nicely as 24 Nov 2026', () => {
    expect(formatSubtitleDate('2026-11-24')).toBe('24 Nov 2026');
  });

  it('truncates text when width exceeds limit with an ellipsis', () => {
    const mockCtx = {
      measureText: (text: string) => ({ width: text.length * 10 }),
    } as unknown as CanvasRenderingContext2D;

    const short = truncateText(mockCtx, 'Hello', 100);
    expect(short).toBe('Hello');

    const long = truncateText(mockCtx, 'Super Long Name That Overflows', 120);
    expect(long).toContain('…');
    expect(mockCtx.measureText(long).width).toBeLessThanOrEqual(120);
  });
});

describe('imageCard - renderReceiptCardBlob', () => {
  it('renders to a PNG blob without throwing in jsdom environment', async () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      createRadialGradient: () => ({
        addColorStop: vi.fn(),
      }),
      createLinearGradient: () => ({
        addColorStop: vi.fn(),
      }),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      ellipse: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      roundRect: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 100 }),
    }) as any;

    HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback) => {
      callback(new Blob(['fake-png-data'], { type: 'image/png' }));
    });

    const people: Person[] = [
      { id: '1', name: 'Anna' },
      { id: '2', name: 'Ben' },
      { id: '3', name: 'Very Long Name Bartholomew Montgomery Of The Old Pennywise Circus' },
    ];
    const settlements: Settlement[] = [
      { from: '2', to: '1', amountMinor: 7800 },
      { from: '3', to: '1', amountMinor: 7200 },
    ];
    const expenses: Expense[] = [
      { id: 'e1', description: 'Fair Tickets', amountMinor: 15000, paidBy: '1', participants: ['1', '2', '3'] },
    ];

    const blob = await renderReceiptCardBlob({
      people,
      settlements,
      expenses,
      totalSpentMinor: 47400,
      currency: 'USD',
      theme: 'dark',
      date: '2026-11-25',
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');

    // Test with empty settlements (all settled state)
    const emptyBlob = await renderReceiptCardBlob({
      people,
      settlements: [],
      expenses: [],
      totalSpentMinor: 0,
      currency: 'USD',
      theme: 'light',
      date: '2026-11-25',
    });

    expect(emptyBlob).toBeInstanceOf(Blob);

    // Restore mocks
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });
});
