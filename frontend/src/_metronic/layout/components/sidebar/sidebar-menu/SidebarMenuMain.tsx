import { useIntl } from 'react-intl'
import { KTIcon } from '../../../../helpers'
import { SidebarMenuItemWithSub } from './SidebarMenuItemWithSub'
import { SidebarMenuItem } from './SidebarMenuItem'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const ADMIN_ROLE_ID = '682f5579f87dcf5d413d22d3';

const SidebarMenuMain = () => {
  const intl = useIntl();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Kiểm tra roleName có phải là Admin không
        setIsAdmin(user.roleName === 'Admin');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAdmin(false);
      }
    }
  }, []);

  return (
    <>
      {/* Dashboard */}
      <SidebarMenuItem
        to='/dashboard'
        title='Tổng Quan'
      />

      {/* Staff - Chỉ hiển thị khi là admin */}
      {isAdmin && (
        <>
          <SidebarMenuItem 
            to='/apps/role' 
            title='Vai trò nhân viên'
          />
          
          <SidebarMenuItem 
            to='/apps/staff' 
            title='Danh sách nhân viên'
          />
        </>
      )}

      {/* Products */}
      <SidebarMenuItem
        to='/apps/categories'
        title='Danh mục sản phẩm'
      />
      <SidebarMenuItem
        to='/apps/products/'
        title='Sản phẩm'
      />
      <SidebarMenuItem
        to='/apps/defectiveProduct'
        title='Khai báo sản phẩm hỏng lỗi'
      />

      {/* Warehouse */}
      <SidebarMenuItem 
        to='/apps/warehouse' 
        title='Danh sách kho'
      />
      {/* Ẩn menu Nhập/Xuất kho nếu là Admin */}
      {!isAdmin && (
        <>
          <SidebarMenuItem 
            to='/apps/stockIn' 
            title='Nhập kho'
          />
          <SidebarMenuItem 
            to='/apps/stockOut' 
            title='Xuất kho'
          />
        </>
      )}
      <SidebarMenuItem 
        to='/apps/importHistory' 
        title='Lịch sử nhập kho'
      />
      <SidebarMenuItem 
        to='/apps/exportHistory' 
        title='Lịch sử xuất kho'
      />
      <SidebarMenuItem 
        to='/apps/inventory' 
        title='Tồn kho'
      />
      <SidebarMenuItem 
        to='/apps/report' 
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