import React from "react";
import { Wifi, WifiOff, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

export function Footer() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <footer
      className={cn(
        "flex flex-col md:flex-row items-center justify-between h-auto md:h-10 py-3 md:py-0 px-4 border-t border-(--border) bg-(--bg-panel) text-[0.8125rem] font-medium text-(--text-secondary) shrink-0 gap-2 md:gap-0",
        "[:root[data-skin='default']_&]:border-t-0 [:root[data-skin='default']_&]:shadow-[0_-1px_15px_0_rgba(0,0,0,0.1)] [:root[data-skin='default']_&]:z-10",
        "[:root[data-theme='light'][data-skin='default']_&]:shadow-[0_-1px_10px_0_rgba(0,0,0,0.05)]",
      )}
    >
      <div className="flex items-center gap-4">
        <span>NexusPOS v1.0.0</span>
        <span className="text-(--border)">•</span>
        <span>© 2025 Nexus Systems</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {isOnline ? (
            <>
              <Wifi size={14} className="text-(--success)" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-(--danger)" />
              <span>Offline</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Circle size={10} className="text-(--success) fill-current" />
          <span>System Operational</span>
        </div>
      </div>
    </footer>
  );
}
