/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  Settings,
  ChevronRight,
  Users,
  Circle,
  CircleDot,
  X,
  Calculator,
  Wrench,
  ShoppingBag,
  Banknote,
  PieChart,
  Shield,
  ShieldCheck,
  Building2,
  NotepadText,
  Logs,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLayout } from "../../context/LayoutContext";
import { Button } from "../ui/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

// API response types
interface ApiMenuItem {
  id: string;
  name: string;
  url: string | null;
  icon: string;
  add: boolean | null;
  edit: boolean | null;
  delete: boolean | null;
  children?: ApiMenuItem[];
}

// Internal NavItem type
interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href?: string;
  subItems?: {
    id: string;
    icon: React.ElementType;
    label: string;
    href: string;
  }[];
}

// Icon mapping from API string names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Circle,
  Calculator,
  Wrench,
  ShoppingBag,
  Banknote,
  PieChart,
  Shield,
  ShieldCheck,
  Building2,
  NotepadText,
  Logs,
};

// Helper function to get icon component from string name
const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Circle;
};

// Transform API menu data to NavItem format
const transformMenuData = (apiMenus: ApiMenuItem[]): NavItem[] => {
  return apiMenus.map((menu) => ({
    id: menu.id,
    icon: getIconComponent(menu.icon),
    label: menu.name,
    href: menu.url || undefined,
    subItems:
      menu.children && menu.children.length > 0
        ? menu.children.map((child) => ({
            id: child.id,
            icon: getIconComponent(child.icon),
            label: child.name,
            href: child.url!,
          }))
        : undefined,
  }));
};

export function Sidebar({ className, ...props }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, isMiniMode, setIsMiniMode } =
    useLayout();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeParent, setActiveParent] = useState<string>("dashboard");
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tempCollapsed, setTempCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  const navRef = useRef<HTMLElement>(null);

  // Determine if sidebar should be fully expanded
  // It is expanded if:
  // 1. We are NOT in mini mode (normal mode)
  // 2. OR we are in mini mode BUT the user is hovering over it AND we are not temporarily collapsed
  const isSidebarExpanded = !isMiniMode || (isHovered && !tempCollapsed);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleChildClick = (
    parentId: string,
    childId: string,
    href?: string,
  ) => {
    // When a child is selected, ensure only its parent menu remains expanded
    setExpandedItems([parentId]);
    setActiveParent(parentId);
    setActiveChild(childId);
    if (href) navigate(href);
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const { getNavigationMenus } = useProvider();

  // Get roleId from localStorage
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
  const roleId = userData?.role?.id || "";

  // Fetch menu data from API
  const { data: menus } = useQuery({
    queryKey: ["menus", roleId],
    queryFn: () => getNavigationMenus(roleId),
    enabled: !!roleId,
  });

  // Extract menus array from response (handle both direct array and nested data)
  const apiMenus: ApiMenuItem[] = Array.isArray(menus)
    ? menus
    : menus?.data || [];

  // Transform API data to internal NavItem format
  const navItems = useMemo(() => {
    return transformMenuData(apiMenus);
  }, [apiMenus]);

  // Update active states based on current route
  useEffect(() => {
    if (navItems.length === 0) return;

    const currentPath = location.pathname;

    // Special case for dashboard root
    if (currentPath === "/") {
      const dashboardItem = navItems.find(
        (item) => item.href === "/" || item.label === "Dashboard",
      );
      if (dashboardItem) {
        setActiveParent(dashboardItem.id);
        setActiveChild(null);
      }
      return;
    }

    // Find matching item
    for (const item of navItems) {
      // Check sub-items first
      if (item.subItems) {
        const matchingSub = item.subItems.find(
          (sub) => sub.href !== "#" && currentPath.startsWith(sub.href),
        );
        if (matchingSub) {
          setActiveParent(item.id);
          setActiveChild(matchingSub.id);
          setExpandedItems((prev) =>
            prev.includes(item.id) ? prev : [...prev, item.id],
          );
          return;
        }
      }

      // Check main item
      if (item.href && item.href !== "/" && currentPath.startsWith(item.href)) {
        setActiveParent(item.id);
        setActiveChild(null);
        return;
      }
    }
  }, [location.pathname, navItems]);

  const handleParentClick = (
    id: string,
    hasSubItems: boolean,
    href?: string,
  ) => {
    if (hasSubItems) {
      toggleExpand(id);
    } else {
      setExpandedItems([id]);
      setActiveParent(id);
      setActiveChild(null);
      if (href) navigate(href);
      // Close sidebar on mobile when a link is clicked
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  };

  return (
    <>
      {/* Spacer for Layout Transition */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out",
          isMiniMode ? "w-[70px]" : "w-[260px]",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full bg-(--bg-panel) border-r border-(--border) flex flex-col p-1 transition-[width,transform,box-shadow,translate] duration-300 ease-in-out",
          // Mobile behavior
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          "lg:translate-x-0", // Always visible on desktop

          // Desktop behavior
          "lg:fixed lg:z-50",

          // Width logic
          isSidebarExpanded ? "lg:w-[260px]" : "lg:w-[70px]",

          // Base width for mobile
          "w-[260px]",

          "[:root[data-skin='default']_&]:border-r-0 [:root[data-skin='default']_&]:shadow-[1px_0_20px_0_rgba(0,0,0,0.1)]",
          "[:root[data-theme='light'][data-skin='default']_&]:shadow-[1px_0_12px_0_rgba(0,0,0,0.05)]",
          className,
        )}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setTempCollapsed(false); // Reset temp collapsed state when mouse leaves
        }}
        {...props}
      >
        <div
          className={cn(
            "relative px-1 -mt-1.5 flex items-center justify-between h-[70px] shrink-0 z-20 transition-all duration-200",
            // Add a bottom border/shadow when scrolled for better separation if desired,
            // but the gradient mask below handles the "blur" feel.
          )}
        >
          <div className="flex items-center justify-between w-full overflow-hidden">
            {/* Logo Section */}
            <div
              className={cn(
                "flex items-center gap-3",
                isSidebarExpanded ? "ml-3" : "ml-2.5",
              )}
            >
              {/* <div className="w-8 h-8 bg-(--primary) rounded-md flex items-center justify-center text-white font-bold shrink-0 shadow-sm transition-all duration-500 ease-in-out">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className={cn(
                  "text-xl font-bold text-(--text-primary) tracking-tight whitespace-nowrap",
                  isSidebarExpanded
                    ? "lg:opacity-100 lg:w-auto"
                    : "lg:opacity-0 w-0"
                )}
              >
                QuickPOS
              </span> */}
            </div>

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-(--table-border) hover:text-(--text-primary)"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </Button>

            {/* Desktop Toggle Button */}
            <div
              className={cn(
                "hidden",
                isSidebarExpanded ? "lg:block" : "lg:hidden",
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-(--table-border) hover:text-(--text-primary) h-8 w-8"
                onClick={() => {
                  if (!isMiniMode) {
                    // Switching TO mini mode
                    setIsMiniMode(true);
                    setTempCollapsed(true); // Immediately collapse even if hovered
                  } else {
                    // Switching FROM mini mode (back to normal)
                    setIsMiniMode(false);
                    setTempCollapsed(false);
                  }
                }}
              >
                {isMiniMode ? <Circle size={20} /> : <CircleDot size={20} />}
              </Button>
            </div>
          </div>

          {/* Scroll Blur/Shadow Effect */}
          <div
            className={cn(
              "absolute -bottom-6 left-0 right-0 h-6 bg-(--bg-panel) z-10 pointer-events-none transition-opacity duration-300 ease-in-out",
              isScrolled ? "opacity-100" : "opacity-0",
            )}
            style={{
              maskImage: "linear-gradient(to bottom, black, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
            }}
          />
        </div>

        <nav
          ref={navRef}
          className="flex flex-col gap-1 p-2 pr-1 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-0"
          style={{
            scrollbarGutter: "stable",
          }}
          onScroll={(e) => {
            handleScroll(e);
          }}
        >
          {navItems.map((item) => {
            const isParentActive = activeParent === item.id && !activeChild;
            const hasActiveChild = activeParent === item.id && activeChild;

            return (
              <div key={item.id} className="flex flex-col">
                <button
                  className={cn(
                    "flex items-center justify-between p-2 px-3 rounded-md font-medium w-full text-left border-none mb-1 text-[0.9375rem] cursor-pointer focus:outline-none select-none",
                    isParentActive ||
                      hasActiveChild ||
                      expandedItems.includes(item.id)
                      ? "text-(--text-primary) bg-(--secondary)/30 shadow-none"
                      : "text-(--text-standard) bg-transparent hover:bg-(--secondary)/30 hover:text-(--text-primary)",

                    isParentActive || hasActiveChild ? "font-semibold" : "",
                  )}
                  onClick={() =>
                    handleParentClick(item.id, !!item.subItems, item.href)
                  }
                >
                  {/* <div className={cn("flex gap-3", !isSidebarExpanded && "w-full")}>
                    <item.icon size={20} className="shrink-0" />
                    {isSidebarExpanded && <span className="whitespace-nowrap">{item.label}</span>}
                  </div> */}
                  <div className="flex gap-3 items-center w-full">
                    <item.icon size={20} className="shrink-0" />
                    <span
                      className={cn(
                        "transition-opacity duration-200",
                        isSidebarExpanded
                          ? "opacity-100"
                          : "lg:opacity-0 lg:w-0 lg:overflow-hidden",
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {item.subItems && isSidebarExpanded && (
                    <div className="ml-auto">
                      <ChevronRight
                        size={20}
                        className={`transition-transform duration-300 ${
                          expandedItems.includes(item.id)
                            ? "rotate-90"
                            : "rotate-0"
                        }`}
                      />
                    </div>
                  )}
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-in-out",
                    expandedItems.includes(item.id) && isSidebarExpanded
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden flex flex-col">
                    {item.subItems?.map((sub) => (
                      <button
                        key={sub.id}
                        className={cn(
                          "flex items-center gap-4 my-[3px] py-2 px-4 pl-[1.2rem] text-[0.9375rem] font-medium rounded-md text-left border-none mb-1 ml-0 cursor-pointer focus:outline-none select-none",
                          hasActiveChild && activeChild === sub.id
                            ? "bg-(--primary) text-(--primary-foreground) font-semibold shadow-[0_2px_10px_0_rgba(0,0,0,0.1)]"
                            : "bg-transparent text-(--text-standard) hover:text-(--text-primary) hover:bg-(--secondary)/30", // hover:bg-(--hover-item-bg)"
                        )}
                        onClick={() =>
                          handleChildClick(item.id, sub.id, sub.href)
                        }
                      >
                        <sub.icon size={11} />
                        <span className="line-clamp-1">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer"></div>
      </aside>
    </>
  );
}
