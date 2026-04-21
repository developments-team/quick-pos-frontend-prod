/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { Combobox } from "../../components/ui/Combobox";
import { ChipSelector } from "../../components/ui/ChipSelector";
import type { User } from "./index";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Partial<User>;
  onSuccess?: (newUserId: string) => void;
}

export function UsersEntry({ isOpen, onClose, user, onSuccess }: FormProps) {
  const queryClient = useQueryClient();

  const { createNewUser, updateUser, getBranches, getRoles, isTenantPortal } =
    useProvider();

  const [formData, setFormData] = useState<Partial<User>>(user || {});
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    email?: string;
    roleId?: string;
  }>({});

  const isEditing = Boolean(user?.id);

  // Fetch branches for ChipSelector
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Fetch roles for Combobox
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
  const tenantId = userData?.tenant?.id;
  const portal = userData?.portal?.toUpperCase() || "";
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", tenantId, portal],
    queryFn: () => getRoles({ tenantId, portal }),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Transform roles for Combobox options
  const roleOptions = roles.map((role: any) => ({
    value: role.id,
    label: role.name,
  }));

  // Transform branches for ChipSelector options
  const branchOptions = branches.map((branch: any) => ({
    value: String(branch.id),
    label: branch.name,
  }));

  // Update local state when user prop changes
  useEffect(() => {
    setFormData(user || {});
    setSelectedBranches(user?.branches || []);
    setErrors({});
  }, [user, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewUser(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (data.status !== false) {
        onClose();
        // Call onSuccess callback with the new user ID
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
      updateUser(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
    const newErrors: { email?: string; roleId?: string } = {};

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.roleId?.trim()) {
      newErrors.roleId = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePayload = () => {
    return {
      email: formData.email,
      roleId: formData.roleId,
      userBranches: selectedBranches,
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

  const handleBlur = (field: "email") => {
    setErrors((prev) => {
      const next = { ...prev };
      const value = formData[field]?.trim() || "";

      if (field === "email") {
        if (!value) {
          next.email = "Email is required";
          return next;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          next.email = "Please enter a valid email";
          return next;
        }
      }

      delete next[field];
      return next;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User" : "Add User"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
            }}
            onBlur={() => handleBlur("email")}
            hasError={!!errors.email}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="roleId">Role</Label>
          <Combobox
            options={roleOptions}
            value={formData.roleId || ""}
            onChange={(value: string) => {
              setFormData({ ...formData, roleId: value });
              if (errors.roleId) {
                setErrors((prev) => ({ ...prev, roleId: undefined }));
              }
            }}
            placeholder="Select a role..."
            loading={rolesLoading}
            hasError={!!errors.roleId}
          />
          {errors.roleId && (
            <span className="text-sm text-red-500">{errors.roleId}</span>
          )}
        </div>
        {isTenantPortal && (
          <div className="flex flex-col gap-1.5">
            <Label>Branches</Label>
            {branchOptions.length === 0 ? (
              <span className="text-sm text-gray-500">
                No branches available
              </span>
            ) : (
              <ChipSelector
                options={branchOptions}
                value={selectedBranches}
                onChange={(value) => setSelectedBranches(value as string[])}
                multiple
              />
            )}
            {selectedBranches.length > 0 && (
              <span className="text-sm text-gray-500">
                {selectedBranches.length} branch(es) selected
              </span>
            )}
          </div>
        )}
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
