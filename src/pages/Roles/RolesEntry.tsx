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
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Role, RolePermission } from "./index";

const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
const localPortal = userData?.portal?.toUpperCase() || "";
const localTenantId = userData?.tenant?.id || "";
const localRoleId = userData?.role?.id || "";

const emptyRole: Role = {
  id: "",
  name: "",
  description: "",
  portal: localPortal,
  tenantId: localTenantId,
  rolePermissions: [],
};

export function RolesEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { createNewRole, updateRole, getNavigationMenus } = useProvider();

  // Get role from location state
  const roleFromState = location.state as Role | undefined;

  useEffect(() => {
    if (location.pathname.includes("/edit") && !roleFromState) {
      toast.error("Please select a role to edit.");
      navigate("/roles");
    }
  }, [location, roleFromState, navigate]);

  const role = roleFromState;
  const id = role?.id;
  const isEditing = !!id;

  const [formData, setFormData] = useState<Role>(emptyRole);
  const [collapsedMenus, setCollapsedMenus] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Fetch navigation menus from the current user's role in localStorage
  const { data: navigationMenus = [] } = useQuery({
    queryKey: ["navigationMenus", localRoleId],
    queryFn: () => getNavigationMenus(localRoleId),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
    enabled: !!localRoleId,
  });

  // Build a flat lookup: menuId -> available permission values from navigation API
  const menuAvailablePermsMap: Record<string, string[]> = {};
  navigationMenus.forEach((menu: any) => {
    if (menu.permissions && Array.isArray(menu.permissions)) {
      menuAvailablePermsMap[menu.id] = menu.permissions.map(
        (p: { value: string }) => p.value,
      );
    }
    if (menu.children) {
      menu.children.forEach((child: any) => {
        if (child.permissions && Array.isArray(child.permissions)) {
          menuAvailablePermsMap[child.id] = child.permissions.map(
            (p: { value: string }) => p.value,
          );
        }
      });
    }
  });

  // Load role data when editing (rolePermissions come from location state)
  useEffect(() => {
    if (role) {
      setFormData({
        ...emptyRole,
        ...role,
        portal: localPortal,
        tenantId: localTenantId,
      });
    } else {
      setFormData(emptyRole);
    }
  }, [role]);

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
    const available = menuAvailablePermsMap[menuId] || [];
    const currentPerms = getMenuPermissions(menuId);
    const allEnabled = available.every((p) => currentPerms.includes(p));

    setFormData((prev: Role) => {
      let newRolePermissions: RolePermission[];

      if (allEnabled) {
        newRolePermissions = prev.rolePermissions.filter(
          (p: RolePermission) => p.menuId !== menuId,
        );
      } else {
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
      const available = menuAvailablePermsMap[menuId] || [];
      const perms = getMenuPermissions(menuId);
      return available.every((p) => perms.includes(p));
    });

    setFormData((prev: Role) => {
      let newRolePermissions = [...prev.rolePermissions];

      menuIds.forEach((menuId: string) => {
        const available = menuAvailablePermsMap[menuId] || [];
        if (allFullyEnabled) {
          newRolePermissions = newRolePermissions.filter(
            (p: RolePermission) => p.menuId !== menuId,
          );
        } else {
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
      const available = menuAvailablePermsMap[menuId] || [];
      return (
        available.length > 0 && available.every((p) => hasPermission(menuId, p))
      );
    });
  };

  // Check if ALL permissions across ALL menus are enabled
  const allPermissionsEnabled = (): boolean => {
    return navigationMenus.every((parent: any) =>
      allChildrenFullyEnabled(parent),
    );
  };

  // Toggle all permissions for ALL menus
  const toggleAllPermissions = () => {
    const allEnabled = allPermissionsEnabled();
    setFormData((prev: Role) => {
      const newRolePermissions: RolePermission[] = [];
      if (!allEnabled) {
        navigationMenus.forEach((parent: any) => {
          const children = parent.children || [];
          const menuIds =
            children.length > 0 ? children.map((c: any) => c.id) : [parent.id];
          menuIds.forEach((menuId: string) => {
            const available = menuAvailablePermsMap[menuId] || [];
            if (available.length > 0) {
              newRolePermissions.push({ menuId, permissions: [...available] });
            }
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
      queryClient.invalidateQueries({ queryKey: ["roles", localTenantId] });
      if (data.status !== false) {
        toast.success(data?.message || "Role created successfully");
        navigate("/roles");
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
      queryClient.invalidateQueries({ queryKey: ["roles", localTenantId] });
      if (data.status !== false) {
        toast.success(data?.message || "Role updated successfully");
        navigate("/roles");
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
    const newErrors: { name?: string } = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
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
        portal: localPortal,
        tenantId: localTenantId || undefined,
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
          <Button outline onClick={() => navigate("/roles")}>
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
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="block text-base font-semibold">
                Permissions
              </Label>
              {navigationMenus.length > 0 && (
                <Checkbox
                  checked={allPermissionsEnabled()}
                  onChange={toggleAllPermissions}
                  label="Select All"
                />
              )}
            </div>
            <div className="overflow-hidden border border-(--border) rounded-lg">
              <div className="divide-y divide-(--border)">
                {navigationMenus.map((parent: any) => {
                  const children = parent.children || [];
                  const hasChildren = children.length > 0;
                  const parentAvailablePerms =
                    menuAvailablePermsMap[parent.id] || [];

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
                                      menuAvailablePermsMap[child.id] || [];
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
              onClick={() => navigate("/roles")}
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
