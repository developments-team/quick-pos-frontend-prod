import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  color?: "default" | "standard" | "primary" | "white";
  strokeWidth?: number;
  variant?:
    | "spinner"
    | "dots"
    | "pulse"
    | "ring"
    | "bars"
    | "wave"
    | "orbit"
    | "square"
    | "bounce"
    | "fade"
    | "dual-ring"
    | "ripple"
    | "circle-dots"
    | "gradient-ring"
    | "ring-chase"
    | "ping"
    | "ring-scale"
    | "circular"
    | "circular"
    | "circular-track"
    | "classic";
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = "md",
      color = "default",
      variant = "spinner",
      strokeWidth,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: { container: "h-3 w-3", dot: "h-0.5 w-0.5", bar: "h-2 w-0.5" },
      sm: { container: "h-4 w-4", dot: "h-1 w-1", bar: "h-3 w-0.5" },
      md: { container: "h-6 w-6", dot: "h-1.5 w-1.5", bar: "h-4 w-1" },
      lg: { container: "h-8 w-8", dot: "h-2 w-2", bar: "h-5 w-1" },
      xl: { container: "h-10 w-10", dot: "h-2.5 w-2.5", bar: "h-5 w-1.5" },
      "2xl": { container: "h-14 w-14", dot: "h-3.5 w-3.5", bar: "h-7 w-2" },
    };

    const defaultStrokeWidths = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 3.5,
      xl: 4,
      "2xl": 5,
    };

    const actualStrokeWidth = strokeWidth || defaultStrokeWidths[size];

    const colors = {
      default: "text-(--text-muted)",
      standard: "var(--text-standard)",
      primary: "text-(--primary)",
      white: "text-white",
    };

    const bgColors = {
      default: "bg-(--text-muted)",
      standard: "var(--text-standard)",
      primary: "bg-(--primary)",
      white: "bg-white",
    };

    const borderColors = {
      default: "border-(--text-muted)",
      standard: "var(--text-standard)",
      primary: "border-(--primary)",
      white: "border-white",
    };

    // Classic rotating spinner (Loader2 icon)
    if (variant === "spinner") {
      return (
        <div
          ref={ref}
          className={cn("flex justify-center items-center", className)}
          {...props}
        >
          <Loader2
            className={cn("animate-spin", sizes[size].container, colors[color])}
            style={{ animationDuration: "0.8s" }}
            strokeWidth={actualStrokeWidth}
          />
        </div>
      );
    }

    // Three bouncing dots
    if (variant === "dots") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center gap-1",
            sizes[size].container,
            className
          )}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "rounded-full animate-bounce",
                sizes[size].dot,
                bgColors[color]
              )}
              style={{
                animationDelay: `${i * 0.12}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      );
    }

    // Pulsing circle
    if (variant === "pulse") {
      return (
        <div
          ref={ref}
          className={cn("flex justify-center items-center", className)}
          {...props}
        >
          <span
            className={cn(
              "rounded-full",
              sizes[size].container,
              bgColors[color]
            )}
            style={{ animation: "pulse-scale 0.8s ease-in-out infinite" }}
          />
          <style>{`
            @keyframes pulse-scale {
              0%, 100% { transform: scale(0.3); opacity: 0.6; }
              50% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      );
    }

    // Rotating ring (border-based)
    if (variant === "ring") {
      return (
        <div
          ref={ref}
          className={cn("flex justify-center items-center", className)}
          {...props}
        >
          <span
            className={cn(
              "rounded-full border-current border-t-transparent animate-spin",
              sizes[size].container,
              colors[color]
            )}
            style={{
              animationDuration: "0.8s",
              borderWidth: `${actualStrokeWidth}px`,
            }}
          />
        </div>
      );
    }

    // Animated bars (equalizer style)
    if (variant === "bars") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-end gap-0.5",
            sizes[size].container,
            className
          )}
          {...props}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "rounded-sm animate-pulse",
                sizes[size].bar,
                bgColors[color]
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      );
    }

    // Wave - dots moving in a wave pattern
    if (variant === "wave") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center gap-1",
            sizes[size].container,
            className
          )}
          {...props}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn("rounded-full", sizes[size].dot, bgColors[color])}
              style={{
                animation: "wave 0.8s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          <style>{`
            @keyframes wave {
              0%, 100% { transform: translateY(0); opacity: 0.5; }
              50% { transform: translateY(-6px); opacity: 1; }
            }
          `}</style>
        </div>
      );
    }

    // Orbit - dot rotating around center
    if (variant === "orbit") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center relative",
            sizes[size].container,
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "absolute rounded-full opacity-30",
              sizes[size].container,
              bgColors[color]
            )}
          />
          <span
            className={cn("absolute", sizes[size].container)}
            style={{ animation: "orbit 0.8s linear infinite" }}
          >
            <span
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 rounded-full",
                sizes[size].dot,
                bgColors[color]
              )}
            />
          </span>
          <style>{`
            @keyframes orbit {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    // Square - rotating square
    if (variant === "square") {
      return (
        <div
          ref={ref}
          className={cn("flex justify-center items-center", className)}
          {...props}
        >
          <span
            className={cn(
              "rounded-sm animate-spin",
              sizes[size].container,
              bgColors[color]
            )}
            style={{ animationDuration: "0.8s" }}
          />
        </div>
      );
    }

    // Bounce - single bouncing ball
    if (variant === "bounce") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-end",
            sizes[size].container,
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "rounded-full",
              sizes[size].container,
              bgColors[color]
            )}
            style={{
              animation: "bounceUp 0.6s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes bounceUp {
              0%, 100% { transform: translateY(0) scale(1, 1); }
              30% { transform: translateY(-100%) scale(0.9, 1.1); }
              50% { transform: translateY(-100%) scale(1.1, 0.9); }
              70% { transform: translateY(0) scale(1.05, 0.95); }
            }
          `}</style>
        </div>
      );
    }

    // Fade - fading dots in sequence
    if (variant === "fade") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center gap-1",
            sizes[size].container,
            className
          )}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn("rounded-full", sizes[size].dot, bgColors[color])}
              style={{
                animation: "fadeInOut 0.9s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          <style>{`
            @keyframes fadeInOut {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      );
    }

    // Dual Ring - two concentric rings spinning opposite directions
    if (variant === "dual-ring") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center relative",
            sizes[size].container,
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "absolute rounded-full border-t-transparent animate-spin",
              sizes[size].container,
              borderColors[color]
            )}
            style={{
              animationDuration: "0.8s",
              borderWidth: `${Math.max(2, actualStrokeWidth - 1)}px`,
            }}
          />
          <span
            className={cn(
              "absolute rounded-full border-b-transparent",
              sizes[size].container,
              borderColors[color]
            )}
            style={{
              animation: "spin-reverse 0.8s linear infinite",
              transform: "scale(0.7)",
              borderWidth: `${Math.max(2, actualStrokeWidth - 1)}px`,
            }}
          />
          <style>{`
            @keyframes spin-reverse {
              from { transform: scale(0.7) rotate(360deg); }
              to { transform: scale(0.7) rotate(0deg); }
            }
          `}</style>
        </div>
      );
    }

    // Ripple - expanding circles
    if (variant === "ripple") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center relative",
            sizes[size].container,
            className
          )}
          {...props}
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className={cn(
                "absolute rounded-full",
                sizes[size].container,
                borderColors[color]
              )}
              style={{
                animation: "ripple 1.2s ease-out infinite",
                animationDelay: `${i * 0.6}s`,
                borderWidth: `${Math.max(2, actualStrokeWidth - 1)}px`,
              }}
            />
          ))}
          <style>{`
            @keyframes ripple {
              0% { transform: scale(0.3); opacity: 1; }
              100% { transform: scale(1.2); opacity: 0; }
            }
          `}</style>
        </div>
      );
    }

    // Circle Dots - dots rotating in a circle
    if (variant === "circle-dots") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center relative",
            sizes[size].container,
            className
          )}
          {...props}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span
              key={i}
              className={cn(
                "absolute rounded-full",
                sizes[size].dot,
                bgColors[color]
              )}
              style={{
                transform: `rotate(${i * 45}deg) translateY(-120%)`,
                opacity: 1 - i * 0.1,
                animation: "circleDots 0.8s linear infinite",
              }}
            />
          ))}
          <style>{`
            @keyframes circleDots {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    // Gradient Ring - ring with gradient effect
    const gradientColors = {
      default: "var(--foreground)",
      standard: "var(--text-primary)",
      primary: "var(--primary)",
      white: "#ffffff",
    };

    if (variant === "gradient-ring") {
      const ringThickness = actualStrokeWidth;
      return (
        <div
          ref={ref}
          className={cn("flex justify-center items-center", className)}
          {...props}
        >
          <span
            className={cn("rounded-full animate-spin", sizes[size].container)}
            style={{
              animationDuration: "0.8s",
              background: `conic-gradient(transparent, ${gradientColors[color]})`,
              WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ringThickness}px), #000 calc(100% - ${
                ringThickness - 1
              }px))`,
              mask: `radial-gradient(farthest-side, transparent calc(100% - ${ringThickness}px), #000 calc(100% - ${
                ringThickness - 1
              }px))`,
            }}
          />
        </div>
      );
    }

    // Ring Chase - segmented ring chasing
    if (variant === "ring-chase") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center relative",
            sizes[size].container,
            className
          )}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "absolute rounded-full border-transparent",
                sizes[size].container,
                "border-t-current",
                colors[color]
              )}
              style={{
                animation: "ring-chase 0.8s linear infinite",
                animationDelay: `${i * 0.15}s`,
                opacity: 1 - i * 0.25,
                borderWidth: `${actualStrokeWidth}px`,
              }}
            />
          ))}
          <style>{`
            @keyframes ring-chase {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    // Ping - pulsing ping effect
    if (variant === "ping") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center relative",
            sizes[size].container,
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "absolute rounded-full animate-ping",
              sizes[size].container,
              bgColors[color]
            )}
            style={{
              animationDuration: "1s",
              opacity: 0.75, // Ping usually fades out
            }}
          />
          <span
            className={cn(
              "rounded-full",
              sizes[size].container,
              bgColors[color]
            )}
            style={{ transform: "scale(0.5)" }}
          />
        </div>
      );
    }

    // Ring Scale - scaling ring
    if (variant === "ring-scale") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex justify-center items-center relative",
            sizes[size].container,
            className
          )}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "absolute rounded-full",
                sizes[size].container,
                borderColors[color]
              )}
              style={{
                animation: "ring-scale 1.2s ease-out infinite",
                animationDelay: `${i * 0.4}s`,
                borderWidth: `${Math.max(2, actualStrokeWidth - 1)}px`,
              }}
            />
          ))}
          <style>{`
            @keyframes ring-scale {
              0% { transform: scale(0.5); opacity: 1; }
              50% { opacity: 0.5; }
              100% { transform: scale(1.1); opacity: 0; }
            }
          `}</style>
        </div>
      );
    }

    // Circular - SVG based smooth spinner (Material UI style)
    if (variant === "circular") {
      return (
        <div
          ref={ref}
          className={cn("flex justify-center items-center", className)}
          {...props}
        >
          <svg
            className={cn("animate-spin", sizes[size].container, colors[color])}
            viewBox="0 0 50 50"
            style={{ animationDuration: "2s" }}
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth={actualStrokeWidth}
              strokeLinecap="round"
              style={{
                animation: "circular-dash 1.5s ease-in-out infinite",
              }}
            />
          </svg>
          <style>{`
            @keyframes circular-dash {
              0% {
                stroke-dasharray: 1, 200;
                stroke-dashoffset: 0;
              }
              50% {
                stroke-dasharray: 90, 200;
                stroke-dashoffset: -35px;
              }
              100% {
                stroke-dasharray: 90, 200;
                stroke-dashoffset: -124px;
              }
            }
          `}</style>
        </div>
      );
    }

    // Circular Track - SVG based smooth spinner with track
    if (variant === "circular-track") {
      return (
        <div
          ref={ref}
          className={cn("flex justify-center items-center", className)}
          {...props}
        >
          <svg
            className={cn("animate-spin", sizes[size].container, colors[color])}
            viewBox="0 0 50 50"
            style={{ animationDuration: "2s" }}
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth={actualStrokeWidth}
              className="opacity-20"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth={actualStrokeWidth}
              strokeLinecap="round"
              style={{
                animation: "circular-dash 1.5s ease-in-out infinite",
              }}
            />
          </svg>
          <style>{`
            @keyframes circular-dash {
              0% {
                stroke-dasharray: 1, 200;
                stroke-dashoffset: 0;
              }
              50% {
                stroke-dasharray: 90, 200;
                stroke-dashoffset: -35px;
              }
              100% {
                stroke-dasharray: 90, 200;
                stroke-dashoffset: -124px;
              }
            }
          `}</style>
        </div>
      );
    }

    // Classic - Simple border spinner
    if (variant === "classic") {
      const classicColors = {
        default: "border-(--text-muted)/30 border-t-(--text-muted)",
        standard: "border-gray-500/30 border-t-gray-500",
        primary: "border-(--primary)/30 border-t-(--primary)",
        white: "border-white/30 border-t-white",
      };

      return (
        <div
          ref={ref}
          className={cn("flex justify-center items-center", className)}
          {...props}
        >
          <div
            className={cn(
              "rounded-full animate-spin",
              sizes[size].container,
              classicColors[color]
            )}
            style={{ borderWidth: `${actualStrokeWidth}px` }}
          />
        </div>
      );
    }

    return null;
  }
);
Spinner.displayName = "Spinner";
