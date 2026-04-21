import { Palette } from "lucide-react";
import { useState } from "react";
import { buttonVariants, useRipple } from "./ui/Button";
import { Dropdown, DropdownItem } from "./ui/Dropdown";
import { useLayout } from "../context/LayoutContext";
import { cn } from "../lib/utils";

export function SkinToggle() {
  const { skin, setSkin } = useLayout();
  const { createRipple, rippleElements } = useRipple(true);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      align="left"
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <div
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: cn(
              "rounded-full transition-colors",
              isOpen
                ? "bg-(--table-border) text-(--text-primary)"
                : "hover:bg-(--table-border) hover:text-(--text-primary)",
            ),
          })}
          onClick={createRipple}
        >
          <Palette size={20} />
          {rippleElements}
        </div>
      }
      className="min-w-[180px]"
    >
      <div className="p-2 space-y-2">
        <DropdownItem
          icon={<Palette size={20} />}
          onClick={() => setSkin("default")}
          className={cn(
            skin === "default" &&
              "bg-(--primary) text-(--primary-foreground) font-medium hover:bg-(--primary) hover:text-(--primary-foreground)",
          )}
        >
          Default
        </DropdownItem>
        <DropdownItem
          icon={<Palette size={20} />}
          onClick={() => setSkin("bordered")}
          className={cn(
            skin === "bordered" &&
              "bg-(--primary) text-(--primary-foreground) font-medium hover:bg-(--primary) hover:text-(--primary-foreground)",
          )}
        >
          Bordered
        </DropdownItem>
      </div>
    </Dropdown>
  );
}
