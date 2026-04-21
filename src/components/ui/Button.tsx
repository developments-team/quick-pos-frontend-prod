/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { cn } from "../../lib/utils";

const colors = {
  primary: {
    base: "bg-(--primary)",
    text: "text-(--primary)",
    fg: "text-(--primary-foreground)",
    hover: "enabled:hover:bg-(--primary-hover)",
    hoverTp: "enabled:hover:bg-(--primary)/10",
    border: "border-(--primary)",
    soft: "bg-(--primary)/10 text-(--primary) enabled:hover:bg-(--primary)/20",
  },
  secondary: {
    base: "bg-(--secondary)",
    text: "text-(--secondary)",
    fg: "text-(--secondary-foreground)",
    hover: "enabled:hover:bg-(--secondary-hover)",
    hoverTp: "enabled:hover:bg-(--secondary)/10",
    border: "border-(--secondary)",
    soft: "bg-(--secondary)/10 text-(--standard) enabled:hover:bg-(--secondary)/20",
  },
  success: {
    base: "bg-green-500",
    text: "text-green-500",
    fg: "text-white",
    hover: "enabled:hover:bg-green-600",
    hoverTp: "enabled:hover:bg-green-500/10",
    border: "border-green-500",
    soft: "bg-green-500/10 text-green-500 enabled:hover:bg-green-500/20",
  },
  warning: {
    base: "bg-amber-500",
    text: "text-amber-500",
    fg: "text-white",
    hover: "enabled:hover:bg-amber-600",
    hoverTp: "enabled:hover:bg-amber-500/10",
    border: "border-amber-500",
    soft: "bg-amber-500/10 text-amber-500 enabled:hover:bg-amber-500/20",
  },
  info: {
    base: "bg-cyan-500",
    text: "text-cyan-500",
    fg: "text-white",
    hover: "enabled:hover:bg-cyan-600",
    hoverTp: "enabled:hover:bg-cyan-500/10",
    border: "border-cyan-500",
    soft: "bg-cyan-500/10 text-cyan-500 enabled:hover:bg-cyan-500/20",
  },
  danger: {
    base: "bg-red-500",
    text: "text-red-500",
    fg: "text-white",
    hover: "enabled:hover:bg-red-600",
    hoverTp: "enabled:hover:bg-red-500/10",
    border: "border-red-500",
    soft: "bg-red-500/10 text-red-500 enabled:hover:bg-red-500/20",
  },
  dark: {
    base: "bg-slate-800",
    text: "text-slate-800",
    fg: "text-white",
    hover: "enabled:hover:bg-slate-900",
    hoverTp: "enabled:hover:bg-slate-800/10",
    border: "border-slate-800",
    soft: "bg-slate-200 text-slate-800 enabled:hover:bg-slate-300",
  },
  // Keep "ghost" key for backward compatibility if anyone uses variant="ghost"
  // But ideally we map it to a neutral/secondary style in the function
  ghost: {
    base: "bg-transparent",
    text: "text-(--text-standard)",
    fg: "text-(--text-primary)",
    hover: "enabled:hover:bg-(--table-border)",
    hoverTp: "enabled:hover:bg-(--table-border)",
    border: "border-transparent",
    soft: "bg-transparent",
  },
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-[0.9375rem]",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export type ButtonVariant = keyof typeof colors;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  outline?: boolean;
  label?: boolean; // Label/Soft style
  ghost?: boolean;
  rounded?: boolean; // Pill shape
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  outline = false,
  label = false,
  ghost = false,
  rounded = false,
  className,
}: ButtonProps) {
  // Backward compatibility for variant="ghost"
  if (variant === "ghost") {
    // Treat as neutral ghost
    return cn(
      "relative overflow-hidden inline-flex items-center justify-center font-medium transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer",
      rounded ? "rounded-full" : "rounded-md",
      sizes[size],
      colors.ghost.text,
      colors.ghost.hover,
      className
    );
  }

  const colorConfig = colors[variant] || colors.primary;

  let variantClass = "";

  if (outline) {
    variantClass = cn(
      "bg-transparent border",
      colorConfig.border,
      colorConfig.text,
      colorConfig.hoverTp
    );
  } else if (label) {
    variantClass = cn(colorConfig.soft);
  } else if (ghost) {
    variantClass = cn("bg-transparent", colorConfig.text, colorConfig.hoverTp);
  } else {
    // Solid (default)
    variantClass = cn(
      colorConfig.base,
      colorConfig.fg,
      colorConfig.hover,
      "shadow-sm"
    );
  }

  return cn(
    "relative overflow-hidden inline-flex items-center justify-center font-medium transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer",
    rounded ? "rounded-full" : "rounded-md",
    sizes[size],
    variantClass,
    className
  );
}

export function useRipple(isGhostOrOutline: boolean = false) {
  const [ripples, setRipples] = React.useState<
    { x: number; y: number; size: number; id: number }[]
  >([]);

  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;

    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;

    const newRipple = {
      x,
      y,
      size: diameter,
      id: Date.now(),
    };

    setRipples((prevRipples) => [...prevRipples, newRipple]);

    setTimeout(() => {
      setRipples((prevRipples) =>
        prevRipples.filter((ripple) => ripple.id !== newRipple.id)
      );
    }, 600);
  };

  const rippleColor = isGhostOrOutline ? "bg-current/20" : "bg-white/30";

  const rippleElements = ripples.map((ripple) => (
    <span
      key={ripple.id}
      className={cn(
        "absolute rounded-full animate-ripple pointer-events-none",
        rippleColor
      )}
      style={{
        left: ripple.x,
        top: ripple.y,
        width: ripple.size,
        height: ripple.size,
        transform: "scale(0)",
      }}
    />
  ));

  return { createRipple, rippleElements };
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      outline = false,
      label = false,
      ghost = false,
      rounded = false,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if we should use the "current" color for ripple or white
    // Ghost, Outline, and Label buttons usually have colored text on light/transparent bg, so use current.
    // Solid buttons usually have white text, so use white.
    // Exception: Dark variant might need tuning, but typically solid dark has white text.
    const isGhostOrOutline = outline || label || ghost || variant === "ghost";

    const { createRipple, rippleElements } = useRipple(isGhostOrOutline);

    return (
      <button
        ref={ref}
        className={buttonVariants({
          variant,
          size,
          outline,
          label,
          ghost,
          rounded,
          className,
        })}
        {...props}
        onClick={(e) => {
          createRipple(e);
          props.onClick?.(e);
        }}
      >
        {children}
        {rippleElements}
      </button>
    );
  }
);

Button.displayName = "Button";
