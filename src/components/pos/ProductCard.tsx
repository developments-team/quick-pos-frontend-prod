import { Package } from "lucide-react";
import { cn } from "../../lib/utils";
import type { POSCartItem, POSMode, POSProduct } from "./types";

export interface ProductCardProps {
  product: POSProduct;
  cartItem?: POSCartItem;
  onClick: () => void;
  priceMode: POSMode;
  children?: React.ReactNode;
  totalQuantity?: number;
}

export function ProductCard({
  product,
  cartItem,
  onClick,
  priceMode,
  children,
  totalQuantity,
}: ProductCardProps) {
  const quantity = totalQuantity ?? (cartItem?.quantity || 0);
  const detail = product.productDetails?.[0];
  const displayPrice =
    priceMode === "purchase" ? detail?.purchasePrice : detail?.salePrice;

  // Check if product is out of stock (only for sales, quantity is 0 or null)
  const stockQuantity =
    detail?.currentStock ?? detail?.quantity ?? product.quantity ?? null;
  const isOutOfStock =
    priceMode === "sale" && (stockQuantity === 0 || stockQuantity === null);
  const handleClick = () => {
    if (!isOutOfStock) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative rounded-xl border transition-all duration-300 overflow-hidden flex flex-col",
        "bg-(--bg-card)",
        isOutOfStock
          ? //"cursor-not-allowed opacity-70 grayscale border-(--border)"
            "cursor-not-allowed border-red-500/25"
          : "cursor-pointer hover:-translate-y-1 hover:shadow-xl",
        !isOutOfStock && quantity > 0
          ? "border-(--primary) ring-1 ring-(--primary)"
          : !isOutOfStock && "border-(--border) hover:border-(--primary)/50",
      )}
    >
      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-0 right-0 z-30 bg-linear-to-r from-red-600/20 to-red-500/20 text-[0.6rem] font-bold tracking-wider px-1.5 py-0.5 rounded shadow-md uppercase">
          Out of Stock
        </div>
      )}

      {/* Quantity Badge */}
      {quantity > 0 && (
        <div className="absolute top-2 right-2 z-40 flex h-6 w-6 items-center justify-center rounded-full bg-(--primary) text-[0.72rem] font-bold text-white shadow-md animate-in zoom-in spin-in-12 duration-300">
          {quantity}
        </div>
      )}

      {/* Price Tag */}
      <div
        className={cn(
          "absolute top-2 left-2 z-10 rounded-lg bg-(--bg-panel)/90 backdrop-blur-md px-2 py-1 text-xs font-semibold shadow-sm transition-colors duration-300 text-(--text-primary)",
          !isOutOfStock && "group-hover:bg-(--primary) group-hover:text-white",
        )}
      >
        ${displayPrice?.toFixed(2) || "0.00"}
      </div>

      {/* Image Area */}
      <div
        className={cn(
          "relative flex h-24 items-center justify-center bg-linear-to-b from-(--bg-item)/20 to-transparent transition-colors",
          !isOutOfStock && "group-hover:from-(--primary)/5",
        )}
      >
        {product.productImage ? (
          <img
            src={product.productImage}
            alt={product.name}
            className={cn(
              "h-full w-full transition-transform duration-500 ease-out",
              !isOutOfStock && "group-hover:scale-110",
            )}
          />
        ) : (
          <Package
            size={40}
            className={cn(
              "text-(--text-muted)/40 transition-colors",
              !isOutOfStock && "group-hover:text-(--primary)/60",
            )}
          />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "p-1 text-center relative z-10 flex-1 flex flex-col items-center justify-center",
          isOutOfStock ? "bg-red-500/1" : "bg-(--bg-card)",
        )}
      >
        <h3
          className={cn(
            "font-medium text-sm line-clamp-2 transition-colors",
            !children && "min-h-[2.5em]",
            quantity > 0
              ? "text-(--text-primary)"
              : !isOutOfStock && "group-hover:text-(--text-primary)",
            "items-center justify-center flex",
          )}
        >
          {product.name}
        </h3>
        {children}
      </div>

      {/* Active Overlay Effect */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300",
          quantity > 0
            ? "bg-(--primary)/5"
            : isOutOfStock
              ? "bg-red-500/3"
              : "opacity-0 group-hover:opacity-100 bg-linear-to-t from-(--bg-card) via-transparent to-transparent",
        )}
      />
    </div>
  );
}
