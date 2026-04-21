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
import { AdminPlansEntry, type Plan } from "./index";

export function AdminPlans() {
  const queryClient = useQueryClient();

  const { getPlans, deletePlan } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  // Queries
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
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
    setCurrentPlan({});
    setIsModalOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setCurrentPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPlanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (planToDelete) {
      deleteMutation.mutate(planToDelete);
    }
  };

  const columns: Column<Plan>[] = [
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
      accessorKey: "price",
      header: "Price",
      cell: (item) => <span>{item.price ?? "-"}</span>,
    },
    {
      accessorKey: "reportLevel",
      header: "Report Level",
      cell: (item) => <span>{item.reportLevel || "-"}</span>,
    },
    {
      accessorKey: "supportType",
      header: "Support Type",
      cell: (item) => <span>{item.supportType || "-"}</span>,
    },
    {
      accessorKey: "roleName",
      header: "Role",
      cell: (item) => <span>{item.roleName || "-"}</span>,
    },
    {
      accessorKey: "userLimit",
      header: "User Limit",
      cell: (item) => <span>{item.userLimit ?? "-"}</span>,
    },
    {
      accessorKey: "branchLimit",
      header: "Branch Limit",
      cell: (item) => <span>{item.branchLimit ?? "-"}</span>,
    },
    {
      accessorKey: "productLimit",
      header: "Product Limit",
      cell: (item) => <span>{item.productLimit ?? "-"}</span>,
    },
    {
      accessorKey: "isRecommended",
      header: "Recommended",
      cell: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            item.isRecommended
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {item.isRecommended ? "Yes" : "No"}
        </span>
      ),
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
        title="Plans"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Plan
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={plans as Plan[]}
        isLoading={isLoading}
      />

      <AdminPlansEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={currentPlan}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPlanToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
