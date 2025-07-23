import { useEffect, useState } from 'react'
// import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import axios from 'axios'
import Swal from 'sweetalert2'

const StockInHistory = () => {
  const [stockImports, setStockImports] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user'))
      setIsAdmin(!user?.adminId) // If no adminId, user is an admin

      const importsResponse = await axios.get('http://localhost:9999/import/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStockImports(importsResponse.data.data || [])
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải dữ liệu lịch sử nhập kho',
        confirmButtonText: 'Đóng'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredImports = stockImports.filter((stock) => {
    const isMatchDate = !selectedDate || formatDateOnly(stock.importDate) === selectedDate
    const isMatchWarehouse = !selectedWarehouse || stock.wareId?.name === selectedWarehouse
    return isMatchDate && isMatchWarehouse
  })

  const handleWarehouseChange = (value) => {
    setSelectedWarehouse(value)
  }

  const handleResetFilters = () => {
    setSelectedWarehouse('')
    setSelectedDate('')
  }

  const handleDeleteImport = async (importId) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa phiếu nhập này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33'
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:9999/import/${importId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Xóa phiếu nhập thành công',
          showConfirmButton: false,
          timer: 1500
        })
        
        fetchData() // Reload data
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.response?.data?.message || 'Có lỗi xảy ra khi xóa phiếu nhập',
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  function formatDateOnly(isoString) {
    const date = new Date(isoString)
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const vnTime = new Date(utc + 7 * 60 * 60000)
    const year = vnTime.getFullYear()
    const month = String(vnTime.getMonth() + 1).padStart(2, '0')
    const day = String(vnTime.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function formatDateTime(isoString) {
    const date = new Date(isoString)
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const vnTime = new Date(utc + 7 * 60 * 60000)
    
    const day = String(vnTime.getDate()).padStart(2, '0')
    const month = String(vnTime.getMonth() + 1).padStart(2, '0')
    const year = vnTime.getFullYear()
    const hours = String(vnTime.getHours()).padStart(2, '0')
    const minutes = String(vnTime.getMinutes()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const uniqueWarehouses = Array.from(
    new Set(stockImports.map((stock) => stock.wareId?.name).filter(Boolean))
  )

  function countTotalProduct(items) {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  function calculateTotalValue(items) {
    return items.reduce((total, item) => {
      const price = item.proId?.price || 0
      return total + (item.quantity * price)
    }, 0)
  }

  return (
    <>
      <Content>
        <div className='card'>
          {/* Header Section */}
          <div className='card-header border-0 pt-6'>
            <div className='card-title'>
              <h3 className='fw-bold m-0'>Lịch sử nhập kho</h3>
            </div>
          </div>

          {/* Filters Section */}
          <div className='card-header border-0'>
            <div className='d-flex align-items-center position-relative gap-5 flex-wrap'>
              <span className='fw-bold me-2'>Lọc theo:</span>

              {/* Thời gian filter */}
              <div className='d-flex align-items-center position-relative'>
                <i className='ki-duotone ki-calendar fs-3 position-absolute ms-4'></i>
                <input
                  type='date'
                  className='form-control form-control-solid w-200px ps-12'
                  placeholder='dd/mm/yyyy'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Kho filter */}
              <div className='d-flex align-items-center position-relative'>
                <i className='ki-duotone ki-home fs-3 position-absolute ms-4'></i>
                <select 
                  className='form-select form-select-solid w-200px ps-12'
                  value={selectedWarehouse}
                  onChange={(e) => handleWarehouseChange(e.target.value)}
                >
                  <option value=''>Tất cả kho</option>
                  {uniqueWarehouses.map((warehouse, index) => (
                    <option key={index} value={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </div>

              {/* Reset filter */}
              <div className='card-toolbar'>
                <button
                  type='button'
                  className='btn btn-light-primary me-3'
                  onClick={handleResetFilters}
                >
                  <i className='ki-duotone ki-filter-remove fs-2'></i>
                  Đặt lại
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className='card-body py-4'>
            <div className='row g-6 g-xl-9 mb-6'>
              <div className='col-md-3 col-xxl-3'>
                <div className='card h-md-100'>
                  <div className='card-body d-flex flex-column flex-center'>
                    <div className='mb-2'>
                      <i className='ki-duotone ki-arrow-down-left fs-3hx text-success'>
                        <span className='path1'></span>
                        <span className='path2'></span>
                      </i>
                    </div>
                    <div className='fs-2hx fw-bold text-gray-800 mb-2 lh-1 ls-n1'>{filteredImports.length}</div>
                    <div className='text-gray-500 fw-semibold fs-6'>Tổng phiếu nhập</div>
                  </div>
                </div>
              </div>

              <div className='col-md-3 col-xxl-3'>
                <div className='card h-md-100'>
                  <div className='card-body d-flex flex-column flex-center'>
                    <div className='mb-2'>
                      <i className='ki-duotone ki-package fs-3hx text-primary'>
                        <span className='path1'></span>
                        <span className='path2'></span>
                        <span className='path3'></span>
                      </i>
                    </div>
                    <div className='fs-2hx fw-bold text-gray-800 mb-2 lh-1 ls-n1'>
                      {filteredImports.reduce((total, imp) => total + countTotalProduct(imp.items), 0)}
                    </div>
                    <div className='text-gray-500 fw-semibold fs-6'>Tổng sản phẩm</div>
                  </div>
                </div>
              </div>

              <div className='col-md-3 col-xxl-3'>
                <div className='card h-md-100'>
                  <div className='card-body d-flex flex-column flex-center'>
                    <div className='mb-2'>
                      <i className='ki-duotone ki-dollar fs-3hx text-warning'>
                        <span className='path1'></span>
                        <span className='path2'></span>
                        <span className='path3'></span>
                      </i>
                    </div>
                    <div className='fs-2hx fw-bold text-gray-800 mb-2 lh-1 ls-n1'>
                      {filteredImports.reduce((total, imp) => total + calculateTotalValue(imp.items), 0).toLocaleString()}đ
                    </div>
                    <div className='text-gray-500 fw-semibold fs-6'>Tổng giá trị</div>
                  </div>
                </div>
              </div>

              <div className='col-md-3 col-xxl-3'>
                <div className='card h-md-100'>
                  <div className='card-body d-flex flex-column flex-center'>
                    <div className='mb-2'>
                      <i className='ki-duotone ki-home fs-3hx text-info'>
                        <span className='path1'></span>
                        <span className='path2'></span>
                      </i>
                    </div>
                    <div className='fs-2hx fw-bold text-gray-800 mb-2 lh-1 ls-n1'>{uniqueWarehouses.length}</div>
                    <div className='text-gray-500 fw-semibold fs-6'>Kho hoạt động</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className='table-responsive'>
              {loading ? (
                <div className='d-flex justify-content-center py-10'>
                  <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Đang tải...</span>
                  </div>
                </div>
              ) : (
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <th>STT</th>
                      <th>Mã phiếu</th>
                      <th>Tên phiếu</th>
                      <th>Thời gian</th>
                      <th>Kho</th>
                      {isAdmin && <th>Người tạo</th>}
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Giá trị</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {filteredImports.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 10 : 9} className='text-center py-10'>
                          <div className='text-muted fs-4'>
                            {stockImports.length === 0 ? 'Chưa có dữ liệu nhập kho' : 'Không tìm thấy dữ liệu phù hợp'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredImports.map((imports, key) => (
                        <tr key={imports._id}>
                          <td>{key + 1}</td>
                          <td>
                            <span className='badge badge-light-primary'>{imports.receiptCode || 'N/A'}</span>
                          </td>
                          <td>
                            <div className='fw-bold text-gray-800'>{imports.receiptName || 'N/A'}</div>
                          </td>
                          <td>{formatDateTime(imports.importDate)}</td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <i className='ki-duotone ki-home fs-3 text-primary me-2'></i>
                              {imports.wareId?.name || 'N/A'}
                            </div>
                          </td>
                          {isAdmin && <td>{imports.staffId?.fullName || 'N/A'}</td>}
                          <td>
                            <div className='d-flex flex-column'>
                              {imports.items?.slice(0, 2).map((item, i) => (
                                <div key={i} className='text-gray-800'>
                                  {item.proId?.name || 'N/A'}
                                </div>
                              ))}
                              {imports.items?.length > 2 && (
                                <div className='text-muted'>
                                  +{imports.items.length - 2} sản phẩm khác
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className='badge badge-light-success'>
                              {countTotalProduct(imports.items)}
                            </span>
                          </td>
                          <td>
                            <span className='fw-bold text-primary'>
                              {calculateTotalValue(imports.items).toLocaleString()}đ
                            </span>
                          </td>
                          <td>
                            <div className='d-flex gap-2'>
                              <button
                                className='btn btn-icon btn-light-info btn-sm'
                                title='Xem chi tiết'
                                onClick={() => {
                                  // Handle view details
                                  console.log('View details:', imports)
                                }}
                              >
                                <i className='ki-duotone ki-eye fs-2'>
                                  <span className='path1'></span>
                                  <span className='path2'></span>
                                  <span className='path3'></span>
                                </i>
                              </button>
                              <button
                                className='btn btn-icon btn-light-danger btn-sm'
                                title='Xóa'
                                onClick={() => handleDeleteImport(imports._id)}
                              >
                                <i className='ki-duotone ki-trash fs-2'>
                                  <span className='path1'></span>
                                  <span className='path2'></span>
                                  <span className='path3'></span>
                                  <span className='path4'></span>
                                  <span className='path5'></span>
                                </i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </Content>
    </>
  )
}

export default StockInHistory