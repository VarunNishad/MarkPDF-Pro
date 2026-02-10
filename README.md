# MarkPDF Pro

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)
![Mobile Friendly](https://img.shields.io/badge/mobile-friendly-green.svg)
![Dark Mode](https://img.shields.io/badge/dark%20mode-supported-blueviolet.svg)
![Security](https://img.shields.io/badge/security-hardened-brightgreen.svg)

**MarkPDF Pro** is a professional, distraction-free Markdown editor and PDF/DOCX converter. Built with performance and privacy in mind, it allows you to write markdown and instantly preview it, then export clean, print-ready PDFs or Word documents directly from your browser.

🌐 **[Try it Live](https://mark-pdf-pro.vercel.app/)**

---

## ✨ Key Features

### Core Features
* **⚡ Real-time Live Preview**: Type on the left, see the formatted document on the right instantly.
* **📄 Print-Optimized PDF Export**: Generates perfectly formatted A4 PDFs using the browser's native print engine. No watermarks, no distortions.
* **📝 DOCX Export**: Export to Microsoft Word format (.docx) compatible with MS Word, Google Docs, and LibreOffice. Tables render correctly across all platforms.
* **🔒 Privacy First**: 100% Client-side. Your data never leaves your browser. No servers, no tracking.
* **📝 GitHub Flavored Markdown**: Supports tables, code blocks, lists, and standard markdown syntax via `remark-gfm`.

### Editor Features
* **💾 Auto-Save**: Editor content is automatically saved to your browser with a 500ms debounce. Restored on your next visit with a visible save indicator.
* **📊 Word Count & Reading Time**: Live word count and estimated reading time displayed at the bottom of the editor.
* **🌙 Dark Mode / Light Mode Toggle**: Switch between dark and light themes with a single click. Dark mode is enabled by default. Your preference is saved automatically.
* **📱 Fully Responsive Design**: Optimized for all screen sizes:
  - **Mobile phones** (320px+): Compact UI with icon-only buttons
  - **Tablets** (640px+): Balanced layout with partial labels
  - **Desktops** (1024px+): Full-featured side-by-side editor and preview
* **💾 Persistent Settings**: Your dark mode preference is saved to localStorage and restored on your next visit.
* **📤 Import Markdown Files**: Upload `.md`, `.markdown`, or `.txt` files (up to 5 MB) directly into the editor.

### Security & Protection
* **🛡️ Bot & Automation Detection**: Detects headless browsers (Puppeteer, Playwright, Selenium, PhantomJS, Cypress) and displays a warning banner.
* **⏱️ Rate Limiting**: Print and DOCX export are rate-limited (3 per 30s) to prevent automated abuse.
* **🧹 XSS Sanitization**: Dangerous HTML tags, event handlers, `javascript:` URIs, and data URIs are stripped from markdown input.
* **📏 Input Size Limits**: Editor input capped at 2 MB; paste operations capped at 500 KB; file imports capped at 5 MB.
* **🔐 Security Headers**: Content-Security-Policy, X-Frame-Options (DENY), HSTS, X-Content-Type-Options, Permissions-Policy, and Referrer-Policy via Vercel.
* **🚨 Error Boundary**: Graceful crash recovery with "Try Again" and "Clear Data & Reload" options instead of a white screen.

### UI/UX Improvements
* **🎨 Modern UI**: Crafted with [Shadcn UI](https://ui.shadcn.com/) and [Tailwind CSS v4](https://tailwindcss.com/) for a sleek, responsive experience.
* **🔄 Smooth Transitions**: Elegant color transitions when switching themes.
* **📏 Adaptive Typography**: Text sizes adjust automatically based on screen size.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
* npm (comes with Node.js) or yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/VarunNishad/MarkPDF-Pro.git
    cd MarkPDF-Pro
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Start the development server**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

4. **Launch the App**
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## 📖 How to Use

### Writing & Previewing

1. **Write**: Enter your Markdown text in the left-hand editor pane.
    * Use `#` for headings (`# H1`, `## H2`, etc.)
    * Use `**bold**` and `*italic*` for styling
    * Use `-` or `1.` for lists
    * Use triple backticks for code blocks
    * Use `|` for tables (GFM supported)
2. **Preview**: The right-hand pane updates automatically as you type, showing exactly how the document will look.

### Switching Themes

* Click the **Dark Mode** / **Light Mode** button in the header to toggle themes.
* On mobile, the button shows only the sun/moon icon to save space.
* Your preference is automatically saved.

### Exporting to DOCX (Word Document)

1. Click the **DOCX** button in the top-right corner of the header.
2. The file will automatically download with a smart filename based on your document's first heading.
3. Open the downloaded `.docx` file in:
    * Microsoft Word
    * Google Docs
    * LibreOffice Writer
    * Any DOCX-compatible application

### Exporting to PDF

1. Click the **Print** button located in the top-right corner of the header.
2. The browser's print dialog will open.
3. **Destination**: Select **"Save as PDF"**.
4. **Settings** (Recommended):
    * **Margins**: Default or None (depending on your preference)
    * **Options**: Ensure "Background graphics" is checked if you want to keep colored headers or code blocks
5. Click **Save** to download your PDF.

### Importing Files

1. Click the **Import** button in the editor panel header.
2. Select a `.md`, `.markdown`, or `.txt` file from your device.
3. The file contents will replace the current editor content.

---

## 🛠️ Technology Stack

This project is built using the latest modern web technologies:

| Category | Technology |
|----------|------------|
| **Framework** | [React 19](https://react.dev/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [PostCSS](https://postcss.org/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) (based on Radix UI) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Markdown Engine** | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| **DOCX Generation** | [docx](https://docx.js.org/) + [file-saver](https://github.com/eligrey/FileSaver.js) |
| **State Management** | React useState + localStorage |
| **Security** | Custom client-side security module + Vercel security headers |

---

## 📋 Supported Markdown Features

| Feature | Syntax | DOCX | PDF |
|---------|--------|------|-----|
| Headings | `# H1` to `###### H6` | ✅ | ✅ |
| Bold | `**text**` | ✅ | ✅ |
| Italic | `*text*` | ✅ | ✅ |
| Links | `[text](url)` | ✅ | ✅ |
| Inline Code | `` `code` `` | ✅ | ✅ |
| Code Blocks | ` ``` ` | ✅ | ✅ |
| Unordered Lists | `- item` | ✅ | ✅ |
| Ordered Lists | `1. item` | ✅ | ✅ |
| Blockquotes | `> quote` | ✅ | ✅ |
| Tables | `\| col \|` | ✅ | ✅ |
| Horizontal Rules | `---` | ✅ | ✅ |

---

## 📱 Responsive Breakpoints

| Screen Size | Breakpoint | Layout |
|-------------|------------|--------|
| Mobile | < 480px | Single column, icon-only buttons |
| Small Mobile | 480px (xs) | Single column, compact labels |
| Tablet | 640px (sm) | Single column, full button labels |
| Desktop | 1024px (lg) | Two-column side-by-side layout |

---

## 🔄 Recent Updates

See [CHANGELOG.md](CHANGELOG.md) for the full changelog.

### Version 2.2.0 (February 2026)
- ✅ **Auto-save** editor content to localStorage with 500ms debounce and save status indicator
- ✅ **Word count & reading time** live display in editor footer
- ✅ **Bot & automation detection** (Puppeteer, Playwright, Selenium, PhantomJS, Cypress)
- ✅ **Rate limiting** on Print and DOCX export (3 per 30 seconds)
- ✅ **XSS sanitization** — strips dangerous HTML, event handlers, and `javascript:` URIs
- ✅ **Input size protection** — 2 MB editor limit, 500 KB paste limit, 5 MB file import limit
- ✅ **React Error Boundary** — graceful crash recovery UI
- ✅ **Security headers** via Vercel (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- 🐛 Fixed darkMode crash on corrupted localStorage
- 🐛 Fixed save status indicator stuck in "Saved" state
- 🐛 Fixed print iframe memory leak on rapid clicks
- 🗑️ Removed API key leak from Vite config
- 🗑️ Removed external CDN script from print iframe
- 🗑️ Removed stale import map and dead code

### Version 2.1.0 (February 2026)
- ✅ Added **DOCX Export** with full MS Word, Google Docs, and LibreOffice compatibility
- ✅ Tables render correctly in all word processors using explicit column widths
- ✅ Smart filename generation from document's first heading
- ✅ Full markdown support: headings, bold, italic, code, lists, tables, blockquotes, links

### Version 2.0.0 (February 2026)
- ✅ Added **Dark Mode / Light Mode** toggle with persistence
- ✅ Made **Dark Mode the default** theme
- ✅ Complete **mobile and tablet responsiveness**
- ✅ Added `xs` breakpoint (480px) for fine-grained control
- ✅ Responsive header with adaptive button sizes
- ✅ Responsive editor and preview panels
- ✅ Adaptive typography scaling
- ✅ Comprehensive **SEO optimization** with meta tags, Open Graph, Twitter Cards, and JSON-LD structured data

### Version 1.0.0 (Initial Release)
- Real-time Markdown preview
- PDF export via browser print
- GitHub Flavored Markdown support
- File import functionality
- Modern UI with Shadcn components

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions or want to improve the code:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🔗 Links

* **Live Demo**: [https://mark-pdf-pro.vercel.app/](https://mark-pdf-pro.vercel.app/)
* **Repository**: [https://github.com/VarunNishad/MarkPDF-Pro](https://github.com/VarunNishad/MarkPDF-Pro)
* **Issues**: [https://github.com/VarunNishad/MarkPDF-Pro/issues](https://github.com/VarunNishad/MarkPDF-Pro/issues)

---

**Made with ❤️ by [Varun Nishad](https://github.com/VarunNishad)**
