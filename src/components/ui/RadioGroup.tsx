import React from "react";
import { cn } from "../../lib/utils";

// 1. Create Context
type RadioGroupContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
        <div className={cn("grid gap-2", className)} ref={ref} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

// ----------------------------------------------------------------------------
// Legacy / Simple Item
// ----------------------------------------------------------------------------

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
}

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(
  (
    { className, label, size = "md", variant = "default", value, ...props },
    ref
  ) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked = context.value === value;

    const sizes = {
      sm: { box: "h-4 w-4", dot: "h-2 w-2", text: "text-xs" },
      md: { box: "h-4.75 w-4.75", dot: "h-2.25 w-2.25", text: "text-sm" },
      lg: { box: "h-6 w-6", dot: "h-3 w-3", text: "text-base" },
    };

    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center">
          <input
            type="radio"
            className="peer sr-only"
            ref={ref}
            name={context.name}
            checked={isChecked}
            value={value}
            onChange={() => context.onValueChange?.(value as string)}
            {...props}
          />
          <div
            className={cn(
              "rounded-full border-2 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200 ease-out active:scale-90",
              "flex items-center justify-center",
              variant === "default" && [
                "border-(--text-muted)/70 bg-(--input-bg)",
                "peer-checked:bg-(--primary) peer-checked:border-(--primary) peer-checked:text-white",
                "peer-checked:[&_div]:opacity-100",
                "peer-checked:[&_div]:scale-100",
              ],
              variant === "filled" && [
                "border-(--text-muted)/70 bg-(--input-bg)",
                "peer-checked:bg-(--primary) peer-checked:border-(--primary)",
                "peer-checked:[&_div]:opacity-100",
                "peer-checked:[&_div]:scale-100",
              ],
              sizes[size].box,
              className
            )}
          >
            <div
              className={cn(
                "rounded-full opacity-0 scale-50 transition-all duration-200 ease-out",
                variant === "default" && "bg-white",
                variant === "filled" && "bg-(--primary-foreground)",
                sizes[size].dot
              )}
            />
          </div>
        </div>
        {label && (
          <span
            className={cn(
              "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-(--text-standard) group-hover:text-(--text-primary) transition-colors",
              sizes[size].text
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

// ----------------------------------------------------------------------------
// Card Item (For "Standard" vs "Variant")
// ----------------------------------------------------------------------------

export interface CardRadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const CardRadioGroupItem = React.forwardRef<
  HTMLInputElement,
  CardRadioGroupItemProps
>(({ className, title, description, icon, value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const isChecked = context.value === value;

  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-center justify-start gap-3 rounded-xl border p-4 transition-all duration-200 -mt-0.5",
        isChecked
          ? "border-(--primary) bg-(--primary)/5 ring-1 ring-(--primary)"
          : "border-(--border) bg-card hover:border-(--text-muted)",
        className
      )}
    >
      <input
        type="radio"
        className="peer sr-only"
        ref={ref}
        name={context.name}
        checked={isChecked}
        value={value}
        onChange={() => context.onValueChange?.(value as string)}
        {...props}
      />

      {/* Radio Circle */}
      <div
        className={cn(
          "h-4.75 w-4.75 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0",
          isChecked
            ? "border-(--primary) bg-(--primary)"
            : "border-(--text-muted)/70 bg-transparent"
        )}
      >
        <div
          className={cn(
            "h-2.25 w-2.25 rounded-full bg-white transition-all duration-200",
            isChecked ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-sm text-foreground truncate">
          {icon && (
            <span className="text-xl text-(--text-secondary)">{icon}</span>
          )}
          {title}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground font-normal leading-normal">
            {description}
          </p>
        )}
      </div>
    </label>
  );
});
CardRadioGroupItem.displayName = "CardRadioGroupItem";
