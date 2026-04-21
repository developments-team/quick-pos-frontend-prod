/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

export interface SearchableTextboxOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
  badge?: string;
}

interface SearchableTextboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  options: SearchableTextboxOption[];
  value?: string;
  onChange: (value: string) => void;
  onSelectOption?: (option: SearchableTextboxOption) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  showBadges?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  inputClassName?: string;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  leftAddonClassName?: string;
  rightAddonClassName?: string;
  hasError?: boolean;
}

export function SearchableTextbox({
  options,
  value,
  onChange,
  onSelectOption,
  placeholder = "Type to search...",
  disabled = false,
  className,
  allowClear = true,
  showBadges = false,
  loading = false,
  emptyMessage = "No result found",
  inputClassName,
  containerClassName,
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  leftAddonClassName,
  rightAddonClassName,
  hasError,
  ...props
}: SearchableTextboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize search query from value if exists
  useEffect(() => {
    if (value && !open) {
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption && searchQuery !== selectedOption.label) {
        setSearchQuery(selectedOption.label);
      }
    } else if (!value && !open) {
      if (searchQuery !== "") setSearchQuery("");
    }
  }, [value, open, options, searchQuery]);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group options by category if categories exist
  const categorizedOptions = filteredOptions.reduce(
    (acc, option) => {
      const category = option.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(option);
      return acc;
    },
    {} as Record<string, SearchableTextboxOption[]>,
  );

  const hasCategories = options.some((opt) => opt.category);

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const { bottom, left, width } = rect;

      let top = bottom + 4;
      let leftPos = left;

      // Adjust if trapped in a transformed ancestor (check offsetParent of the dropdown if rendered)
      if (dropdownRef.current) {
        const offsetParent = dropdownRef.current.offsetParent as HTMLElement;
        if (
          offsetParent &&
          offsetParent.tagName !== "BODY" &&
          offsetParent.tagName !== "HTML"
        ) {
          const parentRect = offsetParent.getBoundingClientRect();
          top = bottom - parentRect.top + 4;
          leftPos = left - parentRect.left;
        }
      }

      setDropdownStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${leftPos}px`,
        width: `${width}px`,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        // Reset query to selected value label on close
        const selectedOption = options.find((opt) => opt.value === value);
        setSearchQuery(selectedOption ? selectedOption.label : "");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
      if (allowClear) {
        onChange(""); // Clear value if input is cleared
      }
    }
  };

  const handleOptionSelect = (option: SearchableTextboxOption) => {
    onChange(option.value);
    if (onSelectOption) onSelectOption(option);
    setSearchQuery(option.label);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative w-full group", className)}>
      <div className={cn("relative flex items-center", containerClassName)}>
        {leftAddon && (
          <div
            className={cn(
              "flex items-center justify-center border border-(--border) bg-(--bg-card) h-10 rounded-l-md text-sm text-(--text-secondary) whitespace-nowrap z-10 transition-all duration-200",
              "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)",
              !hasError &&
                "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",
              leftAddonClassName,
            )}
          >
            {leftAddon}
          </div>
        )}

        <div className="relative flex-1">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "h-10 w-full border border-(--border) bg-(--input-bg) px-3 text-sm text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-muted)",
              "focus:border-(--primary) focus:ring-1 focus:ring-(--primary)",
              "hover:border-(--text-muted) focus:hover:border-(--primary)",
              "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)", // Addon focus state support
              !hasError &&
                "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",
              !leftAddon && !rightAddon && "rounded-md",
              leftAddon && !rightAddon && "rounded-r-md border-l-0",
              !leftAddon && rightAddon && "rounded-l-md border-r-0",
              leftAddon && rightAddon && "border-x-0",
              leftIcon ? "pl-10" : "",
              rightIcon || (allowClear && value) || loading ? "pr-10" : "",
              disabled && "cursor-not-allowed opacity-50",
              inputClassName,
            )}
            autoComplete="off"
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading ? (
              <Spinner variant="gradient-ring" size="sm" color="standard" />
            ) : (
              <>
                {allowClear && value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-(--text-secondary) hover:text-(--text-primary) transition-colors p-0.5"
                  >
                    <X size={14} />
                  </button>
                )}
                {rightIcon}
              </>
            )}
          </div>
        </div>

        {rightAddon && (
          <div
            className={cn(
              "flex items-center justify-center border border-(--border) bg-(--bg-card) h-10 rounded-r-md text-sm text-(--text-secondary) whitespace-nowrap z-10 transition-all duration-200",
              "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)",
              !hasError &&
                "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",
              rightAddonClassName,
            )}
          >
            {rightAddon}
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={cn(
            "fixed overflow-hidden rounded-md border border-(--border)",
            "bg-(--bg-card) shadow-lg",
            "z-9999",
            "mt-1",
          )}
        >
          <div className="max-h-[200px] overflow-y-auto overflow-x-hidden custom-scrollbar outline-none text-(--text-primary)">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center">
                <p className="text-sm text-(--text-primary)">{emptyMessage}</p>
              </div>
            ) : hasCategories ? (
              Object.entries(categorizedOptions).map(
                ([category, categoryOptions]) => (
                  <div key={category} className="py-1">
                    <div className="px-3 py-1.5 text-xs font-semibold text-(--text-primary) uppercase">
                      {category}
                    </div>
                    <div>
                      {categoryOptions.map((option) => (
                        <OptionItem
                          key={option.value}
                          option={option}
                          isSelected={option.value === value}
                          onSelect={() => handleOptionSelect(option)}
                          showBadges={showBadges}
                        />
                      ))}
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <OptionItem
                    key={option.value}
                    option={option}
                    isSelected={option.value === value}
                    onSelect={() => handleOptionSelect(option)}
                    showBadges={showBadges}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionItem({
  option,
  isSelected,
  onSelect,
  showBadges,
}: {
  option: SearchableTextboxOption;
  isSelected: boolean;
  onSelect: () => void;
  showBadges: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex select-none items-center px-3 py-2 text-sm cursor-pointer",
        isSelected
          ? "bg-(--primary) text-(--primary-foreground)"
          : "hover:bg-(--primary)/10 text-(--text-primary)",
      )}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        onSelect();
      }}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate">{option.label}</span>
            {showBadges && option.badge && (
              <span className="px-1.5 py-0.5 text-xs rounded bg-(--primary)/10 text-(--primary)">
                {option.badge}
              </span>
            )}
          </div>
          {option.description && (
            <p
              className={cn(
                "text-xs mt-0.5 truncate",
                isSelected
                  ? "text-(--primary-foreground)/80"
                  : "text-(--text-secondary)",
              )}
            >
              {option.description}
            </p>
          )}
        </div>
        {isSelected && (
          <Check
            strokeWidth={3}
            className="h-4 w-5 text-(--primary-foreground) shrink-0"
          />
        )}
      </div>
    </div>
  );
}
