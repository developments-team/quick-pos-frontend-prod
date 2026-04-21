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
import { ImageChooser } from "../../components/ui/ImageChooser";
import { Textarea } from "../../components/ui/Textarea";
import type { Tenant } from "./index";
import { DatePicker } from "../../components/ui/DatePicker";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Partial<Tenant>;
  onSuccess?: (newId: string) => void;
}

export function AdminTenantsEntry({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}: FormProps) {
  const queryClient = useQueryClient();

  const { createTenant, updateTenant, getBusinessTypes, getPlans } =
    useProvider();

  const [formData, setFormData] = useState<Partial<Tenant>>(tenant || {});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    domain?: string;
    businessType?: string;
    address?: string;
  }>({});

  const isEditing = Boolean(tenant?.id);

  // Update local state when tenant prop changes
  useEffect(() => {
    setFormData(tenant || {});
    setImageFile(null);
    setErrors({});
  }, [tenant, isOpen]);

  // Fetch Business Types
  const { data: businessTypesData } = useQuery({
    queryKey: ["businessTypes"],
    queryFn: () => getBusinessTypes(),
    enabled: isOpen,
  });

  const businessTypeOptions =
    businessTypesData?.data?.map((item: any) => ({
      value: item.value,
      label: item.label,
    })) || [];

  // Fetch Plans
  const { data: plansData } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(),
    enabled: isOpen,
  });

  const planOptions =
    plansData?.data?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createTenant(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
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
      updateTenant(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
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
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      domain?: string;
      businessType?: string;
      address?: string;
    } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Business Type is required";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof Tenant) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!formData.name?.trim()) {
          newErrors.name = "Name is required";
        } else {
          delete newErrors.name;
        }
        break;
      case "email":
        if (!formData.email?.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Invalid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "phone":
        if (!formData.phone?.trim()) {
          newErrors.phone = "Phone is required";
        } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
          newErrors.phone = "Invalid phone number";
        } else {
          delete newErrors.phone;
        }
        break;
      case "address":
        if (!formData.address?.trim()) {
          newErrors.address = "Address is required";
        } else {
          delete newErrors.address;
        }
        break;
      case "domain":
        delete newErrors.domain;
        break;
      case "businessType":
        if (!formData.businessType) {
          newErrors.businessType = "Business Type is required";
        } else {
          delete newErrors.businessType;
        }
        break;
    }

    setErrors(newErrors);
  };

  const calculatePayload = () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fd.append(key, String(value));
      }
    });

    if (imageFile) {
      fd.append("logo", imageFile);
    }

    return fd;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Tenant" : "Add Tenant"}
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
            <Label>Business Type</Label>
            <Combobox
              options={businessTypeOptions}
              value={formData.businessType}
              onChange={(value) => {
                setFormData({ ...formData, businessType: value });
                if (value)
                  setErrors((prev) => ({ ...prev, businessType: undefined }));
              }}
              onBlur={() => handleBlur("businessType")}
              placeholder="Select Business Type"
              hasError={!!errors.businessType}
            />
            {errors.businessType && (
              <span className="text-sm text-red-500">
                {errors.businessType}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Plan</Label>
            <Combobox
              options={planOptions}
              value={formData.planId}
              onChange={(value) => {
                setFormData({ ...formData, planId: value });
              }}
              placeholder="Select Plan"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="planExpiry">Plan Expiry</Label>
            <DatePicker
              mode="single"
              value={
                formData.planExpiry ? new Date(formData.planExpiry) : undefined
              }
              onChange={(date) => {
                setFormData({
                  ...formData,
                  planExpiry: date?.toISOString() || "",
                });
              }}
              placeholder="Select plan expiry date"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="Enter domain"
              value={formData.domain || ""}
              onChange={(e) => {
                setFormData({ ...formData, domain: e.target.value });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email || ""}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              onBlur={() => handleBlur("email")}
              hasError={!!errors.email}
            />
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Enter phone"
              value={formData.phone || ""}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              onBlur={() => handleBlur("phone")}
              hasError={!!errors.phone}
            />
            {errors.phone && (
              <span className="text-sm text-red-500">{errors.phone}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter address"
              value={formData.address || ""}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (errors.address)
                  setErrors({ ...errors, address: undefined });
              }}
              onBlur={() => handleBlur("address")}
              hasError={!!errors.address}
            />
            {errors.address && (
              <span className="text-sm text-red-500">{errors.address}</span>
            )}
          </div>

          {/* Logo Section - Small Square */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logo">Logo</Label>
            <ImageChooser
              id="logo"
              onChange={(file) => {
                setImageFile(file);
              }}
              previewUrl={formData.logo}
              className="h-40"
              changeable={false}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={formData.description || ""}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
              rows={6}
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
