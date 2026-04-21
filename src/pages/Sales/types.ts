export interface SaleDetail {
  id?: string;
  productId: string;
  productDetailId: string;
  quantity: number;
  price: number;
  discountType: string;
  discountPercentage: number;
  discountAmount: number;
  total: number;
}

export interface Sale {
  id?: string;
  branchId: string;
  customerId: string;
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
  saleDetails: SaleDetail[];
  discountItemsType: string;
  user: string;
  createdAt?: string;
  ref?: string;
}
