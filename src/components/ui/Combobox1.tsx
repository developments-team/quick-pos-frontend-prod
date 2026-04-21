/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
  badge?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | string[];
  onChange: (value: any) => void; // Using any to avoid complex type issues in usage, but internally handled
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  showBadges?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  multiple?: boolean;
  searchable?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  disabled = false,
  className,
  allowClear = true,
  showBadges = false,
  loading = false,
  emptyMessage = "No options found",
  multiple = false,
  searchable = true,
  leftAddon,
  rightAddon,
  leftAddonClassName,
  rightAddonClassName,
  hasError,
}: ComboboxProps & {
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  leftAddonClassName?: string;
  rightAddonClassName?: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );
  const selectedOption = !multiple
    ? options.find((option) =>
        Array.isArray(value)
          ? option.value === value[value.length - 1]
          : option.value === value
      )
    : null;

  // Group options by category if categories exist
  const categorizedOptions = filteredOptions.reduce((acc, option) => {
    const category = option.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(option);
    return acc;
  }, {} as Record<string, ComboboxOption[]>);

  const hasCategories = options.some((opt) => opt.category);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      // Only set focus if not already focused to avoid resetting cursor position during typing
      if (document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        // Set cursor to the start
        inputRef.current.setSelectionRange(0, 0);
      }
    }
  }, [open]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!multiple && Array.isArray(value)) {
      onChange(value.slice(0, -1));
    } else {
      onChange(multiple ? [] : "");
    }
    setSearchQuery("");
    // Maintain focus after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    } else {
      containerRef.current
        ?.querySelector<HTMLDivElement>('[tabindex="0"]')
        ?.focus();
    }
  };

  const handleControlClick = () => {
    if (disabled) return;
    if (open) {
      setSearchQuery("");
    }
    setOpen(!open);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    // Don't prevent default space if typing in input
    if (e.target === inputRef.current && e.key === " ") return;

    if ((e.key === "Enter" || e.key === " ") && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const renderOption = (option: ComboboxOption) => {
    const isSelected = selectedValues.includes(option.value);

    return (
      <div
        key={option.value}
        className={cn(
          "relative flex select-none items-center px-3 py-2 text-sm",
          isSelected
            ? "bg-(--primary) text-(--primary-foreground)"
            : "hover:bg-(--primary)/10"
        )}
        onClick={() => {
          if (multiple) {
            const newValues = isSelected
              ? selectedValues.filter((v) => v !== option.value)
              : [...selectedValues, option.value];
            onChange(newValues);
            // Keep open for multiple selection
            inputRef.current?.focus();
          } else {
            onChange(option.value);
            setOpen(false);
            setSearchQuery("");
            // Maintain focus after selection
            if (inputRef.current) {
              inputRef.current.focus();
            } else {
              containerRef.current
                ?.querySelector<HTMLDivElement>('[tabindex="0"]')
                ?.focus();
            }
          }
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
              <p className="text-xs text-(--text-secondary) mt-0.5 truncate">
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
  };

  return (
    <div
      ref={containerRef}
      onBlur={(e) => {
        if (
          e.relatedTarget &&
          containerRef.current &&
          !containerRef.current.contains(e.relatedTarget as Node)
        ) {
          setOpen(false);
          setSearchQuery("");
        }
      }}
      className={cn("relative flex items-center w-full group", className)}
    >
      {leftAddon && (
        <div
          className={cn(
            "flex items-center justify-center border border-(--border) bg-(--bg-card) h-10 rounded-l-md text-sm text-(--text-secondary) whitespace-nowrap z-10 transition-all duration-200",
            "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)",
            !open &&
              !hasError &&
              "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",
            open && "border-(--primary) ring-1 ring-(--primary)",
            hasError &&
              "border-red-500 group-focus-within:border-red-500 group-focus-within:ring-red-500 group-hover:border-red-500",
            hasError && open && "border-red-500",
            leftAddonClassName
          )}
        >
          {leftAddon}
        </div>
      )}
      <div className="relative flex-1">
        {/* Control */}
        <div
          className={cn(
            "flex items-center justify-between px-3 py-1.5 h-10",
            "border border-(--border) bg-(--input-bg) transition-all duration-200 focus-visible:outline-none",
            // Rounded corners logic
            !leftAddon && !rightAddon && "rounded-md",
            leftAddon && !rightAddon && "rounded-r-md border-l-0",
            !leftAddon && rightAddon && "rounded-l-md border-r-0",
            leftAddon && rightAddon && "border-x-0",

            // Focus and State styles
            "cursor-default",
            disabled && "cursor-not-allowed opacity-50",

            "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)",
            open && "border-(--primary) ring-1 ring-(--primary)",

            !open &&
              !hasError &&
              "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",

            hasError &&
              "border-red-500 group-focus-within:border-red-500 group-focus-within:ring-red-500 group-hover:border-red-500",
            hasError && open && "border-red-500"
          )}
          onClick={handleControlClick}
          tabIndex={disabled || searchable ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {searchable ? (
              <div className="relative flex flex-wrap items-center flex-1 min-w-0 cursor-default gap-1">
                {multiple &&
                  selectedOptions.length > 0 &&
                  selectedOptions.map((opt) => (
                    <span
                      key={opt.value}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-(--primary)/10 text-(--primary) text-xs"
                    >
                      {opt.label}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-(--primary)/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(
                            selectedValues.filter((v) => v !== opt.value)
                          );
                          inputRef.current?.focus();
                        }}
                      />
                    </span>
                  ))}
                {!searchQuery && !multiple && (
                  <span
                    className={cn(
                      "absolute left-0 text-sm pointer-events-none whitespace-nowrap",
                      selectedOption
                        ? "text-(--text-primary)"
                        : "text-(--text-secondary)"
                    )}
                  >
                    {selectedOption?.label || placeholder}
                  </span>
                )}
                {!searchQuery && multiple && selectedOptions.length === 0 && (
                  <span className="absolute left-0 text-sm text-(--text-secondary) pointer-events-none whitespace-nowrap">
                    {placeholder}
                  </span>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  className="relative bg-transparent text-sm outline-none cursor-text min-w-[5px] text-(--text-primary)"
                  style={{
                    width: searchQuery
                      ? `${searchQuery.length * 8 + 10}px`
                      : "10px",
                  }}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!multiple && value) onChange(""); // Clear selection when typing in single mode
                    if (!open) setOpen(true);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!open) setOpen(true);
                  }}
                  disabled={disabled}
                />
              </div>
            ) : (
              <div className="flex gap-1 items-center overflow-hidden whitespace-nowrap">
                {multiple && selectedOptions.length > 0 ? (
                  selectedOptions.map((opt) => (
                    <span
                      key={opt.value}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-(--primary)/10 text-(--primary) text-xs whitespace-nowrap"
                    >
                      {opt.label}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-(--primary)/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(
                            selectedValues.filter((v) => v !== opt.value)
                          );
                          // Maintain focus after removing option
                          containerRef.current
                            ?.querySelector<HTMLDivElement>('[tabindex="0"]')
                            ?.focus();
                        }}
                      />
                    </span>
                  ))
                ) : selectedOption ? (
                  <>
                    <span className="truncate text-sm whitespace-nowrap select-none text-(--text-primary)">
                      {selectedOption.label}
                    </span>
                    {showBadges && selectedOption.badge && (
                      <span className="px-1.5 py-0.5 text-xs rounded bg-(--primary)/10 text-(--primary) shrink-0 whitespace-nowrap">
                        {selectedOption.badge}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-(--text-secondary) text-sm whitespace-nowrap select-none">
                    {placeholder}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {allowClear && selectedValues.length > 0 && !loading && (
              <>
                <button
                  type="button"
                  onClick={handleClear}
                  className={cn(
                    "hover:text-(--text-primary) transition-colors",
                    open ? "text-(--text-standard)" : "text-(--text-secondary)"
                  )}
                  tabIndex={-1}
                >
                  <X size={16} />
                </button>
                <div className="h-4 w-px bg-(--text-muted) mx-1" />
              </>
            )}
            {loading ? (
              // <div className="h-4 w-4 border-2 border-(--primary)/30 border-t-(--primary) rounded-full animate-spin" />
              <Spinner variant="gradient-ring" size="sm" color="standard" />
            ) : (
              <ChevronDown
                size={20}
                className={cn(
                  "hover:text-(--text-primary) transition-transform duration-200",
                  open
                    ? "text-(--text-standard) rotate-180"
                    : "text-(--text-secondary)"
                )}
              />
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div
            className={cn(
              "absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-(--border)",
              "bg-(--bg-card) shadow-lg",
              "left-0 right-0 min-w-full" // Ensure it matches container width
            )}
          >
            {/* Options List */}
            <div
              tabIndex={-1}
              className="max-h-[150px] overflow-y-auto overflow-x-hidden custom-scrollbar outline-none text-(--text-primary)"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-3 text-center">
                  <p className="text-sm text-(--text-primary)">
                    {emptyMessage}
                  </p>
                </div>
              ) : hasCategories ? (
                // Render categorized options
                Object.entries(categorizedOptions).map(
                  ([category, categoryOptions]) => (
                    <div key={category} className="py-1">
                      <div className="px-3 py-1.5 text-xs font-semibold text-(--text-primary) uppercase">
                        {category}
                      </div>
                      <div>
                        {categoryOptions.map((option) => renderOption(option))}
                      </div>
                    </div>
                  )
                )
              ) : (
                // Render flat list
                <div className="py-1">
                  {filteredOptions.map((option) => renderOption(option))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {rightAddon && (
        <div
          className={cn(
            "flex items-center justify-center border border-(--border) bg-(--bg-card) h-10 rounded-r-md text-sm text-(--text-secondary) whitespace-nowrap z-10 transition-all duration-200",
            "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)",
            !open &&
              !hasError &&
              "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",
            open && "border-(--primary) ring-1 ring-(--primary)",
            hasError &&
              "border-red-500 group-focus-within:border-red-500 group-focus-within:ring-red-500 group-hover:border-red-500",
            hasError && open && "border-red-500",
            rightAddonClassName
          )}
        >
          {rightAddon}
        </div>
      )}
    </div>
  );
}
