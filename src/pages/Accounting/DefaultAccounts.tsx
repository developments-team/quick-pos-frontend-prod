/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { Combobox } from "../../components/ui/Combobox";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { Save } from "lucide-react";

interface DefaultAccount {
  id: string;
  name: string;
  group: string;
  accountId: string;
  account: {
    accountNumber: string;
    accountName: string;
  };
}

interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
}

interface AccountRowProps {
  item: DefaultAccount;
  value: string;
  onChange: (value: string) => void;
}

const AccountRow = ({ item, value, onChange }: AccountRowProps) => {
  const { getAccountsByGroup } = useProvider();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts-by-group", item.group],
    queryFn: () => getAccountsByGroup(item.group),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
    // Stale time to prevent refetching for the same group across multiple components effectively
    staleTime: 5 * 60 * 1000,
  });

  const options = accounts.map((acc: Account) => ({
    value: acc.id,
    label: `${acc.accountNumber} - ${acc.accountName}`,
    // description: acc.accountName,
  }));

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`account-${item.id}`} className="text-sm font-medium">
        {item.name}{" "}
        <span className="text-(--text-secondary) font-normal text-xs">
          ({item.group})
        </span>
      </Label>
      <Combobox
        options={options}
        value={value}
        onChange={onChange}
        // placeholder={`Select ${item.group.toLowerCase()} account...`}
        loading={isLoading}
        emptyMessage="No accounts found"
      />
    </div>
  );
};

export const DefaultAccounts = () => {
  const queryClient = useQueryClient();
  const { getDefaultAccounts, updateDefaultAccount } = useProvider();

  // Local state for form values
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<
    { id: string; accountId: string }[]
  >([]);

  // Fetch default accounts
  const {
    data: defaultAccounts = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["default-accounts"],
    queryFn: () => getDefaultAccounts(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Initialize form values when default accounts are loaded
  useEffect(() => {
    if (defaultAccounts.length > 0) {
      setFormValues((prev) => {
        // Only initialize if empty to preserve user edits during re-fetches or component updates
        // that shouldn't reset state (though here we want to respect the loaded data if it's the first load)
        if (Object.keys(prev).length === 0) {
          const initial: Record<string, string> = {};
          defaultAccounts.forEach((item: DefaultAccount) => {
            initial[item.id] = item.accountId;
          });
          return initial;
        }
        return prev;
      });
    }
  }, [defaultAccounts]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: { id: string; accountId: string }[]) => {
      const promises = updates.map(({ id, accountId }) =>
        updateDefaultAccount(id, { accountId }),
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default-accounts"] });
      toast.success("Default accounts updated successfully");
      setHasChanges(false);
      setPendingUpdates([]);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update default accounts");
    },
  });

  // Handle value change
  const handleValueChange = (
    defaultAccountId: string,
    newAccountId: string,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [defaultAccountId]: newAccountId,
    }));

    // Check if this value differs from original
    const originalAccount = defaultAccounts.find(
      (da: DefaultAccount) => da.id === defaultAccountId,
    );
    if (originalAccount) {
      if (newAccountId !== originalAccount.accountId) {
        // Add to pending updates
        setPendingUpdates((prev) => {
          const filtered = prev.filter((u) => u.id !== defaultAccountId);
          return [
            ...filtered,
            { id: defaultAccountId, accountId: newAccountId },
          ];
        });
        setHasChanges(true);
      } else {
        // Remove from pending updates if reverted to original
        setPendingUpdates((prev) =>
          prev.filter((u) => u.id !== defaultAccountId),
        );
        // Check if there are still changes by looking at current pending updates (excluding the one we just removed)
        // We need to check the state updater result logic, but here we depend on the *next* render for state.
        // Better to calculate derived state or use a ref, but simple check against the filtered array works.
        const remainingChanges = pendingUpdates.filter(
          (u) => u.id !== defaultAccountId,
        );
        setHasChanges(remainingChanges.length > 0);
      }
    }
  };

  // Handle save
  const handleSave = () => {
    if (pendingUpdates.length > 0) {
      updateMutation.mutate(pendingUpdates);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Default Accounts" />
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Default Accounts"
        action={
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Spinner size="sm" className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        }
      />

      <div className="bg-(--bg-card) border border-(--border) rounded-lg p-6">
        {isFetching && !isLoading && (
          <div className="mb-4 flex items-center gap-2 text-sm text-(--text-secondary)">
            <Spinner size="sm" />
            <span>Refreshing...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {defaultAccounts.map((defaultAccount: DefaultAccount) => (
            <AccountRow
              key={defaultAccount.id}
              item={defaultAccount}
              value={formValues[defaultAccount.id] || ""}
              onChange={(value) => handleValueChange(defaultAccount.id, value)}
            />
          ))}
        </div>

        {defaultAccounts.length === 0 && (
          <div className="text-center py-8 text-(--text-secondary)">
            No default accounts configured
          </div>
        )}
      </div>
    </PageContainer>
  );
};
