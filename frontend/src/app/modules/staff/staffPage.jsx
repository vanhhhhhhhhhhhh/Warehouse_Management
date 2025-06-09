import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { KTSVG } from '../../../_metronic/helpers'
import axios from 'axios'
import { API_URL, getAxiosConfig } from '../../config/api.config'

const StaffPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedMessage, setSelectedMessage] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Fetch staff data
  useEffect(() => {
    fetchStaffData()
  }, [])

  const fetchStaffData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL.USERS.LIST, getAxiosConfig())
      if (response.data.success) {
        setStaff(response.data.staff)
      } else {
        setError('Failed to fetch staff data')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching staff data')
    } finally {
      setLoading(false)
    }
  }

  // Filter staff list
  const filteredStaff = staff?.filter((staff) => {
    if (!staff) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      staff.fullName?.toLowerCase().includes(searchLower) ||
      staff.email?.toLowerCase().includes(searchLower) ||
      staff.phone?.includes(searchTerm)
    )
  }) || []

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked)
    if (e.target.checked) {
      const allIds = filteredStaff.map(staff => staff._id)
      setSelectedItems(allIds)
      setSelectedMessage(`Đã chọn ${allIds.length} nhân viên`)
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
    setSelectAll(newSelectedItems.length === filteredStaff.length)

    if (newSelectedItems.length > 0) {
      setSelectedMessage(`Đã chọn ${newSelectedItems.length} nhân viên`)
    } else {
      setSelectedMessage('')
    }
  }

  const handleExecuteAction = () => {
    if (!selectedAction) return

    switch (selectedAction) {
      case 'delete':
        setShowDeleteModal(true)
        break
      default:
        break
    }
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        API_URL.USERS.DELETE(selectedItems[0]), 
        {
          ...getAxiosConfig(),
          data: { staffIds: selectedItems }
        }
      )

      if (response.data.success) {
        await fetchStaffData()
        setShowDeleteModal(false)
        setSelectedAction('')
        setSelectedItems([])
        setSelectedMessage('')
        setSelectAll(false)
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting staff')
    }
  }

  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='px-9'>
          <div className='card'>
            <div className='card-header border-0 pt-6 d-flex justify-content-between'>
              <div className='card-title'>
                <h3 className='fw-bold'>Danh sách nhân viên</h3>
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
                    placeholder='Tìm kiếm nhân viên'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* End Search */}
              </div>

              <div className='card-toolbar'>
                <div className='d-flex justify-content-end'>
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => navigate('/apps/staff/create')}
                  >
                    <i className='ki-duotone ki-plus fs-2'></i>
                    Thêm nhân viên
                  </button>
                </div>
              </div>
            </div>
            {/* End Header */}

            {/* Begin Body */}
            <div className='card-body py-4'>
              {error && (
                <div className='alert alert-danger'>
                  {error}
                </div>
              )}

              {/* Thông báo số lượng đã chọn */}
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
                      <option value="">--Chọn thao tác--</option>
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

              {/* Table */}
              <div className='table-responsive'>
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
                      <th>Họ tên</th>
                      <th>Số điện thoại</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className='text-center'>
                          <div className='spinner-border text-primary' role='status'>
                            <span className='visually-hidden'>Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={7} className='text-center'>
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((staff) => (
                        <tr key={staff._id}>
                          <td>
                            <div className='form-check form-check-sm form-check-custom form-check-solid'>
                              <input
                                className='form-check-input'
                                type='checkbox'
                                checked={selectedItems.includes(staff._id)}
                                onChange={() => handleSelectItem(staff._id)}
                              />
                            </div>
                          </td>
                          <td>{staff.fullName}</td>
                          <td>{staff.phone}</td>
                          <td>{staff.roleId?.name || 'N/A'}</td>
                          <td>
                            <span className={`badge badge-light-${staff.status ? 'success' : 'danger'}`}>
                              {staff.status ? 'Hoạt động' : 'Ngừng hoạt động'}
                            </span>
                          </td>
                          <td>
                            <button
                              className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 ms-4'
                              onClick={() => navigate(`/apps/staff/update/${staff._id}`)}
                            >
                              <i className='fas fa-edit'></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* End Body */}
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
                <h5 className='modal-title'>Xóa nhân viên</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className='modal-body'>
                <p>Bạn có chắc chắn muốn xóa những nhân viên này? Thao tác này không thể khôi phục.</p>
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

export default StaffPage
