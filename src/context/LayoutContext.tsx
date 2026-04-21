import { createContext, useContext, useState, useEffect } from "react";

export interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  pageType: string;
  setPageType: (type: string) => void;
  themeMode: "dark" | "light" | "system";
  setThemeMode: (theme: "dark" | "light" | "system") => void;
  skin: "default" | "bordered";
  setSkin: (skin: "default" | "bordered") => void;
  isMiniMode: boolean;
  setIsMiniMode: (miniMode: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [pageType, setPageType] = useState("default");
  const [isMiniMode, setIsMiniMode] = useState(false);

  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">(
    () => {
      const savedTheme = localStorage.getItem("theme") as
        | "dark"
        | "light"
        | "system"
        | null;
      return savedTheme || "system";
    }
  );

  const [skin, setSkin] = useState<"default" | "bordered">(() => {
    const savedSkin = localStorage.getItem("skin") as
      | "default"
      | "bordered"
      | null;
    return savedSkin || "default";
  });

  useEffect(() => {
    const getSystemTheme = () => {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    if (themeMode === "system") {
      const systemTheme = getSystemTheme();
      document.documentElement.setAttribute("data-theme", systemTheme);

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      document.documentElement.setAttribute("data-theme", themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-skin", skin);
  }, [skin]);

  const changeTheme = (newTheme: "dark" | "light" | "system") => {
    setThemeMode(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const changeSkin = (newSkin: "default" | "bordered") => {
    setSkin(newSkin);
    localStorage.setItem("skin", newSkin);
  };

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        cartOpen,
        setCartOpen,
        pageType,
        setPageType,
        themeMode,
        setThemeMode: changeTheme,
        skin,
        setSkin: changeSkin,
        isMiniMode,
        setIsMiniMode,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
