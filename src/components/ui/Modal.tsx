/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  hideClose?: boolean;
  autoClose?: boolean;
  comingFrom?: "top" | "bottom" | "left" | "right" | "center";
  hasBlur?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
  hideClose = false,
  autoClose = false,
  comingFrom = "top",
  hasBlur = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [animationState, setAnimationState] = useState<
    "entering" | "visible" | "exiting" | "exited"
  >(isOpen ? "entering" : "exited");

  useEffect(() => {
    // Clear any pending exit timeout when isOpen changes
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }

    if (isOpen) {
      // Reset to entering state immediately when opening
      // This ensures we start fresh even if a previous exit was interrupted
      setAnimationState("entering");

      // Use RAF to trigger the visible state for animation
      const rafId = requestAnimationFrame(() => {
        setAnimationState("visible");
      });

      document.body.style.overflow = "hidden";

      return () => {
        cancelAnimationFrame(rafId);
      };
    } else {
      // Only start exit animation if not already exited
      if (animationState !== "exited") {
        setAnimationState("exiting");
        exitTimeoutRef.current = setTimeout(() => {
          setAnimationState("exited");
          document.body.style.overflow = "unset";
          exitTimeoutRef.current = null;
        }, 300);
      }
    }
  }, [isOpen]);

  // Separate effect for escape key handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Cleanup exit timeout on unmount
  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  if (animationState === "exited" && !isOpen) return null;

  const sizes = {
    xs: "w-full max-w-xs",
    sm: "w-full max-w-md",
    md: "w-full max-w-lg",
    lg: "w-full max-w-2xl",
    xl: "w-full max-w-4xl",
    "2xl": "w-full max-w-[62rem]",
    "3xl": "w-full max-w-[72rem]",
  };

  const getTransformClass = () => {
    const baseTransform = "transition-all duration-300 ease-in-out";

    if (animationState === "visible") {
      return `${baseTransform} opacity-100`;
    }

    // Entering or Exiting states
    const hiddenState = "opacity-0";

    switch (comingFrom) {
      case "top":
        return `${baseTransform} ${hiddenState} -translate-y-12`;
      case "bottom":
        return `${baseTransform} ${hiddenState} translate-y-0`;
      case "left":
        return `${baseTransform} ${hiddenState} -translate-x-12`;
      case "right":
        return `${baseTransform} ${hiddenState} translate-x-0`;
      case "center":
      default:
        // Use scale for center
        return `${baseTransform} ${hiddenState} scale-95`;
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 bg-black/50",
        hasBlur ? "backdrop-blur-[2px]" : "",
        animationState === "visible"
          ? "opacity-100"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div
        ref={overlayRef}
        className="fixed inset-0 transition-opacity duration-300"
        onClick={autoClose ? onClose : undefined}
      />
      <div
        className={cn(
          "relative w-full rounded-lg bg-(--bg-card) border border-(--border) flex flex-col max-h-[90vh] overflow-clip",
          "[:root[data-skin='default']_&]:border-none [:root[data-skin='default']_&]:shadow-xl",
          sizes[size],
          getTransformClass(),
          className,
        )}
      >
        {!hideClose && (
          <div
            className={cn(
              "flex items-center justify-between px-6 py-4 shrink-0",
              title && "border-b border-(--border)",
            )}
          >
            {title && (
              <h3 className="text-lg font-semibold text-(--text-primary)">
                {title}
              </h3>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9.5 w-9.5 rounded-full ml-auto hover:font-semibold active:scale-95 transition-transform"
            >
              <X size={18} />
            </Button>
          </div>
        )}
        <div className="overflow-y-auto custom-scrollbar mx-0.5 mb-1">
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
