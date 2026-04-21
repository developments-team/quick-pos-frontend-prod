import React from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

interface ChipSelectorProps {
  options: { label: string; value: string; icon?: React.ReactNode }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  className?: string;
}

export function ChipSelector({
  options,
  value,
  onChange,
  multiple = false,
  className,
}: ChipSelectorProps) {
  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors border cursor-pointer outline-none",
              selected
                ? "border-(--primary) ring-1 ring-inset ring-(--primary) bg-(--primary)/5 text-(--text-primary)"
                : "border-(--text-muted)/70 hover:bg-(--primary)/3 hover:border-(--text-muted) focus:bg-(--primary)/3" // focus:border-(--text-muted)"
            )}
          >
            {/* {option.icon} */}
            {option.label}
            {isSelected(option.value) && (
              <Check className="w-4 h-4 animate-scale-in" />
            )}
          </button>
        );
      })}
    </div>
  );
}
