import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, icon, children, hasError, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={cn(
            "h-10 w-full appearance-none rounded-md border border-(--border) bg-(--input-bg) px-3 py-2 text-sm text-(--text-primary)",
            "transition-all duration-200",
            "focus:border-(--primary)", // Border color changes ONLY on focus
            "focus:ring-1 focus:ring-(--primary) focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-(--bg-item) disabled:text-(--text-muted) disabled:hover:border-(--border) disabled:focus:border-(--border) disabled:focus:ring-0",
            // Fix: When focused, hover should NOT change the border (unless error)
            !hasError &&
              "hover:border-(--text-muted) focus:hover:border-(--primary)",
            hasError &&
              "border-red-500 focus:border-red-500 focus:ring-red-500 hover:border-red-500 focus:hover:border-red-500",
            icon ? "pl-10" : "",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none text-(--text-muted)" />
      </div>
    );
  },
);
Select.displayName = "Select";
