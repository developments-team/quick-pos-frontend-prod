/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { ChevronRight, Minus, Plus, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "../ui/Input";
import type { POSCartItem, POSMode } from "./types";

export interface CartItemProps {
  item: POSCartItem;
  isExpanded: boolean;
  onToggle: () => void;
  onQuantityChange: (delta: number) => void;
  onPriceChange: (price: number) => void;
  onNoteChange: (note: string) => void;
  onRemove: () => void;
  onDiscountChange: (discount: number) => void;
  onDiscountTypeChange: (type: "amount" | "percent") => void;
  priceMode: POSMode;
}

export function CartItem({
  item,
  isExpanded,
  onToggle,
  onQuantityChange,
  onPriceChange,
  onNoteChange,
  onRemove,
  onDiscountChange,
  onDiscountTypeChange,
  priceMode,
}: CartItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const currentPrice =
    priceMode === "purchase" ? item.purchasePrice : item.salePrice;
  const priceLabel = priceMode === "purchase" ? "Purchase Price" : "Sale Price";

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded, item]);

  return (
    <div
      className={cn(
        "border-b border-(--border)",
        isExpanded && "border-l-2 border-l-(--primary)",
      )}
    >
      {/* Header row - always visible */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
          !isExpanded && "hover:bg-(--bg-item)/30",
        )}
        onClick={onToggle}
      >
        {/* Chevron */}
        <ChevronRight
          size={16}
          className={`text-(--text-muted) transition-transform duration-300 ease-in-out ${
            isExpanded ? "rotate-90" : ""
          }`}
        />

        {/* Item name */}
        <div className="flex-1 min-w-0 flex flex-col">
          <span
            className={cn(
              "text-sm truncate",
              isExpanded && "font-medium text-(--text-primary)",
            )}
          >
            {item.productName}
          </span>
          {item.variantString && (
            <span className="text-sm truncate">({item.variantString})</span>
          )}
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-1">
          <button
            className="w-5 h-5 rounded-full border border-(--text-muted)/60 flex items-center justify-center text-(--text-standard) cursor-pointer hover:bg-(--bg-item) hover:text-(--text-primary) transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(-1);
            }}
          >
            <Minus size={10} />
          </button>
          <span className="text-xs w-6 text-center text-(--text-primary)">
            {item.quantity}
          </span>
          <button
            className="w-5 h-5 rounded-full border border-(--text-muted)/60 flex items-center justify-center text-(--text-standard) cursor-pointer hover:bg-(--bg-item) hover:text-(--text-primary) transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(1);
            }}
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Price */}
        <span className="text-sm font-medium w-20 text-right text-(--text-primary)">
          ${item.total?.toFixed(2)}
        </span>

        {/* Remove button */}
        <button
          className="text-(--text-muted) hover:text-(--danger) cursor-pointer transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XCircle size={16} />
        </button>
      </div>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : "0px",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="px-3 pb-3 pt-1 space-y-2">
          {/* Quantity and Price inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div className="">
              <label className="text-[10px] text-(--text-muted) uppercase">
                Quantity
              </label>
              <Input
                type="number"
                step="0.01"
                value={item.quantity}
                onChange={(e) => {
                  const qty = parseFloat(e.target.value) || 1;
                  onQuantityChange(qty - item.quantity);
                }}
                className="h-8 text-sm"
              />
            </div>
            <div className="">
              <label className="text-[10px] text-(--text-muted) uppercase">
                {priceLabel}
              </label>
              <Input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
            <div className="">
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-(--text-muted) uppercase">
                  Discount
                </label>
                <div className="flex bg-(--bg-card) rounded-md p-0.5 border border-(--border)">
                  <button
                    className={`cursor-pointer px-2 text-xs py-0.5 rounded-sm transition-colors ${
                      item.discountType === "percent"
                        ? "bg-(--bg-item) shadow-sm font-medium text-(--text-primary)"
                        : "hover:bg-(--bg-hover)"
                    }`}
                    onClick={() => onDiscountTypeChange("percent")}
                  >
                    %
                  </button>
                  <button
                    className={`cursor-pointer px-2 text-xs py-0.5 rounded-sm transition-colors ${
                      item.discountType === "amount"
                        ? "bg-(--bg-item) shadow-sm font-medium text-(--text-primary)"
                        : "hover:bg-(--bg-hover)"
                    }`}
                    onClick={() => onDiscountTypeChange("amount")}
                  >
                    $
                  </button>
                </div>
              </div>
              <Input
                type="number"
                step="0.01"
                value={item.discount}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Note */}
          <div className="">
            <label className="text-[10px] text-(--text-muted) uppercase">
              Note
            </label>
            <textarea
              value={item.note || ""}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full h-12 text-sm p-2 border border-(--border) bg-(--input-bg) text-(--text-primary) rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-(--primary) placeholder-(--text-muted)"
              placeholder="Add a note..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
