# Pennywise 🎈

> _"Everyone pays in the end."_

A creepy-carnival expense splitter web app where a group enters who paid for what and instantly sees the fewest payments needed to settle up. Fast, obvious, zero-backend, and fully persistent in client `localStorage`.

---

## Features

- **Optimal Settlement Calculation**:
  - Implements a greedy minimum-cash-flow algorithm (matching the largest debtor with the largest creditor).
  - Guarantees at most $N-1$ payments for $N$ people.
  - Balances always sum to exactly zero.
  - Deterministic remainder distribution prevents fractional cent rounding errors.
- **Creepy Carnival Theme & Visuals**:
  - Dark near-black palette (`#0d0b0c`) with charcoal cards (`#1a1618`), blood-red accents (`#c1121f`), and sickly yellow-green highlights (`#b7c34a`).
  - Faded old paper light mode option.
  - Original inline SVG clown mascot with glowing yellow eyes, asymmetrical stare, stitched grin, and ruffled collar.
  - Floating bobbing red balloon and storm-drain sewer grate iconography.
- **Session-Only Undo**:
  - Deleting an expense triggers a polite, floating toast allowing instant single-level restoration.
  - **Undo Limitation**: Undo state is strictly single-level and session-only; it is not saved to persistent storage and is reset upon browser refresh.
- **Data Privacy Note**:
  - _"Your data stays in your browser. Down in the drain, where nobody can find it."_
  - No database, no user accounts, no tracking cookies, no analytics, and zero external network calls.
- **Accessibility & Mobile-First**:
  - WCAG AA contrast compliance across both dark and light modes.
  - Semantic HTML, visible focus rings, radio/toggle ARIA roles, and concise `aria-live="polite"` updates.
  - All interactive elements are sized for touch ($\ge 44\text{px}$).
  - All animations stop cleanly when `prefers-reduced-motion` is active.
- **Responsive Layout**:
  - Desktop ($\ge 1024\text{px}$): Two columns with an internally scrolling, sticky results panel.
  - Mobile (down to 360px): Single-column layout with a floating _"See who pays whom ↓"_ pill when results are off-screen.
- **15 Supported Currencies**:
  - USD, EUR, GBP, INR, CHF, CAD, AUD, NZD, SEK, NOK, DKK, PLN, CZK, TRY, ZAR.
  - Handles thousands separators (US `1,234.50` and European `1.234,50`). Switching currency reformats immediately without converting values.

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Sharing

Pennywise offers multiple sharing options without any server accounts or tracking:

- **Instant Social & Messaging**: Quick links to share summaries via WhatsApp, Telegram, SMS, or Email.
- **Native Web Share**: Share formatted text directly into native mobile share sheets (`navigator.share`).
- **Receipt Image Card (PNG)**: Generate a high-resolution 1080×1350 card designed for mobile stories and chat apps using pure client-side HTML5 Canvas. Includes themed styling for both dark and light modes, mascot artwork, up to 8 settlement rows with overflow indication, and a receipts breakdown section.
- **Shareable Link (No Backend)**: Encodes participants, expenses, and currency into the URL hash with compression (`CompressionStream('deflate-raw')`) and base64url encoding (`#d=1.<payload>`). Safe to open from untrusted sources with strict validation, read-only preview mode, and confirmation before importing.
- **Download CSV**: Generates RFC 4180 compliant CSV files with UTF-8 BOM for Microsoft Excel containing separate Expenses and Settlements sections.
- **Copy Text**: Quick one-click formatted breakdown for easy pasting.

### Running Locally (Development)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Tests

Execute the full Vitest suite (49 unit and integration tests):

```bash
npm test
```

### Production Build

Build optimized static assets into `dist/`:

```bash
npm run build
```

### Preview Production Build

Locally preview the built production app:

```bash
npm run preview
```

### Deploying to a Custom Domain

The production URL for canonical and Open Graph (`og:image`, `og:url`, `twitter:image`) metadata is defined in one place in `vite.config.ts` (`DEFAULT_SITE_URL`). To deploy to a custom domain, either update `DEFAULT_SITE_URL` in `vite.config.ts` or set the `VITE_SITE_URL` environment variable before running `npm run build`.
