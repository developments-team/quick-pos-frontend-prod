import { useState } from "react";
import {
  Bell,
  User,
  Menu,
  ShoppingCart,
  Settings,
  LogOut,
  UserCircle,
  FileText,
  DollarSign,
  HelpCircle,
  Building2,
  Store,
  ChevronRight,
} from "lucide-react";

import { Button } from "../ui/Button";
import {
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownFooter,
} from "../ui/Dropdown";
import { ThemeToggle } from "../ThemeToggle";
// import { SkinToggle } from "../SkinToggle";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

import { useLayout } from "../../context/LayoutContext";

import { buttonVariants, useRipple } from "../ui/Button";

export function Header() {
  const { setSidebarOpen, setCartOpen, pageType } = useLayout();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
  const tenantName = userData?.tenant?.name || "";
  const branchName = userData?.branches?.name || "";
  const userName =
    [userData?.firstName, userData?.lastName].filter(Boolean).join(" ") ||
    userData?.name ||
    "User";
  const userRole = userData?.role?.name || "User";

  const { createRipple, rippleElements } = useRipple(true);
  return (
    <>
      <header
        className={cn(
          "h-16 border-b border-(--border) bg-(--bg-panel) flex items-center justify-between px-4 md:px-8 shrink-0",
          "[:root[data-skin='default']_&]:border-b-0 [:root[data-skin='default']_&]:shadow-[0_1px_15px_0_rgba(0,0,0,0.1)] [:root[data-skin='default']_&]:z-10",
          "[:root[data-theme='light'][data-skin='default']_&]:shadow-[0_1px_10px_0_rgba(0,0,0,0.05)]",
        )}
      >
        <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 rounded-full hover:bg-(--table-border) hover:text-(--text-primary)"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>

          {/* <div className="w-full md:w-[300px]">
          <Input
            placeholder="Search products..."
            leftIcon={<Search size={18} />}
            className="w-full"
          />
        </div> */}

          {/* Tenant & Branch Info (desktop only) */}
          <div className="hidden md:flex justify-center min-w-0 gap-2">
            {(tenantName || branchName) && (
              <div className="flex items-center gap-1.5 leading-tight">
                {tenantName && (
                  <span className="flex items-center gap-1 truncate">
                    <Building2
                      size={20}
                      className="shrink-0 text-(--primary)"
                    />
                    <span className="truncate font-medium">{tenantName}</span>
                  </span>
                )}
                {tenantName && branchName && (
                  <span className="mx-0.5">
                    <ChevronRight size={18} className="shrink-0" />
                  </span>
                )}
                {branchName && (
                  <span className="flex items-center gap-1 truncate">
                    <Store size={20} className="shrink-0 text-(--primary)" />
                    <span className="truncate font-medium">{branchName}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-2">
          {/* <SkinToggle /> */}
          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>
          <div className="flex sm:hidden">
            <ThemeToggle align="right" />
          </div>

          {pageType === "pos" && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-(--table-border) hover:text-(--text-primary)"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart size={20} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-(--table-border) hover:text-(--text-primary)"
          >
            <Bell size={20} />
          </Button>

          <Dropdown
            open={isProfileOpen}
            onOpenChange={setIsProfileOpen}
            trigger={
              <div
                // className={cn(
                //   "flex items-center gap-2 py-1 px-2 rounded-full border transition-colors cursor-pointer",
                //   isProfileOpen
                //     ? "bg-(--table-border) border-(--table-border) text-(--text-primary)"
                //     : "bg-(--bg-card) border-(--border) hover:bg-(--table-border) hover:border-(--table-border) hover:text-(--text-primary)",
                // )}
                // onClick={createRipple}
                className={buttonVariants({
                  variant: "ghost",
                  // size: "icon",
                  className: cn(
                    "flex items-center gap-2 py-1 px-2 rounded-full border transition-colors cursor-pointer",
                    isProfileOpen
                      ? "bg-(--table-border) border-(--table-border) text-(--text-primary)"
                      : "bg-(--bg-card) border-(--border) hover:bg-(--table-border) hover:border-(--table-border) hover:text-(--text-primary)",
                  ),
                })}
                onClick={createRipple}
              >
                <div className="w-8 h-8 rounded-full bg-(--primary) flex items-center justify-center text-white shrink-0">
                  <User size={20} />
                </div>
                <span className="text-sm font-medium pr-1 hidden sm:inline">
                  {userName}
                </span>

                {rippleElements}
              </div>
            }
            className="min-w-55"
          >
            <DropdownHeader
              name={userName}
              role={userRole}
              avatar={
                <div className="w-10 h-10 rounded-full bg-(--primary) flex items-center justify-center text-white shrink-0">
                  <User size={20} />
                </div>
              }
            />

            <div className="p-2">
              <DropdownItem
                icon={<UserCircle size={20} />}
                onClick={() => console.log("Navigate to My Profile")}
              >
                My Profile
              </DropdownItem>
              <DropdownItem
                icon={<Settings size={20} />}
                onClick={() => console.log("Navigate to Settings")}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                icon={<FileText size={20} />}
                badge={4}
                onClick={() => console.log("Navigate to Billing")}
              >
                Billing
              </DropdownItem>
              <DropdownItem
                icon={<DollarSign size={20} />}
                onClick={() => console.log("Navigate to Pricing")}
              >
                Pricing
              </DropdownItem>
              <DropdownItem
                icon={<HelpCircle size={20} />}
                onClick={() => console.log("Navigate to FAQ")}
              >
                FAQ
              </DropdownItem>
            </div>

            <DropdownFooter>
              <Button
                variant="danger"
                className="w-full justify-center gap-2 h-8"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user_data");
                  // navigate("/login");
                  navigate("/");
                }}
              >
                Logout
                <LogOut size={16} />
              </Button>
            </DropdownFooter>
          </Dropdown>
        </div>
      </header>

      {/* Mobile sub-header for Tenant & Branch */}
      {(tenantName || branchName) && (
        <div
          className={cn(
            "flex md:hidden items-center justify-start gap-2 px-4 py-3.5 mt-3 mx-4 rounded-md border-b border-(--border) bg-(--bg-panel) shrink-0",
            "[:root[data-skin='default']_&]:border-b-0 [:root[data-skin='default']_&]:shadow-[0_1px_8px_0_rgba(0,0,0,0.06)]",
          )}
        >
          <div className="flex items-center gap-1.5 leading-tight">
            {tenantName && (
              <span className="flex items-center gap-1 truncate">
                <Building2 size={14} className="shrink-0 text-(--primary)" />
                <span className="truncate font-medium">{tenantName}</span>
              </span>
            )}
            {tenantName && branchName && (
              <ChevronRight size={18} className="shrink-0" />
            )}
            {branchName && (
              <span className="flex items-center gap-1 truncate">
                <Store size={14} className="shrink-0 text-(--primary)" />
                <span className="truncate font-medium">{branchName}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
