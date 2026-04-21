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
import { BranchesEntry, type Branch } from "./index";

export function Branches() {
  const queryClient = useQueryClient();

  const { getBranches, deleteBranch } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Partial<Branch>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

  // Queries
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
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
    setCurrentBranch({});
    setIsModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setCurrentBranch({
      id: branch.id,
      name: branch.name,
      description: branch.description,
      address: branch.address,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setBranchToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (branchToDelete) {
      deleteMutation.mutate(branchToDelete);
    }
  };

  const columns: Column<Branch>[] = [
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
      accessorKey: "address",
      header: "Address",
      searchable: true,
      cell: (item) => item.address || "-",
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
        title="Branches"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Branch
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={branches as Branch[]}
        isLoading={isLoading}
      />

      <BranchesEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branch={currentBranch}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setBranchToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
