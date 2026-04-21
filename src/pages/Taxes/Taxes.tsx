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
import { TaxesEntry, type Tax } from "./index";

export function Taxes() {
  const queryClient = useQueryClient();

  const { getTaxes, deleteTax } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTax, setCurrentTax] = useState<Partial<Tax>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState<string | null>(null);

  // Queries
  const { data: taxes = [], isLoading } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => getTaxes(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTax(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      setDeleteDialogOpen(false);
      setTaxToDelete(null);
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
    setCurrentTax({});
    setIsModalOpen(true);
  };

  const handleEdit = (tax: Tax) => {
    setCurrentTax({
      id: tax.id,
      name: tax.name,
      percentage: tax.percentage,
      isDefault: tax.isDefault,
      description: tax.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setTaxToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taxToDelete) {
      deleteMutation.mutate(taxToDelete);
    }
  };

  const columns: Column<Tax>[] = [
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
      accessorKey: "percentage",
      header: "Percentage",
      cell: (item) =>
        item.percentage !== undefined ? `${item.percentage}%` : "-",
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
      accessorKey: "description",
      header: "Description",
      cell: (item) => item.description || "-",
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
        title="Taxes"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Tax
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={taxes as Tax[]}
        isLoading={isLoading}
      />

      <TaxesEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tax={currentTax}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTaxToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Tax"
        description="Are you sure you want to delete this tax? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
