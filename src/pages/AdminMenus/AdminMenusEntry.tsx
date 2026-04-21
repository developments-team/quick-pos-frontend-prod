/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { Switch } from "../../components/ui/Switch";
import { Checkbox } from "../../components/ui/Checkbox";
import type { Menu } from "./index";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  menu?: Partial<Menu>;
  onSuccess?: (newId: string) => void;
}

export function AdminMenusEntry({
  isOpen,
  onClose,
  menu,
  onSuccess,
}: FormProps) {
  const queryClient = useQueryClient();

  const { createNewMenu, updateMenu, getActions } = useProvider();

  // Fetch available actions
  const { data: availableActions = [] } = useQuery({
    queryKey: ["actions"],
    queryFn: () => getActions(),
    select: (res: any) =>
      (Array.isArray(res) ? res : res?.data || []) as {
        value: string;
        label: string;
      }[],
  });

  const [formData, setFormData] = useState<Partial<Menu>>(menu || {});
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  const isEditing = Boolean(menu?.id);

  // Update local state when menu prop changes
  useEffect(() => {
    setFormData(menu || {});
    setErrors({});
  }, [menu, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewMenu(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      if (data.status !== false) {
        onClose();
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
      updateMenu(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
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
      name: formData.name,
      parentId: formData.parentId || undefined,
      url: formData.url || undefined,
      icon: formData.icon || undefined,
      description: formData.description || undefined,
      sortOrder: formData.sortOrder ?? 0,
      isActive: formData.isActive ?? true,
      actions: formData.actions || [],
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
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Menu" : "Add Menu"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={formData.url || ""}
              onChange={(e) => {
                setFormData({ ...formData, url: e.target.value });
              }}
              placeholder="e.g., /dashboard"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              value={formData.icon || ""}
              onChange={(e) => {
                setFormData({ ...formData, icon: e.target.value });
              }}
              placeholder="e.g., LayoutDashboard"
            />
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder ?? 0}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 0,
                });
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="isActive" className="cursor-pointer">
              Is Active
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive ?? true}
              onChange={(e) => {
                setFormData({ ...formData, isActive: e.target.checked });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="mb-1 block">Actions</Label>
            <div className="flex flex-wrap gap-4">
              {availableActions
                .filter((a) => a.value !== "VIEW")
                .map((action) => (
                  <Checkbox
                    key={action.value}
                    checked={formData.actions?.includes(action.value) ?? false}
                    onChange={() => {
                      const current = formData.actions || [];
                      const newActions = current.includes(action.value)
                        ? current.filter((a) => a !== action.value)
                        : [...current, action.value];
                      setFormData({ ...formData, actions: newActions });
                    }}
                    label={action.label}
                  />
                ))}
            </div>
          </div>
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
