/**
 * Deterministic pseudo-random number generator (Mulberry32)
 * Ensures reproducible, jitter-free SVG generation across renders.
 */
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DripSpec {
  x: number;
  length: number;
  stemWidth: number;
  bulbRadius: number;
  hasDetachedDroplet: boolean;
  detachedY?: number;
  detachedRadius?: number;
}

export interface GeneratedBloodEdge {
  path: string;
  stemHighlights: string[];
  bulbHighlights: { cx: number; cy: number; rx: number; ry: number }[];
  detachedDroplets: {
    cx: number;
    cy: number;
    r: number;
    highlight: { cx: number; cy: number; rx: number; ry: number };
  }[];
}

/**
 * Generates an organic pooled blood lip with irregular hanging drips.
 * Drip anatomy:
 * - Wide flared root attaching to a continuous 4-9px wavy lip
 * - Narrowing stem with organic curve
 * - Slight pinched neck
 * - Teardrop bulb wider than the stem
 * - Specular stem highlight (left side) and bulb highlight
 */
export function generateHorizontalBloodEdge(
  width: number,
  baseThickness: number,
  drips: DripSpec[],
  seed: number,
  direction: 'down' | 'up' = 'down'
): GeneratedBloodEdge {
  const rand = createPRNG(seed);
  const stemHighlights: string[] = [];
  const bulbHighlights: { cx: number; cy: number; rx: number; ry: number }[] = [];
  const detachedDroplets: {
    cx: number;
    cy: number;
    r: number;
    highlight: { cx: number; cy: number; rx: number; ry: number };
  }[] = [];

  // Sort drips by x
  const sortedDrips = [...drips].sort((a, b) => a.x - b.x);

  // Generate continuous lip points along width
  const lipSteps = Math.max(12, Math.floor(width / 24));
  const stepSize = width / lipSteps;

  // Build the outer wavy contour
  let path = `M 0 0 L ${width} 0 `;

  if (direction === 'down') {
    path += `L ${width} ${baseThickness + rand() * 2} `;

    // Walk backwards from width to 0, inserting drips
    let currentX = width;
    let dripIdx = sortedDrips.length - 1;

    while (currentX > 0) {
      const nextX = Math.max(0, currentX - stepSize);

      // Check if there are drips between nextX and currentX
      while (
        dripIdx >= 0 &&
        sortedDrips[dripIdx].x >= nextX &&
        sortedDrips[dripIdx].x <= currentX
      ) {
        const drip = sortedDrips[dripIdx];
        const halfRoot = Math.max(drip.stemWidth * 1.5, 6);
        const rootRight = Math.min(width, drip.x + halfRoot);
        const rootLeft = Math.max(0, drip.x - halfRoot);
        const halfStem = drip.stemWidth / 2;
        const bulbR = drip.bulbRadius;
        const bulbCenterY = drip.length - bulbR;
        const neckY = bulbCenterY - bulbR * 0.7;

        // Curve into the right side of the drip root
        path += `Q ${rootRight} ${baseThickness} ${drip.x + halfStem} ${baseThickness + 6} `;

        // Right stem down to neck
        const midY = (baseThickness + neckY) / 2;
        path += `C ${drip.x + halfStem + 0.5} ${midY - 2}, ${drip.x + halfStem - 0.2} ${midY + 2}, ${drip.x + halfStem * 0.85} ${neckY} `;

        // Right bulb round bottom
        path += `C ${drip.x + bulbR} ${neckY + bulbR * 0.3}, ${drip.x + bulbR * 1.05} ${bulbCenterY + bulbR * 0.5}, ${drip.x} ${drip.length} `;

        // Left bulb round bottom
        path += `C ${drip.x - bulbR * 1.05} ${bulbCenterY + bulbR * 0.5}, ${drip.x - bulbR} ${neckY + bulbR * 0.3}, ${drip.x - halfStem * 0.85} ${neckY} `;

        // Left stem up to root
        path += `C ${drip.x - halfStem + 0.2} ${midY + 2}, ${drip.x - halfStem - 0.5} ${midY - 2}, ${rootLeft} ${baseThickness + 2} `;

        // Specular highlight down the left edge of the stem
        if (drip.length > 18) {
          stemHighlights.push(
            `M ${drip.x - halfStem * 0.6} ${baseThickness + 4} L ${drip.x - halfStem * 0.5} ${neckY - 2}`
          );
        }

        // Oval highlight on the bulb
        bulbHighlights.push({
          cx: drip.x - bulbR * 0.32,
          cy: bulbCenterY - bulbR * 0.25,
          rx: Math.max(0.8, bulbR * 0.38),
          ry: Math.max(1.2, bulbR * 0.55),
        });

        // Detached droplet if specified
        if (drip.hasDetachedDroplet && drip.detachedY && drip.detachedRadius) {
          detachedDroplets.push({
            cx: drip.x,
            cy: drip.detachedY,
            r: drip.detachedRadius,
            highlight: {
              cx: drip.x - drip.detachedRadius * 0.3,
              cy: drip.detachedY - drip.detachedRadius * 0.25,
              rx: drip.detachedRadius * 0.35,
              ry: drip.detachedRadius * 0.45,
            },
          });
        }

        dripIdx--;
      }

      const lipH = baseThickness + (rand() - 0.5) * 3;
      path += `Q ${currentX - stepSize / 2} ${lipH + (rand() - 0.5) * 2} ${nextX} ${lipH} `;
      currentX = nextX;
    }

    path += `L 0 0 Z`;
  } else {
    // Upward hanging/creeping
    path += `L ${width} ${-baseThickness} L 0 ${-baseThickness} Z`;
  }

  return {
    path,
    stemHighlights,
    bulbHighlights,
    detachedDroplets,
  };
}

/**
 * Generates an organic vertical blood trickle running down a side border.
 */
export function generateVerticalBloodTrickle(height: number, side: 'left' | 'right', seed: number) {
  const rand = createPRNG(seed);
  const startY = 0;
  const trickleLen = Math.min(height * 0.85, 50 + rand() * 70);
  const stemWidth = 2.5 + rand() * 2;
  const bulbRadius = stemWidth * 1.5;
  const bulbY = startY + trickleLen - bulbRadius;

  const xBase = side === 'left' ? 0 : 0;
  const dir = side === 'left' ? 1 : -1;

  // Build vertical drip path
  let path = `M ${xBase} 0 `;
  path += `C ${xBase + dir * (stemWidth * 2)} 4, ${xBase + dir * stemWidth} 15, ${xBase + dir * stemWidth} ${trickleLen * 0.4} `;
  path += `C ${xBase + dir * stemWidth} ${trickleLen * 0.7}, ${xBase + dir * (bulbRadius * 1.2)} ${bulbY - 4}, ${xBase + dir * (bulbRadius * 1.2)} ${bulbY} `;
  path += `C ${xBase + dir * (bulbRadius * 1.2)} ${bulbY + bulbRadius}, ${xBase + dir * bulbRadius} ${startY + trickleLen}, ${xBase} ${startY + trickleLen} `;
  path += `Z`;

  const highlight = {
    cx: xBase + dir * (bulbRadius * 0.4),
    cy: bulbY - bulbRadius * 0.2,
    rx: Math.max(0.6, bulbRadius * 0.35),
    ry: Math.max(1, bulbRadius * 0.5),
  };

  return { path, highlight, trickleLen };
}
