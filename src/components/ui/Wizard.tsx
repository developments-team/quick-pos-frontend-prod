import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

interface WizardContextValue {
  currentStep: number;
  totalSteps: number;
  setTotalSteps: (count: number) => void;
  goToStep: (step: number) => void;
  orientation: "horizontal" | "vertical";
  isStepCompleted: (step: number) => boolean;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}

interface WizardProps {
  defaultStep?: number;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Wizard({
  defaultStep = 0,
  currentStep: controlledStep,
  onStepChange,
  children,
  className,
  orientation = "horizontal",
}: WizardProps) {
  const [internalStep, setInternalStep] = useState(defaultStep);
  const [totalSteps, setTotalSteps] = useState(0);

  const isControlled = controlledStep !== undefined;
  const currentStep = isControlled ? controlledStep : internalStep;

  const goToStep = (step: number) => {
    if (!isControlled) {
      setInternalStep(step);
    }
    onStepChange?.(step);
  };

  const isStepCompleted = (step: number) => {
    return step < currentStep;
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        totalSteps,
        setTotalSteps,
        goToStep,
        orientation,
        isStepCompleted,
      }}
    >
      <div
        className={cn(
          "flex gap-8",
          orientation === "vertical" ? "flex-col md:flex-row" : "flex-col",
          className
        )}
      >
        {children}
      </div>
    </WizardContext.Provider>
  );
}

interface WizardListProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "connectedLine" | "chevron";
}

export function WizardList({
  children,
  className,
  variant = "default",
}: WizardListProps) {
  const { orientation } = useWizard();

  if (variant === "connectedLine" && orientation === "horizontal") {
    // For connected line variant, we need to wrap children with line connectors
    const childArray = React.Children.toArray(children);
    return (
      <div
        className={cn(
          "flex items-start w-full gap-1 sm:gap-2 overflow-x-auto",
          className
        )}
      >
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childArray.length - 1 && (
              <WizardConnector stepIndex={index} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Chevron variant with arrow-shaped steps
  if (variant === "chevron" && orientation === "horizontal") {
    return (
      <div
        className={cn("flex items-stretch w-full overflow-x-auto", className)}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical"
          ? "flex-col gap-10 min-w-0 sm:min-w-[200px]"
          : "flex-nowrap sm:flex-nowrap items-center gap-10 w-full overflow-x-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

// Internal connector component for the connected line variant
function WizardConnector({ stepIndex }: { stepIndex: number }) {
  const { isStepCompleted } = useWizard();
  const isActive = isStepCompleted(stepIndex);

  return (
    <div
      className={cn(
        "w-full h-0.5 mt-4 sm:mt-5 mx-0 transition-colors duration-300",
        isActive ? "bg-(--primary)" : "bg-(--border)"
      )}
    />
  );
}

interface WizardStepProps {
  stepIndex: number; // 0-indexed
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  centered?: boolean; // If true, indicator is above the title (vertical layout within step)
  variant?: "default" | "connectedLine" | "chevron";
  isFirst?: boolean;
  isLast?: boolean;
}

export function WizardStep({
  stepIndex,
  title,
  description,
  icon,
  className,
  centered = false,
  variant = "default",
  isFirst = false,
  isLast = false,
}: WizardStepProps) {
  const { currentStep, goToStep, isStepCompleted, orientation } = useWizard();
  const isActive = currentStep === stepIndex;
  const isCompleted = isStepCompleted(stepIndex);

  // Connected line variant with circle above text
  if (variant === "connectedLine") {
    return (
      <div
        className={cn(
          "cursor-pointer group flex flex-col items-center shrink-0 min-w-[60px] sm:min-w-0",
          className
        )}
        onClick={() => goToStep(stepIndex)}
      >
        {/** Indicator Circle */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 transition-colors duration-200 w-10 h-10 text-sm font-medium",
            isCompleted
              ? "border-(--primary) bg-(--primary) text-white"
              : isActive
              ? "border-(--primary) bg-(--primary) text-white"
              : "border-(--border) bg-(--surface) group-hover:border-(--text-muted)"
          )}
        >
          {isCompleted ? (
            <Check className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
          ) : (
            icon || <span>{stepIndex + 1}</span>
          )}
        </div>

        {/** Text Content */}
        <div className="flex flex-col items-center mt-1.5 sm:mt-2 text-center">
          <span
            className={cn(
              "text-wrap font-medium text-sm transition-colors duration-200 max-w-[80px] sm:max-w-none",
              isActive || (isCompleted && "text-(--text-primary)")
            )}
          >
            {title}
          </span>
          {description && (
            <span className="text-xs text-(--border) mt-0.5 hidden sm:block">
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Chevron variant with arrow-shaped steps
  if (variant === "chevron") {
    return (
      <div
        className={cn(
          "cursor-pointer group flex-1 relative min-w-0",
          className
        )}
        onClick={() => goToStep(stepIndex)}
      >
        {/* Main chevron body */}
        <div
          className={cn(
            "relative flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 transition-colors duration-200",
            isActive || isCompleted
              ? "bg-(--primary) text-white"
              : "bg-(--bg-secondary) text-(--border) group-hover:bg-(--bg-tertiary)",
            isFirst ? "rounded-l-md sm:rounded-l-lg" : "",
            isLast ? "rounded-r-md sm:rounded-r-lg" : ""
          )}
          style={{
            clipPath: isLast
              ? isFirst
                ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                : "polygon(0 0, calc(100% - 0px) 0, 100% 50%, calc(100% - 0px) 100%, 0 100%, 8px 50%)"
              : isFirst
              ? "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)"
              : "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)",
          }}
        >
          {/* Step number */}
          <span
            className={cn(
              "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold shrink-0",
              isActive || isCompleted
                ? "bg-white/20 text-white"
                : "bg-(--border) text-(--border)"
            )}
          >
            {isCompleted ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : (
              stepIndex + 1
            )}
          </span>
          {/* Title - hidden on very small screens */}
          <span className="font-medium text-xs sm:text-sm whitespace-nowrap hidden xs:inline sm:inline">
            {title}
          </span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "cursor-pointer group min-w-0",
        centered
          ? "flex items-center justify-center gap-2"
          : "flex items-center gap-2 sm:gap-3",
        orientation === "vertical" ? "w-full" : "",
        className
      )}
      onClick={() => goToStep(stepIndex)}
    >
      {/** Indicator Circle */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 transition-colors duration-200 shrink-0",
          centered
            ? "w-10 h-10 text-sm"
            : "w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-sm",
          isActive
            ? "border-(--primary) bg-(--primary) text-white"
            : isCompleted
            ? "border-(--primary) bg-(--primary) text-white"
            : "border-(--border) text-(--border) group-hover:border-(--border)"
        )}
      >
        {isCompleted ? (
          <Check
            size={centered ? 18 : 14}
            className={centered ? "" : "sm:w-4 sm:h-4"}
          />
        ) : (
          icon || <span>{stepIndex + 1}</span>
        )}
      </div>

      {/** Text Content */}
      <div
        className={cn(
          "flex flex-col min-w-0",
          centered ? "text-center" : "text-left"
        )}
      >
        <span
          className={cn(
            "font-medium transition-colors duration-200",
            centered ? "text-xs sm:text-sm" : "text-xs sm:text-sm truncate",
            isActive
              ? "text-(--text-primary)"
              : isCompleted
              ? "text-(--text-primary)"
              : "text-(--border)"
          )}
        >
          {title}
        </span>
        {description && (
          <span
            className={cn(
              "text-xs text-(--border)",
              centered ? "" : "hidden sm:block"
            )}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

interface WizardContentProps {
  stepIndex: number;
  children: React.ReactNode;
  className?: string;
}

export function WizardContent({
  stepIndex,
  children,
  className,
}: WizardContentProps) {
  const { currentStep } = useWizard();

  if (currentStep !== stepIndex) return null;

  return (
    <div
      className={cn(
        "flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

interface WizardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function WizardFooter({ children, className }: WizardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between mt-8 border-t border-(--border) pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}
