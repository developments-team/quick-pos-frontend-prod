/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { AlertDialog } from "../../components/ui/AlertDialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Tooltip } from "../../components/ui/Tooltip";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { UnitsEntry, type Unit } from "./index";

export function Units() {
  const queryClient = useQueryClient();

  const { getUnits, deleteUnit } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<Partial<Unit>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

  // Queries
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: () => getUnits(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
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
    setCurrentUnit({});
    setIsModalOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setCurrentUnit({
      id: unit.id,
      name: unit.name,
      shortName: unit.shortName,
      description: unit.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setUnitToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (unitToDelete) {
      deleteMutation.mutate(unitToDelete);
    }
  };

  const columns: Column<Unit>[] = [
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
      accessorKey: "shortName",
      header: "Short Name",
      cell: (item) => <span>{item.shortName || "-"}</span>,
      sortable: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (item) => <span>{item.description || "-"}</span>,
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
        title="Units"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Unit
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={units as Unit[]}
        isLoading={isLoading}
      />

      <UnitsEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        unit={currentUnit}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUnitToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Unit"
        description="Are you sure you want to delete this unit? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
