import { Trash2, Clock, RotateCcw, User } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import type { HeldOrder } from "./types";
import { cn } from "../../lib/utils";

export interface HoldOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  onRestore: (order: HeldOrder) => void;
  onDelete: (orderId: string) => void;
  onClearAll: () => void;
}

export function HoldOrderModal({
  isOpen,
  onClose,
  heldOrders,
  onRestore,
  onDelete,
  onClearAll,
}: HoldOrderModalProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return "Today";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Held Orders (${heldOrders.length})`}
      size="lg"
      comingFrom="top"
      autoClose
    >
      {/* Clear All Button */}
      {heldOrders.length > 0 && (
        <div className="flex justify-end -mt-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Content */}
      {heldOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 ">
          <Clock size={48} className="mb-3 opacity-40" />
          <p className="text-sm">No held orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {heldOrders.map((order) => (
            <div
              key={order.id}
              className={cn(
                "bg-(--bg-item)/20 border border-(--border) rounded-lg p-4",
                "hover:border-(--primary)/50 hover:shadow-md transition-all duration-200",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm  mb-1">
                    <Clock size={14} />
                    <span>{formatDate(order.createdAt)}</span>
                    <span>•</span>
                    <span>{formatTime(order.createdAt)}</span>
                  </div>
                  {order.customerName && (
                    <div className="flex items-center gap-2 text-sm font-medium text-(--text-primary)">
                      <User size={14} />
                      <span>{order.customerName}</span>
                    </div>
                  )}
                  {order.note && (
                    <p className="text-xs  mt-1 italic">{order.note}</p>
                  )}
                </div>
              </div>

              {/* Cart summary */}
              <div className="text-sm text-(--text-secondary) mb-3">
                <span className="font-medium">{order.cart.length} items</span>
                <span className="mx-2">•</span>
                <span className="font-semibold text-(--text-primary)">
                  $
                  {order.cart
                    .reduce((sum, item) => sum + (item.total || 0), 0)
                    .toFixed(2)}
                </span>
              </div>

              {/* Item preview */}
              <div className="text-xs  mb-3 line-clamp-2">
                {order.cart.map((item) => item.productName).join(", ")}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 gap-2 active:scale-95 transition-transform"
                  onClick={() => onRestore(order)}
                >
                  <RotateCcw size={14} />
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-transform"
                  onClick={() => onDelete(order.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
