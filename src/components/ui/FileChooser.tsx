import React, { useRef, useState, useEffect } from "react";
import { Upload, File, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { createPortal } from "react-dom";

interface FileChooserProps {
  accept?: string;
  onChange?: (file: File | null) => void;
  label?: string;
  className?: string;
  hasError?: boolean;
  isMini?: boolean;
}

export function FileChooser({
  accept,
  onChange,
  label = "Choose file",
  className,
  hasError,
  isMini = false,
}: FileChooserProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cleanup preview URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Update tooltip position when hovering
  useEffect(() => {
    if (isHovering && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isHovering]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);

      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }

      onChange?.(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange?.(null);
  };

  const isImage = accept?.includes("image");

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={cn(
          "relative flex items-center justify-between h-10 px-3 rounded-md border",
          "bg-(--input-bg) border-(--border)",
          "transition-all duration-200 cursor-pointer focus-visible:outline-none",
          !hasError &&
            "hover:border-(--text-muted) focus-within:hover:border-(--primary)",
          "focus-within:border-(--primary) focus-within:ring-1 focus-within:ring-(--primary)",
          hasError &&
            "border-red-500 focus-within:border-red-500 focus-within:ring-red-500 hover:border-red-500"
        )}
        onClick={() => inputRef.current?.click()}
        tabIndex={0}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center justify-center h-6 w-6 rounded text-(--text-secondary)">
            <File size={14} />
          </div>
          <span
            className={cn(
              "text-sm truncate",
              fileName ? "text-(--text-primary)" : "text-(--text-muted)"
            )}
          >
            {fileName || label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {fileName && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-(--text-secondary) hover:text-(--text-primary)"
              onClick={handleClear}
            >
              <X size={14} />
            </Button>
          )}
          {(!isMini || (isMini && !fileName)) && (
            <div className="text-(--text-muted)">
              <Upload size={16} />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Image Preview Tooltip - rendered via portal with fixed positioning */}
      {isHovering &&
        previewUrl &&
        isImage &&
        createPortal(
          <div
            className="fixed z-9999 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
          >
            <div className="bg-(--bg-card) border border-(--border) rounded-lg shadow-lg p-0.5 max-w-48">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full rounded object-contain"
              />
              <p className="text-xs mt-1 truncate py-0.5 px-1">{fileName}</p>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
