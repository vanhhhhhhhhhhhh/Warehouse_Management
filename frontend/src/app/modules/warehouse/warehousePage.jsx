import { useState, useEffect } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../_metronic/helpers'
import ErrorModal from '../errors/components/modalErros'
import { getWarehouses, searchWarehouses, deleteManyWarehouses } from '../../services/warehouseService'
import Swal from 'sweetalert2'

const WarehousePage = () => {
  const navigate = useNavigate()

  // States
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedMessage, setSelectedMessage] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userPermissions, setUserPermissions] = useState([])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch danh sách kho
  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const response = await getWarehouses()
      if (response.success) {
        setWarehouses(response.data)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Lỗi khi lấy danh sách kho')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  // Fetch danh sách kho khi component mount
  useEffect(() => {
    fetchWarehouses()
  }, [])

  // Kiểm tra vai trò và quyền
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setIsAdmin(user.roleName === 'Admin')
        setUserPermissions(user.permissions?.WAREHOUSE || [])
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsAdmin(false)
        setUserPermissions([])
      }
    }
  }, [])

  // Kiểm tra quyền thực hiện hành động
  const checkPermission = (action) => {
    if (isAdmin) return true
    return userPermissions.includes(action)
  }

  // Xử lý tìm kiếm
  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    try {
      setLoading(true)
      if (value.trim()) {
        const response = await searchWarehouses(value)
        if (response.success) {
          setWarehouses(response.data)
        }
      } else {
        await fetchWarehouses()
      }
    } catch (error) {
      setErrorMessage(error.message || 'Lỗi khi tìm kiếm kho')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

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
    if (!checkPermission('DELETE')) {
      setErrorMessage('Bạn không có quyền xóa kho')
      setShowErrorModal(true)
      return
    }

    if (!selectedAction) return;

    switch (selectedAction) {
      case 'delete':
        setShowDeleteModal(true)
        break;
      default:
        break;
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      const response = await deleteManyWarehouses(selectedItems)
      if (response.success) {
        Swal.fire({
          title: 'Thành công!',
          text: response.message,
          icon: 'success',
          confirmButtonText: 'OK'
        })
        await fetchWarehouses()
        setShowDeleteModal(false)
        setSelectedAction('')
        setSelectedItems([])
        setSelectedMessage('')
        setSelectAll(false)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Lỗi khi xóa kho')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleShow = () => {
    if (!checkPermission('CREATE')) {
      setErrorMessage('Bạn không có quyền thêm kho mới')
      setShowErrorModal(true)
      return
    }
    navigate('/apps/warehouse/create')
  }

  const handleEdit = (id) => {
    if (!checkPermission('UPDATE')) {
      setErrorMessage('Bạn không có quyền chỉnh sửa kho')
      setShowErrorModal(true)
      return
    }
    navigate(`/apps/warehouse/edit/${id}`)
  }

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
                    onChange={handleSearch}
                  />
                </div>
                {/* End Search */}
              </div>

              {/* Hiển thị nút thêm mới nếu có quyền */}
              {(isAdmin || checkPermission('CREATE')) && (
                <div className='card-toolbar'>
                  <div className='d-flex justify-content-end gap-2'>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={handleShow}
                    >
                      <i className='ki-duotone ki-plus fs-2'></i>
                      Thêm kho mới
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card body */}
            <div className='card-body py-4'>
              {/* Thông báo số lượng đã chọn - Hiển thị nếu có quyền xóa */}
              {(isAdmin || checkPermission('DELETE')) && selectedItems.length > 0 && (
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
              ) : warehouses.length === 0 ? (
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      {/* Hiển thị checkbox nếu có quyền xóa */}
                      {(isAdmin || checkPermission('DELETE')) && (
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
                      )}
                      <th className='min-w-100px text-black'>Tên kho</th>
                      <th className='min-w-150px text-black'>Địa chỉ</th>
                      <th className='min-w-100px text-black'>Số điện thoại</th>
                      <th className='min-w-100px text-black'>Trạng thái</th>
                      {/* Hiển thị cột thao tác nếu có quyền sửa */}
                      {(isAdmin || checkPermission('UPDATE')) && (
                        <th className='min-w-100px text-black'>Thao tác</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    <tr>
                      <td colSpan={isAdmin ? 5 : 6} className='text-center py-5'>
                        Không có dữ liệu
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      {/* Hiển thị checkbox nếu có quyền xóa */}
                      {(isAdmin || checkPermission('DELETE')) && (
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
                      )}
                      <th className='min-w-100px text-black'>Tên kho</th>
                      <th className='min-w-150px text-black'>Địa chỉ</th>
                      <th className='min-w-100px text-black'>Số điện thoại</th>
                      <th className='min-w-100px text-black'>Trạng thái</th>
                      {/* Hiển thị cột thao tác nếu có quyền sửa */}
                      {(isAdmin || checkPermission('UPDATE')) && (
                        <th className='min-w-100px text-black'>Thao tác</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {warehouses.map((warehouse) => (
                      <tr key={warehouse._id}>
                        {/* Hiển thị checkbox nếu có quyền xóa */}
                        {(isAdmin || checkPermission('DELETE')) && (
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
                        )}
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
                        {/* Hiển thị nút thao tác nếu có quyền sửa */}
                        {(isAdmin || checkPermission('UPDATE')) && (
                          <td>
                            <button 
                              className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 ms-4' 
                              onClick={() => handleEdit(warehouse._id)}
                            >
                              <i className='fas fa-edit'></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        message={errorMessage}
      />

      {/* Modal xác nhận xóa - Hiển thị nếu có quyền xóa */}
      {(isAdmin || checkPermission('DELETE')) && showDeleteModal && (
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
