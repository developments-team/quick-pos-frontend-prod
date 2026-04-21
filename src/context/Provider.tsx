/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, type ReactNode } from "react";
import axiosInstance from "./apiConfig";

const ApiContext = createContext<any>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
  const isAdminPortal = userData?.portal?.toLowerCase() === "admin";
  const isTenantPortal = userData?.portal?.toLowerCase() === "tenant";

  const getFn = async (url: string, params: any = {}) => {
    try {
      const res = await axiosInstance.get(url, { params });
      if (res.data) {
        return res.data;
      }
    } catch (error: any) {
      return error.message;
    }
  };

  const postFn = async (url: string, data?: any) => {
    try {
      const res = await axiosInstance.post(url, data);
      if (res.data) {
        return res.data;
      }
    } catch (error: any) {
      return error.message;
    }
  };

  const patchFn = async (url: string, data?: any) => {
    try {
      const res = await axiosInstance.patch(url, data);
      if (res.data) {
        return res.data;
      }
    } catch (error: any) {
      return error.message;
    }
  };

  const deleteFn = async (url: string) => {
    try {
      const res = await axiosInstance.delete(url);
      if (res.data) {
        return res.data;
      }
    } catch (error: any) {
      return error.message;
    }
  };

  return (
    <ApiContext.Provider
      value={{
        isAdminPortal,
        isTenantPortal,
        // #region Auth
        login: async (data: any) => await postFn("/auth/login", data),
        createProfile: async (data: FormData) =>
          await postFn("/profiles/", data),
        // #endregion Auth

        // #region Customer Groups
        getCustomerGroups: async (params?: any) =>
          await getFn("/customerGroups", params),
        getCustomerGroup: async (id: any) =>
          await getFn(`/customerGroups/${id}`),
        createNewCustomerGroup: async (data: any) =>
          await postFn("/customerGroups", data),
        updateCustomerGroup: async (id: any, data: any) =>
          await patchFn(`/customerGroups/${id}`, data),
        deleteCustomerGroup: async (id: any) =>
          await deleteFn(`/customerGroups/${id}`),
        // #endregion Customer Groups

        // #region Customers
        getCustomers: async (params?: any) => await getFn("/customers", params),
        getCustomer: async (id: any) => await getFn(`/customers/${id}`),
        createNewCustomer: async (data: any) =>
          await postFn("/customers", data),
        updateCustomer: async (id: any, data: any) =>
          await patchFn(`/customers/${id}`, data),
        deleteCustomer: async (id: any) => await deleteFn(`/customers/${id}`),
        // #endregion Customers

        // #region Vendors
        getVendors: async (params?: any) => await getFn("/vendors/", params),
        getVendor: async (id: any) => await getFn(`/vendors/${id}`),
        createNewVendor: async (data: any) => await postFn("/vendors/", data),
        updateVendor: async (id: any, data: any) =>
          await patchFn(`/vendors/${id}`, data),
        deleteVendor: async (id: any) => await deleteFn(`/vendors/${id}`),

        getVendorTypes: async (params?: any) =>
          await getFn("/constants/vendorTypes", params),
        // #endregion Vendors

        // #region Categories
        getCategories: async (params?: any) =>
          await getFn("/categories/", params),
        getCategory: async (id: any) => await getFn(`/categories/${id}`),
        createNewCategory: async (data: any) =>
          await postFn("/categories/", data),
        updateCategory: async (id: any, data: any) =>
          await patchFn(`/categories/${id}`, data),
        deleteCategory: async (id: any) => await deleteFn(`/categories/${id}`),
        // #endregion Categories

        // #region Brands
        getBrands: async (params?: any) => await getFn("/brands/", params),
        getBrand: async (id: any) => await getFn(`/brands/${id}`),
        createNewBrand: async (data: any) => await postFn("/brands/", data),
        updateBrand: async (id: any, data: any) =>
          await patchFn(`/brands/${id}`, data),
        deleteBrand: async (id: any) => await deleteFn(`/brands/${id}`),
        // #endregion Brands

        // #region Groups
        getGroups: async (params?: any) => await getFn("/groups/", params),
        getGroup: async (id: any) => await getFn(`/groups/${id}`),
        createNewGroup: async (data: any) => await postFn("/groups/", data),
        updateGroup: async (id: any, data: any) =>
          await patchFn(`/groups/${id}`, data),
        deleteGroup: async (id: any) => await deleteFn(`/groups/${id}`),
        // #endregion Groups

        // #region Variant Attributes
        getVariantAttributes: async (params?: any) =>
          await getFn("/variantAttributes/", params),
        getVariantAttribute: async (id: any) =>
          await getFn(`/variantAttributes/${id}`),
        createNewVariantAttribute: async (data: any) =>
          await postFn("/variantAttributes/", data),
        updateVariantAttribute: async (id: any, data: any) =>
          await patchFn(`/variantAttributes/${id}`, data),
        deleteVariantAttribute: async (id: any) =>
          await deleteFn(`/variantAttributes/${id}`),
        // #endregion Variant Attributes

        // #region Units
        getUnits: async (params?: any) => await getFn("/units/", params),
        getUnit: async (id: any) => await getFn(`/units/${id}`),
        createNewUnit: async (data: any) => await postFn("/units/", data),
        updateUnit: async (id: any, data: any) =>
          await patchFn(`/units/${id}`, data),
        deleteUnit: async (id: any) => await deleteFn(`/units/${id}`),
        // #endregion Units

        // #region Products
        getProducts: async (params?: any) => await getFn("/products/", params),
        getProduct: async (id: any) => await getFn(`/products/${id}`),
        createNewProduct: async (data: FormData) =>
          await postFn("/products/", data),
        updateProduct: async (id: any, data: FormData) =>
          await patchFn(`/products/${id}`, data),
        deleteProduct: async (id: any) => await deleteFn(`/products/${id}`),
        uploadProducts: async (data: any) =>
          await postFn("/uploadProducts/", data),
        checkProductSKUs: async (data: any) =>
          await postFn("/uploadProducts/check-skus", data),
        uploadProductsImages: async (data: any) =>
          await postFn("/uploadProducts/images", data),
        // #endregion Products

        // #region Taxes
        getTaxes: async (params?: any) => await getFn("/taxes/", params),
        getTax: async (id: any) => await getFn(`/taxes/${id}`),
        createNewTax: async (data: any) => await postFn("/taxes/", data),
        updateTax: async (id: any, data: any) =>
          await patchFn(`/taxes/${id}`, data),
        deleteTax: async (id: any) => await deleteFn(`/taxes/${id}`),
        // #endregion Taxes

        // #region Branches
        getBranches: async (params?: any) => await getFn("/branches/", params),
        getBranch: async (id: any) => await getFn(`/branches/${id}`),
        createNewBranch: async (data: any) => await postFn("/branches/", data),
        updateBranch: async (id: any, data: any) =>
          await patchFn(`/branches/${id}`, data),
        deleteBranch: async (id: any) => await deleteFn(`/branches/${id}`),
        // #endregion Branches

        // #region Chart of Accounts
        getChartOfAccounts: async (params?: any) =>
          await getFn("/chartOfAccounts/", params),
        getChartOfAccount: async (id: any) =>
          await getFn(`/chartOfAccounts/${id}`),
        createNewChartOfAccount: async (data: any) =>
          await postFn("/chartOfAccounts/", data),
        updateChartOfAccount: async (id: any, data: any) =>
          await patchFn(`/chartOfAccounts/${id}`, data),
        deleteChartOfAccount: async (id: any) =>
          await deleteFn(`/chartOfAccounts/${id}`),
        getNewAccountNumber: async (parentAccountId: string) =>
          await getFn("/chartOfAccounts/nextNumber", { parentAccountId }),
        getAccountsByGroup: async (group: string) =>
          await getFn(`/chartOfAccounts/byGroup/${group}`),
        // #endregion Chart of Accounts

        // #region Default Accounts
        getDefaultAccounts: async (params?: any) =>
          await getFn("/defaultAaccounts/", params),
        updateDefaultAccount: async (id: any, data: any) =>
          await patchFn(`/defaultAaccounts/${id}`, data),
        // #endregion Default Accounts

        // #region Purchases
        getPurchases: async (params?: any) =>
          await getFn("/purchases/", params),
        getPurchase: async (id: any) => await getFn(`/purchases/${id}`),
        createNewPurchase: async (data: any) =>
          await postFn("/purchases/", data),
        updatePurchase: async (id: any, data: any) =>
          await patchFn(`/purchases/${id}`, data),
        deletePurchase: async (id: any) => await deleteFn(`/purchases/${id}`),
        // #endregion Purchases

        // #region Cost Types
        getCostTypes: async (params?: any) =>
          await getFn("/costTypes/", params),
        getCostType: async (id: any) => await getFn(`/costTypes/${id}`),
        createNewCostType: async (data: any) =>
          await postFn("/costTypes/", data),
        updateCostType: async (id: any, data: any) =>
          await patchFn(`/costTypes/${id}`, data),
        deleteCostType: async (id: any) => await deleteFn(`/costTypes/${id}`),
        // #endregion Cost Types

        // #region Payment Types
        getPaymentTypes: async (params?: any) =>
          await getFn("/paymentTypes/", params),
        getPaymentType: async (id: any) => await getFn(`/paymentTypes/${id}`),
        createNewPaymentType: async (data: any) =>
          await postFn("/paymentTypes/", data),
        updatePaymentType: async (id: any, data: any) =>
          await patchFn(`/paymentTypes/${id}`, data),
        deletePaymentType: async (id: any) =>
          await deleteFn(`/paymentTypes/${id}`),
        // #endregion Payment Types

        // #region Adjustment Types
        getAdjustmentTypes: async (params?: any) =>
          await getFn("/adjustmentTypes/", params),
        getAdjustmentType: async (id: any) =>
          await getFn(`/adjustmentTypes/${id}`),
        createNewAdjustmentType: async (data: any) =>
          await postFn("/adjustmentTypes/", data),
        updateAdjustmentType: async (id: any, data: any) =>
          await patchFn(`/adjustmentTypes/${id}`, data),
        deleteAdjustmentType: async (id: any) =>
          await deleteFn(`/adjustmentTypes/${id}`),
        // #endregion Adjustment Types

        // #region Sales
        getSales: async (params?: any) => await getFn("/sales/", params),
        getSale: async (id: any) => await getFn(`/sales/${id}`),
        createNewSale: async (data: any) => await postFn("/sales/", data),
        updateSale: async (id: any, data: any) =>
          await patchFn(`/sales/${id}`, data),
        deleteSale: async (id: any) => await deleteFn(`/sales/${id}`),
        // #endregion Sales

        // #region Constants
        getPortals: async (params?: any) =>
          await getFn("/constants/portals", params),
        getActions: async (params?: any) =>
          await getFn("/constants/actions", params),
        // #endregion Constants

        // #region Roles
        getRoles: async (params?: any) => await getFn("/roles/", params),
        getRole: async (id: any) => await getFn(`/roles/${id}`),
        createNewRole: async (data: any) => await postFn("/roles/", data),
        updateRole: async (id: any, data: any) =>
          await patchFn(`/roles/${id}`, data),
        deleteRole: async (id: any) => await deleteFn(`/roles/${id}`),
        // #endregion Roles

        // #region Users
        getUsers: async (params?: any) => await getFn("/users/", params),
        getUser: async (id: any) => await getFn(`/users/${id}`),
        createNewUser: async (data: any) => await postFn("/users/", data),
        updateUser: async (id: any, data: any) =>
          await patchFn(`/users/${id}`, data),
        deleteUser: async (id: any) => await deleteFn(`/users/${id}`),
        // #endregion Users

        // #region Role Permissions
        getRolePermissions: async (params?: any) =>
          await getFn(`/roles/rolePermissions`, params),
        updateRolePermissions: async (roleId: string, data: any) =>
          await patchFn(`/roles/rolePermissions/${roleId}`, data),
        getMenuRolePermissions: async (params?: any) =>
          await getFn(`/roles/menuRolePermissions`, params),
        // #endregion Role Permissions

        // #region Plans
        getPlans: async (params?: any) => await getFn("/plans/", params),
        getPlan: async (id: any) => await getFn(`/plans/${id}`),
        createNewPlan: async (data: any) => await postFn("/plans/", data),
        updatePlan: async (id: any, data: any) =>
          await patchFn(`/plans/${id}`, data),
        deletePlan: async (id: any) => await deleteFn(`/plans/${id}`),
        getReportLevels: async (params?: any) =>
          await getFn("/constants/reportLevels", params),
        getSupportTypes: async (params?: any) =>
          await getFn("/constants/supportTypes", params),
        getRolesPlan: async (params?: any) =>
          await getFn("/roles/rolesPlan", params),
        // #endregion Plans

        // #region Tenants
        getBusinessTypes: async (params?: any) =>
          await getFn("/constants/businessTypes", params),
        getTenants: async (params?: any) => await getFn("/tenants/", params),
        getTenant: async (id: any) => await getFn(`/tenants/${id}`),
        createTenant: async (data: any) => await postFn("/tenants/", data),
        updateTenant: async (id: any, data: any) =>
          await patchFn(`/tenants/${id}`, data),
        deleteTenant: async (id: any) => await deleteFn(`/tenants/${id}`),
        // #endregion Tenants

        // #region Menus
        getMenus: async (params?: any) => await getFn("/menus/", params),
        getMenu: async (id: any) => await getFn(`/menus/${id}`),
        createNewMenu: async (data: any) => await postFn("/menus/", data),
        updateMenu: async (id: any, data: any) =>
          await patchFn(`/menus/${id}`, data),
        deleteMenu: async (id: any) => await deleteFn(`/menus/${id}`),
        getNavigationMenus: async (roleId: string) =>
          await getFn(`/menus/navigation/${roleId}`),
        // #endregion Menus

        // #region Accounting Reports
        getIncomeStatement: async (params: {
          startDate: string;
          endDate: string;
        }) => await getFn("/accountingReports/incomeStatement", params),
        getOwnersEquity: async (params: {
          startDate: string;
          endDate: string;
        }) => await getFn("/accountingReports/ownersEquity", params),
        getBalanceSheet: async (params: { asOfDate: string }) =>
          await getFn("/accountingReports/balanceSheet", params),
        getTrialBalance: async (params: { asOfDate: string }) =>
          await getFn("/accountingReports/trialBalance", params),
        getGeneralLedger: async (params: {
          startDate: string;
          endDate: string;
          accountId?: string;
        }) => await getFn("/accountingReports/generalLedger", params),
        // #endregion Accounting Reports
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useProvider = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useProvider must be used within an ApiProvider");
  }
  return context;
};
