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
import { Textarea } from "../../components/ui/Textarea";
import type { CostType } from "./index";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  costType?: Partial<CostType>;
}

export function CostTypesEntry({ isOpen, onClose, costType }: FormProps) {
  const queryClient = useQueryClient();

  const { createNewCostType, updateCostType } = useProvider();

  const [formData, setFormData] = useState<Partial<CostType>>(costType || {});
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  const isEditing = Boolean(costType?.id);

  // Update local state when costType prop changes
  useEffect(() => {
    setFormData(costType || {});
    setErrors({});
  }, [costType, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewCostType(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["costTypes"] });
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateCostType(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["costTypes"] });
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
        next[field] = "Name is required";
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
      title={isEditing ? "Edit Cost Type" : "Add Cost Type"}
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
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                description: e.target.value,
              });
            }}
            rows={3}
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
