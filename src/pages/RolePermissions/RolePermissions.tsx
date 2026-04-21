/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Combobox } from "../../components/ui/Combobox";
import { Switch } from "../../components/ui/Switch";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";
import { Label } from "../../components/ui/Label";
import type { ApiMenuItem, MenuItemState, ActionType } from "./index";
import { PageContainer, PageHeader } from "../../components/layout/Page";

// Transform API response to internal state structure
// For menus without children, create a self-referencing child for consistent expand/collapse design
const transformApiData = (apiData: ApiMenuItem[]): MenuItemState[] => {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((menu) => {
    // If menu has children, map them normally
    if (menu.children && menu.children.length > 0) {
      return {
        id: menu.id,
        name: menu.name,
        availableActions: menu.availableActions || [],
        permissions: {
          view: menu.permissions?.view ?? false,
          add: menu.permissions?.add ?? false,
          edit: menu.permissions?.edit ?? false,
          delete: menu.permissions?.delete ?? false,
        },
        icon: menu.icon,
        url: menu.url,
        children: menu.children.map((child) => ({
          id: child.id,
          name: child.name,
          availableActions: child.availableActions || [],
          permissions: {
            view: child.permissions?.view ?? false,
            add: child.permissions?.add ?? false,
            edit: child.permissions?.edit ?? false,
            delete: child.permissions?.delete ?? false,
          },
          icon: child.icon,
          url: child.url,
        })),
      };
    }

    // For menus without children, create self as a child for consistent design
    return {
      id: menu.id,
      name: menu.name,
      availableActions: menu.availableActions || [],
      permissions: {
        view: menu.permissions?.view ?? false,
        add: menu.permissions?.add ?? false,
        edit: menu.permissions?.edit ?? false,
        delete: menu.permissions?.delete ?? false,
      },
      icon: menu.icon,
      url: menu.url,
      children: [
        {
          id: menu.id,
          name: menu.name,
          availableActions: menu.availableActions || [],
          permissions: {
            view: menu.permissions?.view ?? false,
            add: menu.permissions?.add ?? false,
            edit: menu.permissions?.edit ?? false,
            delete: menu.permissions?.delete ?? false,
          },
          icon: menu.icon,
          url: menu.url,
        },
      ],
    };
  });
};

interface PermissionsEditorProps {
  roleId: string;
  fetchedPermissions: ApiMenuItem[];
  roleSelector: React.ReactNode;
}

function PermissionsEditor({
  roleId,
  fetchedPermissions,
  roleSelector,
}: PermissionsEditorProps) {
  const queryClient = useQueryClient();
  const { updateRolePermissions } = useProvider();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Initialize state from API data
  const [permissions, setPermissions] = useState<MenuItemState[]>(() =>
    transformApiData(fetchedPermissions),
  );

  // Keep initial state for comparison
  const [initialPermissions, setInitialPermissions] = useState<MenuItemState[]>(
    () => JSON.parse(JSON.stringify(permissions)),
  );

  // Toggle menu expansion
  const toggleMenu = (id: string) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((id) => id !== id) : [...prev, id],
    );
  };

  // Update permission for a menu item (parent or child)
  const updatePermission = (
    parentid: string,
    targetid: string,
    actionType: ActionType,
    value: boolean,
  ) => {
    setPermissions((prev) =>
      prev.map((menu) => {
        // Handle self-referencing children (menus without actual children)
        // When parent.id === child.id, we need to update both parent and child
        if (menu.id === parentid && menu.id === targetid && menu.children) {
          return {
            ...menu,
            permissions: {
              ...menu.permissions,
              [actionType]: value,
            },
            children: menu.children.map((child) => {
              if (child.id === targetid) {
                return {
                  ...child,
                  permissions: {
                    ...child.permissions,
                    [actionType]: value,
                  },
                };
              }
              return child;
            }),
          };
        }

        // If updating parent menu directly (non-self-referencing case)
        if (menu.id === targetid && menu.id !== parentid) {
          return {
            ...menu,
            permissions: {
              ...menu.permissions,
              [actionType]: value,
            },
          };
        }

        // If updating a child menu (where parent and child have different IDs)
        if (menu.id === parentid && menu.children) {
          return {
            ...menu,
            children: menu.children.map((child) => {
              if (child.id === targetid) {
                return {
                  ...child,
                  permissions: {
                    ...child.permissions,
                    [actionType]: value,
                  },
                };
              }
              return child;
            }),
          };
        }

        return menu;
      }),
    );
  };

  // Toggle all permissions for a specific action in a menu's children
  const toggleAllPermissions = (
    id: string,
    actionType: ActionType,
    value: boolean,
  ) => {
    setPermissions((prev) =>
      prev.map((menu) => {
        if (menu.id === id && menu.children) {
          return {
            ...menu,
            children: menu.children.map((child) => {
              // Only update if this action is available for the child
              if (child.availableActions.includes(actionType)) {
                return {
                  ...child,
                  permissions: {
                    ...child.permissions,
                    [actionType]: value,
                  },
                };
              }
              return child;
            }),
          };
        }
        return menu;
      }),
    );
  };

  // Check if all children have a specific permission enabled
  const areAllEnabled = (id: string, actionType: ActionType) => {
    const menu = permissions.find((m) => m.id === id);
    if (!menu || !menu.children) return false;

    // Only consider children that have this action available
    const applicableChildren = menu.children.filter((child) =>
      child.availableActions.includes(actionType),
    );

    if (applicableChildren.length === 0) return false;
    return applicableChildren.every(
      (child) => child.permissions[actionType] === true,
    );
  };

  // Check if any child has a specific action available
  const hasAnyActionAvailable = (id: string, actionType: ActionType) => {
    const menu = permissions.find((m) => m.id === id);
    if (!menu || !menu.children) return false;
    return menu.children.some((child) =>
      child.availableActions.includes(actionType),
    );
  };

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    if (!initialPermissions || initialPermissions.length === 0) return false;

    const comparePermissions = (
      current: MenuItemState[],
      initial: MenuItemState[],
    ): boolean => {
      return current.some((menu, menuIndex) => {
        const initialMenu = initial[menuIndex];
        if (!initialMenu) return false;

        // Check parent permissions
        if (
          JSON.stringify(menu.permissions) !==
          JSON.stringify(initialMenu.permissions)
        ) {
          return true;
        }

        // Check children permissions
        if (menu.children && initialMenu.children) {
          return menu.children.some((child, childIndex) => {
            const initialChild = initialMenu.children![childIndex];
            if (!initialChild) return false;
            return (
              JSON.stringify(child.permissions) !==
              JSON.stringify(initialChild.permissions)
            );
          });
        }

        return false;
      });
    };

    return comparePermissions(permissions, initialPermissions);
  }, [permissions, initialPermissions]);

  // Collect changed permissions for save
  const getChangedPermissions = (): any[] => {
    const changedPermissions: any[] = [];

    permissions.forEach((menu, menuIndex) => {
      const initialMenu = initialPermissions[menuIndex];

      // Check parent menu permissions
      if (
        JSON.stringify(menu.permissions) !==
        JSON.stringify(initialMenu.permissions)
      ) {
        changedPermissions.push({
          menuId: menu.id,
          ...menu.permissions,
        });
      }

      // Check children permissions (skip self-referencing children to avoid duplicates)
      if (menu.children && initialMenu.children) {
        menu.children.forEach((child, childIndex) => {
          // Skip if this is a self-referencing child (same ID as parent)
          if (child.id === menu.id) return;

          const initialChild = initialMenu.children![childIndex];
          if (
            JSON.stringify(child.permissions) !==
            JSON.stringify(initialChild.permissions)
          ) {
            changedPermissions.push({
              menuId: child.id,
              ...child.permissions,
            });
          }
        });
      }
    });

    return changedPermissions;
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => updateRolePermissions(roleId, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", roleId],
      });
      if (data.status !== false) {
        // Update initial state to match current state after successful save
        setInitialPermissions(JSON.parse(JSON.stringify(permissions)));
        toast.success(data?.message || "Permissions saved successfully");
      } else {
        toast.error(data?.message || "Failed to save permissions");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save permissions");
    },
  });

  const handleSave = () => {
    const changedPermissions = getChangedPermissions();

    if (changedPermissions.length === 0) {
      toast.info("No changes to save");
      return;
    }

    const payload = {
      roleId: roleId,
      permissions: changedPermissions,
    };

    console.log("Role Permissions Payload:", JSON.stringify(payload, null, 2));
    saveMutation.mutate(payload);
  };

  // Render permission switch for a menu item
  const renderPermissionSwitch = (
    parentid: string,
    item: MenuItemState,
    actionType: ActionType,
  ) => {
    const isAvailable = item.availableActions.includes(actionType);

    if (!isAvailable) {
      return <div className="w-10" />; // Empty placeholder for alignment
    }

    return (
      <Switch
        checked={item.permissions[actionType] ?? false}
        onChange={(e) =>
          updatePermission(parentid, item.id, actionType, e.target.checked)
        }
      />
    );
  };

  const actionTypes: ActionType[] = ["view", "add", "edit", "delete"];

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div className="flex-1 sm:max-w-md">{roleSelector}</div>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !hasChanges}
            className="w-full sm:w-auto"
          >
            {saveMutation.isPending ? (
              <>
                <Spinner
                  size="sm"
                  variant="gradient-ring"
                  className="mr-2"
                  strokeWidth={2}
                />
                Saving...
              </>
            ) : (
              "Save Permissions"
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-(--border) rounded-lg">
        <div className="divide-y divide-(--border)">
          {permissions.map((menu) => (
            <div key={menu.id}>
              {/* Menu with children - expandable */}
              {menu.children && menu.children.length > 0 ? (
                <>
                  {/* Menu Header */}
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-(--secondary)/30 transition-colors cursor-pointer"
                    onClick={() => toggleMenu(menu.id)}
                  >
                    <span className="font-semibold text-(--text-primary)">
                      {menu.name}
                    </span>
                    <ChevronRight
                      size={20}
                      className={cn(
                        "text-(--text-secondary) transition-transform duration-200",
                        expandedMenus.includes(menu.id) && "rotate-90",
                      )}
                    />
                  </button>

                  {/* Children with Permissions */}
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-in-out",
                      expandedMenus.includes(menu.id)
                        ? "grid-rows-[1fr]"
                        : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden overflow-x-auto">
                      <div className="bg-(--bg-card) border-t border-(--border) min-w-[500px]">
                        {/* Header Row - Labels */}
                        <div className="grid grid-cols-[1fr_repeat(4,60px)] sm:grid-cols-[1fr_repeat(4,80px)] gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-(--secondary)/20 text-xs font-medium text-(--text-secondary) uppercase">
                          <span className="pl-2 sm:pl-6">Sub Menu</span>
                          <span className="text-center">View</span>
                          <span className="text-center">Add</span>
                          <span className="text-center">Edit</span>
                          <span className="text-center">Delete</span>
                        </div>

                        {/* Subheader Row - Toggle All Switches */}
                        {menu.children.length > 1 && (
                          <div className="grid grid-cols-[1fr_repeat(4,60px)] sm:grid-cols-[1fr_repeat(4,80px)] gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-(--secondary)/10 border-b border-(--border) items-center">
                            <span className="pl-2 sm:pl-6 text-xs text-(--text-secondary) italic font-bold">
                              Toggle All
                            </span>
                            {actionTypes.map((actionType) => (
                              <div
                                key={actionType}
                                className="flex justify-center"
                              >
                                {hasAnyActionAvailable(menu.id, actionType) ? (
                                  <Switch
                                    checked={areAllEnabled(menu.id, actionType)}
                                    onChange={(e) =>
                                      toggleAllPermissions(
                                        menu.id,
                                        actionType,
                                        e.target.checked,
                                      )
                                    }
                                  />
                                ) : (
                                  <div className="w-10" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Child Menu Rows */}
                        {menu.children.map((child, index) => (
                          <div
                            key={child.id}
                            className={cn(
                              "grid grid-cols-[1fr_repeat(4,60px)] sm:grid-cols-[1fr_repeat(4,80px)] gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 items-center",
                              index !== menu.children!.length - 1 &&
                                "border-b border-(--border)",
                            )}
                          >
                            <span className="pl-2 sm:pl-6 text-sm text-(--text-standard) truncate">
                              {child.name}
                            </span>
                            {actionTypes.map((actionType) => (
                              <div
                                key={actionType}
                                className="flex justify-center"
                              >
                                {renderPermissionSwitch(
                                  menu.id,
                                  child,
                                  actionType,
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Menu without children - single row with permissions */
                <div className="grid grid-cols-[1fr_repeat(4,60px)] sm:grid-cols-[1fr_repeat(4,80px)] gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 items-center">
                  <span className="font-semibold text-(--text-primary)">
                    {menu.name}
                  </span>
                  {actionTypes.map((actionType) => (
                    <div key={actionType} className="flex justify-center">
                      {renderPermissionSwitch(menu.id, menu, actionType)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function RolePermissions() {
  const { getRoles, getRolePermissions } = useProvider();
  const [selectedRole, setSelectedRole] = useState<any>({});
  const portal = JSON.parse(localStorage.getItem("user_data") || "{}")?.portal;

  // Fetch roles for combobox
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", portal],
    queryFn: () => getRoles({ portal }),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Fetch permissions for selected role
  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["rolePermissions", selectedRole],
    queryFn: () => getRolePermissions(selectedRole),
    enabled: !!selectedRole?.roleId,
    select: (res: any) => res?.data || res,
  });

  // Transform roles for combobox options
  const roleOptions = roles.map((role: any) => ({
    value: role.id,
    label: role.name,
  }));

  const roleSelector = (
    <div>
      <Label className="mb-1.5 block">Select Role</Label>
      <Combobox
        options={roleOptions}
        value={selectedRole?.roleId || ""}
        onChange={(value: string) => setSelectedRole({ roleId: value })}
        placeholder="Select a role..."
        loading={rolesLoading}
      />
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Role Permissions" />

      {permissionsLoading ? (
        <>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="flex-1 sm:max-w-md">{roleSelector}</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-12">
            <Spinner variant="gradient-ring" size="lg" />
          </div>
        </>
      ) : selectedRole?.roleId ? (
        <PermissionsEditor
          key={selectedRole?.roleId}
          roleId={selectedRole?.roleId}
          fetchedPermissions={rolePermissions}
          roleSelector={roleSelector}
        />
      ) : (
        <>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="flex-1 sm:max-w-md">{roleSelector}</div>
            </div>
          </div>
          <div className="p-6 sm:p-12 border border-dashed border-(--border) rounded-lg">
            <div className="text-center text-(--text-secondary)">
              <p className="text-base sm:text-lg">
                Select a role to configure permissions
              </p>
              <p className="text-xs sm:text-sm mt-1">
                Choose a role from the dropdown above to view and edit its
                permissions
              </p>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
