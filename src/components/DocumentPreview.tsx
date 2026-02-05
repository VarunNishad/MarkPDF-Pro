import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface DocumentPreviewProps {
  content: string;
}

// Custom components to map Markdown to Tailwind classes for a "Document" look
// We add 'break-inside-avoid' to elements that should not be split across pages.
// This works in conjunction with html2pdf's { pagebreak: { mode: 'css' } } option.
const MarkdownComponents: object = {
  h1: ({ node, ...props }: any) => <h1 className="text-4xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 break-inside-avoid" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4 break-inside-avoid" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 break-inside-avoid" {...props} />,
  h4: ({ node, ...props }: any) => <h4 className="text-lg font-semibold text-gray-700 mt-4 mb-2 break-inside-avoid" {...props} />,

  // Paragraphs should generally stay together to avoid orphans/widows
  p: ({ node, ...props }: any) => <p className="text-gray-700 leading-7 mb-4 break-inside-avoid" {...props} />,

  ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-700" {...props} />,
  // List items should stay together
  li: ({ node, ...props }: any) => <li className="pl-1 break-inside-avoid" {...props} />,

  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-6 bg-blue-50 text-gray-700 italic rounded-r break-inside-avoid" {...props} />
  ),

  code: ({ node, inline, className, children, ...props }: any) => {
    return inline ? (
      <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200" {...props}>
        {children}
      </code>
    ) : (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 text-sm font-mono leading-relaxed shadow-sm break-inside-avoid">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },

  // Table: Allow the table container to break (so the table can span pages)
  table: ({ node, ...props }: any) => (
    <div className="mb-6 border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => <thead className="bg-gray-50 font-semibold text-gray-700" {...props} />,
  // Row: CRITICAL - prevent rows from splitting in half
  tr: ({ node, ...props }: any) => <tr className="break-inside-avoid" {...props} />,
  th: ({ node, ...props }: any) => <th className="px-4 py-3 border-b border-gray-200" {...props} />,
  td: ({ node, ...props }: any) => <td className="px-4 py-3 border-b border-gray-100 text-gray-600" {...props} />,

  hr: ({ node, ...props }: any) => <hr className="my-8 border-gray-200" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2" {...props} />,
  img: ({ node, ...props }: any) => <img className="max-w-full h-auto rounded-lg shadow-md my-6 mx-auto break-inside-avoid" {...props} />,
};

const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(({ content }, ref) => {
  return (
    <Card className="h-full flex flex-col border-border shadow-sm bg-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4 bg-background border-b border-border">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Live Preview
        </CardTitle>
        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
          Rendered
        </span>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
        {/* The actual A4-like page container */}
        <div
          ref={ref}
          className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] mx-auto box-border"
          id="document-preview-content"
        >
          <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DocumentPreview.displayName = 'DocumentPreview';

export default DocumentPreview;