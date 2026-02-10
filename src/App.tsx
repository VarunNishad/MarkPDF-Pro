import React, { useState, useRef, useEffect, useCallback } from 'react';
import MarkdownInput from './components/MarkdownInput';
import DocumentPreview from './components/DocumentPreview';
import { DEFAULT_MARKDOWN } from './constants';
import { Button } from "@/components/ui/button";
import { Printer, FileText, FileDown, Sun, Moon, ShieldAlert } from "lucide-react";
import {
  isRateLimited,
  enforceInputLimit,
  sanitizeMarkdown,
  detectBot,
  safeLocalStorageSet,
  safeLocalStorageGet,
} from './lib/security';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ExternalHyperlink,
  LevelFormat
} from 'docx';
import { saveAs } from 'file-saver';

const AUTOSAVE_KEY = 'markpdf-autosave';
const AUTOSAVE_DELAY = 500;

type SaveStatus = 'idle' | 'saving' | 'saved';

const App = () => {
  const [markdown, setMarkdown] = useState<string>(() => {
    const saved = safeLocalStorageGet(AUTOSAVE_KEY);
    return saved !== null ? saved : DEFAULT_MARKDOWN;
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [botWarning, setBotWarning] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = safeLocalStorageGet('darkMode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const previewRef = useRef<HTMLDivElement>(null);

  // Bot detection on mount
  useEffect(() => {
    const { isBot, reasons } = detectBot();
    if (isBot) {
      console.warn('Bot/automation detected:', reasons);
      setBotWarning(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    safeLocalStorageSet('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Auto-save to localStorage with debounce
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const success = safeLocalStorageSet(AUTOSAVE_KEY, markdown);
      setSaveStatus(success ? 'saved' : 'idle');
      // Reset status after 2 seconds so indicator disappears
      if (success) {
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [markdown]);

  // Secure markdown setter with input size limit and XSS sanitization
  const handleMarkdownChange = useCallback((value: string) => {
    const { text, wasTruncated } = enforceInputLimit(value);
    const sanitized = sanitizeMarkdown(text);
    if (wasTruncated) {
      alert('Input was too large and has been truncated to prevent performance issues.');
    }
    setMarkdown(sanitized);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const printIframeRef = useRef<HTMLIFrameElement | null>(null);

  const handlePrint = () => {
    // Rate limit: max 3 prints per 30 seconds
    if (isRateLimited('print', 3, 30_000)) {
      alert('Please wait a moment before printing again.');
      return;
    }

    const previewElement = previewRef.current;
    if (!previewElement) {
      alert('Preview not ready.');
      return;
    }

    // Clean up any existing print iframe to prevent memory leaks
    if (printIframeRef.current && document.body.contains(printIframeRef.current)) {
      document.body.removeChild(printIframeRef.current);
    }

    // Create a hidden iframe for printing
    // This isolates the content from the app UI and layout styles
    const iframe = document.createElement('iframe');
    printIframeRef.current = iframe;
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
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              background: white;
              margin: 0;
              padding: 0;
              color: #1a1a1a;
              line-height: 1.7;
            }
            h1, h2, h3, h4, h5, h6 { font-family: 'Poppins', sans-serif; }
            h1 { font-size: 2.25rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
            h2 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-top: 2rem; margin-bottom: 1rem; }
            h3 { font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-top: 1.5rem; margin-bottom: 0.75rem; }
            h4 { font-size: 1.125rem; font-weight: 600; color: #374151; margin-top: 1rem; margin-bottom: 0.5rem; }
            p { color: #374151; margin-bottom: 1rem; }
            ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
            ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
            li { padding-left: 0.25rem; margin-bottom: 0.25rem; }
            blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin: 1.5rem 0; background: #eff6ff; padding: 0.5rem 1rem; border-radius: 0 0.25rem 0.25rem 0; font-style: italic; }
            pre { background: #111827; color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1.5rem; font-size: 0.875rem; }
            code { font-family: 'Consolas', 'Monaco', monospace; }
            :not(pre) > code { background: #f3f4f6; color: #db2777; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; border: 1px solid #e5e7eb; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
            th, td { padding: 0.75rem 1rem; border: 1px solid #e5e7eb; text-align: left; }
            th { background: #f9fafb; font-weight: 600; color: #374151; }
            td { color: #4b5563; }
            hr { margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb; }
            a { color: #2563eb; text-decoration: underline; }
            img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1.5rem auto; display: block; }
            
            /* Print settings */
            @page { 
              margin: 20mm; 
              size: auto;
            }

            /* Ensure elements don't break awkwardly across pages */
            h1, h2, h3, h4, h5, h6, p, li, tr, img, blockquote, pre { break-inside: avoid; page-break-inside: avoid; }
            
            /* Hide any UI artifacts if they slipped in */
            ::-webkit-scrollbar { display: none; }
          </style>
        </head>
        <body>
          <div style="padding: 1rem;">
            ${contentHtml}
          </div>
          <script>
            // Wait for fonts to load
            window.onload = function() {
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
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      if (printIframeRef.current === iframe) {
        printIframeRef.current = null;
      }
    }, 10000);
  };

  const handleExportDocx = async () => {
    // Rate limit: max 3 exports per 30 seconds
    if (isRateLimited('docx-export', 3, 30_000)) {
      alert('Please wait a moment before exporting again.');
      return;
    }

    if (!markdown.trim()) {
      alert('Please add some content before exporting.');
      return;
    }

    setIsExporting(true);

    try {
      // Parse markdown and convert to docx elements
      const docElements = parseMarkdownToDocx(markdown);

      // Create the document with proper numbering configuration
      const doc = new Document({
        numbering: {
          config: [{
            reference: 'default-numbering',
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: '%1.',
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 },
                  },
                },
              },
            ],
          }],
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch in twips
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: docElements,
        }],
      });

      // Generate blob and download
      const blob = await Packer.toBlob(doc);
      
      // Generate filename from first heading or use default
      const firstHeading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
      const filename = (firstHeading || 'document').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);

      saveAs(blob, `${filename}.docx`);
    } catch (error) {
      console.error('DOCX export failed:', error);
      alert('Failed to export DOCX. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Parse markdown text and convert to docx elements
  const parseMarkdownToDocx = (md: string): (Paragraph | Table)[] => {
    const elements: (Paragraph | Table)[] = [];
    const lines = md.split('\n');
    let i = 0;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    while (i < lines.length) {
      const line = lines[i];

      // Code block handling
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: codeBlockContent.join('\n'),
                  font: 'Consolas',
                  size: 20, // 10pt
                }),
              ],
              shading: { fill: 'f3f4f6' },
              spacing: { before: 200, after: 200 },
            })
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Flush table if any
          if (inTable && tableRows.length > 0) {
            elements.push(createTable(tableRows));
            tableRows = [];
            inTable = false;
          }
          inCodeBlock = true;
        }
        i++;
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        i++;
        continue;
      }

      // Table handling
      if (line.includes('|') && line.trim().startsWith('|')) {
        const cells = line.split('|').filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1).map(c => c.trim());
        
        // Skip separator row
        if (cells.every(c => /^[-:]+$/.test(c))) {
          i++;
          continue;
        }

        if (!inTable) {
          inTable = true;
        }
        tableRows.push(cells);
        i++;
        continue;
      } else if (inTable) {
        // End of table
        if (tableRows.length > 0) {
          elements.push(createTable(tableRows));
        }
        tableRows = [];
        inTable = false;
      }

      // Empty line
      if (line.trim() === '') {
        elements.push(new Paragraph({ children: [] }));
        i++;
        continue;
      }

      // Headings - check from most specific (######) to least specific (#)
      const trimmedLine = line.trim();
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      
      if (headingMatch) {
        const hashCount = headingMatch[1].length;
        const headingText = headingMatch[2];
        const headingLevels: { [key: number]: (typeof HeadingLevel)[keyof typeof HeadingLevel] } = {
          1: HeadingLevel.HEADING_1,
          2: HeadingLevel.HEADING_2,
          3: HeadingLevel.HEADING_3,
          4: HeadingLevel.HEADING_4,
          5: HeadingLevel.HEADING_5,
          6: HeadingLevel.HEADING_6,
        };
        elements.push(createHeading(headingText, headingLevels[hashCount]));
        i++;
        continue;
      }

      // Horizontal rule
      if (/^[-*_]{3,}$/.test(line.trim())) {
        elements.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'cccccc' },
            },
            spacing: { before: 200, after: 200 },
          })
        );
        i++;
        continue;
      }

      // Blockquote
      if (line.startsWith('>')) {
        const quoteText = line.replace(/^>\s*/, '');
        elements.push(
          new Paragraph({
            children: parseInlineFormatting(quoteText),
            indent: { left: 720 }, // 0.5 inch
            border: {
              left: { style: BorderStyle.SINGLE, size: 24, color: 'cccccc' },
            },
            spacing: { before: 100, after: 100 },
          })
        );
        i++;
        continue;
      }

      // Unordered list
      if (/^[-*+]\s+/.test(line)) {
        const listText = line.replace(/^[-*+]\s+/, '');
        elements.push(
          new Paragraph({
            children: parseInlineFormatting(listText),
            bullet: { level: 0 },
            spacing: { before: 60, after: 60 },
          })
        );
        i++;
        continue;
      }

      // Ordered list
      if (/^\d+\.\s+/.test(line)) {
        const listText = line.replace(/^\d+\.\s+/, '');
        elements.push(
          new Paragraph({
            children: parseInlineFormatting(listText),
            numbering: { reference: 'default-numbering', level: 0 },
            spacing: { before: 60, after: 60 },
          })
        );
        i++;
        continue;
      }

      // Regular paragraph (fallback)
      elements.push(
        new Paragraph({
          children: parseInlineFormatting(line),
          spacing: { before: 100, after: 100 },
        })
      );

      i++;
    }

    // Handle unclosed code block
    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeBlockContent.join('\n'),
              font: 'Consolas',
              size: 20,
            }),
          ],
          shading: { fill: 'f3f4f6' },
        })
      );
    }

    // Handle unclosed table
    if (inTable && tableRows.length > 0) {
      elements.push(createTable(tableRows));
    }

    return elements;
  };

  // Create heading paragraph
  const createHeading = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]): Paragraph => {
    return new Paragraph({
      children: parseInlineFormatting(text),
      heading: level,
      spacing: { before: 240, after: 120 },
    });
  };

  // Create table - with explicit columnWidths grid for Google Docs compatibility
  const createTable = (rows: string[][]): Table => {
    const maxCols = Math.max(...rows.map(r => r.length));
    
    // Explicit column widths - 9360 twips total (6.5 inches)
    // This creates the tblGrid element that Google Docs needs
    const colWidth = Math.floor(9360 / maxCols);
    const columnWidths = new Array(maxCols).fill(colWidth);
    
    return new Table({
      columnWidths: columnWidths,
      rows: rows.map((row, rowIndex) =>
        new TableRow({
          children: Array.from({ length: maxCols }, (_, colIndex) => {
            const text = row[colIndex]?.trim() || '';
            return new TableCell({
              children: [
                new Paragraph({ 
                  children: [
                    new TextRun({ 
                      text: text || ' ', 
                      bold: rowIndex === 0 
                    })
                  ] 
                })
              ],
            });
          }),
        })
      ),
    });
  };

  // Parse inline formatting (bold, italic, code, links)
  const parseInlineFormatting = (text: string): (TextRun | ExternalHyperlink)[] => {
    const runs: (TextRun | ExternalHyperlink)[] = [];

    // Combined regex to find all special patterns
    const combinedRegex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    
    let match;
    let segments: { text: string; bold?: boolean; italics?: boolean; code?: boolean; link?: string }[] = [];
    let currentIndex = 0;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > currentIndex) {
        segments.push({ text: text.slice(currentIndex, match.index) });
      }

      const fullMatch = match[0];

      if (fullMatch.startsWith('***')) {
        segments.push({ text: match[2], bold: true, italics: true });
      } else if (fullMatch.startsWith('**')) {
        segments.push({ text: match[3], bold: true });
      } else if (fullMatch.startsWith('*')) {
        segments.push({ text: match[4], italics: true });
      } else if (fullMatch.startsWith('__')) {
        segments.push({ text: match[5], bold: true });
      } else if (fullMatch.startsWith('_')) {
        segments.push({ text: match[6], italics: true });
      } else if (fullMatch.startsWith('`')) {
        segments.push({ text: match[7], code: true });
      } else if (fullMatch.startsWith('[')) {
        segments.push({ text: match[8], link: match[9] });
      }

      currentIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      segments.push({ text: text.slice(currentIndex) });
    }

    // Convert segments to TextRuns
    for (const segment of segments) {
      if (segment.link) {
        runs.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: segment.text,
                color: '2563eb',
                underline: {},
              }),
            ],
            link: segment.link,
          })
        );
      } else {
        runs.push(
          new TextRun({
            text: segment.text,
            bold: segment.bold,
            italics: segment.italics,
            font: segment.code ? 'Consolas' : 'Calibri',
            size: segment.code ? 20 : 22, // 10pt for code, 11pt for text
            shading: segment.code ? { fill: 'f3f4f6' } : undefined,
          })
        );
      }
    }

    // If no segments, return plain text
    if (runs.length === 0) {
      runs.push(new TextRun({ text, size: 22 }));
    }

    return runs;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Bot detection warning banner */}
      {botWarning && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Automated browser detected. Some features may be restricted.</span>
          <button
            onClick={() => setBotWarning(false)}
            className="ml-2 underline font-semibold hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary p-1.5 sm:p-2 rounded-lg text-primary-foreground">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight">MarkPDF Pro</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden xs:block">Markdown to PDF/DOCX Converter</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 rounded-full shadow-sm h-8 sm:h-9 px-2.5 sm:px-4"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </Button>
            <Button
              onClick={handleExportDocx}
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 rounded-full shadow-sm h-8 sm:h-9 px-2.5 sm:px-4"
              title="Download as Word Document"
              disabled={isExporting}
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'DOCX'}</span>
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 rounded-full shadow-sm h-8 sm:h-9 px-2.5 sm:px-4"
              title="Print or Save as PDF via Browser"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-full mx-auto w-full p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-6rem)] lg:h-[calc(100vh-8rem)]">
          <div className="h-full min-h-[250px] sm:min-h-[350px] lg:min-h-[500px]">
            <MarkdownInput
              value={markdown}
              onChange={handleMarkdownChange}
              saveStatus={saveStatus}
            />
          </div>

          <div className="h-full min-h-[250px] sm:min-h-[350px] lg:min-h-[500px]">
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