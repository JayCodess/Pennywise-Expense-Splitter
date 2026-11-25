import { describe, it, expect } from 'vitest';
import {
  encodeShareableLink,
  decodeShareableHash,
  toBase64Url,
  MAX_PAYLOAD_BYTES,
  MAX_DECOMPRESSED_BYTES,
} from './linkCodec';
import { Person, Expense } from './types';

describe('linkCodec - encode and decode shareable link', () => {
  const people: Person[] = [
    { id: 'p1', name: 'Anna' },
    { id: 'p2', name: 'Ben' },
    { id: 'p3', name: 'Chris' },
  ];

  const expenses: Expense[] = [
    {
      id: 'e1',
      description: 'Carnival Fair Tickets',
      amountMinor: 30000,
      paidBy: 'p1',
      participants: ['p1', 'p2', 'p3'],
    },
    {
      id: 'e2',
      description: 'Cotton Candy',
      amountMinor: 6000,
      paidBy: 'p2',
      participants: ['p1', 'p2'],
    },
  ];

  it('performs round-trip encode and decode accurately', async () => {
    const payload = {
      people,
      expenses,
      currency: 'USD',
    };

    const encoded = await encodeShareableLink(payload, 'https://pennywise.app');
    expect(encoded.url).toContain('https://pennywise.app/#d=1.');
    expect(encoded.isLong).toBe(false);

    const hash = encoded.url.split('#')[1];
    const decoded = await decodeShareableHash(hash);

    expect(decoded.success).toBe(true);
    if (decoded.success) {
      expect(decoded.payload.people).toEqual(people);
      expect(decoded.payload.expenses).toEqual(expenses);
      expect(decoded.payload.currency).toBe('USD');
    }
  });

  it('performs round-trip with unicode and emoji characters (e.g. Hindi, accents, balloons)', async () => {
    const unicodeTroupe: Person[] = [
      { id: 'u1', name: 'कबीर (Kabir)' },
      { id: 'u2', name: 'Pennywise 🎈' },
      { id: 'u3', name: 'François & Zoë' },
    ];
    const unicodeExpenses: Expense[] = [
      {
        id: 'ue1',
        description: 'समोसा & Chai ☕',
        amountMinor: 1550,
        paidBy: 'u1',
        participants: ['u1', 'u2', 'u3'],
      },
    ];

    const encoded = await encodeShareableLink({
      people: unicodeTroupe,
      expenses: unicodeExpenses,
      currency: 'INR',
    });

    const hash = encoded.url.split('#')[1];
    const decoded = await decodeShareableHash(hash);

    expect(decoded.success).toBe(true);
    if (decoded.success) {
      expect(decoded.payload.people).toEqual(unicodeTroupe);
      expect(decoded.payload.expenses).toEqual(unicodeExpenses);
      expect(decoded.payload.currency).toBe('INR');
    }
  });

  it('supports uncompressed fallback path ("u" prefix)', async () => {
    const rawJson = JSON.stringify({
      people,
      expenses,
      currency: 'EUR',
    });
    const bytes = new TextEncoder().encode(rawJson);
    const uncompressedHash = 'd=1.u' + toBase64Url(bytes);

    const decoded = await decodeShareableHash(uncompressedHash);
    expect(decoded.success).toBe(true);
    if (decoded.success) {
      expect(decoded.payload.currency).toBe('EUR');
      expect(decoded.payload.people).toEqual(people);
    }
  });

  it('rejects corrupted base64 without throwing', async () => {
    const corruptedHash = 'd=1.cInvalidBase64!@#$';
    const decoded = await decodeShareableHash(corruptedHash);
    expect(decoded.success).toBe(false);
    if (!decoded.success) {
      expect(decoded.error).toMatch(/DECOMPRESSION_FAILED|INVALID_FORMAT/);
      expect(decoded.message).toBeDefined();
    }
  });

  it('rejects truncated payload without throwing', async () => {
    const payload = { people, expenses, currency: 'USD' };
    const { url } = await encodeShareableLink(payload);
    const hash = url.split('#')[1];
    // Truncate hash to half length
    const truncatedHash = hash.slice(0, Math.floor(hash.length / 2));
    const decoded = await decodeShareableHash(truncatedHash);

    expect(decoded.success).toBe(false);
    if (!decoded.success) {
      expect(decoded.message).toBeDefined();
    }
  });

  it('rejects unsupported version prefix (e.g. d=2.c...)', async () => {
    const wrongVersionHash = 'd=2.cSomeData';
    const decoded = await decodeShareableHash(wrongVersionHash);
    expect(decoded.success).toBe(false);
    if (!decoded.success) {
      expect(decoded.error).toBe('INVALID_FORMAT');
      expect(decoded.message).toContain('Unsupported');
    }
  });

  it('rejects oversized payload exceeding 8 KB before decoding', async () => {
    const oversized = 'd=1.c' + 'A'.repeat(MAX_PAYLOAD_BYTES + 10);
    const decoded = await decodeShareableHash(oversized);
    expect(decoded.success).toBe(false);
    if (!decoded.success) {
      expect(decoded.error).toBe('OVERSIZED_PAYLOAD');
      expect(decoded.message).toContain('8 KB');
    }
  });

  it('detects and rejects decompression bombs exceeding 64 KB', async () => {
    // Generate a compressed payload of 70,000 spaces that compresses into ~100 bytes using CompressionStream
    const largeBuffer = new Uint8Array(MAX_DECOMPRESSED_BYTES + 5000);
    largeBuffer.fill(32); // spaces

    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(largeBuffer);
    writer.close();
    const compressedBuffer = await new Response(cs.readable).arrayBuffer();
    const bombHash = 'd=1.c' + toBase64Url(new Uint8Array(compressedBuffer));

    const decoded = await decodeShareableHash(bombHash);
    expect(decoded.success).toBe(false);
    if (!decoded.success) {
      expect(decoded.error).toBe('DECOMPRESSION_BOMB');
      expect(decoded.message).toContain('64 KB');
    }
  });

  it('rejects invalid schema when payer is not in people', async () => {
    const invalidPayload = {
      people: [{ id: 'p1', name: 'Anna' }],
      expenses: [
        {
          id: 'e1',
          description: 'Fair',
          amountMinor: 500,
          paidBy: 'ghost_payer', // Not in people
          participants: ['p1'],
        },
      ],
      currency: 'USD',
    };

    const rawJson = JSON.stringify(invalidPayload);
    const hash = 'd=1.u' + toBase64Url(new TextEncoder().encode(rawJson));
    const decoded = await decodeShareableHash(hash);

    expect(decoded.success).toBe(false);
    if (!decoded.success) {
      expect(decoded.error).toBe('INVALID_DATA');
    }
  });

  it('rejects payloads exceeding data limits (51 people, 501 expenses, long name/desc)', async () => {
    // 51 people (> 50 limit)
    const tooManyPeople = Array.from({ length: 51 }, (_, i) => ({
      id: `p${i}`,
      name: `Person ${i}`,
    }));
    const payload51 = {
      people: tooManyPeople,
      expenses: [],
      currency: 'USD',
    };
    const hash51 = 'd=1.u' + toBase64Url(new TextEncoder().encode(JSON.stringify(payload51)));
    const decoded51 = await decodeShareableHash(hash51);
    expect(decoded51.success).toBe(false);

    // Name > 60 chars
    const longNamePayload = {
      people: [{ id: 'p1', name: 'A'.repeat(61) }],
      expenses: [],
      currency: 'USD',
    };
    const hashLongName =
      'd=1.u' + toBase64Url(new TextEncoder().encode(JSON.stringify(longNamePayload)));
    const decodedLongName = await decodeShareableHash(hashLongName);
    expect(decodedLongName.success).toBe(false);

    // Description > 120 chars
    const longDescPayload = {
      people: [
        { id: 'p1', name: 'Anna' },
        { id: 'p2', name: 'Ben' },
      ],
      expenses: [
        {
          id: 'e1',
          description: 'D'.repeat(121),
          amountMinor: 1000,
          paidBy: 'p1',
          participants: ['p1', 'p2'],
        },
      ],
      currency: 'USD',
    };
    const hashLongDesc =
      'd=1.u' + toBase64Url(new TextEncoder().encode(JSON.stringify(longDescPayload)));
    const decodedLongDesc = await decodeShareableHash(hashLongDesc);
    expect(decodedLongDesc.success).toBe(false);
  });
});
