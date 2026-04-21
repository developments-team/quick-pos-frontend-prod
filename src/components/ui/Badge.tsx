import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "dark"
    | "soft-primary"
    | "soft-secondary"
    | "soft-destructive"
    | "soft-success"
    | "soft-warning"
    | "soft-info"
    | "soft-dark"
    | "split-primary"
    | "split-secondary"
    | "split-destructive"
    | "split-success"
    | "split-warning";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-(--primary) text-(--primary-foreground)",
      secondary: "border-transparent bg-(--bg-card)",
      destructive: "border-transparent bg-(--danger) text-white",
      success: "border-transparent bg-(--success) text-white",
      warning: "border-transparent bg-(--warning) text-white",
      info: "border-transparent bg-cyan-500 text-white",
      dark: "border-transparent bg-slate-800 text-white",
      outline: "border-(--border)",
      // Soft / Subtle variants
      "soft-primary": "border-transparent bg-(--primary)/10 text-(--primary)",
      "soft-secondary":
        "border-transparent bg-(--secondary)/10 text-(--secondary-foreground)",
      "soft-destructive": "border-transparent bg-(--danger)/10 text-(--danger)",
      "soft-success": "border-transparent bg-(--success)/10 text-(--success)",
      "soft-warning": "border-transparent bg-(--warning)/10 text-(--warning)",
      "soft-info": "border-transparent bg-cyan-500/10 text-cyan-600",
      "soft-dark": "border-transparent bg-slate-800/10 text-slate-800",
      // Split variants
      "split-primary":
        "border-transparent text-(--primary-foreground) bg-gradient-to-r from-(--primary) from-50% to-(--primary)/60 to-50%",
      "split-secondary":
        "border-transparent text-(--secondary-foreground) bg-gradient-to-r from-(--secondary) from-50% to-(--secondary)/60 to-50%",
      "split-destructive":
        "border-transparent text-white bg-gradient-to-r from-(--danger) from-50% to-(--danger)/60 to-50%",
      "split-success":
        "border-transparent text-white bg-gradient-to-r from-(--success) from-50% to-(--success)/60 to-50%",
      "split-warning":
        "border-transparent text-white bg-gradient-to-r from-(--warning) from-50% to-(--warning)/60 to-50%",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
