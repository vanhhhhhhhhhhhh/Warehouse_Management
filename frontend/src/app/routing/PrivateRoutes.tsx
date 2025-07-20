// @ts-nocheck

import { lazy, FC, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper'
import { MenuTestPage } from '../pages/MenuTestPage'
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils'
import { WithChildren } from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import PermissionGuard from '../modules/auth/components/PermissionGuard'

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

const PrivateRoutes = () => {
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'))
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
  const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  const CategoriesPage = lazy(() => import('../modules/categories/CategoriesPage'))
  const CreateCategoryPage = lazy(() => import('../modules/categories/CreateCategoryPage'))
  const EditCategoryPage = lazy(() => import('../modules/categories/EditCategoryPage'))
  const RolePage = lazy(() => import('../modules/role/rolePage'))
  const CreateRolePage = lazy(() => import('../modules/role/createRole'))
  const StaffPage = lazy(() => import('../modules/staff/staffPage'))
  const ProductPage = lazy(() => import('../modules/product/ProductPage'))
  const CreateProduct = lazy(() => import('../modules/product/CreateProductPage'))
  const EditProduct = lazy(() => import('../modules/product/EditProductPage'))
  const CreateStaff = lazy(() => import('../modules/staff/createStaff'))
  const WarehousePage = lazy(() => import('../modules/warehouse/warehousePage'))
  const CreateWarehouse = lazy(() => import('../modules/warehouse/createWarehouse'))
  const DefectiveProductPage = lazy(() => import('../modules/productError/defectiveProduct'))
  const DeclareProduct = lazy(() => import('../modules/productError/declareProduct'))
  const StockInPage = lazy(() => import('../modules/warehouse/stock-in'))
  const StockOutPage = lazy(() => import('../modules/warehouse/stock-out'))
  const CreateStockInPage = lazy(() => import('../modules/warehouse/createStockIn'))
  const CreateStockOutPage = lazy(() => import('../modules/warehouse/createStockOut'))
  const StockInHistory = lazy(() => import('../modules/warehouse/stockInHistory'))
  const StockOutHistory = lazy(() => import('../modules/warehouse/stockOutHistory'))
  const StockImportPrint = lazy(() => import('../modules/warehouse/stockImportPrint'))
  const StockExportPrint = lazy(() => import('../modules/warehouse/stockExportPrint'))
  const StockOverview = lazy(() => import('../modules/warehouse/inventory'))
  const InventoryReport = lazy(() => import('../modules/warehouse/report'))
  const UpdateRole = lazy(() => import('../modules/role/updateRole'))
  const UpdateStaff = lazy(() => import('../modules/staff/updateStaff'))
  const EditWarehouse = lazy(() => import('../modules/warehouse/editWarehouse'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registration */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* Pages */}
        <Route path='dashboard' element={<DashboardWrapper />} />
        <Route path='builder' element={<BuilderPageWrapper />} />
        <Route path='menu-test' element={<MenuTestPage />} />

        {/* Categories */}
        <Route
          path='apps/categories'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'CATEGORIES', action: 'VIEW' }]}>
              <SuspensedView>
                <CategoriesPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/categories/create'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'CATEGORIES', action: 'CREATE' }]}>
              <SuspensedView>
                <CreateCategoryPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/categories/:id'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'CATEGORIES', action: 'UPDATE' }]}>
              <SuspensedView>
                <EditCategoryPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        {/*role*/}
        {/* Role Management */}
        <Route
          path='apps/role/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'ROLES', action: 'VIEW' }]}>
              <SuspensedView>
                <RolePage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/role/create'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'ROLES', action: 'CREATE' }]}>
              <SuspensedView>
                <CreateRolePage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/role/update/:roleId'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'ROLES', action: 'UPDATE' }]}>
              <SuspensedView>
                <UpdateRole />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        {/* Staff Management */}
        <Route
          path='apps/staff/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'USERS', action: 'VIEW' }]}>
              <SuspensedView>
                <StaffPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/staff/create'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'USERS', action: 'CREATE' }]}>
              <SuspensedView>
                <CreateStaff />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/staff/update/:staffId'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'USERS', action: 'UPDATE' }]}>
              <SuspensedView>
                <UpdateStaff />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        {/* Product Management */}
        <Route
          path='apps/products'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'PRODUCTS', action: 'VIEW' }]}>
              <SuspensedView>
                <ProductPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/products/:id'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'PRODUCTS', action: 'UPDATE' }]}>
              <SuspensedView>
                <EditProduct />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/products/create'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'PRODUCTS', action: 'CREATE' }]}>
              <SuspensedView>
                <CreateProduct />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        {/* Warehouse Management */}
        <Route
          path='apps/warehouse/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'VIEW' }]}>
              <SuspensedView>
                <WarehousePage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/warehouse/create'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'CREATE' }]}>
              <SuspensedView>
                <CreateWarehouse />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/warehouse/edit/:id'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'UPDATE' }]}>
              <SuspensedView>
                <EditWarehouse />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        {/* Stock Management */}
        <Route
          path='apps/stockIn/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'STOCK_IN' }]}>
              <SuspensedView>
                <StockInPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/stockOut/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'STOCK_OUT' }]}>
              <SuspensedView>
                <StockOutPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/stockIn/create'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'STOCK_IN' }]}>
              <SuspensedView>
                <CreateStockInPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/stockOut/create'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'STOCK_OUT' }]}>
              <SuspensedView>
                <CreateStockOutPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/importHistory/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'VIEW_STOCK_IN_HISTORY' }]}>
              <SuspensedView>
                <StockInHistory />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/exportHistory/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'VIEW_STOCK_OUT_HISTORY' }]}>
              <SuspensedView>
                <StockOutHistory />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/stockIn/print/:id'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'STOCK_IN' }]}>
              <SuspensedView>
                <StockImportPrint />
              </SuspensedView>
            </PermissionGuard>
          }
        />
        <Route
          path='apps/stockOut/print/:id'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'STOCK_OUT' }]}>
              <SuspensedView>
                <StockExportPrint />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/inventory/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'VIEW_INVENTORY' }]}>
              <SuspensedView>
                <StockOverview />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/report/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'WAREHOUSES', action: 'VIEW_STOCK_REPORT' }]}>
              <SuspensedView>
                <InventoryReport />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        {/* Defective Products */}
        <Route
          path='apps/defectiveProduct/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'DEFECT_PRODUCTS', action: 'VIEW' }]}>
              <SuspensedView>
                <DefectiveProductPage />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        <Route
          path='apps/declareProduct/*'
          element={
            <PermissionGuard requiredPermissions={[{ module: 'DEFECT_PRODUCTS', action: 'CREATE' }]}>
              <SuspensedView>
                <DeclareProduct />
              </SuspensedView>
            </PermissionGuard>
          }
        />

        {/* Catch all */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

export default PrivateRoutes
