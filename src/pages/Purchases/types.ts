export interface PurchaseDetail {
  id: string;
  productId: string;
  productDetailId: string;
  price: number;
  quantity: number;
  discountType: string;
  discountPercentage: number;
  discountAmount: number;
  total: number;
}

export interface AdditionalCost {
  id: string;
  costTypeId: string;
  vendorId: string;
  accountId: string;
  amount: number;
  note: string;
}

export interface Purchase {
  id: string;
  branchId: string;
  vendorId: string;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  discountType: string;
  discountPercentage: number;
  discountAmount: number;
  totalDiscountAmount: number;
  total: number;
  paid: number;
  due: number;
  paymentTypeId: string;
  purchaseDetails: PurchaseDetail[];
  additionalCosts: AdditionalCost[];
  additionalCostsAmount: number;
  discountItemsType?: string;
  user: string;
  createdAt?: string;
  ref?: string; // Optional as it might be generated backend side or not in payload
}

// Keeping Request interfaces for clarity if distinct from main type,
// but Purchase above now matches the payload structure closely.
export type PurchaseRequest = Purchase;
