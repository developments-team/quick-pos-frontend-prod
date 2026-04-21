import React from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "../../lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning";
  title?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", title, children, ...props }, ref) => {
    const variants = {
      default: "bg-(--bg-card) text-(--text-primary) border-(--border)",
      destructive:
        "border-(--danger)/50 text-(--danger) dark:border-(--danger) [&>svg]:text-(--danger)",
      success:
        "border-(--success)/50 text-(--success) dark:border-(--success) [&>svg]:text-(--success)",
      warning:
        "border-(--warning)/50 text-(--warning) dark:border-(--warning) [&>svg]:text-(--warning)",
    };

    const icons = {
      default: <Info className="h-4 w-4" />,
      destructive: <AlertCircle className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertCircle className="h-4 w-4" />,
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
          variants[variant],
          className
        )}
        {...props}
      >
        {icons[variant]}
        {title && (
          <h5 className="mb-1 font-medium leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className="text-sm [&_p]:leading-relaxed">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";
