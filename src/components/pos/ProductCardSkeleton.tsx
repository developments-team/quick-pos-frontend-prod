import { Skeleton } from "../ui/Skeleton";
import { cn } from "../../lib/utils";

export function ProductCardSkeleton() {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-(--border) overflow-hidden flex flex-col bg-(--bg-card)",
        "hover:animate-none",
      )}
    >
      {/* Price Tag Skeleton */}
      <div className="absolute top-2 left-2 z-10 rounded-lg bg-(--bg-panel)/90 px-2 py-1">
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Image Area Skeleton */}
      <div className="relative flex h-24 items-center justify-center bg-(--bg-item)/10">
        <Skeleton className="h-16 w-16 opacity-20" />
      </div>

      {/* Content Skeleton */}
      <div className="p-1 px-2 pt-2 text-center bg-(--bg-card) relative z-10 flex-1 flex flex-col items-center justify-center gap-1.5 pb-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
