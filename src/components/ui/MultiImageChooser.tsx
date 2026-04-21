import React, { useRef, useState, useEffect } from "react";
import { X, UploadCloud, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface MultiImageChooserProps {
  onChange?: (files: File[]) => void;
  defaultPreviews?: string[];
  maxImages?: number;
  className?: string;
  gridClassName?: string;
  getFileStatus?: (
    file: File
  ) => { status: "valid" | "invalid" | "pending"; label?: string } | null;
}

export function MultiImageChooser({
  onChange,
  defaultPreviews = [],
  maxImages,
  className,
  gridClassName,
  getFileStatus,
}: MultiImageChooserProps) {
  // State for managing images
  const [items, setItems] = useState<
    { id: string; preview: string; file?: File; size?: number; name?: string }[]
  >(() =>
    defaultPreviews.map((url) => ({
      id: Math.random().toString(36).substr(2, 9),
      preview: url,
      name: "Existing Image",
    }))
  );

  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep track of items for cleanup
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.file && item.preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []); // Cleanup on unmount

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const triggerOnChange = (currentItems: typeof items) => {
    const filesOnly = currentItems
      .map((item) => item.file)
      .filter((f): f is File => !!f);
    onChange?.(filesOnly);
  };

  const handleFileChange = (fileList: FileList | null) => {
    if (!fileList) return;

    const newItems: typeof items = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      if (!file.type.startsWith("image/")) continue;
      if (maxImages && items.length + newItems.length >= maxImages) break;

      newItems.push({
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(file),
        file: file,
        size: file.size,
        name: file.name,
      });
    }

    if (newItems.length > 0) {
      const updatedItems = [...items, ...newItems];
      setItems(updatedItems);
      triggerOnChange(updatedItems);
    }
  };

  const handleRemove = (id: string) => {
    const itemToRemove = items.find((i) => i.id === id);
    if (itemToRemove && itemToRemove.file) {
      URL.revokeObjectURL(itemToRemove.preview);
    }

    const updatedItems = items.filter((i) => i.id !== id);
    setItems(updatedItems);
    triggerOnChange(updatedItems);
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
    handleFileChange(e.dataTransfer.files);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    items.forEach((item) => {
      if (item.file && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setItems([]);
    triggerOnChange([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative min-h-[200px] w-full rounded-lg border-2 border-dashed p-4 transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-(--primary) bg-(--primary)/5 ring-1 ring-(--primary)"
            : "border-(--border) bg-(--bg-card) hover:border-(--text-muted)",
          "focus-within:border-(--primary) focus-within:ring-1 focus-within:ring-(--primary)"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFileChange(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />

        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="absolute top-0 right-0 z-10 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-colors backdrop-blur-sm"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        )}

        {items.length === 0 ? (
          // Empty State
          <div className="flex h-40 flex-col items-center justify-center">
            <div className="p-3 rounded-full bg-(--bg-subtle) mb-3">
              <UploadCloud size={24} className="text-(--text-secondary)" />
            </div>
            <p className="text-sm font-medium text-(--text-primary)">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-(--text-secondary) mt-1">
              {maxImages
                ? `Up to ${maxImages} images`
                : "Multiple images allowed"}
            </p>
          </div>
        ) : (
          // Grid with Images
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4",
              gridClassName
            )}
          >
            {items.map((item) => {
              const statusInfo =
                item.file && getFileStatus ? getFileStatus(item.file) : null;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex flex-col rounded-md border bg-(--bg-subtle) overflow-hidden cursor-default transition-all duration-200",
                    statusInfo?.status === "invalid"
                      ? "border-red-500/50"
                      : "border-(--border)"
                  )}
                  onClick={(e) => e.stopPropagation()} // Prevent click from triggering upload
                >
                  {/* Image Preview */}
                  <div className="relative h-32 w-full overflow-hidden bg-white/5">
                    <img
                      src={item.preview}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Status Overlay */}
                    {statusInfo && (
                      <div
                        className={cn(
                          "absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md z-10",
                          statusInfo.status === "valid"
                            ? "bg-green-500/90"
                            : statusInfo.status === "invalid"
                            ? "bg-red-500/90"
                            : "bg-blue-500/90"
                        )}
                      >
                        {statusInfo.label || statusInfo.status}
                      </div>
                    )}

                    {/* Overlay Remove Button */}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20 flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                        className="rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 transition-all cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* File Info */}
                  <div
                    className={cn(
                      "flex flex-col gap-0.5 p-2 text-xs border-t",
                      statusInfo?.status === "invalid"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-(--border)"
                    )}
                  >
                    <span
                      className="font-medium text-(--text-primary) line-clamp-1 break-all"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-(--text-secondary)">
                      {item.size ? formatSize(item.size) : "Unknown size"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
