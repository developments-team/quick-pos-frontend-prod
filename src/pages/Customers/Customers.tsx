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
import { CustomersEntry, type Customer } from "./index";
import { CustomerGroupsEntry } from "../CustomerGroups";

export function Customers() {
  const queryClient = useQueryClient();

  const { getCustomers, deleteCustomer } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Queries
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      if (data.status !== false) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    setCurrentCustomer({});
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setCurrentCustomer({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      tin: customer.tin,
      company: customer.company,
      customerGroupId: customer.customerGroupId,
      accountReceivableId: customer.accountReceivableId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (_, index) => <span>{index + 1}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      sortable: true,
      searchable: true,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      sortable: true,
      searchable: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      sortable: true,
      searchable: true,
    },
    {
      accessorKey: "company",
      header: "Company",
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
              onClick={() => handleDelete(item)}
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
        title="Customers"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        }
      />

      <DataTable columns={columns} data={customers} isLoading={isLoading} />

      <CustomersEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={currentCustomer}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete this customer "${customerToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      <CustomerGroupsEntry
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
    </PageContainer>
  );
}
