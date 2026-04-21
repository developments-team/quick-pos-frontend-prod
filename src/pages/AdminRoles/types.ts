export interface RolePermission {
  menuId: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  portal: string;
  tenantId: string;
  rolePermissions: RolePermission[];
}
