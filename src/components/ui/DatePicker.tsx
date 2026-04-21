import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface BaseDatePickerProps {
  placeholder?: string;
  className?: string;
  hasError?: boolean;
  allowClear?: boolean;
}

interface SingleDatePickerProps extends BaseDatePickerProps {
  mode?: "single";
  value?: Date;
  onChange?: (date: Date) => void;
}

interface RangeDatePickerProps extends BaseDatePickerProps {
  mode: "range";
  value?: DateRange;
  onChange?: (range: DateRange) => void;
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

export function DatePicker(props: DatePickerProps) {
  const {
    placeholder = props.mode === "range" ? "Select date range" : "Select date",
    className,
    hasError,
    allowClear = true,
  } = props;

  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // For range mode, we track a pending range that's only applied on "Apply" click
  const [pendingRange, setPendingRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Track selected preset
  const [preset, setPreset] = useState<string | null>(null);

  // Get initial month from value
  const getInitialMonth = () => {
    if (props.mode === "range") {
      return props.value?.from || new Date();
    }
    return props.value || new Date();
  };

  const [leftMonth, setLeftMonth] = useState(getInitialMonth());
  const [rightMonth, setRightMonth] = useState(() => {
    const next = new Date(getInitialMonth());
    next.setMonth(next.getMonth() + 1);
    return next;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync pending range with actual value when opening
  useEffect(() => {
    if (open && props.mode === "range") {
      const newRange = props.value || { from: undefined, to: undefined };
      setPendingRange(newRange);
    }
  }, [open, props.mode, props.value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (props.mode === "range") {
      setLeftMonth(
        new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1)
      );
      setRightMonth(
        new Date(rightMonth.getFullYear(), rightMonth.getMonth() - 1, 1)
      );
    } else {
      setLeftMonth(
        new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1)
      );
    }
  };

  const handleNextMonth = () => {
    if (props.mode === "range") {
      setLeftMonth(
        new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1)
      );
      setRightMonth(
        new Date(rightMonth.getFullYear(), rightMonth.getMonth() + 1, 1)
      );
    } else {
      setLeftMonth(
        new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1)
      );
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isDateInRange = (
    date: Date,
    from: Date | undefined,
    to: Date | undefined
  ) => {
    if (!from || !to) return false;
    const time = date.getTime();
    return time >= from.getTime() && time <= to.getTime();
  };

  const handleDateClick = (day: number, monthDate: Date) => {
    const newDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      day
    );

    if (props.mode === "range") {
      const currentRange = pendingRange;

      // If no start date or both dates are set, start a new range
      if (!currentRange.from || currentRange.to) {
        setPendingRange({ from: newDate, to: undefined });
      } else {
        // If we have a start date, set the end date
        if (newDate < currentRange.from) {
          setPendingRange({ from: newDate, to: currentRange.from });
        } else {
          setPendingRange({ from: currentRange.from, to: newDate });
        }
      }
    } else {
      props.onChange?.(newDate);
      setOpen(false);
    }
  };

  const handleApply = () => {
    if (props.mode === "range" && pendingRange.from && pendingRange.to) {
      props.onChange?.(pendingRange);
      setOpen(false);
    }
  };

  const handlePreset = (presetName: string) => {
    setPreset(presetName);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from: Date;
    let to: Date;

    switch (presetName) {
      case "today":
        from = new Date(today);
        to = new Date(today);
        break;
      case "this-month":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "last-month":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "last-7-days":
        to = new Date(today);
        from = new Date(today);
        from.setDate(from.getDate() - 6);
        break;
      case "last-30-days":
        to = new Date(today);
        from = new Date(today);
        from.setDate(from.getDate() - 29);
        break;
      default:
        return;
    }

    setPendingRange({ from, to });
    setLeftMonth(from);
    setRightMonth(new Date(from.getFullYear(), from.getMonth() + 1, 1));
  };

  const renderCalendar = (
    monthDate: Date,
    showNav: "left" | "right" | "both" | "none" = "both"
  ) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;
      let isInHoverRange = false;

      if (props.mode === "range") {
        const range = pendingRange;
        if (range?.from) {
          isRangeStart = isSameDay(date, range.from);
          if (range.to) {
            isRangeEnd = isSameDay(date, range.to);
            isInRange = isDateInRange(date, range.from, range.to);
          } else if (hoverDate && !range.to) {
            // Preview range when hovering
            const previewFrom = range.from < hoverDate ? range.from : hoverDate;
            const previewTo = range.from < hoverDate ? hoverDate : range.from;
            isInHoverRange = isDateInRange(date, previewFrom, previewTo);
          }
        }
        isSelected = isRangeStart || isRangeEnd;
      } else {
        const singleValue = props.value;
        isSelected = singleValue ? isSameDay(date, singleValue) : false;
      }

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day, monthDate)}
          onMouseEnter={() => props.mode === "range" && setHoverDate(date)}
          onMouseLeave={() => props.mode === "range" && setHoverDate(null)}
          className={cn(
            "h-8 w-8 text-sm font-normal transition-all flex items-center justify-center cursor-pointer",
            // Range styling
            isInRange && !isSelected && "bg-(--primary)/30",
            isInHoverRange && !isSelected && "bg-(--primary)/20",
            isRangeStart && !isRangeEnd && "rounded-l-md rounded-r-none",
            isRangeEnd && !isRangeStart && "rounded-r-md rounded-l-none",
            // Selected styling
            isSelected
              ? "bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-hover) rounded-lg"
              : "hover:bg-(--border) rounded-lg",
            // Today styling
            isToday && !isSelected && "text-(--primary) font-semibold"
          )}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-3 h-8">
          {showNav === "left" || showNav === "both" ? (
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-(--table-border) active:scale-95 transition-transform text-(--text-secondary)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <span className="text-sm font-semibold text-(--text-primary)">
            {monthDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>

          {showNav === "right" || showNav === "both" ? (
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-(--table-border) active:scale-95 transition-transform text-(--text-secondary)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        <div className="grid grid-cols-7 gap-0 mb-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-(--text-secondary) h-8 flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  const formatDateISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return null;
    if (!range.to) return formatDateISO(range.from);
    return `${formatDateISO(range.from)} - ${formatDateISO(range.to)}`;
  };

  const getDisplayValue = () => {
    if (props.mode === "range") {
      return formatDateRange(props.value);
    }
    return props.value ? formatDate(props.value) : null;
  };

  const displayValue = getDisplayValue();

  const hasValue =
    props.mode === "range"
      ? props.value?.from || props.value?.to
      : !!props.value;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.mode === "range") {
      props.onChange?.({ from: undefined, to: undefined });
      setPendingRange({ from: undefined, to: undefined });
    } else {
      props.onChange?.(undefined as unknown as Date);
    }
    setPreset(null);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full select-none", className)}
    >
      <div
        tabIndex={0}
        className={cn(
          "flex items-center justify-between h-10 px-3 rounded-md border outline-none",
          "bg-(--input-bg) border-(--border)",
          "transition-all duration-200 cursor-pointer",
          "focus:border-(--primary) focus:ring-1 focus:ring-(--primary)",
          !open &&
            !hasError &&
            "hover:border-(--text-muted) focus:hover:border-(--primary)",
          open && "border-(--primary) ring-1 ring-(--primary)",
          hasError &&
            "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        onClick={() => {
          if (!open) {
            // Reset preset when opening if no value
            if (
              props.mode === "range" &&
              !props.value?.from &&
              !props.value?.to
            ) {
              setPreset(null);
            } else if (props.mode !== "range" && !props.value) {
              setPreset(null);
            }
          }
          setOpen(!open);
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <CalendarIcon className="h-4 w-4 text-(--text-muted) shrink-0" />
          {displayValue ? (
            <span className="text-sm truncate">{displayValue}</span>
          ) : (
            <span className="text-sm text-(--text-muted)">{placeholder}</span>
          )}
        </div>

        {/* Clear Button */}
        {allowClear && hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 p-0.5 rounded hover:bg-(--bg-panel) text-(--text-muted) hover:text-(--text-primary) transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && props.mode === "range" && (
        <div className="absolute z-50 mt-2 rounded-lg border border-(--border) bg-(--bg-card) shadow-xl left-0 right-0 lg:left-auto lg:right-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Calendars Container */}
            <div className="flex flex-col lg:flex-row p-4 gap-4 lg:gap-6">
              {/* Left Calendar */}
              <div className="w-full lg:w-[252px]">
                {renderCalendar(leftMonth, "left")}
              </div>

              {/* Right Calendar */}
              <div className="w-full lg:w-[252px]">
                {renderCalendar(rightMonth, "right")}
              </div>
            </div>

            {/* Presets & Apply - Responsive: column below calendars on mobile, sidebar on desktop */}
            <div className="flex flex-col lg:border-l border-(--border) p-4 pt-0 lg:pt-4 lg:min-w-[130px]">
              {/* Close button - desktop only */}
              {/* <div className="hidden lg:flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-6 w-6 flex items-center justify-center rounded hover:bg-(--table-border) text-(--text-muted)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div> */}

              {/* Presets */}
              <div className="flex flex-col items-center lg:items-start gap-1 lg:gap-1 flex-1">
                <Button
                  size="sm"
                  variant={preset === "today" ? "primary" : "ghost"}
                  type="button"
                  className="w-full truncate"
                  onClick={() => handlePreset("today")}
                  outline
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  variant={preset === "this-month" ? "primary" : "ghost"}
                  type="button"
                  className="w-full truncate"
                  onClick={() => handlePreset("this-month")}
                  outline
                >
                  This month
                </Button>
                <Button
                  size="sm"
                  variant={preset === "last-month" ? "primary" : "ghost"}
                  type="button"
                  className="w-full truncate"
                  onClick={() => handlePreset("last-month")}
                  outline
                >
                  Last month
                </Button>
                <Button
                  size="sm"
                  variant={preset === "last-7-days" ? "primary" : "ghost"}
                  type="button"
                  className="w-full truncate"
                  onClick={() => handlePreset("last-7-days")}
                  outline
                >
                  Last 7 days
                </Button>
                <Button
                  size="sm"
                  variant={preset === "last-30-days" ? "primary" : "ghost"}
                  type="button"
                  className="w-full truncate"
                  onClick={() => handlePreset("last-30-days")}
                  outline
                >
                  Last 30 days
                </Button>
              </div>

              {/* Apply Button */}
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={handleApply}
                disabled={!pendingRange.from || !pendingRange.to}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {open && props.mode !== "range" && (
        <div className="absolute z-50 mt-2 p-4 rounded-lg border border-(--border) bg-(--bg-card) shadow-xl w-[300px]">
          {renderCalendar(leftMonth, "both")}
        </div>
      )}
    </div>
  );
}
