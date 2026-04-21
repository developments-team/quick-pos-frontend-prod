/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Store, ArrowRight, Check, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

interface Branch {
  id: string;
  name: string;
  address?: string | null;
}

interface BranchSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  branches: Branch[];
  onBack?: () => void;
  selectedBranchId?: string | null;
}

export function BranchSwitcher({
  isOpen,
  onClose,
  userData,
  branches,
  onBack,
  selectedBranchId: initialSelectedBranchId,
}: BranchSwitcherProps) {
  const navigate = useNavigate();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    () => {
      if (initialSelectedBranchId) return initialSelectedBranchId;
      if (branches?.length === 1) {
        return branches[0].id;
      }
      return null;
    },
  );

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
  };

  const handleContinue = () => {
    if (selectedBranchId && userData) {
      const selectedBranch = branches.find((b) => b.id === selectedBranchId);

      if (selectedBranch) {
        const userToSave = { ...userData, branches: selectedBranch };
        localStorage.setItem("user_data", JSON.stringify(userToSave));
        onClose();
        navigate("/dashboard");
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
              {[userData?.firstName, userData?.lastName]
                .filter(Boolean)
                .join(" ") ||
                userData?.name ||
                "User"}
            </span>
          </h1>
          <p className="text-lg text-(--text-secondary) font-light">
            Please select the branch you would like to manage today.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
          {branches.length === 0 ? (
            <div className="col-span-full text-center text-(--text-muted) py-12">
              No branches found for your account. Please contact your
              administrator.
            </div>
          ) : (
            branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch.id)}
                className={cn(
                  "m-1 mb-8 cursor-pointer group relative flex flex-col items-center text-center p-6 rounded-xl border transition-all duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-xl",
                  selectedBranchId === branch.id
                    ? "bg-(--bg-panel) border-(--primary) ring-1 ring-(--primary) ring-offset-(--bg-card) shadow-lg scale-[1.02]"
                    : "bg-(--bg-panel) border-(--border) hover:border-(--text-muted)/30",
                )}
              >
                <div
                  className={cn(
                    "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300 shadow-sm",
                    selectedBranchId === branch.id
                      ? "bg-(--primary) text-(--primary-foreground)"
                      : "bg-(--bg-item) text-(--text-muted) group-hover:bg-(--primary)/10 group-hover:text-(--primary)",
                  )}
                >
                  <Store size={32} strokeWidth={1.5} />
                </div>

                <h3
                  className={cn(
                    "text-lg font-semibold mb-1 transition-colors",
                    selectedBranchId === branch.id
                      ? "text-(--text-primary)"
                      : "text-(--text-primary)",
                  )}
                >
                  {branch.name}
                </h3>

                {branch.address && (
                  <div className="flex items-center gap-1.5 text-sm text-(--text-secondary) opacity-80">
                    <MapPin size={14} />
                    <span>{branch.address}</span>
                  </div>
                )}

                {/* Selection Indicator */}
                <div
                  className={cn(
                    "absolute top-3 right-3 transition-all duration-300",
                    selectedBranchId === branch.id
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
          <Button disabled={!selectedBranchId} onClick={handleContinue}>
            <span>Continue</span>
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
