import { useIntl } from 'react-intl'
import { KTIcon } from '../../../../helpers'
import { SidebarMenuItemWithSub } from './SidebarMenuItemWithSub'
import { SidebarMenuItem } from './SidebarMenuItem'
import { useLocation } from 'react-router-dom'

const SidebarMenuMain = () => {
  const intl = useIntl();
  const location = useLocation();

  return (
    <>
      {/* Dashboard */}
      <SidebarMenuItem
        to='/dashboard'
        title='Tổng Quan'
      />

      {/* Products */}
      <SidebarMenuItem
        to='/apps/categories'
        title='Danh mục sản phẩm'
      />
      <SidebarMenuItem
        to='/apps/products/productsPage'
        title='sản phẩm'
      />
      <SidebarMenuItem
        to='/apps/products/defectiveProduct/list'
        title='Khai báo sản phẩm hỏng lỗi'
      />

      {/* Staff */}
      <SidebarMenuItem 
        to='/apps/staff/list' 
        title='Danh sách nhân viên'
      />
      <SidebarMenuItem 
        to='/apps/staff/role' 
        title='Vai trò nhân viên'
      />

      {/* Warehouse */}
      <SidebarMenuItem 
        to='/apps/warehouse/list' 
        title='Danh sách kho'
      />
      <SidebarMenuItem 
        to='/apps/warehouse/stockIn' 
        title='Nhập kho'
      />
      <SidebarMenuItem 
        to='/apps/warehouse/stockOut' 
        title='Xuất kho'
      />
      <SidebarMenuItem 
        to='/apps/warehouse/stock-in-history' 
        title='Lịch sử nhập kho'
      />
      <SidebarMenuItem 
        to='/apps/warehouse/stock-release-history' 
        title='Lịch sử xuất kho'
      />
      <SidebarMenuItem 
        to='/apps/warehouse/inventory' 
        title='Tồn kho'
      />
      <SidebarMenuItem 
        to='/apps/warehouse/report' 
        title='Báo cáo xuất nhập kho'
      />

      {/* <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Apps</span>
        </div>
      </div>

      <SidebarMenuItemWithSub
        to='/apps/chat'
        title='Chat'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <SidebarMenuItem to='/apps/chat/private-chat' title='Private Chat' hasBullet={true} />
        <SidebarMenuItem to='/apps/chat/group-chat' title='Group Chart' hasBullet={true} />
        <SidebarMenuItem to='/apps/chat/drawer-chat' title='Drawer Chart' hasBullet={true} />
      </SidebarMenuItemWithSub>

      <SidebarMenuItem
        to='/apps/user-management/users'
        icon='abstract-28'
        title='User management'
        fontIcon='bi-layers'
      />
      <div className='menu-item'>
        <a
          target='_blank'
          className='menu-link'
          href={import.meta.env.VITE_APP_PREVIEW_DOCS_URL + '/changelog'}
        >
          <span className='menu-icon'>
            <KTIcon iconName='code' className='fs-2' />
          </span>
          <span className='menu-title'>Changelog {import.meta.env.VITE_APP_VERSION}</span>
        </a>
      </div> */}
    </>
  )
}

export { SidebarMenuMain }