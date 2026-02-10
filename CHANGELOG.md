# Changelog

All notable changes to **MarkPDF Pro** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-02-10

### Added
- **Auto-save**: Editor content is automatically saved to localStorage with a 500ms debounce. Saved content is restored on next visit, with a visible save status indicator (Saving.../Saved).
- **Word Count & Reading Time**: Live word count and estimated reading time displayed at the bottom of the editor panel.
- **Bot & Automation Detection**: Client-side detection of headless browsers (Puppeteer, Playwright, Selenium, PhantomJS, Cypress) with a dismissable warning banner.
- **Rate Limiting**: Print and DOCX export are rate-limited to 3 invocations per 30 seconds to prevent abuse.
- **Input Size Protection**: Editor input is capped at 2 MB to prevent memory exhaustion attacks.
- **Paste Bomb Protection**: Clipboard paste is limited to 500 KB to block paste-based DoS attacks.
- **XSS / HTML Sanitization**: Dangerous HTML tags (`<script>`, `<iframe>`, `<object>`, etc.), event handlers (`onclick`, `onerror`, etc.), `javascript:` URIs, and `data:text/html` payloads are stripped from markdown input.
- **React Error Boundary**: Graceful crash recovery UI with "Try Again" and "Clear Data & Reload" buttons instead of a white screen.
- **File Import Size Limit**: Imported files are capped at 5 MB with a user-friendly error message.
- **File Import Error Handling**: Added `reader.onerror` handler for failed file reads.
- **Security Headers** (`vercel.json`):
  - `Content-Security-Policy` — restricts script/resource origins
  - `X-Frame-Options: DENY` — prevents clickjacking
  - `X-Content-Type-Options: nosniff` — prevents MIME-type sniffing
  - `Strict-Transport-Security` (HSTS) — enforces HTTPS
  - `Permissions-Policy` — disables camera, microphone, geolocation, FLoC
  - `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer leakage
  - `X-XSS-Protection: 1; mode=block` — legacy XSS filter
- **Safe localStorage Wrappers**: All localStorage access uses try/catch wrappers to handle QuotaExceededError and private browsing SecurityError gracefully.

### Fixed
- **darkMode crash**: `JSON.parse` on corrupted localStorage value previously crashed the entire app on load (white screen). Now wrapped in try/catch.
- **Save status stuck**: Auto-save status indicator (`Saved`) previously stayed visible forever. Now resets to idle after 2 seconds.
- **Print iframe memory leak**: Clicking Print rapidly accumulated orphan iframes in the DOM. Now cleans up the previous iframe before creating a new one.
- **Print iframe cleanup timeout**: Increased from 5s to 10s to accommodate slower print dialogs.

### Removed
- **API key leak**: Removed `GEMINI_API_KEY` exposure via Vite `define` block in `vite.config.ts`. Keys were being injected into the client-side JS bundle.
- **CDN script in print iframe**: Removed external `cdn.tailwindcss.com` `<script>` tag from the print iframe (supply-chain attack vector). Replaced with self-contained inline CSS.
- **Stale import map**: Removed unused `<script type="importmap">` block from `index.html` that referenced esm.sh CDN URLs (ignored by Vite, served no purpose).
- **Dead code**: Removed unused variables (`remaining`, `lastIndex`, `processedText`, `patterns`) from the DOCX inline formatting parser.

### Security
- Full client-side security module added at `src/lib/security.ts`.
- Vercel deployment hardened with comprehensive HTTP security headers via `vercel.json`.

---

## [2.1.0] - 2026-02-10

### Added
- **DOCX Export**: Export markdown to Microsoft Word format (.docx) compatible with MS Word, Google Docs, and LibreOffice.
- Tables render correctly in all word processors using explicit column widths.
- Smart filename generation from the document's first heading.
- Full markdown support in DOCX: headings, bold, italic, code, lists, tables, blockquotes, links.

---

## [2.0.0] - 2026-02-10

### Added
- **Dark Mode / Light Mode** toggle with localStorage persistence.
- **Dark Mode as default** theme.
- **Complete mobile and tablet responsiveness** with adaptive layouts.
- Custom `xs` breakpoint (480px) for fine-grained responsive control.
- Responsive header with adaptive button sizes.
- Responsive editor and preview panels.
- Adaptive typography scaling across breakpoints.
- **SEO optimization**: meta tags, Open Graph, Twitter Cards, JSON-LD structured data.

---

## [1.0.0] - 2026-02-10

### Added
- Real-time Markdown live preview (side-by-side editor and preview).
- PDF export via browser's native print engine (print-optimized A4 layout).
- GitHub Flavored Markdown support via `remark-gfm` (tables, code blocks, lists).
- Markdown file import (`.md`, `.markdown`, `.txt`).
- Modern UI built with React 19, Shadcn UI, Tailwind CSS v4, and Vite.
- Google Fonts integration (Inter + Poppins).

---

[2.2.0]: https://github.com/VarunNishad/MarkPDF-Pro/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/VarunNishad/MarkPDF-Pro/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/VarunNishad/MarkPDF-Pro/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/VarunNishad/MarkPDF-Pro/releases/tag/v1.0.0
