import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileCode, Upload } from "lucide-react";

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(content);
      }
    };
    reader.readAsText(file);

    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="h-full flex flex-col border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-4">
        <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
          <FileCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Markdown</span> Source
        </CardTitle>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md,.markdown,.txt"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            className="h-7 sm:h-8 gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3"
          >
            <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden xs:inline">Import</span>
            <span className="xs:hidden">Import</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        <Textarea
          className="h-full w-full resize-none border-0 focus-visible:ring-0 rounded-none p-3 sm:p-4 font-mono text-xs sm:text-sm leading-relaxed"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your markdown here or import a file..."
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
};

export default MarkdownInput;