import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  triggerClassName?: string;
  autoHide?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  triggerClassName,
  autoHide = true,
  open,
  onOpenChange,
}: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalIsOpen;
  const setIsOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalIsOpen(newOpen);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
          if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={cn(
          "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-app)",
          !triggerClassName && "rounded-full",
          triggerClassName
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 bg-(--bg-card) border border-(--border) rounded-xl shadow-lg z-50 w-fit overflow-hidden",
            // "[:root[data-skin='default']_&]:border-none [:root[data-skin='default']_&]:shadow-[0_4px_16px_0_rgba(0,0,0,0.4)]",
            "shadow-[0_4px_16px_0_rgba(0,0,0,0.4)]",
            "[:root[data-theme='light'][data-skin='default']_&]:shadow-[0_2px_10px_0_rgba(0,0,0,0.1)]",
            align === "right" ? "right-0" : "left-0",
            className
          )}
          role="menu"
          aria-orientation="vertical"
          onClick={() => {
            if (autoHide) setIsOpen(false);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownHeaderProps {
  name: string;
  role?: string;
  avatar?: ReactNode;
  className?: string;
}

export function DropdownHeader({
  name,
  role,
  avatar,
  className,
}: DropdownHeaderProps) {
  return (
    <div className={cn("p-2 border-b border-(--border)", className)}>
      <div className="flex items-center gap-3 hover:bg-(--table-border) hover:text-(--text-primary) cursor-pointer rounded-md p-2">
        {avatar}
        <div>
          <div className="text-sm font-semibold text-(--text-primary)">
            {name}
          </div>
          {role && (
            <div className="text-xs text-(--text-secondary)">{role}</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  badge?: string | number;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  icon,
  badge,
  className,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left text-(--text-standard) cursor-pointer whitespace-nowrap",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--primary)",
        "hover:bg-(--table-border) hover:text-(--text-primary) rounded-md",
        className
      )}
      role="menuitem"
      tabIndex={0}
    >
      {/* {icon && <span className="shrink-0 text-(--text-secondary)">{icon}</span>} */}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
      {badge && (
        <span className="shrink-0 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </button>
  );
}

interface DropdownFooterProps {
  children: ReactNode;
  className?: string;
}

export function DropdownFooter({ children, className }: DropdownFooterProps) {
  return (
    <div className={cn("p-3 border-t border-(--border)", className)}>
      {children}
    </div>
  );
}

interface DropdownSeparatorProps {
  className?: string;
}

export function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return <div className={cn("h-px bg-(--border) my-1", className)} />;
}
