import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ToastProvider } from "./components/ui/Toast";
import { LayoutProvider } from "./context/LayoutContext";
import { DesignSystem } from "./components/ui/elements/DesignSystem";
import { AdvancedControls } from "./components/ui/elements/AdvancedControls";
import { AdvancedElements } from "./components/ui/elements/AdvancedElements";
import { Elements } from "./components/ui/elements/Elements";
import { CustomerGroups } from "./pages/CustomerGroups";
import { Customers } from "./pages/Customers";
import { Vendors } from "./pages/Vendors";
import { Categories } from "./pages/Categories";
import { Brands } from "./pages/Brands";
import { Groups } from "./pages/Groups";
import { VariantAttributes } from "./pages/VariantAttributes";
import { Units } from "./pages/Units";
import { Products, ProductsEntry } from "./pages/Products";
import { ImportProducts } from "./pages/Products/importProducts";
import { ImportProductImages } from "./pages/Products/importProductImages";
import { Taxes } from "./pages/Taxes";
import { Branches } from "./pages/Branches";
import { Home } from "./pages/Home/Home";
import { ChartOfAccounts } from "./pages/Accounting/ChartOfAccounts";
import { DefaultAccounts } from "./pages/Accounting/DefaultAccounts";
import { ManagePurchases } from "./pages/Purchases/maagePurchases";
import { Purchases } from "./pages/Purchases";
import { Sales } from "./pages/Sales";
import { ManageSales } from "./pages/Sales/manageSales";
import { CostTypes } from "./pages/CostTypes";
import { PaymentTypes } from "./pages/PaymentTypes";
import { AdjustmentTypes } from "./pages/AdjustmentTypes";
import { Users } from "./pages/Users";
import { AdminRoles, AdminRolesEntry } from "./pages/AdminRoles";
import { Roles, RolesEntry } from "./pages/Roles";
import { RolePermissions } from "./pages/RolePermissions";
import { AdminMenus } from "./pages/AdminMenus";
import { IncomeStatement } from "./pages/Reports/IncomeStatement";
import { OwnersEquity } from "./pages/Reports/OwnersEquity";
import { BalanceSheet } from "./pages/Reports/BalanceSheet";
import { TrialBalance } from "./pages/Reports/TrialBalance";
import { GeneralLedger } from "./pages/Reports/GeneralLedger";
import { AdminTenants } from "./pages/AdminTenants";
import { AdminPlans } from "./pages/AdminPlans";
import { AdminUsers } from "./pages/AdminUsers";

function App() {
  return (
    <ToastProvider>
      <LayoutProvider>
        <Router>
          <Routes>
            {/* Home Page as default */}
            <Route path="/" element={<Home />} />

            {/* Main App Routes - With Layout */}
            <Route
              path="*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/design" element={<DesignSystem />} />
                    <Route path="/advanced" element={<AdvancedControls />} />
                    <Route path="/elements" element={<Elements />} />
                    <Route
                      path="/advanced-elements"
                      element={<AdvancedElements />}
                    />

                    {/* <Route path="/" element={<Dashboard />} /> */}
                    {/* Contacts */}
                    <Route
                      path="/customer-groups"
                      element={<CustomerGroups />}
                    />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/vendors" element={<Vendors />} />

                    {/* Products */}
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/brands" element={<Brands />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route
                      path="/variant-attributes"
                      element={<VariantAttributes />}
                    />
                    <Route path="/units" element={<Units />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/add" element={<ProductsEntry />} />
                    <Route path="/products/edit" element={<ProductsEntry />} />
                    <Route
                      path="/products/import"
                      element={<ImportProducts />}
                    />
                    <Route
                      path="/products/import-images"
                      element={<ImportProductImages />}
                    />

                    {/* Purchases */}
                    <Route path="/purchase" element={<Purchases />} />
                    <Route
                      path="/manage-purchases"
                      element={<ManagePurchases />}
                    />
                    <Route path="/purchase/edit" element={<Purchases />} />
                    <Route path="/purchase/return" element={<Purchases />} />

                    {/* Sales */}
                    <Route path="/sale" element={<Sales />} />
                    <Route path="/manage-sales" element={<ManageSales />} />
                    <Route path="/sale/edit" element={<Sales />} />
                    <Route path="/sale/return" element={<Sales />} />

                    {/* Accounting */}
                    <Route
                      path="/chart-of-accounts"
                      element={<ChartOfAccounts />}
                    />
                    <Route
                      path="/default-accounts"
                      element={<DefaultAccounts />}
                    />

                    {/* Reports */}
                    <Route
                      path="/incomeStatement"
                      element={<IncomeStatement />}
                    />
                    <Route path="/ownersEquity" element={<OwnersEquity />} />
                    <Route path="/balanceSheet" element={<BalanceSheet />} />
                    <Route path="/trialBalance" element={<TrialBalance />} />
                    <Route path="/generalLedger" element={<GeneralLedger />} />

                    {/* Setups */}
                    <Route path="/branches" element={<Branches />} />
                    <Route path="/adminTenants" element={<AdminTenants />} />
                    <Route path="/adminPlans" element={<AdminPlans />} />
                    <Route path="/taxes" element={<Taxes />} />
                    <Route path="/payment-types" element={<PaymentTypes />} />
                    <Route path="/cost-types" element={<CostTypes />} />
                    <Route
                      path="/adjustment-types"
                      element={<AdjustmentTypes />}
                    />

                    {/* Settings */}
                    <Route path="/users" element={<Users />} />
                    <Route path="/roles" element={<Roles />} />
                    <Route path="/roles/add" element={<RolesEntry />} />
                    <Route path="/roles/edit" element={<RolesEntry />} />
                    <Route path="/adminRoles" element={<AdminRoles />} />
                    <Route
                      path="/adminRoles/add"
                      element={<AdminRolesEntry />}
                    />
                    <Route
                      path="/adminRoles/edit"
                      element={<AdminRolesEntry />}
                    />
                    <Route
                      path="/role-permissions"
                      element={<RolePermissions />}
                    />
                    <Route path="/adminUsers" element={<AdminUsers />} />
                    <Route path="/adminMenus" element={<AdminMenus />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </Router>
      </LayoutProvider>
    </ToastProvider>
  );
}

export default App;
