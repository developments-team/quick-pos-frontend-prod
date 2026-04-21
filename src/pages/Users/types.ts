export interface User {
  id: string;
  email: string;
  roleId: string;
  roleName?: string;
  branches: string[];
  user: string;
}
