import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface PasswordInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "rightAddon" | "leftAddon" | "rightIcon" | "leftIcon"
  > {
  togglePosition?: "left" | "right";
  toggleVariant?: "icon" | "ghost-button";
  showIcon?: React.ReactNode;
  hideIcon?: React.ReactNode;
  // Allow passing other addons/icons if they don't conflict, but for simplicity we omit them from the interface
  // to avoid confusion, or we can re-add them as optional.
  // Let's re-include them so users can use the unused slots.
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hasError?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      className,
      togglePosition = "right",
      toggleVariant = "ghost-button",
      showIcon,
      hideIcon,
      leftAddon,
      rightAddon,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const [show, setShow] = React.useState(false);

    const toggleButton = (position: "left" | "right") => (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
        className={cn(
          "h-9.5",
          toggleVariant === "ghost-button"
            ? `rounded-none ${
                position === "left" ? "rounded-l-md" : "rounded-r-md"
              }`
            : "-mx-2.5 rounded-full"
        )}
      >
        {show
          ? hideIcon || <EyeOff className="h-4 w-4" />
          : showIcon || <Eye className="h-4 w-4" />}
      </Button>
    );

    const inputProps: React.ComponentProps<typeof Input> = {
      ...props,
      leftAddon,
      rightAddon,
      leftIcon,
      rightIcon,
    };

    if (toggleVariant === "ghost-button") {
      if (togglePosition === "left") {
        inputProps.leftAddon = toggleButton("left");
      } else {
        inputProps.rightAddon = toggleButton("right");
      }
    } else {
      if (togglePosition === "left") {
        inputProps.leftIcon = toggleButton("left");
        inputProps.leftIconInteractive = true;
        inputProps.leftIconClassName = "cursor-pointer";
      } else {
        inputProps.rightIcon = toggleButton("right");
        inputProps.rightIconInteractive = true;
        inputProps.rightIconClassName = "cursor-pointer";
      }
    }

    return (
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn(className)}
        {...inputProps}
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";
