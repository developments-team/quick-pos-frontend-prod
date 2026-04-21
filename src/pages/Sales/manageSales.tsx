/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { AlertDialog } from "../../components/ui/AlertDialog";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import { Tooltip } from "../../components/ui/Tooltip";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { useNavigate } from "react-router-dom";

export function ManageSales() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { getSales, deleteSale, getCustomers, getBranches } = useProvider();

  const navigate = useNavigate();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getSales(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
      if (data.status !== false) {
        toast.success(data.message || "Sale deleted successfully");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (sale: any) => {
    navigate("/sale/edit", { state: { ...sale } });
  };

  const handleReturn = (sale: any) => {
    navigate("/sale/return", { state: { ...sale } });
  };

  const handleDelete = (id: string) => {
    setSaleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (saleToDelete) {
      deleteMutation.mutate(saleToDelete);
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c: any) => c.id === customerId);
    return customer?.name || "-";
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find((b: any) => b.id === branchId);
    return branch?.name || "-";
  };

  const columns: Column<any>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (_, index) => <span className="">{index + 1}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: (item) => (
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      ),
      sortable: true,
    },
    {
      accessorKey: "ref",
      header: "Ref",
      sortable: true,
      searchable: true,
    },
    {
      accessorKey: "customerId",
      header: "Customer",
      cell: (item) => <span>{getCustomerName(item.customerId)}</span>,
    },
    {
      accessorKey: "branchId",
      header: "Branch",
      cell: (item) => <span>{getBranchName(item.branchId)}</span>,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: (item) => <span>{item.total?.toFixed(2) || "0.00"}</span>,
      sortable: true,
    },
    {
      accessorKey: "paid",
      header: "Paid",
      cell: (item) => <span>{item.paid?.toFixed(2) || "0.00"}</span>,
      sortable: true,
    },
    {
      accessorKey: "due",
      header: "Due",
      cell: (item) => (
        <span
          className={
            item.due > 0 ? "text-red-500 font-medium" : "text-green-500"
          }
        >
          {item.due?.toFixed(2) || "0.00"}
        </span>
      ),
      sortable: true,
    },
    {
      accessorKey: "id",
      header: "Actions",
      className: "text-right pr-10",
      cell: (item) => (
        <div className="flex justify-end -mr-2">
          <Tooltip content="Return">
            <Button
              size="sm"
              variant="ghost"
              className="-mx-1 text-orange-500"
              onClick={() => handleReturn(item)}
            >
              <RotateCcw size={16} />
            </Button>
          </Tooltip>
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
      <PageHeader title="Manage Sales" />
      <DataTable columns={columns} data={sales} isLoading={isLoading} />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSaleToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Sale"
        description="Are you sure you want to delete this sale? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
