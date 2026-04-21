/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { Button } from "../../components/ui/Button";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import { Spinner } from "../../components/ui/Spinner";
import { Checkbox } from "../../components/ui/Checkbox";
import { toast } from "../../components/ui/Toast";
import { Combobox } from "../../components/ui/Combobox";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Role, RolePermission } from "./index";

const emptyRole: Role = {
  id: "",
  name: "",
  description: "",
  portal: "",
  tenantId: "",
  rolePermissions: [],
};

export function AdminRolesEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    createNewRole,
    updateRole,
    getMenuRolePermissions,
    getPortals,
    getTenants,
    getActions,
  } = useProvider();

  // Fetch available permission actions
  const { data: ALL_PERMISSIONS = [] } = useQuery({
    queryKey: ["actions"],
    queryFn: () => getActions(),
    select: (res: any) =>
      (Array.isArray(res) ? res : res?.data || []).map(
        (a: { value: string }) => a.value,
      ),
  });

  // Get role from location state
  const roleFromState = location.state as Role | undefined;

  useEffect(() => {
    if (location.pathname.includes("/edit") && !roleFromState) {
      toast.error("Please select a role to edit.");
      navigate("/adminRoles");
    }
  }, [location, roleFromState, navigate]);

  const role = roleFromState;
  const id = role?.id;
  const isEditing = !!id;

  const [formData, setFormData] = useState<Role>(emptyRole);
  const [collapsedMenus, setCollapsedMenus] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; portal?: string }>({});

  // Fetch portals
  const { data: portals = [], isLoading: portalsLoading } = useQuery({
    queryKey: ["portals"],
    queryFn: () => getPortals(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Fetch tenants
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => getTenants(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Transform for Combobox options
  const portalOptions = portals.map((p: any) => ({
    value: p.value,
    label: p.label,
  }));

  const tenantOptions = tenants.map((t: any) => ({
    value: t.id,
    label: t.name,
  }));

  // Auto-select first portal when creating a new role
  useEffect(() => {
    if (!isEditing && portals.length > 0 && !formData.portal) {
      setFormData((prev) => ({ ...prev, portal: portals[0].value }));
    }
  }, [portals, isEditing, formData.portal]);

  // Fetch menu role permissions
  const { data: menuPermissions = [] } = useQuery({
    queryKey: ["menuRolePermissions", formData.portal, id],
    queryFn: () =>
      getMenuRolePermissions({
        portal: formData.portal,
        ...(id ? { roleId: id } : {}),
      }),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
    enabled: !!formData.portal,
  });

  // Get available permissions for a menu (VIEW + actions)
  const getAvailablePermissions = (menu: any): string[] => {
    const perms: string[] = ["VIEW"];
    if (menu.actions) {
      menu.actions.forEach((a: string) => {
        if (!perms.includes(a)) perms.push(a);
      });
    }
    return perms;
  };

  // Build a flat lookup: menuId -> available permissions
  const menuAvailablePermsMap: Record<string, string[]> = {};
  menuPermissions.forEach((menu: any) => {
    menuAvailablePermsMap[menu.id] = getAvailablePermissions(menu);
    if (menu.children) {
      menu.children.forEach((child: any) => {
        menuAvailablePermsMap[child.id] = getAvailablePermissions(child);
      });
    }
  });

  // Load role data when editing
  useEffect(() => {
    if (role) {
      setFormData({
        ...emptyRole,
        ...role,
      });
    } else {
      setFormData((prev) => ({ ...emptyRole, portal: prev.portal }));
    }
  }, [role]);

  // Initialize rolePermissions from API response when editing
  useEffect(() => {
    if (isEditing && menuPermissions.length > 0) {
      const initialPerms: RolePermission[] = [];
      menuPermissions.forEach((menu: any) => {
        if (menu.permissions && menu.permissions.length > 0) {
          initialPerms.push({
            menuId: menu.id,
            permissions: [...menu.permissions],
          });
        }
        if (menu.children) {
          menu.children.forEach((child: any) => {
            if (child.permissions && child.permissions.length > 0) {
              initialPerms.push({
                menuId: child.id,
                permissions: [...child.permissions],
              });
            }
          });
        }
      });
      setFormData((prev) => ({ ...prev, rolePermissions: initialPerms }));
    }
  }, [isEditing, menuPermissions]);

  // Helper: get current permissions for a menuId
  const getMenuPermissions = (menuId: string): string[] => {
    const rp = formData.rolePermissions.find(
      (p: RolePermission) => p.menuId === menuId,
    );
    return rp?.permissions || [];
  };

  // Helper: check if a permission is enabled for a menu
  const hasPermission = (menuId: string, perm: string): boolean => {
    return getMenuPermissions(menuId).includes(perm);
  };

  // Toggle a single permission for a menu
  const togglePermission = (menuId: string, perm: string) => {
    setFormData((prev: Role) => {
      const existing = prev.rolePermissions.find(
        (p: RolePermission) => p.menuId === menuId,
      );
      let newRolePermissions: RolePermission[];

      if (existing) {
        const hasPerm = existing.permissions.includes(perm);
        const newPerms = hasPerm
          ? existing.permissions.filter((p: string) => p !== perm)
          : [...existing.permissions, perm];

        if (newPerms.length === 0) {
          // Remove entry entirely if no permissions left
          newRolePermissions = prev.rolePermissions.filter(
            (p: RolePermission) => p.menuId !== menuId,
          );
        } else {
          newRolePermissions = prev.rolePermissions.map((p: RolePermission) =>
            p.menuId === menuId ? { ...p, permissions: newPerms } : p,
          );
        }
      } else {
        newRolePermissions = [
          ...prev.rolePermissions,
          { menuId, permissions: [perm] },
        ];
      }

      return { ...prev, rolePermissions: newRolePermissions };
    });
  };

  // Toggle all permissions for a menu
  const toggleAllForMenu = (menuId: string) => {
    const available = menuAvailablePermsMap[menuId] || ALL_PERMISSIONS;
    const currentPerms = getMenuPermissions(menuId);
    const allEnabled = available.every((p) => currentPerms.includes(p));

    setFormData((prev: Role) => {
      let newRolePermissions: RolePermission[];

      if (allEnabled) {
        // Remove all
        newRolePermissions = prev.rolePermissions.filter(
          (p: RolePermission) => p.menuId !== menuId,
        );
      } else {
        // Enable all
        const existing = prev.rolePermissions.find(
          (p: RolePermission) => p.menuId === menuId,
        );
        if (existing) {
          newRolePermissions = prev.rolePermissions.map((p: RolePermission) =>
            p.menuId === menuId ? { ...p, permissions: [...available] } : p,
          );
        } else {
          newRolePermissions = [
            ...prev.rolePermissions,
            { menuId, permissions: [...available] },
          ];
        }
      }

      return { ...prev, rolePermissions: newRolePermissions };
    });
  };

  // Toggle all permissions for a parent menu and all its children
  const toggleAllForParent = (parentMenu: any) => {
    const children = parentMenu.children || [];
    const menuIds =
      children.length > 0 ? children.map((c: any) => c.id) : [parentMenu.id];

    const allFullyEnabled = menuIds.every((menuId: string) => {
      const available = menuAvailablePermsMap[menuId] || ALL_PERMISSIONS;
      const perms = getMenuPermissions(menuId);
      return available.every((p) => perms.includes(p));
    });

    setFormData((prev: Role) => {
      let newRolePermissions = [...prev.rolePermissions];

      menuIds.forEach((menuId: string) => {
        const available = menuAvailablePermsMap[menuId] || ALL_PERMISSIONS;
        if (allFullyEnabled) {
          // Remove all
          newRolePermissions = newRolePermissions.filter(
            (p: RolePermission) => p.menuId !== menuId,
          );
        } else {
          // Enable all
          const existingIdx = newRolePermissions.findIndex(
            (p: RolePermission) => p.menuId === menuId,
          );
          if (existingIdx >= 0) {
            newRolePermissions[existingIdx] = {
              ...newRolePermissions[existingIdx],
              permissions: [...available],
            };
          } else {
            newRolePermissions.push({
              menuId,
              permissions: [...available],
            });
          }
        }
      });

      return { ...prev, rolePermissions: newRolePermissions };
    });
  };

  const toggleMenu = (id: string) => {
    setCollapsedMenus((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
    );
  };

  // Check if all children of a parent have ALL available permissions
  const allChildrenFullyEnabled = (parentMenu: any): boolean => {
    const children = parentMenu.children || [];
    const menuIds =
      children.length > 0 ? children.map((c: any) => c.id) : [parentMenu.id];
    return menuIds.every((menuId: string) => {
      const available = menuAvailablePermsMap[menuId] || ALL_PERMISSIONS;
      return available.every((p) => hasPermission(menuId, p));
    });
  };

  // Check if ALL permissions across ALL menus are enabled
  const allPermissionsEnabled = (): boolean => {
    return menuPermissions.every((parent: any) =>
      allChildrenFullyEnabled(parent),
    );
  };

  // Toggle all permissions for ALL menus
  const toggleAllPermissions = () => {
    const allEnabled = allPermissionsEnabled();
    setFormData((prev: Role) => {
      const newRolePermissions: RolePermission[] = [];
      if (!allEnabled) {
        menuPermissions.forEach((parent: any) => {
          const children = parent.children || [];
          const menuIds =
            children.length > 0 ? children.map((c: any) => c.id) : [parent.id];
          menuIds.forEach((menuId: string) => {
            const available = menuAvailablePermsMap[menuId] || ALL_PERMISSIONS;
            newRolePermissions.push({ menuId, permissions: [...available] });
          });
        });
      }
      return { ...prev, rolePermissions: newRolePermissions };
    });
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => createNewRole(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      if (data.status !== false) {
        toast.success(data?.message || "Role created successfully");
        navigate("/adminRoles");
      } else {
        toast.error(data?.message || "Failed to create role");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateRole(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      if (data.status !== false) {
        toast.success(data?.message || "Role updated successfully");
        navigate("/adminRoles");
      } else {
        toast.error(data?.message || "Failed to update role");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const validateForm = () => {
    const newErrors: { name?: string; portal?: string } = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.portal) {
      newErrors.portal = "Portal is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = {
        name: formData.name,
        description: formData.description,
        portal: formData.portal,
        tenantId: formData.tenantId || undefined,
        rolePermissions: formData.rolePermissions,
      };
      if (isEditing && formData.id) {
        updateMutation.mutate({ id: formData.id, data: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const handleBlur = (field: "name") => {
    setErrors((prev) => {
      const next = { ...prev };
      const value = formData[field]?.trim() || "";
      if (!value) {
        next[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return next;
      }
      delete next[field];
      return next;
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title={isEditing ? "Edit Role" : "Add Role"}
        action={
          <Button outline onClick={() => navigate("/adminRoles")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <div className="mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                onBlur={() => handleBlur("name")}
                hasError={!!errors.name}
              />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Portal *</Label>
              <Combobox
                options={portalOptions}
                value={formData.portal || ""}
                onChange={(value: string) => {
                  setFormData({ ...formData, portal: value, tenantId: "" });
                  setCollapsedMenus([]);
                  if (errors.portal) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.portal;
                      return next;
                    });
                  }
                }}
                placeholder="Select portal..."
                loading={portalsLoading}
                allowClear={false}
              />
              {errors.portal && (
                <span className="text-sm text-red-500">{errors.portal}</span>
              )}
            </div>
            {formData.portal === "TENANT" && (
              <div className="flex flex-col gap-1.5">
                <Label>Tenant</Label>
                <Combobox
                  options={tenantOptions}
                  value={formData.tenantId || ""}
                  onChange={(value: string) =>
                    setFormData({ ...formData, tenantId: value })
                  }
                  placeholder="Select tenant..."
                  loading={tenantsLoading}
                />
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="block text-base font-semibold">
                Permissions
              </Label>
              {menuPermissions.length > 0 && (
                <Checkbox
                  checked={allPermissionsEnabled()}
                  onChange={toggleAllPermissions}
                  label="Select All"
                />
              )}
            </div>
            <div className="overflow-hidden border border-(--border) rounded-lg">
              <div className="divide-y divide-(--border)">
                {menuPermissions.map((parent: any) => {
                  const children = parent.children || [];
                  const hasChildren = children.length > 0;
                  const parentAvailablePerms =
                    menuAvailablePermsMap[parent.id] || ALL_PERMISSIONS;

                  return (
                    <div key={parent.id}>
                      {hasChildren ? (
                        <>
                          {/* Parent Header - expandable */}
                          <div
                            className={cn(
                              "flex items-center justify-between px-4 transition-colors",
                              !collapsedMenus.includes(parent.id)
                                ? "bg-(--secondary)/15"
                                : "hover:bg-(--secondary)/20",
                            )}
                          >
                            <button
                              type="button"
                              className="flex items-center gap-2 flex-1 cursor-pointer py-4"
                              onClick={() => toggleMenu(parent.id)}
                            >
                              <ChevronRight
                                size={20}
                                className={cn(
                                  "text-(--text-secondary) transition-transform duration-200",
                                  !collapsedMenus.includes(parent.id) &&
                                    "rotate-90",
                                )}
                              />
                              <span className="font-semibold text-(--text-primary)">
                                {parent.name}
                              </span>
                            </button>
                            <div className="flex items-center gap-4">
                              {!collapsedMenus.includes(parent.id) && (
                                <Checkbox
                                  checked={allChildrenFullyEnabled(parent)}
                                  onChange={() => toggleAllForParent(parent)}
                                  label="Select All"
                                  // size="sm"
                                />
                              )}
                            </div>
                          </div>

                          {/* Children */}
                          <div
                            className={cn(
                              "grid transition-[grid-template-rows] duration-300 ease-in-out",
                              !collapsedMenus.includes(parent.id)
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]",
                            )}
                          >
                            <div className="overflow-hidden">
                              <div className="border-t border-(--border)/40 p-4">
                                {/* Sub-menu cards grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                  {children.map((child: any) => {
                                    const childAvailablePerms =
                                      menuAvailablePermsMap[child.id] ||
                                      ALL_PERMISSIONS;
                                    return (
                                      <div
                                        key={child.id}
                                        className="flex flex-col gap-1.5"
                                      >
                                        {/* Menu name checkbox (select all for this menu) */}
                                        <div className="mb-1">
                                          <Checkbox
                                            checked={childAvailablePerms.every(
                                              (p) => hasPermission(child.id, p),
                                            )}
                                            onChange={() =>
                                              toggleAllForMenu(child.id)
                                            }
                                            label={child.name}
                                            // size="sm"
                                          />
                                        </div>
                                        {/* Individual permissions */}
                                        <div className="flex flex-col gap-1 pl-5">
                                          {childAvailablePerms.map((perm) => (
                                            <Checkbox
                                              key={perm}
                                              checked={hasPermission(
                                                child.id,
                                                perm,
                                              )}
                                              onChange={() =>
                                                togglePermission(child.id, perm)
                                              }
                                              label={
                                                perm.charAt(0) +
                                                perm.slice(1).toLowerCase()
                                              }
                                              // size="sm"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Menu without children - collapsible */
                        <>
                          <div
                            className={cn(
                              "flex items-center justify-between px-4 transition-colors",
                              !collapsedMenus.includes(parent.id)
                                ? "bg-(--secondary)/15"
                                : "hover:bg-(--secondary)/20",
                            )}
                          >
                            <button
                              type="button"
                              className="flex items-center gap-2 flex-1 cursor-pointer py-4"
                              onClick={() => toggleMenu(parent.id)}
                            >
                              <ChevronRight
                                size={20}
                                className={cn(
                                  "text-(--text-secondary) transition-transform duration-200",
                                  !collapsedMenus.includes(parent.id) &&
                                    "rotate-90",
                                )}
                              />
                              <span className="font-semibold text-(--text-primary)">
                                {parent.name}
                              </span>
                            </button>
                            <div className="flex items-center gap-4">
                              {!collapsedMenus.includes(parent.id) && (
                                <Checkbox
                                  checked={parentAvailablePerms.every((p) =>
                                    hasPermission(parent.id, p),
                                  )}
                                  onChange={() => toggleAllForMenu(parent.id)}
                                  label="Select All"
                                  // size="sm"
                                />
                              )}
                            </div>
                          </div>

                          <div
                            className={cn(
                              "grid transition-[grid-template-rows] duration-300 ease-in-out",
                              !collapsedMenus.includes(parent.id)
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]",
                            )}
                          >
                            <div className="overflow-hidden">
                              <div className="border-t border-(--border)/40 p-4">
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 pl-5">
                                  {parentAvailablePerms.map((perm) => (
                                    <Checkbox
                                      key={perm}
                                      checked={hasPermission(parent.id, perm)}
                                      onChange={() =>
                                        togglePermission(parent.id, perm)
                                      }
                                      label={
                                        perm.charAt(0) +
                                        perm.slice(1).toLowerCase()
                                      }
                                      // size="sm"
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/adminRoles")}
              label
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner
                    size="sm"
                    variant="gradient-ring"
                    className="mr-2"
                    strokeWidth={2}
                  />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : isEditing ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
