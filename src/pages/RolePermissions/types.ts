export type ActionType = "view" | "add" | "edit" | "delete";

export interface Permission {
  view?: boolean;
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
}

// API response structure
export interface ApiMenuItem {
  id: string;
  name: string;
  availableActions: ActionType[];
  permissions: Permission;
  icon: string;
  url?: string;
  children?: ApiMenuItem[] | null;
}

// Internal state structure for UI
export interface MenuItemState {
  id: string;
  name: string;
  availableActions: ActionType[];
  permissions: Permission;
  icon: string;
  url?: string;
  children?: MenuItemState[];
}
