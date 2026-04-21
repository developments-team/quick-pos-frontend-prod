/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Switch } from "../../components/ui/Switch";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import type { Tax } from "./index";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  tax?: Partial<Tax>;
  onSuccess?: (newTaxId: string) => void;
}

export function TaxesEntry({ isOpen, onClose, tax, onSuccess }: FormProps) {
  const queryClient = useQueryClient();

  const { createNewTax, updateTax } = useProvider();

  const [formData, setFormData] = useState<Partial<Tax>>(tax || {});
  const [errors, setErrors] = useState<{
    name?: string;
    percentage?: string;
  }>({});

  const isEditing = Boolean(tax?.id);

  // Update local state when tax prop changes
  useEffect(() => {
    setFormData(tax || {});
    setErrors({});
  }, [tax, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewTax(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      if (data.status !== false) {
        onClose();
        // Call onSuccess callback with the new tax ID
        if (onSuccess && data?.data?.id) {
          onSuccess(data.data.id);
        }
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateTax(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      if (data.status !== false) {
        onClose();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const validateForm = () => {
    const newErrors: { name?: string; percentage?: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (
      formData.percentage !== undefined &&
      formData.percentage !== null &&
      (formData.percentage < 0 || formData.percentage > 100)
    ) {
      newErrors.percentage = "Percentage must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePayload = () => {
    return {
      ...formData,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = calculatePayload();
      if (isEditing && formData.id) {
        updateMutation.mutate({ id: formData.id, data: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const handleBlur = (field: "name" | "percentage") => {
    setErrors((prev) => {
      const next = { ...prev };
      const value =
        typeof formData[field] === "string"
          ? formData[field].trim() || ""
          : formData[field] || "";

      // 1. Required for name
      if (field === "name" && !value) {
        next.name = "Name is required";
        return next;
      }

      // 2. Percentage Validation
      if (field === "percentage") {
        const val = formData.percentage;
        if (val !== undefined && val !== null && (val < 0 || val > 100)) {
          next.percentage = "Percentage must be between 0 and 100";
          return next;
        }
        delete next.percentage;
        return next;
      }

      delete next[field];
      return next;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Tax" : "Add Tax"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
            }}
            onBlur={() => handleBlur("name")}
            hasError={!!errors.name}
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="percentage">Percentage</Label>
          <Input
            id="percentage"
            type="number"
            value={formData.percentage ?? ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setFormData({
                ...formData,
                percentage: isNaN(val) ? undefined : val,
              });
            }}
            onBlur={() => handleBlur("percentage")}
            hasError={!!errors.percentage}
          />
          {errors.percentage && (
            <span className="text-sm text-red-500">{errors.percentage}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description || ""}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="isDefault">Mark as default</Label>
          <Switch
            id="isDefault"
            checked={formData.isDefault || false}
            onChange={(e) =>
              setFormData({
                ...formData,
                isDefault: e.target.checked,
              })
            }
            label={formData.isDefault ? "Yes" : "No"}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose} label>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner
                  size="sm"
                  variant="gradient-ring"
                  className="mr-2"
                  strokeWidth={2}
                />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : isEditing ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
