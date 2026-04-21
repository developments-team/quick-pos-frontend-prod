/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { PurchaseDetail } from "../Purchases/types";
import type { Product } from "../../pages/Products";

export interface CartItem extends Product {
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// POS Mode - determines which price field to use
export type POSMode = "purchase" | "sale";

// Party Type for display purposes (vendor or customer)
export type PartyType = "vendor" | "customer";

// Cart item - Standalone definition to support both UI and mapping to payloads
export interface POSCartItem {
  id?: string;
  productId: string;
  productDetailId: string;
  productName: string;
  variantString?: string;
  productImage: string;

  // Prices
  purchasePrice: number;
  salePrice: number;

  quantity: number;
  currentStock?: number;

  // Discount state for UI
  discountType: "amount" | "percent" | string;
  discount: number;

  total: number;
  note?: string;
  animationKey?: number;
}

// Additional cost item
export interface POSAdditionalCost {
  id?: string;
  costTypeId: string;
  vendorId?: string;
  accountId?: string;
  amount: number;
  note?: string;
  name?: string;
}

// Transaction totals
export interface POSTotals {
  subTotal: number;
  tax: number;
  discountGlobal: number;
  discountPercent: number;
  additionalCostsTotal: number;
  total: number;
  paid: number;
  due: number;
}

// Product with details (from API)
export interface POSProduct {
  id: string;
  name: string;
  categoryId: string;
  productImage?: string;
  productDetails?: {
    id: string;
    purchasePrice: number;
    salePrice: number;
    quantity?: number;
    currentStock?: number;
  }[];
  [key: string]: any;
}

// Party option for combobox (vendor or customer)
export interface PartyOption {
  value: string;
  label: string;
}

// Category option for combobox
export interface CategoryOption {
  value: string;
  label: string;
}

// Held order for sales
export interface HeldOrder {
  id: string;
  cart: POSCartItem[];
  customerId?: string;
  customerName?: string;
  createdAt: string;
  note?: string;
  transactionDetails?: {
    taxAmount?: number;
    discountAmount?: number;
    discountPercent?: number;
    discountItemsType?: "amount" | "percent";
    globalDiscountType?: "amount" | "percent";
  };
}
