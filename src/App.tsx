import React, { useState, useRef } from 'react';
import MarkdownInput from './components/MarkdownInput';
import DocumentPreview from './components/DocumentPreview';
import { DEFAULT_MARKDOWN } from './constants';
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";

const App = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const previewElement = previewRef.current;
    if (!previewElement) {
      alert('Preview not ready.');
      return;
    }

    // Create a hidden iframe for printing
    // This isolates the content from the app UI and layout styles
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    // Append to body
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Get the HTML content from the preview
    // The previewRef points to the A4 container, so innerHTML gives us the content div
    const contentHtml = previewElement.innerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Print Document</title>
          <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              background: white;
              margin: 0;
              padding: 0;
            }
            h1, h2, h3, h4, h5, h6 { font-family: 'Poppins', sans-serif; }
            
            /* Print settings */
            @page { 
              margin: 20mm; 
              size: auto;
            }

            /* Ensure elements don't break awkwardly across pages */
            .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
            img { max-width: 100%; height: auto; break-inside: avoid; page-break-inside: avoid; }
            tr { break-inside: avoid; page-break-inside: avoid; }
            
            /* Ensure typography fills the width */
            .prose { max-width: none !important; }
            
            /* Hide any UI artifacts if they slipped in */
            ::-webkit-scrollbar { display: none; }
          </style>
        </head>
        <body>
          <div class="p-4">
            ${contentHtml}
          </div>
          <script>
            // Wait for Tailwind CDN and fonts to load
            window.onload = function() {
              // Add a small delay for style computation
              setTimeout(function() {
                try {
                  window.focus();
                  window.print();
                } catch (e) {
                  console.error('Print failed', e);
                }
              }, 600);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    // Clean up the iframe after enough time for the print dialog to register
    // Note: If the user cancels print quickly, this removes the iframe correctly.
    // If they keep it open, the iframe removal doesn't affect the open dialog in most modern browsers.
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">MarkPDF Pro</h1>
              <p className="text-xs text-muted-foreground font-medium">Markdown to PDF Converter</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2 rounded-full shadow-sm"
              title="Print or Save as PDF via Browser"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-full mx-auto w-full p-4 lg:p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          <div className="h-full min-h-[500px]">
            <MarkdownInput
              value={markdown}
              onChange={setMarkdown}
            />
          </div>

          <div className="h-full min-h-[500px]">
            <DocumentPreview
              ref={previewRef}
              content={markdown}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;