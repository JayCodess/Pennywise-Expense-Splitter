# Contributing to Pennywise

Thank you for your interest in improving Pennywise! We welcome contributions that maintain our high standards for code quality, accessibility, visual design, and test coverage.

---

## Code of Conduct & Ground Rules

1. **Zero Runtime Dependencies**: The app is strictly client-only. Do not add runtime dependencies or client-side analytics/tracking libraries without prior discussion.
2. **Deterministic Arithmetic**: Never use floating-point numbers for money calculations. All financial logic must use integer minor units.
3. **Decor Safety Rule**: Atmospheric visual elements (balloons, blood drips, banners, carnival grates) must **never** obscure text, input fields, participant chips, or interactive buttons. Always enforce `pointer-events: none` and `aria-hidden="true"` on decorative overlays.

---

## Development Setup

### Prerequisites

- Node.js `v20.0.0` or higher
- npm `v10.0.0` or higher

```bash
# Clone the repository
git clone https://github.com/REPLACE_WITH_YOUR_USERNAME/pennywise.git
cd pennywise

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Branch & Commit Conventions

### Branch Naming

- `feature/<short-description>`: New features or UI capabilities
- `fix/<short-description>`: Bug fixes and calculations
- `docs/<short-description>`: Documentation improvements
- `refactor/<short-description>`: Code structure improvements without behavior change

### Conventional Commits

All commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` Adds a new user-facing capability
- `fix:` Corrects a bug or calculation error
- `docs:` Documentation additions or updates
- `style:` Formatting changes with zero code modifications
- `refactor:` Code restructuring without behavioral changes
- `test:` Adding or updating unit/integration test cases
- `chore:` Dependency, build script, or tooling configuration updates

_Example_: `feat: add export to json summary` or `fix: handle edge case with zero balance debtor`

---

## Pull Request Checklist

Before submitting a Pull Request, verify that all quality gates pass locally:

- [ ] **Tests pass**: `npm test` runs with zero failures (92+ tests).
- [ ] **Type checks pass**: `npm run typecheck` passes with zero TypeScript errors.
- [ ] **Linter passes**: `npm run lint` passes without warnings.
- [ ] **Formatting adheres to Prettier**: `npm run format:check` passes cleanly.
- [ ] **Production build succeeds**: `npm run build` completes without warnings.
- [ ] **Accessibility check**: New interactive controls meet WCAG 2.1 AA touch target ($\ge 44\text{px}$) and visible focus ring standards.
- [ ] **Decor Safety verified**: No decorative elements obstruct clicks or touch events.
