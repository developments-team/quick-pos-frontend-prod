import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, size = "md", variant = "default", ...props }, ref) => {
    const sizes = {
      sm: { box: "h-4 w-4 rounded-sm", check: "h-2.5 w-2.5", text: "text-xs" },
      md: {
        box: "h-4.5 w-4.5 rounded-sm",
        check: "h-3.75 w-3.75",
        text: "text-sm",
      },
      lg: { box: "h-6 w-6 rounded-sm", check: "h-4 w-4", text: "text-base" },
    };

    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "shrink-0 border-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200 ease-out active:scale-90",
              "flex items-center justify-center relative",
              variant === "default" && [
                "border-(--text-muted)/70 bg-(--input-bg)",
                "peer-checked:bg-(--primary) peer-checked:text-(--primary-foreground) peer-checked:border-(--primary)",
                "peer-checked:[&_svg]:opacity-100",
                "peer-checked:[&_svg]:scale-100",
              ],
              variant === "filled" && [
                "border-(--text-muted)/70 bg-(--input-bg)",
                "peer-checked:bg-(--primary) peer-checked:border-(--primary)",
              ],
              sizes[size].box,
              className,
            )}
          >
            <Check
              className={cn(
                "absolute opacity-0 scale-50 transition-all duration-200 stroke-[3px] pointer-events-none",
                "opacity-0 scale-50 transition-all duration-200 pointer-events-none",
                variant === "default" && "text-white",
                variant === "filled" && "text-(--primary-foreground)",
                "stroke-current z-10",
                sizes[size].check,
              )}
            />
          </div>
        </div>
        {label && (
          <span
            className={cn(
              "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-(--text-standard) group-hover:text-(--text-primary) transition-colors select-none",
              sizes[size].text,
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
