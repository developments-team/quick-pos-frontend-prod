import React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-10 w-full rounded-md border border-(--border) bg-(--input-bg) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary) focus:border-(--primary)",
          // Fix: When focused, hover should NOT change the border (unless error)
          !hasError &&
            "hover:border-(--text-muted) focus:hover:border-(--primary)",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-(--bg-item) disabled:text-(--text-muted) disabled:hover:border-(--border) disabled:focus:border-(--border) disabled:focus:ring-0",
          hasError &&
            "border-red-500 focus:border-red-500 focus-visible:ring-red-500 hover:border-red-500 focus:hover:border-red-500",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
