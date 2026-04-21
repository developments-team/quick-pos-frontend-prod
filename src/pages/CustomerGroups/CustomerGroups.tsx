/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { AlertDialog } from "../../components/ui/AlertDialog";
import { Badge } from "../../components/ui/Badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Tooltip } from "../../components/ui/Tooltip";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { CustomerGroupsEntry, type CustomerGroup } from "./index";

export function CustomerGroups() {
  const queryClient = useQueryClient();

  const { getCustomerGroups, deleteCustomerGroup } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<CustomerGroup>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  // Queries
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["customerGroups"],
    queryFn: () => getCustomerGroups(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomerGroup(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["customerGroups"] });
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      if (data.status !== false) {
        toast.success(data.message, {
          title: "Success",
        });
      } else {
        toast.error(data.message, {
          title: "Error",
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        title: "Error",
      });
    },
  });

  const handleCreate = () => {
    setCurrentGroup({});
    setIsModalOpen(true);
  };

  const handleEdit = (group: CustomerGroup) => {
    setCurrentGroup({
      id: group.id,
      name: group.name,
      discountPercentage: group.discountPercentage,
      isDefault: group.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setGroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (groupToDelete) {
      deleteMutation.mutate(groupToDelete);
    }
  };

  const columns: Column<CustomerGroup>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (_, index) => <span className="">{index + 1}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      sortable: true,
      searchable: true,
    },
    {
      accessorKey: "discountPercentage",
      header: "Discount Percentage",
      cell: (item) =>
        item.discountPercentage !== undefined
          ? `${item.discountPercentage}%`
          : "-",
      sortable: true,
    },
    {
      accessorKey: "isDefault",
      header: "Default",
      cell: (item) => (
        <Badge variant={item.isDefault ? "success" : "secondary"}>
          {item.isDefault ? "Yes" : "No"}
        </Badge>
      ),
      sortable: true,
    },
    {
      accessorKey: "id",
      header: "Actions",
      className: "text-right pr-10",
      cell: (item) => (
        <div className="flex justify-end -mr-2">
          <Tooltip content="Edit">
            <Button
              size="sm"
              variant="ghost"
              className="-mx-1"
              onClick={() => handleEdit(item)}
            >
              <Edit size={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500"
              onClick={() => handleDelete(item.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending &&
              deleteMutation.variables === item.id ? (
                <Spinner size="sm" className="w-4 h-4" />
              ) : (
                <Trash2 size={16} />
              )}
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Customer Group"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Group
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={groups as CustomerGroup[]}
        isLoading={isLoading}
      />

      <CustomerGroupsEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customerGroup={currentGroup}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Customer Group"
        description="Are you sure you want to delete this group? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
