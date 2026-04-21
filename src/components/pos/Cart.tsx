import {
  Package,
  Search,
  XCircle,
  Pencil,
  X,
  Pause,
  RotateCcw,
  Plus,
} from "lucide-react";
import { Button } from "../ui/Button";
import { CartItem } from "./CartItem";
import { useState, useRef, useEffect } from "react";
import type {
  POSCartItem,
  POSMode,
  POSTotals,
  PartyOption,
  PartyType,
} from "./types";
import { Input } from "../ui/Input";
import { cn } from "../../lib/utils";
import { SearchableTextbox } from "../ui/SearchableTextbox";
import { CustomersEntry, type Customer } from "../../pages/Customers";
import { VendorsEntry, type Vendor } from "../../pages/Vendors";

export interface CartProps {
  cart: POSCartItem[];
  party: string;
  onPartyChange: (partyId: string) => void;
  partyOptions: PartyOption[];
  partyType: PartyType;
  expandedItemId: string | null;
  onToggleExpand: (itemId: string) => void;
  onQuantityChange: (itemId: string, delta: number) => void;
  onPriceChange: (itemId: string, price: number) => void;
  onDiscountChange: (itemId: string, discount: number) => void;
  onDiscountTypeChange: (itemId: string, type: "amount" | "percent") => void;
  onNoteChange: (itemId: string, note: string) => void;
  onRemove: (itemId: string) => void;
  onPay: () => void;
  onReset: () => void;
  totals: POSTotals;
  priceMode: POSMode;
  isPending?: boolean;
  showCartMobile?: boolean;
  onCloseMobile?: () => void;
  onDiscountGlobalPercentChange?: (value: number) => void;
  onDiscountGlobalAmountChange?: (value: number) => void;
  onAddCost?: () => void;
  onApplyDiscountToAll?: (value: number, type: "amount" | "percent") => void;
  globalDiscountType?: "amount" | "percent";
  onGlobalDiscountTypeChange?: (type: "amount" | "percent") => void;
  discountItemsType?: "amount" | "percent";
  // Hold order functionality (for sales)
  onHoldOrder?: () => void;
  onOpenHeldOrders?: () => void;
  heldOrdersCount?: number;
}

export function Cart({
  cart,
  party,
  onPartyChange,
  partyOptions,
  partyType,
  expandedItemId,
  onToggleExpand,
  onQuantityChange,
  onPriceChange,
  onDiscountChange,
  onDiscountTypeChange,
  onNoteChange,
  onRemove,
  onPay,
  onReset,
  totals,
  priceMode,
  isPending,
  showCartMobile,
  onCloseMobile,
  onDiscountGlobalPercentChange,
  onDiscountGlobalAmountChange,
  onAddCost,
  onApplyDiscountToAll,
  globalDiscountType = "amount",
  onGlobalDiscountTypeChange,
  discountItemsType = "percent",
  onHoldOrder,
  onOpenHeldOrders,
  heldOrdersCount = 0,
}: CartProps) {
  const partyPlaceholder =
    partyType === "vendor" ? "Search Vendors" : "Search Customers";

  const [isDiscountPopoverOpen, setIsDiscountPopoverOpen] = useState(false);
  // Removed local discountType state
  const [tempValue, setTempValue] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const [isDiscountAllPopoverOpen, setIsDiscountAllPopoverOpen] =
    useState(false);
  const [discountAllType, setDiscountAllType] = useState<"percent" | "amount">(
    discountItemsType,
  );
  const [tempAllValue, setTempAllValue] = useState("");
  const discountAllPopoverRef = useRef<HTMLDivElement>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Sync discountAllType when discountItemsType prop changes (e.g., after async data load)
  useEffect(() => {
    setDiscountAllType(discountItemsType);
  }, [discountItemsType]);

  // Reset internal state when cart is cleared
  useEffect(() => {
    if (cart.length === 0) {
      setTempValue("");
      setTempAllValue("");
      setIsDiscountPopoverOpen(false);
      setIsDiscountAllPopoverOpen(false);
    }
  }, [cart.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsDiscountPopoverOpen(false);
      }
      if (
        discountAllPopoverRef.current &&
        !discountAllPopoverRef.current.contains(event.target as Node)
      ) {
        setIsDiscountAllPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set initial discount type based on existing values
  // Initialize discount type if needed, but avoid useEffect loop
  // Just let user switch it if they want.

  // Calculate total discount applied to items
  let totalItemDiscount = 0;
  let uniformDiscountValue: number | null = null;
  let uniformDiscountType: "percent" | "amount" | null = null;
  let isUniform = true;

  if (cart.length > 0) {
    const firstItem = cart[0];
    uniformDiscountValue = firstItem.discount || 0;
    uniformDiscountType =
      (firstItem.discountType as "percent" | "amount") || "amount";

    cart.forEach((item) => {
      const itemPrice =
        priceMode === "purchase" ? item.purchasePrice : item.salePrice;
      const originalTotal = itemPrice * item.quantity;
      const currentTotal = item.total || 0;
      totalItemDiscount += originalTotal - currentTotal;

      if (
        item.discount !== uniformDiscountValue ||
        item.discountType !== uniformDiscountType
      ) {
        isUniform = false;
      }
    });

    if (!isUniform) {
      uniformDiscountValue = null;
      uniformDiscountType = null;
    }
  } else {
    isUniform = false;
  }

  const handleEditClick = () => {
    if (isDiscountPopoverOpen) {
      setIsDiscountPopoverOpen(false);
    } else {
      setIsDiscountPopoverOpen(true);
      // Initialize type based on current values when opening
      if (globalDiscountType === "amount") {
        setTempValue(
          totals.discountGlobal > 0 ? totals.discountGlobal.toString() : "",
        );
      } else {
        setTempValue(
          totals.discountPercent > 0 ? totals.discountPercent.toString() : "",
        );
      }
    }
  };

  const handleDiscountChange = (valStr: string) => {
    setTempValue(valStr);
    const val = parseFloat(valStr);

    if (globalDiscountType === "percent") {
      if (!isNaN(val)) {
        if (onDiscountGlobalPercentChange) onDiscountGlobalPercentChange(val);
      } else if (valStr === "") {
        if (onDiscountGlobalPercentChange) onDiscountGlobalPercentChange(0);
      }
    } else {
      if (!isNaN(val)) {
        if (onDiscountGlobalAmountChange) onDiscountGlobalAmountChange(val);
      } else if (valStr === "") {
        if (onDiscountGlobalAmountChange) onDiscountGlobalAmountChange(0);
      }
    }
  };

  const handleTypeSwitch = (type: "percent" | "amount") => {
    if (onGlobalDiscountTypeChange) onGlobalDiscountTypeChange(type);

    // Keep the same numeric value, just apply it with the new type
    // Get current value from tempValue or from existing totals
    let currentVal = 0;
    if (tempValue !== "") {
      const parsed = parseFloat(tempValue);
      if (!isNaN(parsed)) currentVal = parsed;
    } else {
      // If no tempValue, get from current applied value
      if (globalDiscountType === "percent") {
        currentVal = totals.discountPercent || 0;
      } else {
        currentVal = totals.discountGlobal || 0;
      }
    }

    // Apply the same value with new type
    if (type === "percent") {
      if (onDiscountGlobalPercentChange)
        onDiscountGlobalPercentChange(currentVal);
    } else {
      if (onDiscountGlobalAmountChange)
        onDiscountGlobalAmountChange(currentVal);
    }

    setTempValue(currentVal > 0 ? currentVal.toString() : "");
  };

  const handleEditAllClick = () => {
    if (isDiscountAllPopoverOpen) {
      setIsDiscountAllPopoverOpen(false);
    } else {
      setIsDiscountAllPopoverOpen(true);
      if (
        isUniform &&
        uniformDiscountValue !== null &&
        uniformDiscountValue > 0
      ) {
        setTempAllValue(uniformDiscountValue.toString());
        if (uniformDiscountType) setDiscountAllType(uniformDiscountType);
      } else {
        setTempAllValue(""); // Start clean for bulk action if mixed or no value
      }
    }
  };

  const handleDiscountAllChange = (valStr: string) => {
    setTempAllValue(valStr);
    const val = parseFloat(valStr);
    if (!isNaN(val) && onApplyDiscountToAll) {
      onApplyDiscountToAll(val, discountAllType);
    } else if (valStr === "" && onApplyDiscountToAll) {
      onApplyDiscountToAll(0, discountAllType);
    }
  };

  const handleAllTypeSwitch = (type: "percent" | "amount") => {
    setDiscountAllType(type);
    // Apply immediately using current input value OR uniform value
    const val =
      tempAllValue !== ""
        ? parseFloat(tempAllValue)
        : isUniform && uniformDiscountValue !== null
          ? uniformDiscountValue
          : 0;

    if (!isNaN(val) && onApplyDiscountToAll) {
      onApplyDiscountToAll(val, type);
    }
  };

  return (
    <>
      <div
        className={`
        fixed inset-0 z-50 bg-(--bg-app) flex flex-col transition-transform duration-300 ease-in-out
        lg:relative lg:inset-auto lg:translate-x-0 lg:w-96 xl:w-[424px] lg:h-full lg:block lg:z-0
        ${showCartMobile ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* Mobile Header with Close Button */}
        {/* <div className="flex items-center justify-between p-3 border-b border-(--border) lg:hidden bg-(--bg-card)">
        <span className="font-semibold text-(--text-primary)">
          Cart ({cart.length} items)
        </span>
        <button
          onClick={onCloseMobile}
          className="p-2 -mr-2 text-(--text-muted) hover:text-(--text-primary)"
        >
          <XCircle size={24} />
        </button>
      </div> */}

        <div
          className={cn(
            "flex items-center justify-between px-6 py-4 shrink-0",
            "border-b border-(--border) lg:hidden bg-(--bg-card)",
          )}
        >
          <h3 className="text-lg font-semibold text-(--text-primary)">
            Cart ({cart.length} items)
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="h-9.5 w-9.5 rounded-full ml-auto hover:font-semibold active:scale-95 transition-transform"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Unified Cart Sidebar */}
        <div className="flex-1 lg:h-full bg-(--bg-card) border-x border-b lg:border border-(--border) lg:rounded-md shadow-sm flex flex-col overflow-hidden">
          {/* Party search */}
          <div className="p-1.5 shrink-0 border-b border-(--border)">
            {party && partyOptions.find((p) => p.value === party) ? (
              <div className="flex items-center justify-between pl-3 py-0.75 rounded-md border border-(--border)">
                <div className="flex items-center gap-2">
                  {/* <div className="w-8 h-8 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary)">
                    {partyType === "vendor" ? (
                      <Package size={16} />
                    ) : (
                      <Package size={16} /> // Or User icon if imported
                    )}
                  </div> */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-(--text-primary)">
                      {partyOptions.find((p) => p.value === party)?.label}
                    </span>
                    {/* <span className="text-xs text-(--text-muted) capitalize">
                      {partyType}
                    </span> */}
                  </div>
                </div>
                <button
                  onClick={() => onPartyChange("")}
                  className="h-8 w-8 p-0 text-(--text-muted) hover:text-(--text-primary)"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <SearchableTextbox
                options={partyOptions}
                value={party}
                onChange={onPartyChange}
                placeholder={partyPlaceholder}
                allowClear
                leftIcon={<Search size={16} />}
                rightAddon={
                  <Button
                    type="button"
                    ghost
                    className="px-3 rounded-none h-9.5 rounded-r-md"
                    onClick={() => {
                      if (partyType === "vendor") {
                        setIsVendorModalOpen(true);
                      } else {
                        setIsCustomerModalOpen(true);
                      }
                    }}
                    tabIndex={-1}
                  >
                    <Plus size={16} />
                  </Button>
                }
                rightAddonClassName="p-0 "
              />
            )}
          </div>

          {/* Cart Items List with expandable items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-(--text-muted)">
                <Package size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No items in cart</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.id}-${item.animationKey || 0}`}
                  className="animate-slide-in"
                >
                  <CartItem
                    item={item}
                    isExpanded={expandedItemId === item.id}
                    onToggle={() => onToggleExpand(item.id!)}
                    onQuantityChange={(delta) =>
                      onQuantityChange(item.id!, delta)
                    }
                    onPriceChange={(price) => onPriceChange(item.id!, price)}
                    onDiscountChange={(discount) =>
                      onDiscountChange(item.id!, discount)
                    }
                    onDiscountTypeChange={(type) =>
                      onDiscountTypeChange(item.id!, type)
                    }
                    onNoteChange={(note) => onNoteChange(item.id!, note)}
                    onRemove={() => onRemove(item.id!)}
                    priceMode={priceMode}
                  />
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="border-t border-(--border) text-sm">
            {/* Sub Total */}
            <div className="flex justify-between items-center px-4 py-1.5 border-b border-(--border) text-(--text-primary) font-semibold">
              <span>Sub Total</span>
              <span>${totals.subTotal?.toFixed(2) || "0.00"}</span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center px-4 py-1.5 border-b border-(--border)">
              <span>Tax</span>
              <span>${totals.tax?.toFixed(2) || "0.00"}</span>
            </div>

            {/* Discount Items (Bulk Action) */}
            {onApplyDiscountToAll && (
              <div className="flex justify-between items-center px-4 py-1.5 border-b border-(--border)">
                <div
                  className="flex items-center gap-2 relative"
                  ref={isDiscountAllPopoverOpen ? discountAllPopoverRef : null}
                >
                  <span>Discount Items</span>

                  {/* Type Toggle - Inline */}
                  <div className="flex bg-(--bg-card) rounded-md p-0.5 border border-(--border)">
                    <button
                      className={`cursor-pointer px-2 text-xs py-0.5 rounded-sm transition-colors ${
                        discountAllType === "percent"
                          ? "bg-(--bg-item) shadow-sm font-medium text-(--text-primary)"
                          : "hover:bg-(--bg-hover)"
                      }`}
                      onClick={() => handleAllTypeSwitch("percent")}
                    >
                      %
                    </button>
                    <button
                      className={`cursor-pointer px-2 text-xs py-0.5 rounded-sm transition-colors ${
                        discountAllType === "amount"
                          ? "bg-(--bg-item) shadow-sm font-medium text-(--text-primary)"
                          : "hover:bg-(--bg-hover)"
                      }`}
                      onClick={() => handleAllTypeSwitch("amount")}
                    >
                      $
                    </button>
                  </div>

                  <button
                    onClick={handleEditAllClick}
                    className="cursor-pointer transition-colors"
                  >
                    <Pencil size={14} />
                  </button>

                  {/* Popover */}
                  {isDiscountAllPopoverOpen && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 bg-(--bg-card) shadow-xl rounded-md border border-(--border) p-1.5 flex items-center animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-(--bg-card) border-l border-b border-(--border) rotate-45 transform"></div>
                      <Input
                        type="number"
                        className="w-32 h-8 text-sm"
                        autoFocus
                        value={tempAllValue}
                        onChange={(e) =>
                          handleDiscountAllChange(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            setIsDiscountAllPopoverOpen(false);
                          if (e.key === "Escape")
                            setIsDiscountAllPopoverOpen(false);
                        }}
                      />
                    </div>
                  )}
                </div>
                <span>
                  {/* No value display here as it is an action applied to items */}
                  <span>${totalItemDiscount.toFixed(2)}</span>
                  {/* {isUniform &&
                  uniformDiscountType === "percent" &&
                  uniformDiscountValue && (
                    <span className="text-xs ml-1">
                      ({uniformDiscountValue.toFixed(2)}%)
                    </span>
                  )} */}
                  {isUniform && uniformDiscountValue ? (
                    <span className="text-xs ml-1">
                      ({uniformDiscountValue.toFixed(2)}{" "}
                      {uniformDiscountType === "percent" ? "%" : "$"})
                    </span>
                  ) : (
                    <span className="text-xs ml-1">
                      (0.00 {uniformDiscountType === "percent" ? "%" : "$"})
                    </span>
                  )}
                </span>
                {/* <span>
                $
                {uniformDiscountType === "percent"
                  ? uniformDiscountValue
                    ? uniformDiscountValue.toFixed(2)
                    : "0.00"
                  : uniformDiscountValue?.toFixed(2) || "0.00"}
                {uniformDiscountType === "percent" && (
                  <span className="text-xs ml-1">
                    ({uniformDiscountValue?.toFixed(2)}%)
                  </span>
                )}
              </span> */}
              </div>
            )}

            {/* Discount */}
            <div className="flex justify-between items-center px-4 py-1.5 border-b border-(--border)">
              <div
                className="flex items-center gap-2 relative"
                ref={isDiscountPopoverOpen ? popoverRef : null}
              >
                <span>Discount global</span>

                {/* Type Toggle - Inline */}
                <div className="flex bg-(--bg-card) rounded-md p-0.5 border border-(--border)">
                  <button
                    className={`cursor-pointer px-2 text-xs py-0.5 rounded-sm transition-colors ${
                      globalDiscountType === "percent"
                        ? "bg-(--bg-item) shadow-sm font-medium text-(--text-primary)"
                        : "hover:bg-(--bg-hover)"
                    }`}
                    onClick={() => handleTypeSwitch("percent")}
                  >
                    %
                  </button>
                  <button
                    className={`cursor-pointer px-2 text-xs py-0.5 rounded-sm transition-colors ${
                      globalDiscountType === "amount"
                        ? "bg-(--bg-item) shadow-sm font-medium text-(--text-primary)"
                        : "hover:bg-(--bg-hover)"
                    }`}
                    onClick={() => handleTypeSwitch("amount")}
                  >
                    $
                  </button>
                </div>

                <button
                  onClick={handleEditClick}
                  className="cursor-pointer transition-colors"
                >
                  <Pencil size={14} />
                </button>

                {/* Popover - now only contains input */}
                {isDiscountPopoverOpen && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 bg-(--bg-card) shadow-xl rounded-md border border-(--border) p-1.5 flex items-center animate-in fade-in zoom-in-95 duration-100">
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-(--bg-card) border-l border-b border-(--border) rotate-45 transform"></div>
                    <Input
                      type="number"
                      className="w-32 h-8 text-sm"
                      autoFocus
                      value={tempValue}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setIsDiscountPopoverOpen(false);
                        if (e.key === "Escape") setIsDiscountPopoverOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <span>
                $
                {globalDiscountType === "percent"
                  ? totals.discountPercent
                    ? (
                        (totals.subTotal * totals.discountPercent) /
                        100
                      ).toFixed(2)
                    : "0.00"
                  : totals.discountGlobal?.toFixed(2) || "0.00"}
                {globalDiscountType === "percent" && (
                  <span className="text-xs ml-1">
                    ({totals.discountPercent?.toFixed(2)}%)
                  </span>
                )}
              </span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center px-4 py-1.5 border-b border-(--border) text-(--text-primary) font-semibold">
              <span>Total</span>
              <span>${totals.total?.toFixed(2) || "0.00"}</span>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-(--border)">
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={onReset}
                  disabled={isPending || cart.length === 0}
                  label
                >
                  <XCircle size={22} />
                </Button>
                {/* Show Hold/Restore for sale mode, Add Costs for purchase mode */}
                {priceMode === "sale" ? (
                  <Button
                    className="flex-1 relative"
                    onClick={() => {
                      if (cart.length > 0) {
                        onHoldOrder?.();
                      } else if (heldOrdersCount > 0) {
                        onOpenHeldOrders?.();
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (heldOrdersCount > 0) {
                        onOpenHeldOrders?.();
                      }
                    }}
                    disabled={
                      isPending || (cart.length === 0 && heldOrdersCount === 0)
                    }
                    label
                    title={
                      cart.length > 0
                        ? "Hold Order (Right-click to view held)"
                        : "View Held Orders"
                    }
                  >
                    {cart.length > 0 ? (
                      <Pause size={22} />
                    ) : (
                      <>
                        <RotateCcw size={22} />
                        {heldOrdersCount > 0 && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                            {heldOrdersCount}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={onAddCost}
                    disabled={isPending || cart.length === 0}
                    label
                  >
                    Add’l Costs
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={onPay}
                  disabled={isPending || cart.length === 0}
                >
                  Pay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomersEntry
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={{}}
        onSuccess={(customer: Customer) => {
          onPartyChange(customer.id);
          setIsCustomerModalOpen(false);
        }}
      />

      <VendorsEntry
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        vendor={{}}
        onSuccess={(vendor: Vendor) => {
          onPartyChange(vendor.id!);
          setIsVendorModalOpen(false);
        }}
      />
    </>
  );
}
