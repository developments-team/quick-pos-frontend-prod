/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback } from "react";
import {
  IoCheckmarkCircle,
  IoInformationCircle,
  IoAlertCircle,
  IoWarning,
} from "react-icons/io5";
import { cn } from "../../lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
}

type ToastInput = Omit<Toast, "id">;

class ToastManager {
  private listeners: Set<(toasts: Toast[]) => void> = new Set();
  private toasts: Toast[] = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    // Immediately call listener with current state
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  addToast(toast: ToastInput) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    this.toasts = [...this.toasts, newToast];
    this.notify();
    return id;
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string, options?: Omit<ToastInput, "message" | "type">) {
    return this.addToast({
      type: "success",
      title: "Success",
      message,
      ...options,
    });
  }

  error(message: string, options?: Omit<ToastInput, "message" | "type">) {
    return this.addToast({
      type: "error",
      title: "Error",
      message,
      ...options,
    });
  }

  info(message: string, options?: Omit<ToastInput, "message" | "type">) {
    return this.addToast({ type: "info", title: "Info", message, ...options });
  }

  warning(message: string, options?: Omit<ToastInput, "message" | "type">) {
    return this.addToast({
      type: "warning",
      title: "Warning",
      message,
      ...options,
    });
  }

  dismiss(id: string) {
    this.removeToast(id);
  }
}

const toastManager = new ToastManager();

export const toast = {
  success: toastManager.success.bind(toastManager),
  error: toastManager.error.bind(toastManager),
  info: toastManager.info.bind(toastManager),
  warning: toastManager.warning.bind(toastManager),
  dismiss: toastManager.dismiss.bind(toastManager),
  add: toastManager.addToast.bind(toastManager),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
    return unsubscribe;
  }, []);

  const removeToast = useCallback((id: string) => {
    toastManager.removeToast(id);
  }, []);

  const positionClasses: Record<ToastPosition, string> = {
    "top-right": "top-4 right-5",
    "top-left": "top-4 left-5",
    "bottom-right": "bottom-4 right-5",
    "bottom-left": "bottom-4 left-5",
  };

  const groupedToasts = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || "top-right";
      if (!acc[position]) acc[position] = [];
      acc[position].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, Toast[]>,
  );

  return (
    <>
      {children}
      {(Object.keys(positionClasses) as ToastPosition[]).map((position) => {
        const positionToasts = groupedToasts[position] || [];
        if (positionToasts.length === 0) return null;

        return (
          <div
            key={position}
            className={cn(
              "fixed z-100 flex flex-col gap-2 pointer-events-none cursor-default w-full max-w-78",
              positionClasses[position],
            )}
          >
            {positionToasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
          </div>
        );
      })}
    </>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const duration = toast.duration || 5000;
  const [isPaused, setIsPaused] = useState(false);
  const [transitionDuration, setTransitionDuration] = useState(duration);
  const [progress, setProgress] = useState(100);
  const startTimeRef = React.useRef<number>(0);
  const remainingRef = React.useRef<number>(duration);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = React.useRef(false);

  // Start the animation after first paint
  React.useEffect(() => {
    if (duration === 0) return;
    const frame = requestAnimationFrame(() => {
      hasStartedRef.current = true;
      startTimeRef.current = Date.now();
      setProgress(0);
    });
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  // Auto-dismiss timer
  React.useEffect(() => {
    if (duration === 0 || isPaused) return;

    timerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, remainingRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, isPaused, onRemove, toast.id]);

  const handleMouseEnter = () => {
    if (!hasStartedRef.current) return;
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, remainingRef.current - elapsed);
    remainingRef.current = remaining;
    const currentProgress = (remaining / duration) * 100;
    setTransitionDuration(0);
    setProgress(currentProgress);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    setTransitionDuration(remainingRef.current);
    setProgress(0);
    setIsPaused(false);
  };

  // Tailwind safelist for dynamic classes:
  // text-green-500 text-red-500 text-blue-500 text-amber-500
  // bg-green-500 bg-red-500 bg-blue-500 bg-amber-500
  // bg-green-500/30 bg-red-500/30 bg-blue-500/30 bg-amber-500/30

  const baseColors = {
    success: "green-500",
    error: "red-500",
    info: "blue-500",
    warning: "amber-500",
  };

  const toastStyles = {
    success: {
      icon: IoCheckmarkCircle,
      iconColor: `text-${baseColors.success}`,
      bar: `bg-${baseColors.success}`,
      track: `bg-${baseColors.success}/30`,
    },
    error: {
      icon: IoAlertCircle,
      iconColor: `text-${baseColors.error}`,
      bar: `bg-${baseColors.error}`,
      track: `bg-${baseColors.error}/30`,
    },
    info: {
      icon: IoInformationCircle,
      iconColor: `text-${baseColors.info}`,
      bar: `bg-${baseColors.info}`,
      track: `bg-${baseColors.info}/30`,
    },
    warning: {
      icon: IoWarning,
      iconColor: `text-${baseColors.warning}`,
      bar: `bg-${baseColors.warning}`,
      track: `bg-${baseColors.warning}/30`,
    },
  };

  const currentStyle = toastStyles[toast.type];
  const Icon = currentStyle.icon;

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex items-start gap-3 p-3 rounded-lg bg-(--bg-card) shadow-[0_0_10px_rgba(0,0,0,0.4)] transition-all animate-in slide-in-from-right-full duration-300 overflow-hidden",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="shrink-0 my-auto">
        <Icon className={cn("h-6 w-6", currentStyle.iconColor)} />
      </div>
      <div className="flex-1 z-10">
        <p className="text-sm font-semibold text-(--text-standard) leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Progress Bar */}
      {duration !== 0 && (
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1.25 w-full ",
            currentStyle.track,
          )}
        >
          <div
            className={cn("h-full", currentStyle.bar)}
            style={{
              width: `${progress}%`,
              transition: `width ${transitionDuration}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
}
