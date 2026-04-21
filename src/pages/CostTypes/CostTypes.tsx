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
import { CostTypesEntry, type CostType } from "./index";

export function CostTypes() {
  const queryClient = useQueryClient();

  const { getCostTypes, deleteCostType } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<Partial<CostType>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);

  // Queries
  const { data: costTypes = [], isLoading } = useQuery({
    queryKey: ["costTypes"],
    queryFn: () => getCostTypes(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCostType(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["costTypes"] });
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
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
    setCurrentType({});
    setIsModalOpen(true);
  };

  const handleEdit = (type: CostType) => {
    setCurrentType({
      id: type.id,
      name: type.name,
      description: type.description,
      isDefault: type.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setTypeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (typeToDelete) {
      deleteMutation.mutate(typeToDelete);
    }
  };

  const columns: Column<CostType>[] = [
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
      accessorKey: "description",
      header: "Description",
      sortable: true,
      cell: (item) => item.description || "-",
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
        title="Cost Types"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Cost Type
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={costTypes as CostType[]}
        isLoading={isLoading}
      />

      <CostTypesEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        costType={currentType}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTypeToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Cost Type"
        description="Are you sure you want to delete this cost type? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
