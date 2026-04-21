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
import { Plus } from "lucide-react";
import { CustomerGroupsEntry } from "../CustomerGroups";
import type { Customer } from "./index";

interface CustomerGroup {
  id: string;
  name: string;
}

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Partial<Customer>;
  onSuccess?: (customer: Customer) => void;
}

export function CustomersEntry({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: FormProps) {
  const queryClient = useQueryClient();

  const { createNewCustomer, updateCustomer, getCustomerGroups } =
    useProvider();

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>(customer || {});
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const isEditing = Boolean(customer?.id);
  console.log(customer);
  useEffect(() => {
    setFormData(customer || {});
    setErrors({});
  }, [customer, isOpen]);

  // Fetch customer groups for combobox
  const { data: customerGroups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["customerGroups"],
    queryFn: () => getCustomerGroups(),
    // select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
    select: (res: any) => {
      const customerGroups = res.data || [];
      return Array.isArray(customerGroups)
        ? customerGroups.map((group: CustomerGroup) => ({
            value: group.id,
            label: group.name,
          }))
        : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => createNewCustomer(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
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
      updateCustomer(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
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

  const handleBlur = (field: "name" | "email" | "phone") => {
    setErrors((prev) => {
      const next = { ...prev };
      const value = formData[field]?.trim() || "";

      // 1. Required for all fields
      if (!value) {
        next[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return next;
      }

      // 2. Extra rule only for email
      if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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
      title={isEditing ? "Edit Customer" : "Add Customer"}
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
              hasError={!!errors.phone}
            />
            {errors.phone && (
              <span className="text-sm text-red-500">{errors.phone}</span>
            )}
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

          {/* Customer Group */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customerGroupId">Customer Group</Label>
            <Combobox
              options={customerGroups}
              value={formData.customerGroupId || ""}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  customerGroupId: value,
                })
              }
              placeholder="Select customer group..."
              loading={isLoadingGroups}
              emptyMessage="No customer groups found"
              rightAddon={
                <Button
                  type="button"
                  ghost
                  className="px-3 rounded-none h-9.5 rounded-r-md"
                  onClick={() => setIsAddGroupModalOpen(true)}
                  tabIndex={-1}
                >
                  <Plus size={16} />
                </Button>
              }
              rightAddonClassName="p-0 "
            />
          </div>

          {/* Account Receivable ID */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accountReceivableId">Account Receivable ID</Label>
            <Input
              id="accountReceivableId"
              value={formData.accountReceivableId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accountReceivableId: e.target.value,
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

      {/* Nested Customer Group Form */}
      <CustomerGroupsEntry
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["customerGroups"] });
        }}
      />
    </Modal>
  );
}
