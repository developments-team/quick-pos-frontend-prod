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
import type { CustomerGroup } from "./index";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  customerGroup?: Partial<CustomerGroup>;
  onSuccess?: (newGroupId: string) => void;
}

export function CustomerGroupsEntry({
  isOpen,
  onClose,
  customerGroup,
  onSuccess,
}: FormProps) {
  const queryClient = useQueryClient();

  const { createNewCustomerGroup, updateCustomerGroup } = useProvider();

  const [formData, setFormData] = useState<Partial<CustomerGroup>>(
    customerGroup || {},
  );
  const [errors, setErrors] = useState<{
    name?: string;
    discountPercentage?: string;
  }>({});

  const isEditing = Boolean(customerGroup?.id);

  // Update local state when group prop changes
  useEffect(() => {
    setFormData(customerGroup || {});
    setErrors({});
  }, [customerGroup, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewCustomerGroup(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["customerGroups"] });
      if (data.status !== false) {
        onClose();
        // Call onSuccess callback with the new group ID
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
      updateCustomerGroup(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["customerGroups"] });
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
    const newErrors: { name?: string; discountPercentage?: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (
      formData.discountPercentage !== undefined &&
      formData.discountPercentage !== null &&
      (formData.discountPercentage < 0 || formData.discountPercentage > 100)
    ) {
      newErrors.discountPercentage = "Discount must be between 0 and 100";
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

  const handleBlur = (field: "name" | "discountPercentage") => {
    setErrors((prev) => {
      const next = { ...prev };
      const value =
        typeof formData[field] === "string"
          ? formData[field].trim() || ""
          : formData[field] || "";

      // 1. Required for all fields
      if (!value) {
        next[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return next;
      }

      // 2. Discount Validation
      if (field === "discountPercentage") {
        const value = formData.discountPercentage;
        if (
          value !== undefined &&
          value !== null &&
          (value < 0 || value > 100)
        ) {
          next.discountPercentage = "Discount must be between 0 and 100";
          return next;
        }
        delete next.discountPercentage;
        return next;
      }

      return next;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Customer Group" : "Add Customer Group"}
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
          <Label htmlFor="discountPercentage">Discount Percentage</Label>
          <Input
            id="discountPercentage"
            type="number"
            value={formData.discountPercentage || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setFormData({
                ...formData,
                discountPercentage: isNaN(val) ? undefined : val,
              });
            }}
            onBlur={() => handleBlur("discountPercentage")}
            hasError={!!errors.discountPercentage}
          />
          {errors.discountPercentage && (
            <span className="text-sm text-red-500">
              {errors.discountPercentage}
            </span>
          )}
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
