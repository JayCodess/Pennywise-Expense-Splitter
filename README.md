# Pennywise 🎈

> *"Everyone pays in the end."*

A creepy-carnival expense splitter web app built with Vite, React, TypeScript, and Tailwind CSS.

## Features
- **Zero backend & zero accounts**: All state runs and persists securely in client `localStorage`.
- **Optimal settlement calculation**: Greedy minimum-cash-flow algorithm guarantees minimal number of transactions (at most N-1 transactions for N participants).
- **Session-only single-level undo**: Deleting an expense triggers a polite undo toast that allows immediate restoration. Undo state is session-only and not persisted across refreshes.
- **Creepy carnival aesthetic**: Sinister clown mascot, bobbing red balloon, storm drain iconography, and subtle eerie atmospheric effects.
- **Accessible & Responsive**: WCAG AA contrast compliance across both dark (near-black) and light (faded old paper) themes, full keyboard navigation, visible focus rings, touch targets $\ge 44\text{px}$, and strict respect for `prefers-reduced-motion`.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Production Build
```bash
npm run build
```
