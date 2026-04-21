/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { AlertDialog } from "../../components/ui/AlertDialog";
import { Badge } from "../../components/ui/Badge";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { Tooltip } from "../../components/ui/Tooltip";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { useNavigate } from "react-router-dom";

export function Products() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { getProducts, deleteProduct, getCategories, getBrands } =
    useProvider();

  const navigate = useNavigate();
  // Queries

  // Queries
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
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

  const handleEdit = (product: any) => {
    // navigate(`/products/${product.id}/edit`);
    // Pass the ID in the state object
    // navigate("/products/edit", { state: { id: product.id } });
    navigate("/products/edit", {
      state: {
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        brandId: product.brandId,
        groupId: product.groupId,
        purchaseUnitId: product.purchaseUnitId,
        saleUnitId: product.saleUnitId,
        rate: product.rate,
        productImage: product.productImage,
        taxId: product.taxId,
        productType: product.productType,
        hasInitialQuantity: product.hasInitialQuantity,
        assetAccountId: product.assetAccountId,
        revenueAccountId: product.revenueAccountId,
        COGsAccountId: product.COGsAccountId,
        saleReturnAccountId: product.saleReturnAccountId,
        branchId: product.branchId,
        paymentType: product.paymentType,
        subTotal: product.subTotal,
        productDetails: product.productDetails,
      },
    });
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || "-";
  };

  const getBrandName = (brandId: string) => {
    const brand = brands.find((b: any) => b.id === brandId);
    return brand?.name || "-";
  };

  const columns: Column<any>[] = [
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
      accessorKey: "categoryId",
      header: "Category",
      cell: (item) => <span>{getCategoryName(item.categoryId)}</span>,
    },
    {
      accessorKey: "brandId",
      header: "Brand",
      cell: (item) => <span>{getBrandName(item.brandId)}</span>,
    },
    {
      accessorKey: "productType",
      header: "Type",
      cell: (item) => (
        <Badge variant="secondary">{item.productType || "-"}</Badge>
      ),
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: (item) => <span>{item.rate || 0}</span>,
      sortable: true,
    },
    {
      accessorKey: "subTotal",
      header: "Sub Total",
      cell: (item) => <span>{item.subTotal || 0}</span>,
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
        title="Products"
        action={
          <div className="flex gap-2">
            <Button outline onClick={() => navigate("/products/add")}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
            <Button outline onClick={() => navigate("/products/import")}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button outline onClick={() => navigate("/products/import-images")}>
              <Upload className="mr-2 h-4 w-4" /> Import Images
            </Button>
          </div>
        }
      />
      <DataTable columns={columns} data={products} isLoading={isLoading} />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
