/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ChipSelector } from "../ui/ChipSelector";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Combobox } from "../ui/Combobox";
import type { POSAdditionalCost } from "./types";

export interface AdditionalCostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  additionalCosts: POSAdditionalCost[];
  onAddCost: (cost: Partial<POSAdditionalCost>) => void;
  onRemoveCost: (index: number) => void;
  onCostChange: (index: number, field: string, value: any) => void;
  costTypes: any[];
  onAddCostType: () => void;
  vendorOptions?: { value: string; label: string }[];
  accountOptions?: { value: string; label: string }[];
  onClear: () => void;
}

export function AdditionalCostsModal({
  isOpen,
  onClose,
  additionalCosts = [],
  onAddCost,
  onRemoveCost,
  onCostChange,
  costTypes = [],
  onAddCostType,
  vendorOptions = [],
  accountOptions = [],
  onClear,
}: AdditionalCostsModalProps) {
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  const handleDone = () => {
    const newErrors: Record<number, boolean> = {};
    let hasError = false;

    additionalCosts.forEach((cost, index) => {
      if (!cost.amount || cost.amount <= 0) {
        newErrors[index] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    onClose();
  };

  const handleCancel = () => {
    setErrors({});
    onClear();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Additional Costs"
      size="2xl"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--text-primary)">
            Select Cost Types
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              label
              className="rounded-full w-9.5 h-9.5 p-0 shrink-0"
              tabIndex={-1}
              onClick={onAddCostType}
            >
              <Plus size={16} />
            </Button>
            <ChipSelector
              options={costTypes.map((ct) => ({
                label: ct.name,
                value: ct.id,
              }))}
              value={additionalCosts.map((cost) => cost.costTypeId || "")}
              onChange={(val) => {
                const selectedIds = Array.isArray(val) ? val : [val];
                const currentCosts = additionalCosts || [];

                // 1. Identify added IDs
                const addedIds = selectedIds.filter(
                  (id) => !currentCosts.some((c) => c.costTypeId === id),
                );

                // 2. Identify removed IDs
                const removedIds = currentCosts
                  .filter(
                    (c) => c.costTypeId && !selectedIds.includes(c.costTypeId),
                  )
                  .map((c) => c.costTypeId);

                // Handle Additions
                addedIds.forEach((id) => {
                  onAddCost({
                    costTypeId: id,
                    amount: 0,
                  });
                });

                // Handle Removals
                removedIds.forEach((id) => {
                  const indexToRemove = currentCosts.findIndex(
                    (c) => c.costTypeId === id,
                  );
                  if (indexToRemove !== -1) {
                    onRemoveCost(indexToRemove);
                  }
                });
              }}
              multiple
              className="mb-2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <label className="text-sm font-medium text-(--text-primary)">
            Cost Details
          </label>
          <div className="space-y-4 p-1">
            {additionalCosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-(--text-muted) border-2 border-dashed border-(--border) rounded-md">
                <p className="text-sm italic">
                  Select cost types above to details.
                </p>
              </div>
            ) : (
              additionalCosts.map((cost, index) => {
                const costType = costTypes.find(
                  (ct) => ct.id === cost.costTypeId,
                ) || { name: "Unknown" };

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-1 p-2 bg-(--bg-subtle) rounded-md border border-(--border) relative"
                  >
                    <div className="flex justify-between items-start">
                      <Label className="text-base font-semibold">
                        {costType.name}
                      </Label>
                      <Button
                        variant="danger"
                        ghost
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onRemoveCost(index)}
                        title="Remove cost"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Vendor Selection */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Vendor</Label>
                        <Combobox
                          options={vendorOptions}
                          value={cost.vendorId}
                          onChange={(val) =>
                            onCostChange(index, "vendorId", val)
                          }
                          placeholder="Select Vendor"
                          className="w-full"
                        />
                      </div>

                      {/* Amount Input */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={cost.amount || ""}
                          onChange={(e) => {
                            setErrors((prev) => ({ ...prev, [index]: false }));
                            onCostChange(
                              index,
                              "amount",
                              parseFloat(e.target.value),
                            );
                          }}
                          hasError={!!errors[index]}
                          //   error="Amount must be greater than 0"
                        />
                        {errors[index] && (
                          <span className="text-sm text-red-500">
                            Amount is required
                          </span>
                        )}
                      </div>

                      {/* Account Selection */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Account</Label>
                        <Combobox
                          options={accountOptions}
                          value={cost.accountId}
                          onChange={(val) =>
                            onCostChange(index, "accountId", val)
                          }
                          placeholder="Select Account"
                          className="w-full"
                        />
                      </div>

                      {/* Note */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Note</Label>
                        <Textarea
                          placeholder="Add a note..."
                          value={cost.note || ""}
                          onChange={(e) =>
                            onCostChange(index, "note", e.target.value)
                          }
                          rows={1}
                          //   className="resize-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleDone}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
