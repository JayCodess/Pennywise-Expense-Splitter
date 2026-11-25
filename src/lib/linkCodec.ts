/**
 * Compressed URL hash codec (#d=1.<payload>) using deflate-raw and base64url.
 */

import { Person, Expense } from './types';
import { validateHydratedState } from './expenseReducer';

export interface ShareablePayload {
  people: Person[];
  expenses: Expense[];
  currency: string;
}

export interface EncodeLinkResult {
  url: string;
  isLong: boolean;
  length: number;
}

export type DecodeErrorCode =
  | 'INVALID_FORMAT'
  | 'OVERSIZED_PAYLOAD'
  | 'DECOMPRESSION_FAILED'
  | 'DECOMPRESSION_BOMB'
  | 'INVALID_DATA';

export type DecodeHashResult =
  | { success: true; payload: ShareablePayload }
  | { success: false; error: DecodeErrorCode; message: string };

export const MAX_PAYLOAD_BYTES = 8192; // 8 KB safety limit before decoding
export const MAX_DECOMPRESSED_BYTES = 65536; // 64 KB safety limit for decompressed output
export const VERSION_PREFIX = '1.';

/**
 * Base64url encoding and decoding (RFC 4648)
 */
export function toBase64Url(uint8: Uint8Array): string {
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes payload into URL hash: <origin>/#d=1.<base64url>
 * Uses built-in CompressionStream('deflate-raw') if available, falling back to raw UTF-8.
 */
export async function encodeShareableLink(
  payload: ShareablePayload,
  origin = typeof window !== 'undefined' ? window.location.origin : 'https://pennywise.app'
): Promise<EncodeLinkResult> {
  const jsonStr = JSON.stringify({
    people: payload.people,
    expenses: payload.expenses,
    currency: payload.currency,
  });

  const textEncoder = new TextEncoder();
  const rawBytes = textEncoder.encode(jsonStr);

  let encodedData: string;

  // Try CompressionStream('deflate-raw')
  if (typeof CompressionStream !== 'undefined') {
    try {
      const cs = new CompressionStream('deflate-raw');
      const writer = cs.writable.getWriter();
      writer.write(rawBytes);
      writer.close();
      const compressedBuffer = await new Response(cs.readable).arrayBuffer();
      const compressedBytes = new Uint8Array(compressedBuffer);
      encodedData = 'c' + toBase64Url(compressedBytes);
    } catch {
      encodedData = 'u' + toBase64Url(rawBytes);
    }
  } else {
    encodedData = 'u' + toBase64Url(rawBytes);
  }

  const hashParam = `d=${VERSION_PREFIX}${encodedData}`;
  const cleanOrigin = origin.replace(/\/+$/, '');
  const url = `${cleanOrigin}/#${hashParam}`;

  return {
    url,
    isLong: url.length > 2000,
    length: url.length,
  };
}

/**
 * Reads a ReadableStream in chunks and aborts if decompressed size exceeds MAX_DECOMPRESSED_BYTES.
 */
async function readLimitedStream(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number
): Promise<Uint8Array | null> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          try {
            await reader.cancel();
          } catch {
            // Ignore stream cancel error
          }
          return null; // Exceeded limit (decompression bomb protection)
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

/**
 * Decodes and strictly validates a payload from URL hash (#d=1....)
 * Never throws to the UI; returns a typed DecodeHashResult.
 */
export async function decodeShareableHash(hash: string): Promise<DecodeHashResult> {
  if (!hash || typeof hash !== 'string') {
    return {
      success: false,
      error: 'INVALID_FORMAT',
      message: 'Invalid link format.',
    };
  }

  // Strip leading '#' if present
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const match = cleanHash.match(/(?:^|&)d=([^&]+)/);
  if (!match) {
    return {
      success: false,
      error: 'INVALID_FORMAT',
      message: 'No link payload found.',
    };
  }

  const rawPayload = decodeURIComponent(match[1]);

  // 1. Base64url payload capped at 8 KB BEFORE decoding
  if (rawPayload.length > MAX_PAYLOAD_BYTES) {
    return {
      success: false,
      error: 'OVERSIZED_PAYLOAD',
      message: 'The shared link payload exceeds the 8 KB limit.',
    };
  }

  // 2. Check version prefix
  if (!rawPayload.startsWith(VERSION_PREFIX)) {
    return {
      success: false,
      error: 'INVALID_FORMAT',
      message: 'Unsupported shared link version.',
    };
  }

  const payloadBody = rawPayload.slice(VERSION_PREFIX.length);
  if (!payloadBody) {
    return {
      success: false,
      error: 'INVALID_FORMAT',
      message: 'Empty payload body.',
    };
  }

  const compressionType = payloadBody[0]; // 'c' = compressed, 'u' = uncompressed
  const base64Data = payloadBody.slice(1);

  let jsonStr: string;

  try {
    const bytes = fromBase64Url(base64Data);

    if (compressionType === 'c') {
      if (typeof DecompressionStream === 'undefined') {
        return {
          success: false,
          error: 'DECOMPRESSION_FAILED',
          message: 'Decompression is not supported in this browser.',
        };
      }

      // 3. Decompress in chunks, aborting past 64 KB (decompression bomb protection)
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(bytes as unknown as BufferSource).catch(() => {});
      writer.close().catch(() => {});

      const decompressedBytes = await readLimitedStream(ds.readable, MAX_DECOMPRESSED_BYTES);
      if (!decompressedBytes) {
        return {
          success: false,
          error: 'DECOMPRESSION_BOMB',
          message: 'The shared link contains data that exceeds the 64 KB decompression limit.',
        };
      }

      const textDecoder = new TextDecoder();
      jsonStr = textDecoder.decode(decompressedBytes);
    } else if (compressionType === 'u') {
      if (bytes.byteLength > MAX_DECOMPRESSED_BYTES) {
        return {
          success: false,
          error: 'DECOMPRESSION_BOMB',
          message: 'Payload exceeds the 64 KB size limit.',
        };
      }
      const textDecoder = new TextDecoder();
      jsonStr = textDecoder.decode(bytes);
    } else {
      return {
        success: false,
        error: 'INVALID_FORMAT',
        message: 'Invalid compression identifier in link.',
      };
    }
  } catch {
    return {
      success: false,
      error: 'DECOMPRESSION_FAILED',
      message: 'Could not decode the link payload (corrupted or truncated base64/deflate).',
    };
  }

  // 4. Parse JSON & strictly validate schema and counts
  try {
    const parsed = JSON.parse(jsonStr);
    const validated = validateHydratedState(parsed);
    if (!validated) {
      return {
        success: false,
        error: 'INVALID_DATA',
        message: 'The shared link contains invalid trip data or exceeds participant/expense limits.',
      };
    }
    return {
      success: true,
      payload: validated,
    };
  } catch {
    return {
      success: false,
      error: 'INVALID_DATA',
      message: 'Could not parse JSON trip data from the link.',
    };
  }
}
