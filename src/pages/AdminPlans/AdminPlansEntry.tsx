/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { Combobox } from "../../components/ui/Combobox";
import { Switch } from "../../components/ui/Switch";
import type { Plan } from "./index";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Partial<Plan>;
  onSuccess?: (newId: string) => void;
}

export function AdminPlansEntry({
  isOpen,
  onClose,
  plan,
  onSuccess,
}: FormProps) {
  const queryClient = useQueryClient();

  const {
    createNewPlan,
    updatePlan,
    getReportLevels,
    getSupportTypes,
    getRolesPlan,
  } = useProvider();

  const [formData, setFormData] = useState<Partial<Plan>>(plan || {});
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
  }>({});

  const isEditing = Boolean(plan?.id);

  // Update local state when plan prop changes
  useEffect(() => {
    setFormData(plan || {});
    setErrors({});
  }, [plan, isOpen]);

  // Fetch Report Levels
  const { data: reportLevelsData } = useQuery({
    queryKey: ["reportLevels"],
    queryFn: () => getReportLevels(),
    enabled: isOpen,
  });

  const reportLevelOptions =
    reportLevelsData?.data?.map((item: any) => ({
      value: item.value,
      label: item.label,
    })) || [];

  // Fetch Support Types
  const { data: supportTypesData } = useQuery({
    queryKey: ["supportTypes"],
    queryFn: () => getSupportTypes(),
    enabled: isOpen,
  });

  const supportTypeOptions =
    supportTypesData?.data?.map((item: any) => ({
      value: item.value,
      label: item.label,
    })) || [];

  // Fetch Roles for Plan
  const { data: rolesPlanData, isLoading: rolesLoading } = useQuery({
    queryKey: ["rolesPlan"],
    queryFn: () => getRolesPlan(),
    enabled: isOpen,
  });

  const roleOptions =
    rolesPlanData?.data?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewPlan(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
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
      updatePlan(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
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
    const newErrors: { name?: string; price?: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.price === undefined || formData.price === null) {
      newErrors.price = "Price is required";
    } else if (Number(formData.price) < 0) {
      newErrors.price = "Price must be 0 or greater";
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

  const handleBlur = (field: "name" | "price") => {
    setErrors((prev) => {
      const next = { ...prev };

      if (field === "name") {
        if (!formData.name?.trim()) {
          next.name = "Name is required";
        } else {
          delete next.name;
        }
      }

      if (field === "price") {
        if (formData.price === undefined || formData.price === null) {
          next.price = "Price is required";
        } else if (Number(formData.price) < 0) {
          next.price = "Price must be 0 or greater";
        } else {
          delete next.price;
        }
      }

      return next;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Plan" : "Add Plan"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={formData.name || ""}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
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
              placeholder="Enter description"
              value={formData.description || ""}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter price"
              value={formData.price ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  price: e.target.value ? Number(e.target.value) : undefined,
                });
                if (errors.price) setErrors({ ...errors, price: undefined });
              }}
              onBlur={() => handleBlur("price")}
              hasError={!!errors.price}
            />
            {errors.price && (
              <span className="text-sm text-red-500">{errors.price}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Report Level</Label>
            <Combobox
              options={reportLevelOptions}
              value={formData.reportLevel}
              onChange={(value) => {
                setFormData({ ...formData, reportLevel: value });
              }}
              placeholder="Select Report Level"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Support Type</Label>
            <Combobox
              options={supportTypeOptions}
              value={formData.supportType}
              onChange={(value) => {
                setFormData({ ...formData, supportType: value });
              }}
              placeholder="Select Support Type"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Combobox
              options={roleOptions}
              value={formData.roleId}
              onChange={(value) => {
                setFormData({ ...formData, roleId: value });
              }}
              placeholder="Select Role"
              loading={rolesLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="userLimit">User Limit</Label>
            <Input
              id="userLimit"
              type="number"
              placeholder="Enter user limit"
              value={formData.userLimit ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  userLimit: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="branchLimit">Branch Limit</Label>
            <Input
              id="branchLimit"
              type="number"
              placeholder="Enter branch limit"
              value={formData.branchLimit ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  branchLimit: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="productLimit">Product Limit</Label>
            <Input
              id="productLimit"
              type="number"
              placeholder="Enter product limit"
              value={formData.productLimit ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  productLimit: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                });
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 lg:col-span-2">
            <Switch
              id="isRecommended"
              checked={formData.isRecommended ?? false}
              onChange={(e) => {
                setFormData({ ...formData, isRecommended: e.target.checked });
              }}
              label="Recommended"
            />
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
