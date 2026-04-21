import { cn } from "../../lib/utils";
import { useRef, useState, useEffect } from "react";

interface TabOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "default" | "primary";
}

export function Tab({
  options,
  value,
  onChange,
  className,
  variant = "default",
}: TabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selectedIndex = options.findIndex((opt) => opt.value === value);
    const buttons = container.querySelectorAll("button");
    const selectedButton = buttons[selectedIndex];

    if (selectedButton) {
      setIndicatorStyle({
        left: selectedButton.offsetLeft,
        width: selectedButton.offsetWidth,
      });
    }
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex rounded-xl p-1 overflow-x-auto scrollbar-hide",
        variant === "default" && "bg-(--secondary)/20",
        variant === "primary" && "bg-(--secondary)/20",
        className
      )}
    >
      {/* Sliding indicator */}
      <div
        className={cn(
          "absolute top-1 h-[calc(100%-8px)] rounded-lg shadow-sm transition-all duration-300 ease-out",
          variant === "default" && "bg-(--bg-card)",
          variant === "primary" && "bg-(--primary) shadow-md"
        )}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />

      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "relative z-10 px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors duration-200 cursor-pointer whitespace-nowrap",
              variant === "default" &&
                (isSelected
                  ? "text-(--text-primary)"
                  : "hover:text-(--text-primary)"),
              variant === "primary" &&
                (isSelected ? "text-white" : "hover:text-(--text-primary)")
            )}
            onClick={() => onChange(option.value)}
          >
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
