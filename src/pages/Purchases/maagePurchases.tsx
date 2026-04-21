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

export function ManagePurchases() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { getPurchases, deletePurchase, getVendors, getBranches } =
    useProvider();

  const navigate = useNavigate();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => getPurchases(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePurchase(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      setDeleteDialogOpen(false);
      setPurchaseToDelete(null);
      if (data.status !== false) {
        toast.success(data.message || "Purchase deleted successfully");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (purchase: any) => {
    navigate("/purchase/edit", { state: { ...purchase } });
  };

  const handleReturn = (purchase: any) => {
    navigate("/purchase/return", { state: { ...purchase } });
  };

  const handleDelete = (id: string) => {
    setPurchaseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (purchaseToDelete) {
      deleteMutation.mutate(purchaseToDelete);
    }
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((s: any) => s.id === vendorId);
    return vendor?.name || "-";
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
      accessorKey: "vendorId",
      header: "Vendor",
      cell: (item) => <span>{getVendorName(item.vendorId)}</span>,
    },
    {
      accessorKey: "branchId",
      header: "Branch",
      cell: (item) => <span>{getBranchName(item.branchId)}</span>,
    },
    // {
    //   accessorKey: "purchaseType",
    //   header: "Type",
    //   cell: (item) => (
    //     <Badge
    //       variant={item.purchaseType === "Return" ? "destructive" : "secondary"}
    //     >
    //       {item.purchaseType || "Purchase"}
    //     </Badge>
    //   ),
    // },
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
      <PageHeader
        title="Manage Purchases"
        // action={
        //   <div className="flex gap-2">
        //     <Button outline onClick={() => navigate("/purchase")}>
        //       <Plus className="mr-2 h-4 w-4" /> Add
        //     </Button>
        //   </div>
        // }
      />
      <DataTable columns={columns} data={purchases} isLoading={isLoading} />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPurchaseToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Purchase"
        description="Are you sure you want to delete this purchase? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
