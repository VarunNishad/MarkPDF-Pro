# MarkPDF Pro

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)

**MarkPDF Pro** is a professional, distraction-free Markdown editor and PDF converter. Built with performance and privacy in mind, it allows you to write markdown and instantly preview it, then export clean, print-ready PDFs directly from your browser.

## ✨ Key Features

* **⚡ Real-time Live Preview**: Type on the left, see the formatted document on the right instantly.
* **📄 Print-Optimized Export**: Generates perfectly formatted A4 PDFs using the browser's native print engine. No watermarks, no distortions.
* **🔒 Privacy First**: 100% Client-side. Your data never leaves your browser. No servers, no tracking.
* **🎨 Modern UI**: Crafted with [Shadcn UI](https://ui.shadcn.com/) and [Tailwind CSS v4](https://tailwindcss.com/) for a sleek, responsive experience.
* **📝 GitHub Flavored Markdown**: Supports tables, code blocks, lists, and standard markdown syntax via `remark-gfm`.

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
* npm (comes with Node.js) or yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/VarunNishad/MarkPDF-Pro.git
    cd markpdf-pro
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
    Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal, e.g., `http://localhost:5173`).

## � How to Use

### Writing & Previewing

1. **Write**: Enter your Markdown text in the left-hand editor pane.
    * Use `#` for headings.
    * Use `**bold**` and `*italic*` for styling.
    * Use `-` or `1.` for lists.
    * Use code blocks with ` ``` ` for syntax highlighting.
2. **Preview**: The right-hand pane updates automatically as you type, showing exactly how the document will look.

### Exporting to PDF

1. Click the **Print** button located in the top-right corner of the header.
2. The browser's print dialog will open.
3. **Destination**: Select **"Save as PDF"**.
4. **Settings** (Recommended):
    * **Margins**: Default or None (depending on your preference).
    * **Options**: Ensure "Background graphics" is checked if you want to keep colored headers or code blocks.
5. Click **Save** to download your PDF.

## 🛠️ Technology Stack

This project is built using the latest modern web technologies:

* **Framework**: [React 19](https://react.dev/)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [PostCSS](https://postcss.org/)
* **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (based on Radix UI)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Markdown Engine**: [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)

## 🤝 Contributing

Contributions are welcome! If you have suggestions or want to improve the code:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

> **MIT License**
>
> Copyright (c) 2024 Varun Nishad
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software... (Standard MIT text implies adoption).

---

Built with ❤️ by [Varun Nishad](https://github.com/VarunNishad)
