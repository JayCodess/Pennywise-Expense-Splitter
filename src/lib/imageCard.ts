/**
 * Client-side HTML5 Canvas receipt card renderer for social sharing.
 */

import { Person, Settlement, Expense } from './types';
import { formatMoney } from './money';

export interface ImageCardOptions {
  people: Person[];
  settlements: Settlement[];
  expenses?: Expense[];
  totalSpentMinor: number;
  currency: string;
  theme: 'dark' | 'light';
  date?: string; // ISO date string or formatted date
  origin?: string;
  maxRows?: number; // default 8
}

/**
 * Truncates text with an ellipsis if it exceeds maxWidth using canvas measureText.
 */
export function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  const ellipsis = '…';
  let low = 0;
  let high = text.length;
  let best = '';

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.slice(0, mid) + ellipsis;
    if (ctx.measureText(candidate).width <= maxWidth) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best || ellipsis;
}

/**
 * Generates formatted file name: pennywise-<yyyy-mm-dd>.png
 */
export function getImageFileName(dateStr?: string): string {
  const d = dateStr || new Date().toISOString().split('T')[0];
  return `pennywise-${d}.png`;
}

/**
 * Formats date cleanly as "24 Nov 2026" using Intl.DateTimeFormat
 */
export function formatSubtitleDate(dateInput?: string): string {
  try {
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(dateObj.getTime())) {
      return dateInput || '';
    }
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return formatter.format(dateObj); // "24 Nov 2026"
  } catch {
    return dateInput || '';
  }
}

// Standalone SVG with literal hex colors for the full detailed Clown Mascot from ClownMascot.tsx
const DETAILED_CLOWN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="220" height="220">
  <defs>
    <radialGradient id="clownSkinGrad" cx="48%" cy="42%" r="56%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="45%" stop-color="#f4efe6" />
      <stop offset="78%" stop-color="#d5cbbe" />
      <stop offset="100%" stop-color="#9b8e84" />
    </radialGradient>
    <radialGradient id="socketShadowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1216" stop-opacity="0.85" />
      <stop offset="65%" stop-color="#2c1f25" stop-opacity="0.55" />
      <stop offset="100%" stop-color="#2c1f25" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="eyeGlowGrad" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#fff8b3" />
      <stop offset="45%" stop-color="#f5d020" />
      <stop offset="85%" stop-color="#d99b00" />
      <stop offset="100%" stop-color="#805000" />
    </radialGradient>
    <radialGradient id="noseGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ff4d5a" />
      <stop offset="50%" stop-color="#c1121f" />
      <stop offset="100%" stop-color="#54050b" />
    </radialGradient>
  </defs>

  <!-- Ruffled accordion collar -->
  <g fill="#ded4c3" stroke="#2a2226" stroke-width="1.4">
    <path d="M 24 108 Q 36 90 46 105 Q 60 88 74 105 Q 84 90 96 108 Q 60 122 24 108 Z" />
    <path d="M 34 104 Q 46 92 60 101 Q 74 92 86 104" fill="none" stroke="#685c54" stroke-width="1" />
  </g>

  <!-- Wild red hair tufts -->
  <g fill="#a80f19" stroke="#3b0307" stroke-width="1.2">
    <path d="M 32 38 C 16 32 8 46 11 58 C 4 63 6 76 17 80 C 10 86 19 94 30 88 C 24 75 26 54 32 38 Z" />
    <path d="M 18 45 C 11 40 8 48 12 55" fill="none" stroke="#d9232e" stroke-width="1.2" />
    <path d="M 22 66 C 14 68 15 76 21 78" fill="none" stroke="#d9232e" stroke-width="0.8" />
    <path d="M 88 38 C 104 32 112 46 109 58 C 116 63 114 76 103 80 C 110 86 101 94 90 88 C 96 75 94 54 88 38 Z" />
    <path d="M 102 45 C 109 40 112 48 108 55" fill="none" stroke="#d9232e" stroke-width="1.2" />
    <path d="M 98 66 C 106 68 105 76 99 78" fill="none" stroke="#d9232e" stroke-width="0.8" />
  </g>

  <!-- Chalk-white head shape with subtle corpse gradient -->
  <ellipse cx="60" cy="58" rx="34" ry="39" fill="url(#clownSkinGrad)" stroke="#3a2e34" stroke-width="1.8" />

  <!-- Sunken cheek hollows -->
  <ellipse cx="34" cy="74" rx="4" ry="7" fill="#8e8076" opacity="0.25" />
  <ellipse cx="86" cy="74" rx="4" ry="7" fill="#8e8076" opacity="0.25" />

  <!-- Sunken shadowed eye sockets -->
  <ellipse cx="45" cy="50" rx="10" ry="8" fill="url(#socketShadowGrad)" />
  <ellipse cx="75" cy="49" rx="9" ry="7" fill="url(#socketShadowGrad)" />

  <!-- Eye makeup streaks -->
  <g fill="#940b13" stroke="#480509" stroke-width="0.6">
    <path d="M 45 28 L 49 43 L 41 43 Z" />
    <path d="M 41 57 L 49 57 L 44 72 Z" />
    <path d="M 75 30 L 78 43 L 71 43 Z" />
    <path d="M 71 56 L 78 56 L 74 71 Z" />
  </g>

  <!-- Glowing yellow eyes -->
  <ellipse cx="45" cy="50" rx="5.2" ry="4.2" fill="url(#eyeGlowGrad)" stroke="#1a1402" stroke-width="0.8" />
  <circle cx="45" cy="50" r="1.6" fill="#140d02" />
  <circle cx="43.8" cy="48.8" r="0.6" fill="#ffffff" opacity="0.9" />

  <ellipse cx="75" cy="49.5" rx="3.8" ry="2.8" transform="rotate(-6 75 49.5)" fill="url(#eyeGlowGrad)" stroke="#1a1402" stroke-width="0.8" />
  <circle cx="75" cy="49.5" r="1.1" fill="#140d02" />
  <circle cx="74.2" cy="48.8" r="0.4" fill="#ffffff" opacity="0.8" />

  <!-- Bulbous red clown nose -->
  <circle cx="60" cy="62" r="6.2" fill="url(#noseGrad)" stroke="#3e0307" stroke-width="0.8" />
  <circle cx="58" cy="60" r="1.6" fill="#ffffff" opacity="0.6" />

  <!-- Stitched grin reaching toward cheeks -->
  <g>
    <path d="M 28 66 Q 38 88 60 93 Q 82 88 92 66 Q 80 82 60 84 Q 40 82 28 66 Z" fill="#940b13" stroke="#3d0307" stroke-width="1.2" />
    <path d="M 32 68 Q 42 84 60 88 Q 78 84 88 68 Q 78 78 60 80 Q 42 78 32 68 Z" fill="#120608" />
    <!-- Teeth -->
    <polygon points="46,80 48,77 50,80" fill="#ede5d8" />
    <polygon points="53,81 55,77 57,81" fill="#ede5d8" />
    <polygon points="62,81 64,77 66,81" fill="#ede5d8" />
    <polygon points="69,80 71,77 73,80" fill="#ede5d8" />
    <!-- Stitches -->
    <g stroke="#1b1216" stroke-width="1.4" stroke-linecap="round">
      <line x1="28" y1="63" x2="31" y2="70" />
      <line x1="34" y1="67" x2="36" y2="74" />
      <line x1="41" y1="72" x2="43" y2="79" />
      <line x1="48" y1="75" x2="49" y2="84" />
      <line x1="55" y1="77" x2="55" y2="86" />
      <line x1="61" y1="77" x2="61" y2="86" />
      <line x1="67" y1="75" x2="66" y2="84" />
      <line x1="74" y1="72" x2="73" y2="79" />
      <line x1="81" y1="67" x2="79" y2="74" />
      <line x1="87" y1="63" x2="84" y2="70" />
    </g>
    <!-- Upward grin extensions -->
    <path d="M 28 65 Q 24 58 22 55" fill="none" stroke="#940b13" stroke-width="1.6" stroke-linecap="round" />
    <path d="M 92 65 Q 96 58 98 55" fill="none" stroke="#940b13" stroke-width="1.6" stroke-linecap="round" />
    <!-- Trickle -->
    <path d="M 28 66 C 26 71 27 76 26.5 81 C 26.5 83 25.5 84 24.5 84 C 23.5 84 22.8 83 23 81 C 23.5 76 25 71 26 66 Z" fill="#800a12" />
    <circle cx="24.5" cy="83" r="0.6" fill="#ffffff" opacity="0.5" />
  </g>
  <!-- Eye trickle -->
  <path d="M 44.5 54 C 44 58 43.5 61 43.2 64 C 43 65.5 42 66.5 41 66.5 C 40 66.5 39.5 65.5 39.8 64 C 40.5 61 41.5 58 42.5 54 Z" fill="#7a0810" />
  <circle cx="41" cy="65.5" r="0.5" fill="#ffffff" opacity="0.45" />
</svg>`;

// Standalone SVG for the Red Balloon scaled to match
const DETAILED_BALLOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 110" width="105" height="192">
  <defs>
    <radialGradient id="cardBalloonGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="35%" stop-color="#c1121f"/>
      <stop offset="100%" stop-color="#3d0307"/>
    </radialGradient>
  </defs>
  <path d="M 30 4 C 45 4 56 16 56 34 C 56 50 44 62 33 65 L 27 65 C 16 62 4 50 4 34 C 4 16 15 4 30 4 Z" fill="url(#cardBalloonGrad)"/>
  <ellipse cx="21" cy="22" rx="6.5" ry="12" transform="rotate(-20 21 22)" fill="#ffffff" opacity="0.45"/>
  <polygon points="27,65 33,65 36,70 24,70" fill="#800a12"/>
  <path d="M 30 70 Q 23 85 32 98 Q 36 104 28 110" fill="none" stroke="#888888" stroke-width="1.2"/>
</svg>`;

function loadSvgImage(svgStr: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function ensureFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load('600 78px "Pirata One"'),
      document.fonts.load('400 38px "Pirata One"'),
      document.fonts.load('400 24px "Inter"'),
      document.fonts.load('600 26px "Inter"'),
      document.fonts.load('700 32px "Inter"'),
      document.fonts.load('700 58px "Inter"'),
    ]);
    await document.fonts.ready;
  } catch {
    // Graceful fallback to system font stack
  }
}

/**
 * Procedural realistic blood drips generator along an edge (with neck, teardrop bulb, and highlights)
 */
function drawRealisticBloodDrips(ctx: CanvasRenderingContext2D, width: number, isDark: boolean) {
  ctx.save();

  // Shadow for blood
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  const baseLipH = 7;
  const darkEdge = '#1f0205';
  const crimsonCenter = isDark ? '#7a0812' : '#8f0d17';

  // Seeded drips along top edge (center drips stay shallow under 28px to keep clear of text)
  const drips = [
    { x: 75, len: 95, w: 14, r: 10 },
    { x: 160, len: 55, w: 9, r: 6.5 },
    { x: 250, len: 110, w: 16, r: 12 },
    { x: 360, len: 45, w: 8, r: 5.5 },
    // Center drips (above title) strictly under 28px
    { x: 470, len: 26, w: 6, r: 4 },
    { x: 540, len: 22, w: 5, r: 3.5 },
    { x: 610, len: 27, w: 6, r: 4 },
    // Right side drips
    { x: 720, len: 65, w: 10, r: 7.5 },
    { x: 820, len: 105, w: 15, r: 11 },
    { x: 920, len: 48, w: 8, r: 6 },
    { x: 1005, len: 88, w: 13, r: 9.5 },
  ];

  // Draw continuous pooled irregular lip with drips
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, baseLipH + 2);

  // Trace across from right to left
  const sorted = [...drips].sort((a, b) => b.x - a.x);
  for (const d of sorted) {
    const rootHalf = d.w * 1.5;
    const rightX = d.x + rootHalf;
    const leftX = d.x - rootHalf;
    const bulbY = d.len - d.r;

    ctx.lineTo(rightX + 10, baseLipH);
    ctx.quadraticCurveTo(rightX, baseLipH + 1, d.x + d.w / 2, baseLipH + 8);
    // Narrow stem into teardrop bulb
    ctx.bezierCurveTo(d.x + d.w * 0.4, bulbY - d.r * 0.6, d.x + d.r, bulbY - 1, d.x, d.len);
    ctx.bezierCurveTo(
      d.x - d.r,
      bulbY - 1,
      d.x - d.w * 0.4,
      bulbY - d.r * 0.6,
      d.x - d.w / 2,
      baseLipH + 8
    );
    ctx.quadraticCurveTo(leftX, baseLipH + 1, leftX - 10, baseLipH);
  }

  ctx.lineTo(0, baseLipH + 2);
  ctx.closePath();

  // Gradient fill from dark coagulated edge to crimson
  const bloodGrad = ctx.createLinearGradient(0, 0, 0, 115);
  bloodGrad.addColorStop(0, darkEdge);
  bloodGrad.addColorStop(0.3, crimsonCenter);
  bloodGrad.addColorStop(1, '#54050b');
  ctx.fillStyle = bloodGrad;
  ctx.fill();

  // Specular highlights on bulbs
  ctx.shadowColor = 'transparent';
  for (const d of drips) {
    if (d.len > 35) {
      // Left side stem specular line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(d.x - d.w * 0.25, baseLipH + 6);
      ctx.lineTo(d.x - d.w * 0.25, d.len - d.r * 1.2);
      ctx.stroke();

      // Bulb oval highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(
        d.x - d.r * 0.25,
        d.len - d.r * 0.7,
        d.r * 0.28,
        d.r * 0.45,
        -0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Thin side edge drips hugging left and right margins
  const drawSideDrip = (x: number, y: number, len: number, w: number) => {
    ctx.fillStyle = crimsonCenter;
    ctx.beginPath();
    ctx.ellipse(x, y + len, w, w * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - w * 0.5, y, w, len);
  };
  drawSideDrip(10, 280, 70, 3);
  drawSideDrip(width - 10, 360, 85, 3.5);

  ctx.restore();
}

/**
 * Renders the 1080x1350 receipt card to a Blob with dynamic layout, receipts section, and visual polish.
 */
export async function renderReceiptCardBlob(options: ImageCardOptions): Promise<Blob> {
  const {
    people,
    settlements,
    expenses = [],
    totalSpentMinor,
    currency,
    theme,
    date = new Date().toISOString().split('T')[0],
    origin = typeof window !== 'undefined' ? window.location.origin : 'https://pennywise.app',
  } = options;

  await ensureFontsLoaded();

  const width = 1080;
  const height = 1350;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const isDark = theme === 'dark';

  // Palette configuration
  const bgGradStart = isDark ? '#1a0407' : '#f5e8d8';
  const bgGradEnd = isDark ? '#0b0204' : '#e6d3bf';

  const cardBg = isDark ? '#140c0f' : '#ffffff';
  const cardBorder = isDark ? '#3d161c' : '#d8c2b0';
  const cardShadow = isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(70, 30, 20, 0.16)';

  const textPrimary = isDark ? '#fbf1e8' : '#1c0f13';
  const textMuted = isDark ? '#a88f93' : '#735b60';
  const receiptLineBorder = isDark ? '#2b1519' : '#ebdcd0';

  // Specific requirement: Red for debtor, Green for receiver
  const debtorColor = isDark ? '#ff5260' : '#a80f1a';
  const receiverColor = isDark ? '#c2d148' : '#365201';
  const totalSpentColor = isDark ? '#ff5260' : '#a80f1a';

  // 1. Canvas Background with Vignette
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 220, width / 2, height / 2, 850);
  bgGrad.addColorStop(0, bgGradStart);
  bgGrad.addColorStop(1, bgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Realistic Procedural Blood Drips along page top
  drawRealisticBloodDrips(ctx, width, isDark);

  // 3. Central Card Container
  const cardX = 80;
  const cardY = 95;
  const cardW = width - cardX * 2; // 920px
  const cardH = height - cardY - 75; // 1180px
  const cardRadius = 36;

  ctx.save();
  ctx.shadowColor = cardShadow;
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;

  ctx.fillStyle = cardBg;
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Load Artwork SVGs (Detailed Mascot & Balloon)
  let clownImg: HTMLImageElement | null = null;
  let balloonImg: HTMLImageElement | null = null;
  try {
    [clownImg, balloonImg] = await Promise.all([
      loadSvgImage(DETAILED_CLOWN_SVG),
      loadSvgImage(DETAILED_BALLOON_SVG),
    ]);
  } catch {
    // Continue cleanly if SVG image fails
  }

  // Draw Artwork in Card Header
  if (balloonImg) {
    ctx.drawImage(balloonImg, cardX + 45, cardY + 28, 105, 192);
  }
  if (clownImg) {
    ctx.drawImage(clownImg, cardX + cardW - 235, cardY + 20, 200, 200);
  }

  // 4. Header Titles inside Card
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Title: "Pennywise" in Pirata One
  ctx.font = '700 82px "Pirata One", Georgia, serif';
  ctx.fillStyle = textPrimary;
  ctx.fillText('Pennywise', width / 2, cardY + 48);

  // Subtitle: "Settle up · 24 Nov 2026"
  const formattedDateStr = formatSubtitleDate(date);
  ctx.font = '500 24px "Inter", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = textMuted;
  ctx.fillText(`Settle up · ${formattedDateStr}`, width / 2, cardY + 144);

  // Header Divider
  ctx.strokeStyle = receiptLineBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 50, cardY + 200);
  ctx.lineTo(cardX + cardW - 50, cardY + 200);
  ctx.stroke();

  // 5. Total Spent Section (Banner)
  ctx.font = '600 22px "Inter", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = textMuted;
  ctx.fillText('TOTAL SPENT', width / 2, cardY + 225);

  ctx.save();
  if (isDark) {
    ctx.shadowColor = 'rgba(255, 82, 96, 0.4)';
    ctx.shadowBlur = 18;
  }
  ctx.font = '700 62px "Inter", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = totalSpentColor;
  ctx.fillText(formatMoney(totalSpentMinor, currency), width / 2, cardY + 260);
  ctx.restore();

  // Divider above table
  ctx.beginPath();
  ctx.moveTo(cardX + 50, cardY + 348);
  ctx.lineTo(cardX + cardW - 50, cardY + 348);
  ctx.stroke();

  // 6. Settlements & Receipts Dynamic Vertical Distribution
  const tableTopY = cardY + 372;
  const colLeft = cardX + 55;
  const colRight = cardX + cardW - 55;
  const colWidth = colRight - colLeft;

  const getPersonName = (id: string) => people.find((p) => p.id === id)?.name || id;

  const settlementCount = settlements.length;

  // Determine row scale based on settlement count
  // 1-3 settlements: large rows (name ~44px, amount ~52px, 110px row height)
  // 4-5 settlements: medium rows (name ~32px, amount ~36px, 80px row height)
  // 6+: compact rows (name ~24px, amount ~26px, 58px row height)
  let rowHeight = 58;
  let nameFontSize = 24;
  let amountFontSize = 26;
  let maxDisplaySettlements = 8;

  if (settlementCount <= 3 && settlementCount > 0) {
    rowHeight = 110;
    nameFontSize = 42;
    amountFontSize = 50;
    maxDisplaySettlements = 3;
  } else if (settlementCount <= 5 && settlementCount > 0) {
    rowHeight = 80;
    nameFontSize = 32;
    amountFontSize = 38;
    maxDisplaySettlements = 5;
  } else {
    rowHeight = 56;
    nameFontSize = 24;
    amountFontSize = 26;
    maxDisplaySettlements = 8;
  }

  let currentY = tableTopY;

  if (settlementCount === 0) {
    // All settled state
    ctx.textAlign = 'center';
    ctx.font = '700 42px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textPrimary;
    ctx.fillText('All settled. For now. 🎈', width / 2, currentY + 120);

    ctx.font = '400 24px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textMuted;
    ctx.fillText('Nobody owes a single coin down here.', width / 2, currentY + 185);
    currentY += 280;
  } else {
    // Section Header
    ctx.font = '700 20px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textMuted;
    ctx.textAlign = 'left';
    ctx.fillText('WHO PAYS WHOM', colLeft, currentY);
    ctx.textAlign = 'right';
    ctx.fillText('AMOUNT', colRight, currentY);
    currentY += 38;

    const displayCount = Math.min(settlementCount, maxDisplaySettlements);

    for (let i = 0; i < displayCount; i++) {
      const s = settlements[i];
      const debtorName = getPersonName(s.from);
      const receiverName = getPersonName(s.to);
      const rowY = currentY + i * rowHeight;

      // Divider line between rows
      if (i > 0) {
        ctx.strokeStyle = receiptLineBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(colLeft, rowY - 8);
        ctx.lineTo(colRight, rowY - 8);
        ctx.stroke();
      }

      // Amount right-aligned
      const amountStr = formatMoney(s.amountMinor, currency);
      ctx.textAlign = 'right';
      ctx.font = `700 ${amountFontSize}px "Inter", monospace, sans-serif`;
      ctx.fillStyle = textPrimary;
      ctx.fillText(amountStr, colRight, rowY);

      const amountWidth = ctx.measureText(amountStr).width;
      const availableNameWidth = colWidth - amountWidth - 35;

      // Formatted "Debtor owes Receiver":
      // Debtor in negative red, " owes " in textMuted, Receiver in positive green
      ctx.textAlign = 'left';
      ctx.font = `600 ${nameFontSize}px "Inter", system-ui, -apple-system, sans-serif`;

      const owesText = ' owes ';
      const owesWidth = ctx.measureText(owesText).width;

      const halfNameWidth = Math.max(80, (availableNameWidth - owesWidth) / 2);
      const truncatedDebtor = truncateText(ctx, debtorName, halfNameWidth);
      const debtorWidth = ctx.measureText(truncatedDebtor).width;

      const remainingForReceiver = availableNameWidth - debtorWidth - owesWidth;
      const truncatedReceiver = truncateText(ctx, receiverName, remainingForReceiver);

      // Draw Debtor
      ctx.fillStyle = debtorColor;
      ctx.fillText(truncatedDebtor, colLeft, rowY);

      // Draw "owes"
      ctx.fillStyle = textMuted;
      ctx.fillText(owesText, colLeft + debtorWidth, rowY);

      // Draw Receiver
      ctx.fillStyle = receiverColor;
      ctx.fillText(truncatedReceiver, colLeft + debtorWidth + owesWidth, rowY);
    }

    currentY += displayCount * rowHeight;

    // Settlement overflow "+N more"
    if (settlementCount > maxDisplaySettlements) {
      const overflowCount = settlementCount - maxDisplaySettlements;
      ctx.textAlign = 'center';
      ctx.font = '600 22px "Inter", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = textMuted;
      ctx.fillText(`+${overflowCount} more settlement payments`, width / 2, currentY + 8);
      currentY += 45;
    }
  }

  // 7. Receipts Breakdown Section (when space allows, up to 5 expenses)
  const footerAreaHeight = 140;
  const remainingSpace = cardY + cardH - footerAreaHeight - currentY;

  // Space check: requires at least 150px of vertical headroom
  if (remainingSpace >= 150 && expenses.length > 0) {
    currentY += 15;
    ctx.strokeStyle = receiptLineBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(colLeft, currentY);
    ctx.lineTo(colRight, currentY);
    ctx.stroke();

    currentY += 18;
    ctx.font = '700 18px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textMuted;
    ctx.textAlign = 'left';
    ctx.fillText('RECEIPTS BREAKDOWN', colLeft, currentY);
    currentY += 28;

    const maxReceipts = Math.min(expenses.length, 5);
    const receiptRowH = Math.min(
      46,
      (cardY + cardH - footerAreaHeight - currentY - 30) / maxReceipts
    );

    for (let j = 0; j < maxReceipts; j++) {
      const exp = expenses[j];
      const rY = currentY + j * receiptRowH;

      ctx.font = '600 20px "Inter", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = textPrimary;
      ctx.textAlign = 'left';

      // Payer name
      const payerName = getPersonName(exp.paidBy);
      const descText = `${exp.description}`;
      const payerSub = ` · paid by ${payerName}`;

      const amtStr = formatMoney(exp.amountMinor, currency);
      ctx.textAlign = 'right';
      ctx.fillText(amtStr, colRight, rY);

      const expAmtW = ctx.measureText(amtStr).width;
      const descAvailW = colWidth - expAmtW - 30;

      ctx.textAlign = 'left';
      ctx.fillStyle = textPrimary;
      const truncDesc = truncateText(ctx, descText, descAvailW * 0.65);
      ctx.fillText(truncDesc, colLeft, rY);

      const truncDescW = ctx.measureText(truncDesc).width;
      ctx.fillStyle = textMuted;
      ctx.font = '400 17px "Inter", system-ui, -apple-system, sans-serif';
      const truncPayer = truncateText(ctx, payerSub, descAvailW - truncDescW);
      ctx.fillText(truncPayer, colLeft + truncDescW, rY);
    }

    if (expenses.length > maxReceipts) {
      const moreExpenses = expenses.length - maxReceipts;
      ctx.textAlign = 'center';
      ctx.font = '500 18px "Inter", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = textMuted;
      ctx.fillText(
        `+${moreExpenses} more expenses`,
        width / 2,
        currentY + maxReceipts * receiptRowH + 6
      );
    }
  }

  // 8. Receipt Card Footer
  ctx.textAlign = 'center';
  ctx.font = '700 38px "Pirata One", Georgia, serif';
  ctx.fillStyle = textPrimary;
  ctx.fillText('Everyone pays in the end.', width / 2, cardY + cardH - 95);

  // Display URL without http(s)://; omit if localhost
  const cleanOrigin = origin.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const isLocal = cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1');

  if (!isLocal && cleanOrigin) {
    ctx.font = '500 26px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textMuted;
    ctx.fillText(cleanOrigin, width / 2, cardY + cardH - 46);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create PNG blob from canvas'));
      }
    }, 'image/png');
  });
}
