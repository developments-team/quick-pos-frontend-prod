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
import { UsersEntry, type User } from "./index";

export function Users() {
  const queryClient = useQueryClient();

  const { getUsers, deleteUser, getRoles, getBranches } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Queries
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Fetch roles to map roleId to roleName
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
  const tenantId = userData?.tenant?.id;
  const portal = userData?.portal?.toUpperCase() || "";
  const { data: roles = [] } = useQuery({
    queryKey: ["roles", tenantId, portal],
    queryFn: () => getRoles({ tenantId, portal }),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Fetch branches to map branch IDs to names
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Create lookup maps
  const roleMap = roles.reduce((acc: Record<string, string>, role: any) => {
    acc[role.id] = role.name;
    return acc;
  }, {});

  const branchMap = branches.reduce(
    (acc: Record<string, string>, branch: any) => {
      acc[branch.id] = branch.name;
      return acc;
    },
    {},
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
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
    setCurrentUser({});
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      branches: Array.isArray(user.branches)
        ? user.branches.map((b: any) =>
            typeof b === "object" && b !== null && "id" in b
              ? String(b.id)
              : String(b),
          )
        : [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  const columns: Column<User>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (_, index) => <span className="">{index + 1}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      sortable: true,
      searchable: true,
    },
    {
      accessorKey: "roleId",
      header: "Role",
      searchable: true,
      cell: (item) => roleMap[item.roleId] || item.roleId || "-",
    },
    {
      accessorKey: "branches",
      header: "Branches",
      cell: (item) =>
        item.branches && item.branches.length > 0
          ? item.branches.map((id) => branchMap[id] || id).join(", ")
          : "-",
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
        title="Users"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users as User[]}
        isLoading={isLoading}
      />

      <UsersEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={currentUser}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
