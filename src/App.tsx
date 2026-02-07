import React, { useState, useRef, useEffect } from 'react';
import MarkdownInput from './components/MarkdownInput';
import DocumentPreview from './components/DocumentPreview';
import { DEFAULT_MARKDOWN } from './constants';
import { Button } from "@/components/ui/button";
import { Printer, FileText, FileDown, Sun, Moon } from "lucide-react";
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

const App = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

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

  const handleExportDocx = async () => {
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
    
    // Regex patterns for inline formatting
    const patterns = [
      { regex: /\*\*\*(.+?)\*\*\*/g, bold: true, italics: true },
      { regex: /\*\*(.+?)\*\*/g, bold: true, italics: false },
      { regex: /\*(.+?)\*/g, bold: false, italics: true },
      { regex: /__(.+?)__/g, bold: true, italics: false },
      { regex: /_(.+?)_/g, bold: false, italics: true },
      { regex: /`(.+?)`/g, code: true },
      { regex: /\[(.+?)\]\((.+?)\)/g, link: true },
    ];

    // Simple approach: process text sequentially
    let remaining = text;
    let lastIndex = 0;

    // Combined regex to find all special patterns
    const combinedRegex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    
    let match;
    let processedText = '';
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
              onChange={setMarkdown}
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