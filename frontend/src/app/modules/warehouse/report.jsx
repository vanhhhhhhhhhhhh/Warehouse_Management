import { useState, useEffect } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import '../../../_metronic/assets/sass/exportPage.scss';

// Mock data
const warehouses = [
  { id: 'hanoi', name: 'Kho Hà Nội' },
  { id: 'hcm', name: 'Kho HCM' }
]

const products = [
  { id: '1', name: 'Honda Wave Alpha' },
  { id: '2', name: 'Honda Vision' },
  { id: '3', name: 'Honda Air Blade' }
]

const mockReportData = [
  {
    warehouseId: 'hanoi',
    warehouseName: 'Kho Hà Nội',
    productId: '1',
    productName: 'Honda Wave Alpha',
    date: '2024-03-15',
    totalIn: 100,
    totalOut: 80,
    totalDamaged: 2,
    pendingOut: 5
  },
  {
    warehouseId: 'hanoi',
    warehouseName: 'Kho Hà Nội',
    productId: '2',
    productName: 'Honda Vision',
    date: '2024-03-16',
    totalIn: 150,
    totalOut: 120,
    totalDamaged: 3,
    pendingOut: 8
  },
  {
    warehouseId: 'hanoi',
    warehouseName: 'Kho Hà Nội',
    productId: '3',
    productName: 'Honda Air Blade',
    date: '2024-03-17',
    totalIn: 80,
    totalOut: 60,
    totalDamaged: 1,
    pendingOut: 4
  },
  {
    warehouseId: 'hcm',
    warehouseName: 'Kho HCM',
    productId: '1',
    productName: 'Honda Wave Alpha',
    date: '2024-03-18',
    totalIn: 200,
    totalOut: 160,
    totalDamaged: 4,
    pendingOut: 10
  },
  {
    warehouseId: 'hcm',
    warehouseName: 'Kho HCM',
    productId: '2',
    productName: 'Honda Vision',
    date: '2024-03-19',
    totalIn: 180,
    totalOut: 150,
    totalDamaged: 2,
    pendingOut: 7
  },
]

const InventoryReport = () => {
  const [timeRange, setTimeRange] = useState({
    start: '',
    end: ''
  })
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [reportData, setReportData] = useState(mockReportData)

  // Hàm lọc dữ liệu
  const getFilteredData = () => {
    return reportData.filter(item => {
      // Lọc theo kho
      if (selectedWarehouse && item.warehouseId !== selectedWarehouse) {
        return false
      }

      // Lọc theo sản phẩm
      if (selectedProduct && item.productId !== selectedProduct) {
        return false
      }

      // Lọc theo thời gian
      if (timeRange.start && timeRange.end) {
        const itemDate = new Date(item.date).getTime()
        const startDate = new Date(timeRange.start).getTime()
        const endDate = new Date(timeRange.end).getTime()

        console.log('Item date:', item.date, itemDate)
        console.log('Start date:', timeRange.start, startDate)
        console.log('End date:', timeRange.end, endDate)

        // Kiểm tra xem ngày của item có nằm trong khoảng thời gian đã chọn không
        if (itemDate < startDate || itemDate > endDate) {
          return false
        }
      }

      return true
    })
  }

  // Thêm useEffect để theo dõi thay đổi của timeRange
  useEffect(() => {
    console.log('Time range changed:', timeRange)
    // Khi timeRange thay đổi, getFilteredData() sẽ tự động chạy lại
  }, [timeRange])

  // Lấy dữ liệu đã lọc
  const filteredData = getFilteredData()

  // Tính tổng dựa trên dữ liệu đã lọc
  const totals = filteredData.reduce((acc, item) => ({
    totalIn: acc.totalIn + item.totalIn,
    totalOut: acc.totalOut + item.totalOut,
    totalDamaged: acc.totalDamaged + item.totalDamaged,
    pendingOut: acc.pendingOut + item.pendingOut
  }), {
    totalIn: 0,
    totalOut: 0,
    totalDamaged: 0,
    pendingOut: 0
  })

  // Reset tất cả các bộ lọc
  const handleReset = () => {
    setTimeRange({ start: '', end: '' })
    setSelectedWarehouse('')
    setSelectedProduct('')
  }

  return (
    <Content>
      <div className='card'>
        <div className='card-header border-0 pt-6 d-flex justify-content-between'>
          <div className='d-flex align-items-center'>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>Báo cáo xuất nhập kho</span>
            </h3>
          </div>
        </div>
        {/* Phần filters */}
        <div className='card-header border-0 pt-6'>
          <div className='card-title'>
            <div className='d-flex align-items-center position-relative'>
              <div className='me-5'>
                <label className='form-label'>Thời gian:</label>
                <div className='date-filter-container'>
                  <div className="date-range-wrapper">
                    <div className="date-field">
                      <span className="date-label">Từ ngày:</span>
                      <input
                        type="date"
                        className="date-input"
                        value={timeRange.start}
                        onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                      />
                      <i className="ki-duotone ki-calendar fs-3"></i>
                    </div>

                    <div className="date-field">
                      <span className="date-label">Đến ngày:</span>
                      <input
                        type="date"
                        className="date-input"
                        value={timeRange.end}
                        onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                      />
                      <i className="ki-duotone ki-calendar fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className='me-5'>
                <label className='form-label'>Kho:</label>
                <select
                  className='form-select form-select-solid'
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  <option value=''>Tất cả</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div className='me-5'>
                <label className='form-label'>Sản phẩm:</label>
                <select
                  className='form-select form-select-solid'
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value=''>Tất cả</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </select>
              </div>
              <div className='mt-4'>
                <button
                  type='button'
                  className='btn btn-light-primary'
                  onClick={handleReset}
                  style={{ marginTop: '18px' }}
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
        </div>

        {/* Phần bảng báo cáo */}
        <div className='card-body py-4'>
          <div className='table-responsive'>
            <table className='table align-middle table-row-dashed fs-6 gy-5'>
              <thead>
                <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                  <th>Kho</th>
                  <th>Sản phẩm</th>
                  <th>Tổng số nhập</th>
                  <th>Tổng số xuất</th>
                  <th>Tổng số SP hỏng, rơi vỡ, lỗi</th>
                  <th>Số lượng SP đang chờ xuất kho</th>
                </tr>
              </thead>
              <tbody className='text-gray-600 fw-semibold'>
                {filteredData.map((item) => (
                  <tr key={`${item.warehouseId}-${item.productId}`}>
                    <td>{item.warehouseName}</td>
                    <td>{item.productName}</td>
                    <td>{item.totalIn}</td>
                    <td>{item.totalOut}</td>
                    <td>{item.totalDamaged}</td>
                    <td>{item.pendingOut}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='fw-bold'>
                  <td colSpan={2}>Tổng cộng:</td>
                  <td>{totals.totalIn}</td>
                  <td>{totals.totalOut}</td>
                  <td>{totals.totalDamaged}</td>
                  <td>{totals.pendingOut}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Content>
  )
}

export default InventoryReport
