export interface Menu {
  id: string;
  name: string;
  parentId: string;
  url: string;
  icon: string;
  description: string;
  position: number;
  sortOrder: number;
  isActive: boolean;
  actions: string[];
  user: string;
}
