import React from "react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  leftAddonClassName?: string;
  rightAddonClassName?: string;
  leftIconClassName?: string;
  rightIconClassName?: string;
  leftIconInteractive?: boolean;
  rightIconInteractive?: boolean;
  hasError?: boolean;
  loading?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      leftAddonClassName,
      rightAddonClassName,
      leftIconClassName,
      rightIconClassName,
      leftIconInteractive,
      rightIconInteractive,
      hasError,
      loading,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative flex items-center w-full group">
        {leftAddon && (
          <div
            className={cn(
              "flex items-center justify-center border border-(--border) bg-(--bg-card) h-10 rounded-l-md text-sm text-(--text-secondary) whitespace-nowrap z-10 transition-all duration-200",
              "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)",
              // Fix: When group is focused, hover should NOT change the border (unless error)
              !hasError &&
                "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",
              hasError &&
                "border-red-500 group-focus-within:border-red-500 group-focus-within:ring-red-500 group-hover:border-red-500",
              leftAddonClassName,
            )}
          >
            {leftAddon}
          </div>
        )}
        <div className="relative flex-1">
          {leftIcon && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) flex items-center",
                !leftIconInteractive && "pointer-events-none",
                leftIconClassName,
              )}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            aria-invalid={hasError ? "true" : undefined}
            data-invalid={hasError ? "" : undefined}
            className={cn(
              "h-10 w-full border border-(--border) bg-(--input-bg) px-3 text-sm text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-muted)",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-(--bg-item) disabled:text-(--text-muted) disabled:hover:border-(--border) disabled:focus:border-(--border) disabled:focus:ring-0",
              "focus:border-(--primary) focus:ring-1 focus:ring-(--primary)",
              // Fix: When focused, hover should NOT change the border (unless error)
              !hasError &&
                "hover:border-(--text-muted) focus:hover:border-(--primary)",
              "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)",
              // Group hover logic for addon inputs
              !hasError &&
                "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",
              !leftAddon && !rightAddon && "rounded-md",
              leftAddon && !rightAddon && "rounded-r-md border-l-0",
              !leftAddon && rightAddon && "rounded-l-md border-r-0",
              leftAddon && rightAddon && "border-x-0",
              leftIcon && "pl-10",
              (rightIcon || loading) && "pr-10",
              hasError &&
                "border-red-500 focus:border-red-500 focus:ring-red-500 hover:border-red-500 focus:hover:border-red-500",
              className,
            )}
            {...props}
          />
          {(rightIcon || loading) && (
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) flex items-center",
                !rightIconInteractive && "pointer-events-none",
                rightIconClassName,
              )}
            >
              {loading ? (
                <Spinner variant="gradient-ring" size="sm" color="standard" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        {rightAddon && (
          <div
            className={cn(
              "flex items-center justify-center border border-(--border) bg-(--bg-card) h-10 rounded-r-md text-sm text-(--text-secondary) whitespace-nowrap z-10 transition-all duration-200",
              "group-focus-within:border-(--primary) group-focus-within:ring-1 group-focus-within:ring-(--primary)",
              // Fix: When group is focused, hover should NOT change the border (unless error)
              !hasError &&
                "group-hover:border-(--text-muted) group-focus-within:group-hover:border-(--primary)",
              hasError &&
                "border-red-500 group-focus-within:border-red-500 group-focus-within:ring-red-500 group-hover:border-red-500",
              rightAddonClassName,
            )}
          >
            {rightAddon}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
