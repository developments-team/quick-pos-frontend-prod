/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown, Package, Search } from "lucide-react";
import { Dropdown } from "../ui/Dropdown";
import { Input } from "../ui/Input";
import { ChipSelector } from "../ui/ChipSelector";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import type { CategoryOption, POSCartItem, POSMode, POSProduct } from "./types";
import { useLayout } from "../../context/LayoutContext";

export interface ProductGridProps {
  products: POSProduct[];
  cart: POSCartItem[];
  onAddToCart: (product: POSProduct) => void;
  categoryOptions: CategoryOption[];
  isLoading?: boolean;
  priceMode: POSMode;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export function ProductGrid({
  products,
  cart,
  onAddToCart,
  categoryOptions,
  isLoading,
  priceMode,
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
}: ProductGridProps) {
  const { isMiniMode } = useLayout();
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] =
    React.useState(false);

  // Grid column classes based on sidebar mini mode
  // When sidebar is mini (collapsed), we have more space so show more columns
  const gridColsClass = isMiniMode
    ? "grid-cols-1 min-[18rem]:grid-cols-2 min-[28rem]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 min-[70rem]:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    : "grid-cols-1 min-[18rem]:grid-cols-2 min-[28rem]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-2 min-[70rem]:grid-cols-3 xl:grid-cols-3 min-[85rem]:grid-cols-4 min-[90rem]:grid-cols-5 2xl:grid-cols-6";
  const getSelectedLabel = () => {
    if (selectedCategories.length === 0) return "Category";
    if (selectedCategories.length === 1) {
      return (
        categoryOptions.find((opt) => opt.value === selectedCategories[0])
          ?.label || "Category"
      );
    }
    return `${selectedCategories.length} Selected`;
  };

  return (
    <div className="flex-1 flex flex-col gap-0 h-full overflow-hidden">
      {/* Top Search - Product search and category */}
      <div className="flex flex-col md:flex-row gap-2 border border-(--border) bg-(--bg-card) rounded-md p-1.5 shrink-0">
        <Input
          placeholder="Search Product"
          leftIcon={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Dropdown
          open={isCategoryDropdownOpen}
          onOpenChange={setIsCategoryDropdownOpen}
          trigger={
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{getSelectedLabel()}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 opacity-50 transition-transform duration-200",
                  isCategoryDropdownOpen && "transform rotate-180",
                )}
              />
            </div>
          }
          className="w-80 p-2 right-0"
          autoHide={false}
          triggerClassName={cn(
            "w-full md:w-[13rem] px-3 py-2.25 text-sm border border-(--border) bg-(--input-bg) rounded-md transition-all duration-200 text-left outline-none",
            !isCategoryDropdownOpen && "hover:border-(--text-muted)",
            "focus-visible:ring-1 focus-visible:ring-(--primary) focus-visible:border-(--primary)",
            isCategoryDropdownOpen &&
              "border-(--primary) ring-1 ring-(--primary)",
          )}
        >
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            <ChipSelector
              options={categoryOptions}
              value={selectedCategories}
              onChange={(val) => onCategoryChange(val as string[])}
              multiple={true}
            />
          </div>
        </Dropdown>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-md p-2 px-0.25">
        {isLoading ? (
          <div className={cn("grid gap-2", gridColsClass)}>
            {Array.from({ length: 15 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-(--text-muted)">
            <Package size={48} className="mb-2 opacity-50" />
            <p>No products found</p>
          </div>
        ) : (
          <div className={cn("grid gap-2", gridColsClass)}>
            {products.map((product) => {
              const totalQuantity = cart
                .filter((item) => item.productId === product.id)
                .reduce((sum, item) => sum + item.quantity, 0);

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartItem={cart.find((item) => item.productId === product.id)}
                  onClick={() => onAddToCart(product)}
                  priceMode={priceMode}
                  totalQuantity={totalQuantity}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
