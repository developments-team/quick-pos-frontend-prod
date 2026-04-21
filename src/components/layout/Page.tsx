import React, { useEffect } from "react";
import { cn } from "../../lib/utils";
import { useLayout } from "../../context/LayoutContext";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  pageType?: "default" | "pos" | "dashboard" | "custom";
}

export function PageContainer({
  children,
  className,
  pageType = "default",
  ...props
}: PageContainerProps) {
  const { setPageType } = useLayout();

  useEffect(() => {
    setPageType(pageType);
  }, [pageType, setPageType]);

  if (pageType === "pos") {
    return (
      <div className={cn("h-[calc(100vh-8rem)]", className)} {...props}>
        {children}
      </div>
    );
  }

  if (pageType === "dashboard") {
    return (
      <div className={cn("p-6 w-full", className)} {...props}>
        {children}
      </div>
    );
  }

  if (pageType === "custom") {
    return (
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    );
  }

  // Default
  return (
    <div
      className={cn(
        "p-6 bg-(--bg-panel) border border-(--border) rounded-xl",
        "[:root[data-skin='default']_&]:border-none [:root[data-skin='default']_&]:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  action,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4",
        className
      )}
      {...props}
    >
      <h1 className="text-xl font-bold text-(--text-standard)">{title}</h1>
      {action && (
        <div className="self-end sm:self-auto flex items-center gap-2 overflow-x-auto max-w-full pb-2">
          {action}
        </div>
      )}
    </div>
  );
}
