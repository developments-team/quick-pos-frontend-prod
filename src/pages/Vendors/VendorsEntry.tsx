/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { Combobox } from "../../components/ui/Combobox";
import type { Vendor } from "./index";

interface VendorType {
  value: string;
  label: string;
}

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: Partial<Vendor>;
  onSuccess?: (vendor: Vendor) => void;
}

export function VendorsEntry({
  isOpen,
  onClose,
  vendor,
  onSuccess,
}: FormProps) {
  const queryClient = useQueryClient();

  const { createNewVendor, updateVendor, getVendorTypes } = useProvider();

  const [formData, setFormData] = useState<Partial<Vendor>>(vendor || {});
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const isEditing = Boolean(vendor?.id);

  useEffect(() => {
    setFormData(vendor || {});
    setErrors({});
  }, [vendor, isOpen]);

  const { data: vendorTypeOptions = [] } = useQuery({
    queryKey: ["vendorTypes"],
    queryFn: () => getVendorTypes(),
    select: (res: any) => {
      const vendorTypes = res.data || [];
      return Array.isArray(vendorTypes)
        ? vendorTypes.map((type: VendorType) => ({
            value: type.value,
            label: type.label,
          }))
        : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewVendor(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (data.status) {
        onClose();
        toast.success(data.message);
        if (onSuccess && data.data) {
          onSuccess(data.data);
        }
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
      updateVendor(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (data.status) {
        onClose();
        toast.success(data.message);
        if (onSuccess && data.data) {
          onSuccess(data.data);
        }
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
    const newErrors: { name?: string; email?: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePayload = () => {
    return {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      tin: formData.tin,
      company: formData.company,
      vendorType: formData.vendorType,
      vendorPayableAccountId: formData.vendorPayableAccountId,
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

  const handleBlur = (field: "name" | "email" | "phone") => {
    setErrors((prev) => {
      const next = { ...prev };
      const value = formData[field]?.trim() || "";

      // 1. Required for all fields
      if (!value && field === "name") {
        next[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return next;
      }

      // 2. Extra rule only for email
      if (
        field === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        next.email = "Invalid email address";
        return next;
      }

      // 3. If valid: clear error
      delete next[field];
      return next;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Vendor" : "Add Vendor"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
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

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              onBlur={() => handleBlur("phone")}
            />
          </div>

          {/* Email */}
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

          {/* TIN */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tin">TIN</Label>
            <Input
              id="tin"
              value={formData.tin || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tin: e.target.value,
                })
              }
            />
          </div>

          {/* Company */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  company: e.target.value,
                })
              }
            />
          </div>

          {/* Vendor Type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vendorType">Vendor Type</Label>
            <Combobox
              id="vendorType"
              options={vendorTypeOptions}
              value={formData.vendorType}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  vendorType: value,
                })
              }
              placeholder="Select vendor type..."
              searchable={false}
            />
          </div>

          {/* Vendor Payable Account Id */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vendorPayableAccountId">
              Vendor Payable Account ID
            </Label>
            <Input
              id="vendorPayableAccountId"
              value={formData.vendorPayableAccountId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vendorPayableAccountId: e.target.value,
                })
              }
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
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
