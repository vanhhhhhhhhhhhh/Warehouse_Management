import { useState, useEffect } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../_metronic/helpers'

// Mock data for warehouses
const mockWarehouses = [
  {
    _id: '1',
    name: 'Kho Hà Nội',
    address: {
      detail: '123 Đường ABC',
      ward: 'Phường XYZ',
      district: 'Quận Hoàn Kiếm',
      city: 'Hà Nội'
    },
    phone: '0123456789',
    isActive: true
  },
  {
    _id: '2',
    name: 'Kho Hồ Chí Minh',
    address: {
      detail: '456 Đường DEF',
      ward: 'Phường UVW',
      district: 'Quận 1',
      city: 'Hồ Chí Minh'
    },
    phone: '0987654321',
    isActive: true
  },
  {
    _id: '3',
    name: 'Kho Đà Nẵng',
    address: {
      detail: '789 Đường GHI',
      ward: 'Phường KLM',
      district: 'Quận Hải Châu',
      city: 'Đà Nẵng'
    },
    phone: '0123498765',
    isActive: false
  }
]

const WarehousePage = () => {
  const navigate = useNavigate()

  // States
  const [warehouses, setWarehouses] = useState(mockWarehouses)
  const [loading, setLoading] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedMessage, setSelectedMessage] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked)
    if (e.target.checked) {
      const allIds = warehouses.map(item => item._id)
      setSelectedItems(allIds)
      setSelectedMessage(`Đã chọn ${allIds.length} kho`)
    } else {
      setSelectedItems([])
      setSelectedMessage('')
    }
  }

  const handleSelectItem = (id) => {
    const newSelectedItems = selectedItems.includes(id)
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id]

    setSelectedItems(newSelectedItems)
    setSelectAll(newSelectedItems.length === warehouses.length)

    if (newSelectedItems.length > 0) {
      setSelectedMessage(`Đã chọn ${newSelectedItems.length} kho`)
    } else {
      setSelectedMessage('')
    }
  }

  const handleExecuteAction = () => {
    if (!selectedAction) return;

    switch (selectedAction) {
      case 'delete':
        setShowDeleteModal(true)
        break;
      default:
        break;
    }
  }

  const handleConfirmDelete = () => {
    const newWarehouses = warehouses.filter(warehouse => !selectedItems.includes(warehouse._id))
    setWarehouses(newWarehouses)
    setShowDeleteModal(false)
    setSelectedAction('')
    setSelectedItems([])
    setSelectedMessage('')
    setSelectAll(false)
    console.log(`Đã xóa ${selectedItems.length} kho thành công`)
  }

  const handleShow = () => {
    navigate('/apps/warehouse/create')
  }

  const handleEdit = (id) => {
    navigate(`/apps/warehouse/edit/${id}`)
  }

  // Filter warehouses based on search term
  const filteredWarehouses = warehouses.filter(warehouse => 
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.address.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.address.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.phone.includes(searchTerm)
  )
  
  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='px-9'>
          <div className='card'>
            <div className='card-header border-0 pt-6 d-flex justify-content-between'>
              <div className='card-title'>
                <h3 className='fw-bold'>Danh sách kho</h3>
              </div>
            </div>

            {/* Begin Header */}
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                {/* Begin Search */}
                <div className='d-flex align-items-center position-relative my-1'>
                  <KTSVG
                    path='/media/icons/duotune/general/gen021.svg'
                    className='svg-icon-1 position-absolute ms-6'
                  />
                  <input
                    type='text'
                    className='form-control form-control-solid w-250px ps-14'
                    placeholder='Tìm kiếm kho'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* End Search */}
              </div>

              <div className='card-toolbar'>
                <div className='d-flex justify-content-end gap-2'>
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => navigate('/apps/warehouse/create')}
                  >
                    <i className='ki-duotone ki-plus fs-2'></i>
                    Thêm kho mới
                  </button>
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className='card-body py-4'>
              {selectedItems.length > 0 && (
                <div className='d-flex align-items-center mb-5'>
                  <div className='d-flex align-items-center'>
                    <KTSVG
                      path='/media/icons/duotune/general/gen043.svg'
                      className='svg-icon-2 me-2 text-primary'
                    />
                    <span className='text-gray-600'>{selectedMessage}</span>
                  </div>
                  <div className='d-flex align-items-center ms-3'>
                    <select
                      className='form-select form-select-sm w-180px'
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                    >
                      <option value="">-- Chọn thao tác --</option>
                      <option value="delete">Xóa các mục đã chọn</option>
                    </select>
                    <button
                      className='btn btn-sm btn-primary ms-3 w-150px'
                      onClick={handleExecuteAction}
                      disabled={!selectedAction}
                    >
                      Thực hiện
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className='d-flex justify-content-center p-5'>
                  <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                </div>
              ) : filteredWarehouses.length === 0 ? (
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <th className='w-35px'>
                        <div className='form-check form-check-sm form-check-custom form-check-solid'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            checked={selectAll}
                            onChange={handleSelectAll}
                            disabled
                          />
                        </div>
                      </th>
                      <th className='min-w-100px text-black'>Tên kho</th>
                      <th className='min-w-150px text-black'>Địa chỉ</th>
                      <th className='min-w-100px text-black'>Số điện thoại</th>
                      <th className='min-w-100px text-black'>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    <tr>
                      <td colSpan={5} className='text-center py-5'>
                        Không có dữ liệu
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <th className='w-35px'>
                        <div className='form-check form-check-sm form-check-custom form-check-solid'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th className='min-w-100px text-black'>Tên kho</th>
                      <th className='min-w-150px text-black'>Địa chỉ</th>
                      <th className='min-w-100px text-black'>Số điện thoại</th>
                      <th className='min-w-100px text-black'>Trạng thái</th>
                      <th className='min-w-100px text-black'>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {filteredWarehouses.map((warehouse) => (
                      <tr key={warehouse._id}>
                        <td>
                          <div className='form-check form-check-sm form-check-custom form-check-solid'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              checked={selectedItems.includes(warehouse._id)}
                              onChange={() => handleSelectItem(warehouse._id)}
                            />
                          </div>
                        </td>
                        <td>{warehouse.name}</td>
                        <td>
                          {`${warehouse.address.detail}, ${warehouse.address.ward}, ${warehouse.address.district}, ${warehouse.address.city}`}
                        </td>
                        <td>{warehouse.phone}</td>
                        <td>
                          <span className={`badge badge-light-${warehouse.isActive ? 'success' : 'danger'}`}>
                            {warehouse.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 ms-4' 
                            onClick={() => handleEdit(warehouse._id)}
                          >
                            <i className='fas fa-edit'></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <div
          className='modal fade show d-block'
          tabIndex={-1}
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div
            className='modal-dialog'
            style={{
              marginTop: '2rem',
              maxWidth: '600px',
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 0.5s ease',
              animation: 'modal-fade-in 0.5s ease'
            }}
          >
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Xóa kho</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className='modal-body'>
                <p>Bạn có chắc chắn muốn xóa những kho này? Thao tác này không thể khôi phục.</p>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-light'
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </button>
                <button
                  type='button'
                  className='btn btn-danger'
                  onClick={handleConfirmDelete}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-fade-in {
          from {
            opacity: 0;
            transform: translateY(-60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

export default WarehousePage
