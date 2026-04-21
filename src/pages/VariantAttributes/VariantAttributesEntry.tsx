/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import type { VariantAttribute } from "./index";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  attribute?: Partial<VariantAttribute>;
  onSuccess?: (newAttribute: any) => void;
}

export function VariantAttributesEntry({
  isOpen,
  onClose,
  attribute,
  onSuccess,
}: FormProps) {
  const queryClient = useQueryClient();

  const { createNewVariantAttribute, updateVariantAttribute } = useProvider();

  const [formData, setFormData] = useState<Partial<VariantAttribute>>(
    attribute || {},
  );
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  const isEditing = Boolean(attribute?.id);

  // Update local state when attribute prop changes
  useEffect(() => {
    setFormData(attribute || {});
    setErrors({});
  }, [attribute, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewVariantAttribute(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["variantAttributes"] });
      if (data.status !== false) {
        onClose();
        if (onSuccess && data?.data) {
          onSuccess(data.data);
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
      updateVariantAttribute(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["variantAttributes"] });
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
    const newErrors: { name?: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
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

  const handleBlur = (field: "name") => {
    setErrors((prev) => {
      const next = { ...prev };
      const value = formData[field]?.trim() || "";

      if (!value) {
        next[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
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
      title={isEditing ? "Edit Variant Attribute" : "Add Variant Attribute"}
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
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description || ""}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
            }}
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
