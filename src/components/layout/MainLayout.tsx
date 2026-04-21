import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

import { useLayout } from "../../context/LayoutContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

import { cn } from "../../lib/utils";

// ...

// ...
// ...

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, setSidebarOpen, cartOpen, setCartOpen } = useLayout();

  return (
    <div className="flex h-screen w-screen bg-(--bg-app) overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-500 ease-in-out",
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 transparent-scrollbar">
          {children}
        </div>
        <Footer />
      </main>

      {/* Mobile Cart Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}
