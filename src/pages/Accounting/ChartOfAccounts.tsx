/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { TableRow, TableCell } from "../../components/ui/Table";
import { Plus, Edit, Trash2, ChevronLeft, FolderPlus } from "lucide-react";
import { Tooltip } from "../../components/ui/Tooltip";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { AlertDialog } from "../../components/ui/AlertDialog";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { CardRadioGroupItem, RadioGroup } from "../../components/ui/RadioGroup";
import { Textarea } from "../../components/ui/Textarea";

const initialState = {
  parentAccountId: "",
  accountNumber: "",
  accountName: "",
  accountType: "General",
  openBalance: "",
  description: "",
};

export const ChartOfAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialState);

  // Navigation State
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  // New state to track if we are adding a child to a specific parent from the row action
  const [parentForNewAccount, setParentForNewAccount] = useState<any | null>(
    null,
  );

  const queryClient = useQueryClient();
  const {
    getChartOfAccounts,
    deleteChartOfAccount,
    createNewChartOfAccount,
    updateChartOfAccount,
    getNewAccountNumber,
  } = useProvider();

  // Queries
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["chart-of-accounts", currentParentId],
    queryFn: () => getChartOfAccounts({ parentAccountId: currentParentId }),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Query for new account number when adding a child
  const { data: newAccountNumber, isFetching: isFetchingAccountNumber } =
    useQuery({
      queryKey: ["new-account-number", parentForNewAccount?.id],
      queryFn: () => getNewAccountNumber(parentForNewAccount?.id),
      select: (res: any) => res?.data?.nextAccountNumber || "",
      enabled: !!parentForNewAccount && isModalOpen && !editingAccount,
    });

  // Update formData when newAccountNumber is fetched
  useEffect(() => {
    if (newAccountNumber && !editingAccount) {
      setFormData((prev) => ({
        ...prev,
        accountNumber: newAccountNumber,
      }));
    }
  }, [newAccountNumber, editingAccount]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => createNewChartOfAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      closeModal();
      toast.success("Account created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateChartOfAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      closeModal();
      toast.success("Account updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChartOfAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      toast.success("Account deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const openAddModal = () => {
    setEditingAccount(null);
    setParentForNewAccount(null);
    setFormData(initialState);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setParentForNewAccount(null);
    setFormData(initialState);
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setParentForNewAccount(null);
    setFormData({
      parentAccountId: account.parentAccountId || "",
      accountNumber: account.accountNumber || "",
      accountName: account.accountName || "",
      accountType: account.accountType || "General",
      openBalance: account.openingBalance || "",
      description: account.description || "",
    });
    setIsModalOpen(true);
  };

  const handleAddChild = (parent: any) => {
    setParentForNewAccount(parent);
    setEditingAccount(null);
    setFormData({
      ...initialState,
      // Inherit group from parent if applicable, or keep empty
      // accountGroup: parent.accountGroup || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: any = {
      ...formData,
    };

    // Logic for parentAccountId:
    if (parentForNewAccount) {
      data.parentAccountId = parentForNewAccount.id;
    } else if (currentParentId) {
      data.parentAccountId = currentParentId;
    }

    if (data.openBalance) {
      data.balanceDate = new Date().toISOString();
    }

    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDrillDown = (account: any) => {
    setBreadcrumbs([...breadcrumbs, account]);
    setCurrentParentId(account.id);
  };

  const handleBack = () => {
    if (breadcrumbs.length > 0) {
      const newBreadcrumbs = [...breadcrumbs];
      newBreadcrumbs.pop();
      setBreadcrumbs(newBreadcrumbs);
      const prevParent =
        newBreadcrumbs.length > 0
          ? newBreadcrumbs[newBreadcrumbs.length - 1]
          : null;
      setCurrentParentId(prevParent ? prevParent.id : null);
    }
  };

  const columns: Column<any>[] = [
    {
      accessorKey: "accountNumber",
      header: "Number",
      sortable: true,
      searchable: true,
      cell: (item, index) => (
        <span
          className="flex capitalize cursor-pointer"
          onClick={() => (index === -1 ? handleBack() : handleDrillDown(item))}
        >
          {item.accountNumber}
        </span>
      ),
    },
    {
      accessorKey: "accountName",
      header: "Name",
      sortable: true,
      searchable: true,
      cell: (item, index) => (
        <span
          className="flex capitalize cursor-pointer"
          onClick={() => (index === -1 ? handleBack() : handleDrillDown(item))}
        >
          {item.accountName}
        </span>
      ),
    },
    {
      accessorKey: "accountGroup",
      header: "Group",
      sortable: true,
      cell: (item) => <span className="capitalize">{item.accountGroup}</span>,
    },
    {
      accessorKey: "accountType",
      header: "Type",
      sortable: true,
      cell: (item) => <span className="capitalize">{item.accountType}</span>,
    },
    {
      accessorKey: "openingBalance",
      header: "Open Balance",
      sortable: true,
      cell: (item) => <span className="capitalize">{item.openingBalance}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      sortable: true,
      cell: (item) => <span className="capitalize">{item.description}</span>,
    },
    {
      accessorKey: "id",
      header: "Actions",
      className: "text-right",

      cell: (item, index) => (
        <div className="flex justify-end -mr-2">
          {index === -1 && (
            <div className="mr-5">
              <Tooltip content="Add Sub-account">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddChild(item)}
                >
                  <FolderPlus size={16} />
                </Button>
              </Tooltip>
            </div>
          )}
          {index !== -1 && (
            <>
              <Tooltip content="Edit">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(item)}
                >
                  <Edit size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  // Helper to build full path from breadcrumbs
  const getAccountPath = (account: any) => {
    // Check if the account is already the last item in breadcrumbs (parent header row)
    const lastBreadcrumb =
      breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
    const isParentHeaderRow = lastBreadcrumb?.id === account.id;

    if (isParentHeaderRow) {
      // Account is the current parent, just use breadcrumbs path
      return breadcrumbs.map((b) => b.accountName).join(" > ");
    } else {
      // Account is a child in the current view, add it to the path
      const pathParts = [
        ...breadcrumbs.map((b) => b.accountName),
        account.accountName,
      ];
      return pathParts.join(" > ");
    }
  };

  // Helper title for modal
  const getModalTitle = () => {
    if (editingAccount) return "Edit Account";
    if (parentForNewAccount) {
      const fullPath = getAccountPath(parentForNewAccount);
      return `Add Sub-account to ${fullPath}`;
    }
    if (currentParentId) {
      const parent =
        breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
      if (parent) {
        const fullPath = breadcrumbs.map((b) => b.accountName).join(" > ");
        return `Add Sub-account to ${fullPath}`;
      }
      return "Add Sub-account to Current Account";
    }
    return "Add Account";
  };

  const parentHeaderRow =
    currentParentId && breadcrumbs.length > 0 ? (
      <TableRow className="bg-(--bg-muted)/50 hover:bg-(--bg-muted)/60 border-b-2 border-(--border)">
        {columns.map((column, index) => {
          const parentAccount = breadcrumbs[breadcrumbs.length - 1];
          const content = column.cell
            ? column.cell(parentAccount, -1) // -1 index to indicate it's special
            : (parentAccount[column.accessorKey] as React.ReactNode);

          return (
            <TableCell key={`parent-${index}`} className={column.className}>
              {index === 0 ? (
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-7 w-8 p-0 hover:bg-transparent -ml-2"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  {content}
                </div>
              ) : (
                content
              )}
            </TableCell>
          );
        })}
      </TableRow>
    ) : null;

  return (
    <PageContainer>
      <PageHeader
        title="Chart of Accounts"
        action={
          breadcrumbs.length > 0 ? (
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          ) : null
        }
      />
      <span className="flex mb-4 -mt-4">
        {breadcrumbs.map((b) => b.accountName).join(" > ")}
      </span>
      <DataTable
        columns={columns}
        data={accounts}
        isLoading={isLoading}
        prependRows={parentHeaderRow}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={getModalTitle()}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                defaultValue={
                  editingAccount?.accountNumber || newAccountNumber || ""
                }
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    accountNumber: e.target.value,
                  });
                }}
                required
                placeholder="e.g. 1000"
                loading={isFetchingAccountNumber}
                disabled={isFetchingAccountNumber}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                name="accountName"
                defaultValue={editingAccount?.accountName}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    accountName: e.target.value,
                  });
                }}
                required
                placeholder="e.g. Cash"
              />
            </div>
            <div className="flex flex-col gap-2.25">
              <Label>Account Type</Label>
              <RadioGroup
                value={formData.accountType}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    accountType: value,
                  });
                }}
                className="grid grid-cols-2 gap-4"
              >
                <CardRadioGroupItem
                  value="General"
                  title="General"
                  className="h-10.5 rounded-md py-1.5 px-3 pr-5"
                />
                <CardRadioGroupItem
                  value="Detail"
                  title="Detail"
                  className="h-10.5 rounded-md py-1.5 px-3 pr-5"
                />
              </RadioGroup>
            </div>
            {formData.accountType === "General" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="openBalance">Open Balance</Label>
                <Input
                  id="openBalance"
                  type="number"
                  value={formData.openBalance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openBalance: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            )}
            {/* <Activity
              mode={formData.accountType === "General" ? "hidden" : "visible"}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="openBalance">Open Balance</Label>
                <Input
                  id="openBalance"
                  type="number"
                  value={formData.openBalance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openBalance: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </Activity> */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner className="mr-2 h-4 w-4" />
              )}
              {editingAccount ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={() => deleteMutation.mutate(accountToDelete!)}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
};
