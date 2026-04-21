export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  reportLevel: string;
  supportType: string;
  roleId: string;
  roleName?: string;
  userLimit: number;
  branchLimit: number;
  productLimit: number;
  isRecommended: boolean;
}
