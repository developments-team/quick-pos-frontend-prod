/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { TableRow, TableCell } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { AlertDialog } from "../../components/ui/AlertDialog";
import { Plus, Edit, Trash2, Check, X, ChevronLeft } from "lucide-react";
import { Tooltip } from "../../components/ui/Tooltip";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Spinner } from "../../components/ui/Spinner";
import { Label } from "../../components/ui/Label";
import { toast } from "../../components/ui/Toast";
import { Combobox } from "../../components/ui/Combobox";
import { AdminMenusEntry, type Menu } from "./index";

export function AdminMenus() {
  const queryClient = useQueryClient();

  const { getMenus, deleteMenu, getPortals } = useProvider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<Partial<Menu>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);
  const [selectedPortal, setSelectedPortal] = useState("");

  // Navigation State
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Menu[]>([]);

  // Fetch portals
  const { data: portals = [], isLoading: portalsLoading } = useQuery({
    queryKey: ["portals"],
    queryFn: () => getPortals(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const portalOptions = portals.map((p: any) => ({
    value: p.value,
    label: p.label,
  }));

  // Auto-select first portal
  useEffect(() => {
    if (portals.length > 0 && !selectedPortal) {
      setSelectedPortal(portals[0].value);
    }
  }, [portals, selectedPortal]);

  // Reset navigation when portal changes
  useEffect(() => {
    setCurrentParentId(null);
    setBreadcrumbs([]);
  }, [selectedPortal]);

  // Queries
  const { data: menus = [], isLoading } = useQuery({
    queryKey: ["menus", selectedPortal, currentParentId],
    queryFn: () =>
      getMenus({ portal: selectedPortal, parentId: currentParentId }),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
    enabled: !!selectedPortal,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMenu(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
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
    setCurrentMenu({ parentId: currentParentId || undefined });
    setIsModalOpen(true);
  };

  const handleEdit = (menu: Menu) => {
    setCurrentMenu({
      id: menu.id,
      name: menu.name,
      parentId: menu.parentId,
      url: menu.url,
      icon: menu.icon,
      description: menu.description,
      position: menu.position,
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
      actions: menu.actions || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setMenuToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (menuToDelete) {
      deleteMutation.mutate(menuToDelete);
    }
  };

  // Drill-down into a menu's children
  const handleDrillDown = (menu: Menu) => {
    setBreadcrumbs([...breadcrumbs, menu]);
    setCurrentParentId(menu.id);
  };

  // Go back to parent level
  const handleBack = () => {
    if (breadcrumbs.length > 0) {
      const newBreadcrumbs = [...breadcrumbs];
      newBreadcrumbs.pop();
      setBreadcrumbs(newBreadcrumbs);
      const prevParent =
        newBreadcrumbs.length > 0
          ? newBreadcrumbs[newBreadcrumbs.length - 1]
          : null;
      setCurrentParentId(prevParent ? prevParent.id : null);
    }
  };

  const columns: Column<Menu>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (_, index) => <span>{index !== -1 ? index + 1 : ""}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      sortable: true,
      searchable: true,
      cell: (item, index) => {
        const clickable = index === -1 || !item.url;
        return (
          <span
            className={`flex capitalize ${clickable ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (index === -1) handleBack();
              else if (!item.url) handleDrillDown(item);
            }}
          >
            {item.name}
          </span>
        );
      },
    },
    {
      accessorKey: "url",
      header: "URL",
      cell: (item) => <span className="text-sm">{item.url || "-"}</span>,
    },
    {
      accessorKey: "icon",
      header: "Icon",
      cell: (item) => <span>{item.icon || "-"}</span>,
    },
    // {
    //   accessorKey: "sortOrder",
    //   header: "Sort Order",
    //   cell: (item) => <span>{item.sortOrder ?? "-"}</span>,
    // },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: (item) => (
        <span>
          {item.isActive ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <X size={16} className="text-red-500" />
          )}
        </span>
      ),
    },
    {
      accessorKey: "id",
      header: "Actions",
      className: "text-right pr-10",
      cell: (item, index) => (
        <div className="flex justify-end -mr-2">
          {index !== -1 && (
            <>
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
            </>
          )}
        </div>
      ),
    },
  ];

  // Parent header row (like ChartOfAccounts)
  const parentHeaderRow =
    currentParentId && breadcrumbs.length > 0 ? (
      <TableRow className="bg-(--bg-muted)/50 hover:bg-(--bg-muted)/60 border-b-2 border-(--border)">
        {columns.map((column, index) => {
          const parentMenu = breadcrumbs[breadcrumbs.length - 1];
          const content = column.cell
            ? column.cell(parentMenu, -1)
            : (parentMenu[column.accessorKey] as React.ReactNode);

          return (
            <TableCell key={`parent-${index}`} className={column.className}>
              {index === 0 ? (
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-7 w-8 p-0 hover:bg-transparent -ml-2"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  {content}
                </div>
              ) : (
                content
              )}
            </TableCell>
          );
        })}
      </TableRow>
    ) : null;

  return (
    <PageContainer>
      <PageHeader
        title="Menus"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Menu
          </Button>
        }
      />

      <div className="flex flex-col items-start gap-2 mb-4 max-w-sm">
        <Label className="whitespace-nowrap">Portal</Label>
        <Combobox
          options={portalOptions}
          value={selectedPortal}
          onChange={(value: string) => setSelectedPortal(value)}
          placeholder="Select portal..."
          loading={portalsLoading}
          allowClear={false}
        />
      </div>

      {breadcrumbs.length > 0 && (
        <span className="flex mb-4 -mt-2 text-sm text-(--text-muted)">
          {breadcrumbs.map((b) => b.name).join(" > ")}
        </span>
      )}

      <DataTable
        columns={columns}
        data={menus as Menu[]}
        isLoading={isLoading}
        prependRows={parentHeaderRow}
      />

      <AdminMenusEntry
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menu={currentMenu}
      />

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMenuToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Menu"
        description="Are you sure you want to delete this menu? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
