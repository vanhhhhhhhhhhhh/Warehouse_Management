import { useEffect, useState } from 'react'
// import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import axios from 'axios'

const StockInHistory = () => {
  const [stockImports, setStockImports] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const importsResponse = await axios.get('http://localhost:9999/import/history')
        setStockImports(importsResponse.data.data)
      } catch (error) {
        console.log(error);
      }
    }
    fetchData()
  }, [])

  const filteredImports = stockImports.filter((stock) => {
    const isMatchDate = !selectedDate || formatDateOnly(stock.importDate) === selectedDate
    const isMatchWarehouse = !selectedWarehouse || stock.wareId.name === selectedWarehouse
    return isMatchDate && isMatchWarehouse
  })

  const handleSelected = (value) => {
    setSelectedWarehouse(value)
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

  function countTotalProduct(items) {
    return items.reduce((total, item) => total + item.quantity, 0)
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
                <select className='form-select form-select-solid w-200px ps-12'
                  value={selectedWarehouse || ''}
                  onChange={(e) => handleSelected(e.target.value)}>
                  <option value=''>Tất cả kho</option>
                  {
                    stockImports.map((stock) => {
                      return <option value={stock.wareId.name}>{stock.wareId.name}</option>
                    })
                  }
                </select>
              </div>

              {/* Reset filter */}
              <div className='card-toolbar'>
                <button
                  type='button'
                  className='btn btn-light-primary me-3'
                  onClick={() => {
                    setSelectedWarehouse(null)
                    setSelectedDate('')
                  }}
                >
                  <i className='ki-duotone ki-filter-remove fs-2'></i>
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
                    <th>Người nhập</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody className='text-gray-600 fw-semibold'>
                  {/* Dữ liệu sẽ được hiển thị tại đây */}
                  {
                    filteredImports.map((imports, key) => {
                      return <tr>
                        <td>{key + 1}</td>
                        <td>{formatDateOnly(imports.importDate)}</td>
                        <td>{imports.wareId.name}</td>
                        <td>{imports.adminId.fullName}</td>
                        <td>
                          {
                            imports.items.map((item, i) => {
                              return <div key={i}>{item.proId.name}</div>
                            })
                          }
                        </td>
                        <td>{countTotalProduct(imports.items)}</td>
                        <td>
                          <button
                            className='btn btn-icon btn-light-danger btn-sm'
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
                        </td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Content>
    </>
  )
}

export default StockInHistory
