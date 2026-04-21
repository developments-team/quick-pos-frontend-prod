import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { buttonVariants, useRipple } from "./ui/Button";
import { Dropdown, DropdownItem } from "./ui/Dropdown";
import { useLayout } from "../context/LayoutContext";
import { cn } from "../lib/utils";

export function ThemeToggle({ align = "left" }: { align?: "left" | "right" }) {
  const { themeMode, setThemeMode } = useLayout();
  const { createRipple, rippleElements } = useRipple(true);
  const [isOpen, setIsOpen] = useState(false);

  // const toggleTheme = () => {
  //   const newTheme = themeMode === "dark" ? "light" : "dark";
  //   setThemeMode(newTheme);
  //   localStorage.setItem("theme", newTheme);
  // };

  return (
    <Dropdown
      align={align}
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
          {themeMode === "system" ? (
            <Monitor size={20} />
          ) : themeMode === "dark" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
          {rippleElements}
        </div>
      }
      className="min-w-[180px]"
    >
      <div className="p-2 space-y-2">
        <DropdownItem
          icon={<Sun size={20} />}
          onClick={() => setThemeMode("light")}
          className={cn(
            themeMode === "light" &&
              "bg-(--primary) text-(--primary-foreground) font-medium hover:bg-(--primary) hover:text-(--primary-foreground)",
          )}
        >
          Light
        </DropdownItem>
        <DropdownItem
          icon={<Moon size={20} />}
          onClick={() => setThemeMode("dark")}
          className={cn(
            themeMode === "dark" &&
              "bg-(--primary) text-(--primary-foreground) font-medium hover:bg-(--primary) hover:text-(--primary-foreground)",
          )}
        >
          Dark
        </DropdownItem>
        <DropdownItem
          icon={<Monitor size={20} />}
          onClick={() => setThemeMode("system")}
          className={cn(
            themeMode === "system" &&
              "bg-(--primary) text-(--primary-foreground) font-medium hover:bg-(--primary) hover:text-(--primary-foreground)",
          )}
        >
          System
        </DropdownItem>
      </div>
    </Dropdown>

    // <Button
    //   variant="ghost"
    //   size="icon"
    //   onClick={toggleTheme}
    //   className="rounded-full hover:bg-(--table-border) hover:text-(--text-primary)"
    // >
    //   {themeMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    // </Button>
  );
}
