// @ts-nocheck

import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {MenuTestPage} from '../pages/MenuTestPage'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'

const SuspensedView: FC<WithChildren> = ({children}) => {
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
  const CategoriesPage = lazy(() => import('../modules/categories/categories'))
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
  const StockOverview = lazy(() => import('../modules/warehouse/inventory'))
  const InventoryReport = lazy(() => import('../modules/warehouse/report'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* Pages */}
        <Route path='dashboard' element={<DashboardWrapper />} />
        <Route path='builder' element={<BuilderPageWrapper />} />
        <Route path='menu-test' element={<MenuTestPage />} />
        {/* Lazy Modules */}
        <Route
          path='crafted/pages/profile/*'
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/pages/wizards/*'
          element={
            <SuspensedView>
              <WizardsPage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/widgets/*'
          element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/account/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/chat/*'
          element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/user-management/*'
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />

        {/*categories*/}
        <Route
          path='apps/categories/*'
          element={
            <SuspensedView>
              <CategoriesPage />
            </SuspensedView>
          }
        />

        {/*role*/}
        <Route
          path='apps/role/*'
          element={
            <SuspensedView>
              <RolePage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/role/create'
          element={
            <SuspensedView>
              <CreateRolePage />
            </SuspensedView>
          }
        />

        {/*staff*/}
        <Route
          path='apps/staff/*'
          element={
            <SuspensedView>
              <StaffPage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/staff/create'
          element={
            <SuspensedView>
              <CreateStaff />
            </SuspensedView>
          }
        />

        {/*product*/}
        <Route
          path='apps/products'
          element={
            <SuspensedView>
              <ProductPage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/products/:id'
          element={
            <SuspensedView>
              <EditProduct />
            </SuspensedView>
          }
        />

        <Route
          path='apps/products/create'
          element={
            <SuspensedView>
              <CreateProduct />
            </SuspensedView>
          }
        />

        {/*warehouse*/}
        <Route
          path='apps/warehouse/*'
          element={
            <SuspensedView>
              <WarehousePage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/warehouse/create'
          element={
            <SuspensedView>
              <CreateWarehouse />
            </SuspensedView>
          }
        />

        {/*defective product*/}
        <Route
          path='apps/defectiveProduct/*'
          element={
            <SuspensedView>
              <DefectiveProductPage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/declareProduct/*'
          element={
            <SuspensedView>
              <DeclareProduct />
            </SuspensedView>
          }
        />

        <Route
          path='apps/stockIn/*'
          element={
            <SuspensedView>
              <StockInPage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/stockOut/*'
          element={
            <SuspensedView>
              <StockOutPage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/stockIn/create'
          element={
            <SuspensedView>
              <CreateStockInPage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/stockOut/create'
          element={
            <SuspensedView>
              <CreateStockOutPage />
            </SuspensedView>
          }
        />

        <Route
          path='apps/importHistory/*'
          element={
            <SuspensedView>
              <StockInHistory />
            </SuspensedView>
          }
        />

        <Route
          path='apps/exportHistory/*'
          element={
            <SuspensedView>
              <StockOutHistory />
            </SuspensedView>
          }
        />

        <Route
          path='apps/inventory/*'
          element={
            <SuspensedView>
              <StockOverview />
            </SuspensedView>
          }
        />

        <Route
          path='apps/report/*'
          element={
            <SuspensedView>
              <InventoryReport />
            </SuspensedView>
          }
        />
        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

export {PrivateRoutes}
