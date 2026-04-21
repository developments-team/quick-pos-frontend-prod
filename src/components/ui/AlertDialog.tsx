import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: AlertDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xs"
      hideClose
      autoClose={true}
    >
      <div className="flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            variant === "destructive"
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-amber-100 dark:bg-amber-900/30"
          )}
        >
          <AlertTriangle
            className={cn(
              "w-6 h-6",
              variant === "destructive"
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400"
            )}
          />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-(--text-primary)">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-(--text-secondary)">{description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 w-full mt-2">
          <Button
            variant="secondary"
            label
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "danger" : "primary"}
            className="flex-1"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner
                  size="sm"
                  variant="gradient-ring"
                  className="mr-2"
                  strokeWidth={2}
                />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
