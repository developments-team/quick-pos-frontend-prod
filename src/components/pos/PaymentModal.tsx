/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Plus } from "lucide-react";
import { ChipSelector } from "../ui/ChipSelector";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";
import type {
  POSAdditionalCost,
  POSCartItem,
  POSMode,
  POSTotals,
} from "./types";
import { cn } from "../../lib/utils";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  cart: POSCartItem[];
  totals: POSTotals;
  paymentType: string;
  onPaymentTypeChange: (type: string) => void;
  isPending?: boolean;
  mode: POSMode;
  additionalCosts?: POSAdditionalCost[];
  paymentTypes?: any[];
  onAddPaymentType?: () => void;
  paidAmount?: number;
  onPaidAmountChange?: (amount: number) => void;
  balance: number;
  vendorName?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  cart,
  totals,
  paymentType,
  onPaymentTypeChange,
  isPending,
  mode,
  additionalCosts = [],
  paymentTypes = [],
  onAddPaymentType,
  paidAmount,
  onPaidAmountChange,
  balance,
  vendorName = "",
}: PaymentModalProps) {
  const title = mode === "purchase" ? "Complete Purchase" : "Complete Sale";
  const confirmText = isPending ? "Processing" : "Confirm Pay";
  const priceField = mode === "purchase" ? "purchasePrice" : "salePrice";

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  // Format current date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Invoice labels based on mode
  const invoiceType =
    mode === "purchase" ? "Purchase Invoice" : "Sales Invoice";
  const partyFromLabel = mode === "purchase" ? "Vendor" : "Sold By";
  const partyToLabel = mode === "purchase" ? "Purchased By" : "Customer";

  const hasDiscount = cart.some((item) => (item.discount || 0) > 0);
  const colSpanValue = hasDiscount ? 4 : 3;

  // // Calculate total item discount
  // const totalItemDiscount = cart.reduce((acc, item) => {
  //   const itemPrice = (item as any)[priceField] || 0;
  //   const originalTotal = itemPrice * item.quantity;
  //   const currentTotal = item.total || 0;
  //   return acc + (originalTotal - currentTotal);
  // }, 0);

  // Global discount amount
  const globalDiscountAmount =
    (totals.discountGlobal || 0) +
    (totals.subTotal * (totals.discountPercent || 0)) / 100;

  // const totalDiscount = totalItemDiscount + globalDiscountAmount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="2xl"
      className="pb-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[64vh] max-h-[68vh]">
        {/* Left Column: Order Summary Table */}
        <div className="flex flex-col gap-5 justify-between">
          <div className="print:max-w-136 print:mx-auto" ref={componentRef}>
            {/* Invoice Header - Only visible in print */}
            <div className="hidden print:flex flex-col items-center gap-2 mb-4 print:m-8 print:mb-4">
              {/* Logo and System Name */}
              {/* <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-(--primary) rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  Q
                </div>
                <span className="text-xl font-bold text-(--text-primary)">
                  QuickPOS
                </span>
              </div> */}

              {/* Invoice Type */}
              <div className="text-lg font-semibold text-(--text-primary) mt-2">
                {invoiceType}
              </div>

              {/* Date and Time */}
              <div className="text-sm">
                {formattedDate} at {formattedTime}
              </div>

              {/* Party Info */}
              <div>
                <span>{partyFromLabel}: </span>
                <span className="font-medium text-(--text-primary)">
                  {mode === "purchase"
                    ? vendorName || "Direct Purchase"
                    : "Store"}
                </span>
              </div>
              <div>
                <span>{partyToLabel}: </span>
                <span className="font-medium text-(--text-primary)">
                  {mode === "purchase"
                    ? "Store"
                    : vendorName || "Walk-in Customer"}
                </span>
              </div>
            </div>

            <div className="relative bg-(--bg-card) border border-(--border) rounded-lg overflow-hidden print:m-8 print:mt-0">
              {/* Table Structure - Block display for isolated tbody scroll */}
              <div className="overflow-x-auto h-full print:overflow-visible print:h-auto">
                <table className="min-w-full text-sm border-separate border-spacing-0">
                  {/* Header - Fixed at top */}
                  <thead className="bg-(--bg-panel) block w-full">
                    <tr className="flex w-full border-b border-(--border)">
                      <th className="flex-1 text-left px-3 py-2 font-medium">
                        Items
                      </th>
                      <th className="w-12 px-2 py-2 font-medium shrink-0">
                        Qty
                      </th>
                      <th className="w-16 px-2 py-2 font-medium shrink-0">
                        Price
                      </th>
                      <th
                        className={cn(
                          "w-20 px-2 py-2 font-medium shrink-0",
                          !hasDiscount && "hidden",
                        )}
                      >
                        Discount
                      </th>
                      <th className="w-20 px-3 py-2 font-medium shrink-0">
                        Total
                      </th>
                    </tr>
                  </thead>
                  {/* Body - Scrollable */}
                  <tbody className="block w-full overflow-y-auto max-h-95 custom-scrollbar print:max-h-none print:overflow-visible">
                    {cart.map((item) => (
                      <tr
                        key={item.id}
                        className="flex w-full border-b border-(--border) last:border-b-0"
                      >
                        <td className="flex-1 px-3 py-2">
                          <div className="line-clamp-3">{item.productName}</div>
                        </td>
                        <td className="w-12 text-center px-2 py-2 shrink-0">
                          {item.quantity?.toFixed(2)}
                        </td>
                        <td className="w-16 text-right px-2 py-2 shrink-0">
                          ${(item as any)[priceField]?.toFixed(2)}
                        </td>
                        <td
                          className={cn(
                            "w-20 text-right px-2 py-2 shrink-0",
                            !hasDiscount && "hidden",
                          )}
                        >
                          {item.discount > 0 ? (
                            <div>
                              {item.discountType === "percent" ? (
                                <>
                                  $
                                  {(
                                    ((item as any)[priceField] *
                                      item.quantity *
                                      item.discount) /
                                    100
                                  ).toFixed(2)}
                                  <span className="text-xs ml-1">
                                    ({item.discount}%)
                                  </span>
                                </>
                              ) : (
                                `$${item.discount?.toFixed(2)}`
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="w-20 text-right px-3 py-2 font-medium shrink-0">
                          ${item.total?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Footer - Fixed at bottom */}
                  <tfoot className="bg-(--bg-panel) block w-full border-t border-(--border) font-medium">
                    <tr className="flex w-full">
                      <td
                        className={`flex-1 px-3 py-1.25 col-span-${colSpanValue}`}
                      >
                        Subtotal
                      </td>
                      <td className="text-right px-3 py-1.25 shrink-0">
                        ${totals.subTotal?.toFixed(2)}
                      </td>
                    </tr>
                    {totals.tax > 0 && (
                      <tr className="flex w-full border-t border-(--border)">
                        <td
                          className={`flex-1 px-3 py-1.25 col-span-${colSpanValue}`}
                        >
                          Tax
                        </td>
                        <td className="text-right px-3 py-1.25 shrink-0">
                          ${totals.tax?.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {/* {totalDiscount > 0 && (
                      <tr className="flex w-full border-t border-(--border)">
                        <td
                          className={`flex-1 px-3 py-1.25 col-span-${colSpanValue}`}
                        >
                          Discount
                          {globalDiscountAmount > 0 &&
                            totalItemDiscount > 0 && (
                              <span className="text-xs text-(--text-muted) ml-1 font-normal">
                                (Items: ${totalItemDiscount.toFixed(2)} +
                                Global: ${globalDiscountAmount.toFixed(2)})
                              </span>
                            )}
                        </td>
                        <td className="text-right px-3 py-1.25 shrink-0">
                          - ${totalDiscount.toFixed(2)}
                        </td>
                      </tr>
                    )} */}
                    {globalDiscountAmount > 0 && (
                      <tr className="flex w-full border-t border-(--border)">
                        <td
                          className={`flex-1 px-3 py-1.25 col-span-${colSpanValue}`}
                        >
                          Discount
                        </td>
                        <td className="text-right px-3 py-1.25 shrink-0">
                          - ${globalDiscountAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {/* Total */}
                    <tr className="flex w-full border-t border-(--border)">
                      <td
                        className={`flex-1 px-3 py-1.25 col-span-${colSpanValue}`}
                      >
                        Total
                      </td>
                      <td className="text-right px-3 py-1.25 shrink-0">
                        ${totals.total?.toFixed(2)}
                      </td>
                    </tr>

                    {/* Paid Amount */}
                    <tr className="flex w-full border-t border-(--border)">
                      <td
                        className={`flex-1 px-3 py-1.25 col-span-${colSpanValue}`}
                      >
                        Paid
                      </td>
                      <td className="text-right px-3 py-1.25 shrink-0">
                        ${paidAmount ? paidAmount.toFixed(2) : "0.00"}
                      </td>
                    </tr>

                    {/* Due / Change */}
                    {Math.abs(balance) > 0 && (
                      <tr className="flex w-full border-t border-(--border)">
                        <td
                          className={`flex-1 px-3 py-1.25 col-span-${colSpanValue}`}
                        >
                          {balance > 0 ? "Change" : "Due"}
                        </td>
                        <td className="text-right px-3 py-1.25 shrink-0">
                          ${Math.abs(balance).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {mode === "purchase" && totals.additionalCostsTotal > 0 && (
                      <tr className="flex w-full border-t border-(--border)">
                        <td
                          className={`flex-1 px-3 py-1.25 col-span-${colSpanValue}`}
                        >
                          Add’l Costs
                          {additionalCosts.length > 0 && (
                            <span className="text-xs text-(--text-secondary) ml-1 font-normal">
                              (
                              {additionalCosts
                                .map(
                                  (c) => `${c.name}: $${c.amount?.toFixed(2)}`,
                                )
                                .join(", ")}
                              )
                            </span>
                          )}
                        </td>
                        <td className="text-right px-3 py-1.25 shrink-0">
                          + ${totals.additionalCostsTotal?.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div>
            <Button outline className="w-full" onClick={() => handlePrint()}>
              <Printer size={16} className="mr-2" />
              Print
            </Button>
          </div>
        </div>
        {/* Right Column: Payment Settings */}
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-6">
            {/* Payment Type */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-(--text-primary)">
                  Payment Type
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    label
                    className="rounded-full w-9.5 h-9.5 p-0 shrink-0"
                    tabIndex={-1}
                    onClick={onAddPaymentType}
                  >
                    <Plus size={16} />
                  </Button>
                  <ChipSelector
                    options={paymentTypes.map((pt) => ({
                      value: pt.name,
                      label: pt.name,
                    }))}
                    value={paymentType}
                    onChange={(val) => onPaymentTypeChange(val as string)}
                    className="grid-cols-1 sm:grid-cols-3"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-(--text-primary)">
                  {paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}{" "}
                  Amount
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={paidAmount ?? totals.total?.toFixed(2)}
                    onChange={(e) =>
                      onPaidAmountChange?.(parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
            {/* Additional Costs - Only for Purchase mode */}
          </div>
          <Button onClick={onSubmit} disabled={isPending} className="w-full">
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
