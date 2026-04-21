import React, { useRef, useState } from "react";
import { X, UploadCloud } from "lucide-react";
import { cn } from "../../lib/utils";

interface ImageChooserProps {
  id?: string;
  onChange?: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
  hasError?: boolean;
  changeable?: boolean;
  onBlur?: (e: React.FocusEvent) => void;
}

export function ImageChooser({
  id,
  onChange,
  previewUrl: initialPreviewUrl,
  className,
  hasError,
  changeable = true,
  onBlur,
}: ImageChooserProps) {
  const [preview, setPreview] = useState<string | null>(
    initialPreviewUrl || null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange?.(file);
    } else {
      setPreview(null);
      onChange?.(null);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange?.(null);
  };

  return (
    <div
      className={cn(
        "relative group flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed transition-all duration-200 overflow-hidden focus-visible:outline-none",
        !preview && "cursor-pointer",
        preview && changeable && "cursor-pointer",
        isDragging
          ? "border-(--primary) bg-(--primary)/5 ring-1 ring-(--primary)"
          : cn(
              "border-(--border) bg-(--bg-card)",
              !hasError &&
                "hover:border-(--text-muted) focus-within:hover:border-(--primary) focus-within:hover:bg-(--bg-card)",
            ),
        "focus-within:border-(--primary) focus-within:ring-1 focus-within:ring-(--primary)",
        hasError &&
          "border-red-500 focus-within:border-red-500 focus-within:ring-red-500 hover:border-red-500",
        className,
      )}
      onClick={() =>
        !changeable && preview ? null : inputRef.current?.click()
      }
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onBlur?.(e);
        }
      }}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className={cn(
              "absolute inset-0 bg-black/40 opacity-0 transition-opacity flex items-center justify-center",
              changeable && "group-hover:opacity-100",
            )}
          >
            {changeable && (
              <p className={cn("text-white font-medium")}>Change Image</p>
            )}
          </div>
          <button
            onClick={handleClear}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors",
              // !changeable && "cursor-pointer",
              "cursor-pointer",
            )}
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center text-(--text-secondary) w-full h-full text-center",
            isSmallHeight(className) ? "p-1 gap-1" : "gap-3",
          )}
        >
          <div
            className={cn(isSmallHeight(className) ? "" : "p-3 rounded-full")}
          >
            <UploadCloud size={24} />
          </div>
          <div
            className={cn(
              "flex flex-col",
              isSmallHeight(className) ? "gap-0.5" : "gap-1",
            )}
          >
            <p
              className={cn(
                "font-medium text-(--text-primary)",
                isSmallHeight(className) ? "text-sm leading-tight" : "text-sm",
              )}
            >
              {/* {isSmallHeight(className)
                ? "Click to upload"
                : "Click to upload or drag and drop"} */}
              Click to upload or drag and drop
            </p>
            <p
              className={cn(
                isSmallHeight(className)
                  ? "text-xs leading-tight opacity-80"
                  : "text-xs",
              )}
            >
              SVG, PNG, JPG or GIF
            </p>
          </div>
        </div>
      )}

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}

// Helper to detect if a class string implies a small height
function isSmallHeight(className?: string) {
  if (!className) return false;
  // Check for specific small height classes (h-20... up to h-40)
  return (
    /\bh-(20|24|28|32|34|36|40)\b/.test(className) ||
    /\bh-\[([1-9][0-9]?px)\]/.test(className)
  );
}
