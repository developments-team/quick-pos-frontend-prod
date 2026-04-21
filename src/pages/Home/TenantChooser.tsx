/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Building2, ArrowRight, Check, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { cn } from "../../lib/utils";

interface TenantInfo {
  tenant: {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    logo?: string | null;
    plan?: {
      id: string;
      name: string;
    };
    [key: string]: any;
  };
  role: {
    id: string;
    name: string;
  };
  branches: any[];
}

interface TenantChooserProps {
  isOpen: boolean;
  onClose: () => void;
  loginData: any;
  tenants: TenantInfo[];
  onTenantSelected: (loginData: any, selectedTenant: TenantInfo) => void;
  onBack?: () => void;
  selectedTenantId?: string | null;
}

export function TenantChooser({
  isOpen,
  onClose,
  loginData,
  tenants,
  onTenantSelected,
  onBack,
  selectedTenantId: initialSelectedTenantId,
}: TenantChooserProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    () => {
      if (initialSelectedTenantId) return initialSelectedTenantId;
      if (tenants?.length === 1) {
        return tenants[0].tenant.id;
      }
      return null;
    },
  );

  const handleSelectTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
  };

  const handleContinue = () => {
    if (selectedTenantId && loginData) {
      const selected = tenants.find((t) => t.tenant.id === selectedTenantId);
      if (selected) {
        onTenantSelected(loginData, selected);
      }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      hideClose
      comingFrom="center"
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            {getGreeting()},{" "}
            <span className="text-(--primary) opacity-90">
              {[loginData?.data?.firstName, loginData?.data?.lastName]
                .filter(Boolean)
                .join(" ") ||
                loginData?.data?.name ||
                loginData?.data?.email ||
                "User"}
            </span>
          </h1>
          <p className="text-lg text-(--text-secondary) font-light">
            You have access to multiple tenants. Please select one to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
          {tenants.length === 0 ? (
            <div className="col-span-full text-center text-(--text-muted) py-12">
              No tenants found for your account. Please contact your
              administrator.
            </div>
          ) : (
            tenants.map((item) => (
              <button
                key={item.tenant.id}
                onClick={() => handleSelectTenant(item.tenant.id)}
                className={cn(
                  "m-1 mb-8 cursor-pointer group relative flex flex-col items-center text-center p-6 rounded-xl border transition-all duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-xl",
                  selectedTenantId === item.tenant.id
                    ? "bg-(--bg-panel) border-(--primary) ring-1 ring-(--primary) ring-offset-(--bg-card) shadow-lg scale-[1.02]"
                    : "bg-(--bg-panel) border-(--border) hover:border-(--text-muted)/30",
                )}
              >
                <div
                  className={cn(
                    "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300 shadow-sm",
                    selectedTenantId === item.tenant.id
                      ? "bg-(--primary) text-(--primary-foreground)"
                      : "bg-(--bg-item) text-(--text-muted) group-hover:bg-(--primary)/10 group-hover:text-(--primary)",
                  )}
                >
                  {item.tenant.logo ? (
                    <img
                      src={item.tenant.logo}
                      alt={item.tenant.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Building2 size={32} strokeWidth={1.5} />
                  )}
                </div>

                <h3
                  className={cn(
                    "text-lg font-semibold mb-1 transition-colors",
                    selectedTenantId === item.tenant.id
                      ? "text-(--text-primary)"
                      : "text-(--text-primary)",
                  )}
                >
                  {item.tenant.name}
                </h3>

                <div className="text-sm text-(--text-secondary) opacity-80">
                  {item.role?.name}
                </div>

                {item.tenant.plan && (
                  <div className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--primary)/10 text-(--primary)">
                    {item.tenant.plan.name}
                  </div>
                )}

                {/* Selection Indicator */}
                <div
                  className={cn(
                    "absolute top-3 right-3 transition-all duration-300",
                    selectedTenantId === item.tenant.id
                      ? "opacity-100 scale-100 rotate-0 text-(--primary)"
                      : "opacity-0 scale-50 -rotate-45",
                  )}
                >
                  <div className="bg-(--primary)/10 p-1 rounded-full">
                    <Check size={20} strokeWidth={3} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button variant="secondary" label onClick={onBack || onClose}>
            <ArrowLeft size={20} className="mr-2" />
            <span>Back</span>
          </Button>
          <Button disabled={!selectedTenantId} onClick={handleContinue}>
            <span>Continue</span>
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
