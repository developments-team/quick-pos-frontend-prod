import React from "react";
import { cn } from "../../lib/utils";

export interface SelectionOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectionGridProps {
  options: SelectionOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  columns?: number;
  variant?: "xs" | "sm" | "md" | "lg";
}

export function SelectionGrid({
  options,
  value,
  onChange,
  className,
  columns = 3,
  variant = "md",
}: SelectionGridProps) {
  const sizeClasses = {
    xs: "p-1 text-sm gap-1",
    sm: "p-2 text-sm gap-1",
    md: "p-2.5 text-sm gap-1",
    lg: "p-4 text-base gap-2",
  };

  return (
    <div
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-start justify-center rounded-md border transition-all outline-none cursor-pointer",
            sizeClasses[variant],
            value === option.value
              ? "border-(--primary) ring-1 ring-inset ring-(--primary) bg-(--primary)/5 text-(--text-primary)"
              : "border-(--border) hover:border-(--text-muted) text-(--text-muted) hover:text-(--text-primary)"
          )}
        >
          {option.icon}
          <span className="truncate">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
