import { useState } from 'react'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { useNavigate } from 'react-router-dom'

const StockInHistory = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedHistoryId, setSelectedHistoryId] = useState('')

  // Mock data với nhiều trường hợp khác nhau
  const historyData = [
    {
      id: '1',
      date: '2024-03-20',
      warehouse: 'Kho Hà Nội',
      sourceType: 'NEW',
      createdBy: 'Nguyễn Văn A',
      products: [
        { name: 'Honda Wave Alpha', quantity: 5 },
        { name: 'Honda Vision', quantity: 3 }
      ],
      status: 'COMPLETED'
    },
    {
      id: '2',
      date: '2024-03-20',
      warehouse: 'Kho HCM',
      sourceType: 'RETURN',
      createdBy: 'Trần Văn B',
      products: [
        { name: 'Honda Air Blade', quantity: 2 }
      ],
      status: 'COMPLETED'
    },
    {
      id: '3',
      date: '2024-03-19',
      warehouse: 'Kho Hà Nội',
      sourceType: 'TRANSFER',
      createdBy: 'Lê Thị C',
      products: [
        { name: 'Honda Winner X', quantity: 4 }
      ],
      status: 'COMPLETED'
    },
    {
      id: '4',
      date: '2024-03-19',
      warehouse: 'Kho HCM',
      sourceType: 'NEW',
      createdBy: 'Phạm Văn D',
      products: [
        { name: 'Honda SH Mode', quantity: 3 },
        { name: 'Honda Vision', quantity: 2 }
      ],
      status: 'CANCELLED'
    },
    {
      id: '5',
      date: '2024-03-18',
      warehouse: 'Kho Hà Nội',
      sourceType: 'RETURN',
      createdBy: 'Nguyễn Văn A',
      products: [
        { name: 'Honda Future', quantity: 1 }
      ],
      status: 'COMPLETED'
    }
  ]

  const sourceTypeLabels = {
    NEW: 'SP mới: SP được nhập trực tiếp vào kho',
    RETURN: 'SP hoàn: SP được trả về từ các đơn hàng hoàn đã đối soát',
    TRANSFER: 'SP chuyển kho: được transfer từ kho khác qua'
  }

  const getSourceTypeClass = (type) => {
    const classes = {
      NEW: 'badge-light-primary',
      RETURN: 'badge-light-warning',
      TRANSFER: 'badge-light-info'
    }
    return `badge ${classes[type]}`
  }

  // Xử lý filter data
  const getFilteredData = () => {
    return historyData.filter(item => {
      // Filter theo thời gian
      if (selectedDate && item.date !== selectedDate) {
        return false
      }

      // Filter theo kho
      if (selectedWarehouse && !item.warehouse.toLowerCase().includes(selectedWarehouse.toLowerCase())) {
        return false
      }

      // Filter theo nguồn nhập
      if (selectedSource && item.sourceType !== selectedSource) {
        return false
      }

      return true
    })
  }

  // Lấy dữ liệu đã filter
  const filteredData = getFilteredData()

  const handleDelete = (id) => {
    setSelectedHistoryId(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    console.log('Deleting history:', selectedHistoryId)
    setShowDeleteModal(false)
    // Xử lý xóa thực tế ở đây
  }

  // Reset filters
  const handleReset = () => {
    setSelectedDate('')
    setSelectedWarehouse('')
    setSelectedSource('')
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
            <div className='d-flex align-items-center position-relative gap-5'>
            <span className='fw-bold me-2'>Lọc theo:</span>
              {/* Thời gian filter */}
              <div className='d-flex align-items-center position-relative'>
                <i className='ki-duotone ki-calendar fs-3 position-absolute ms-4'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
                <input
                  type='text'
                  className='form-control form-control-solid w-200px ps-12'
                  placeholder='dd/mm/yyyy'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => (e.target.type = 'text')}
                />
              </div>

              {/* Kho filter */}
              <div className='d-flex align-items-center position-relative'>
                <i className='ki-duotone ki-home fs-3 position-absolute ms-4'></i>
                <select
                  className='form-select form-select-solid w-200px ps-12'
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  <option value=''>Tất cả kho</option>
                  <option value='Kho Hà Nội'>Kho Hà Nội</option>
                  <option value='Kho HCM'>Kho HCM</option>
                </select>
              </div>

              {/* Nguồn nhập filter */}
              <div className='d-flex align-items-center position-relative'>
                <i className='ki-duotone ki-filter fs-3 position-absolute ms-4'></i>
                <select
                  className='form-select form-select-solid w-200px ps-12'
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  <option value=''>Tất cả nguồn</option>
                  <option value='NEW'>SP mới</option>
                  <option value='RETURN'>SP hoàn</option>
                  <option value='TRANSFER'>SP chuyển kho</option>
                </select>
              </div>
              <div className='card-toolbar'>
                <button
                  type='button'
                  className='btn btn-light-primary me-3'
                  onClick={handleReset}
                >
                  <i className='ki-duotone ki-filter-remove fs-2'>
                    <span className='path1'></span>
                    <span className='path2'></span>
                  </i>
                  Đặt lại
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className='card-body py-4'>
            <div className='table-responsive'>
              <table className='table align-middle table-row-dashed fs-6 gy-5'>
                <thead>
                  <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                    <th>STT</th>
                    <th>Thời gian</th>
                    <th>Kho</th>
                    <th>Nguồn nhập</th>
                    <th>Người nhập</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody className='text-gray-600 fw-semibold'>
                  {filteredData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.date}</td>
                      <td>{item.warehouse}</td>
                      <td>
                        <span className={getSourceTypeClass(item.sourceType)}>
                          {sourceTypeLabels[item.sourceType]}
                        </span>
                      </td>
                      <td>{item.createdBy}</td>
                      <td>
                        {item.products.map((product, index) => (
                          <div key={index}>
                            {product.name}
                          </div>
                        ))}
                      </td>
                      <td>
                        {item.products.map((product, index) => (
                          <div
                            key={index}
                            style={{
                              marginLeft: '25px'
                            }}>
                            {product.quantity}
                          </div>
                        ))}
                      </td>
                      <td>
                        {item.status === 'COMPLETED' && (
                          <button
                            className='btn btn-icon btn-light-danger btn-sm'
                            onClick={() => handleDelete(item.id)}
                            title='Xóa'
                            style={{
                              marginLeft: '15px'
                            }}
                          >
                            <i className='ki-duotone ki-trash fs-2'>
                              <span className='path1'></span>
                              <span className='path2'></span>
                            </i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Content>

      {/* Delete confirmation modal - Updated style */}
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
                <h5 className='modal-title'>Xác nhận xóa</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className='modal-body'>
                <p>Bạn có chắc chắn muốn xóa lịch sử nhập kho này?</p>
                <p className='text-danger fw-semibold'>
                  Lưu ý: Chỉ có thể xóa trong trường hợp nhập kho sai
                </p>
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

      {/* Add animation keyframes */}
      <style>
        {`
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
        `}
      </style>
    </>
  )
}

export default StockInHistory
