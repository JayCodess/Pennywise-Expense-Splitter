# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-25

### Added

- **Optimal Settlement Engine**: Greedy minimum-cash-flow algorithm guaranteeing at most $N-1$ payments with deterministic integer minor-unit remainder distribution.
- **Multi-Currency Support**: 15 supported currencies (USD, EUR, GBP, INR, CHF, CAD, AUD, NZD, SEK, NOK, DKK, PLN, CZK, TRY, ZAR) with localized formatting and thousands separator parsing.
- **Dark & Light Themes**: Dual theme system with `localStorage` persistence and automatic OS theme detection.
- **Zero-Backend Sharing & Export**:
  - Compressed URL hash links (`#d=1.<payload>`) using Deflate raw compression and base64url encoding, with strict 8 KB / 64 KB safety limits and read-only view mode.
  - Client-side HTML5 Canvas generator producing 1080×1350 receipt PNG image cards with dynamic layout scaling.
  - RFC 4180 compliant CSV export with UTF-8 BOM.
  - Direct sharing via Web Share API, WhatsApp, Telegram, SMS, Email, and clipboard plain text.
- **Accessibility & Mobile Experience**: WCAG 2.1 AA contrast compliance, keyboard focus trapping, `aria-live` status updates, reduced motion support, and mobile quick-jump pill.
- **Tooling & Documentation**: ESLint 9 flat config, Prettier formatting, Vitest test suite (92 tests), architecture documentation, and GitHub Actions CI pipeline.
