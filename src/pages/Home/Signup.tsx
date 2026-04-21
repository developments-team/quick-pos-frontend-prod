/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Building2, Mail, Lock, Phone, MapPin } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { Combobox } from "../../components/ui/Combobox";
import { ImageChooser } from "../../components/ui/ImageChooser";
import { Spinner } from "../../components/ui/Spinner";
import { useProvider } from "../../context/Provider";
import { toast } from "../../components/ui/Toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../../context/apiConfig";

interface SignupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  plans: any[];
}

export function Signup({
  isOpen,
  onClose,
  selectedPlanId,
  plans,
}: SignupProps) {
  const { getBusinessTypes } = useProvider();

  const [formData, setFormData] = useState<{
    name?: string;
    businessType?: string;
    planId?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
  }>({ planId: selectedPlanId });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    businessType?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ planId: selectedPlanId });
      setImageFile(null);
      setErrors({});
    }
  }, [isOpen, selectedPlanId]);

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

  const planOptions = plans.map((item: any) => ({
    value: item.id,
    label: `${item.name} — $${item.price}/mo`,
  }));

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await axiosInstance.post("/tenants/public", data);
      return res.data;
    },
    onSuccess: (data: any) => {
      if (data?.status) {
        toast.success(data.message || "Account created successfully!");
        onClose();
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      businessType?: string;
      address?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Business name is required";
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
      newErrors.businessType = "Business type is required";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!formData.name?.trim()) {
          newErrors.name = "Business name is required";
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
      case "businessType":
        if (!formData.businessType) {
          newErrors.businessType = "Business type is required";
        } else {
          delete newErrors.businessType;
        }
        break;
      case "address":
        if (!formData.address?.trim()) {
          newErrors.address = "Address is required";
        } else {
          delete newErrors.address;
        }
        break;
      case "password":
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        if (
          formData.confirmPassword &&
          formData.confirmPassword !== formData.password
        ) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      case "confirmPassword":
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.confirmPassword !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "confirmPassword") return;
        if (value !== undefined && value !== null) {
          fd.append(key, String(value));
        }
      });
      if (imageFile) {
        fd.append("logo", imageFile);
      }
      createMutation.mutate(fd);
    }
  };

  const selectedPlan = plans.find((p: any) => p.id === formData.planId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Your Business Account"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-(--primary)/10 border border-(--primary)/20">
            <div className="flex-1">
              <p className="text-sm text-(--text-secondary)">Selected Plan</p>
              <p className="text-lg font-semibold text-(--text-primary)">
                {selectedPlan.name}{" "}
                <span className="text-(--primary)">
                  ${selectedPlan.price}/mo
                </span>
              </p>
              <p className="text-xs text-(--text-muted)">
                {selectedPlan.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, planId: undefined })}
              className="text-xs text-(--primary) hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-name">Business Name</Label>
            <Input
              id="tenant-name"
              placeholder="Enter your business name"
              leftIcon={<Building2 size={18} className="text-(--text-muted)" />}
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
              onChange={(value: any) => {
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

          {!selectedPlan && (
            <div className="flex flex-col gap-1.5">
              <Label>Plan</Label>
              <Combobox
                options={planOptions}
                value={formData.planId}
                onChange={(value: any) => {
                  setFormData({ ...formData, planId: value });
                }}
                placeholder="Select Plan"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-email">Email</Label>
            <Input
              id="tenant-email"
              type="email"
              placeholder="Enter your email"
              leftIcon={<Mail size={18} className="text-(--text-muted)" />}
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
            <Label htmlFor="tenant-phone">Phone</Label>
            <Input
              id="tenant-phone"
              placeholder="Enter phone number"
              leftIcon={<Phone size={18} className="text-(--text-muted)" />}
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
            <Label htmlFor="tenant-address">Address</Label>
            <Input
              id="tenant-address"
              placeholder="Enter your address"
              leftIcon={<MapPin size={18} className="text-(--text-muted)" />}
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-password">Password</Label>
            <PasswordInput
              id="tenant-password"
              placeholder="Enter password"
              leftIcon={<Lock size={18} className="text-(--text-muted)" />}
              togglePosition="right"
              toggleVariant="icon"
              value={formData.password || ""}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              onBlur={() => handleBlur("password")}
              hasError={!!errors.password}
            />
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="tenant-confirmPassword"
              placeholder="Confirm your password"
              leftIcon={<Lock size={18} className="text-(--text-muted)" />}
              togglePosition="right"
              toggleVariant="icon"
              value={formData.confirmPassword || ""}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: undefined });
              }}
              onBlur={() => handleBlur("confirmPassword")}
              hasError={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <span className="text-sm text-red-500">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-logo">Logo</Label>
            <ImageChooser
              id="tenant-logo"
              onChange={(file) => setImageFile(file)}
              className="h-40"
              changeable={false}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose} label>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Spinner
                  size="sm"
                  variant="gradient-ring"
                  className="mr-2"
                  strokeWidth={2}
                />
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
