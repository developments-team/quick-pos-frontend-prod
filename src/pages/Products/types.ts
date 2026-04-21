export interface ProductVariant {
  variantId: string;
  variantValue: string;
  color: string;
  name?: string;
  variant?: {
    id: string;
    name: string;
  };
}

export interface ProductDetail {
  id: string;
  sku: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  reOrder: number;
  productImage: string;
  productVariants: ProductVariant[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  brandId: string;
  groupId: string;
  productImage: string;
  taxId: string;
  productMode: string;
  purchaseUnitId: string;
  saleUnitId: string;
  rate: number;
  productType: string;
  hasInitialQuantity: boolean;
  productAvailability: string;
  expiryDate: string;
  assetAccountId: string;
  revenueAccountId: string;
  COGsAccountId: string;
  saleReturnAccountId: string;
  branchId: string;
  paymentType: string;
  subTotal: number;
  productDetails: ProductDetail[];
  user: string;
}
