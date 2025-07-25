import { useState, useEffect } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import axios from 'axios'
import Swal from 'sweetalert2'
import '../../../_metronic/assets/sass/exportPage.scss'

// Thêm script pdfmake từ CDN
const loadPdfMake = () => {
  return new Promise((resolve) => {
    if (window.pdfMake) {
      resolve(window.pdfMake);
    } else {
      const script1 = document.createElement('script');
      const script2 = document.createElement('script');
      
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js';
      
      script1.onload = () => {
        script2.onload = () => {
          resolve(window.pdfMake);
        };
        document.body.appendChild(script2);
      };
      
      document.body.appendChild(script1);
    }
  });
};

const InventoryReport = () => {
  const [timeRange, setTimeRange] = useState({
    start: '',
    end: ''
  })
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [loading, setLoading] = useState(false)
  
  // State for data
  const [stockImports, setStockImports] = useState([])
  const [stockExports, setStockExports] = useState([])
  const [defectiveProducts, setDefectiveProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch all data in parallel
      const [importsResponse, exportsResponse, defectiveResponse] = await Promise.all([
        axios.get('http://localhost:9999/import/history', { headers }),
        axios.get('http://localhost:9999/export/history', { headers }),
        axios.get('http://localhost:9999/error/stockError', { headers })
      ])

      const imports = importsResponse.data.data || []
      const exports = exportsResponse.data.data || []
      const defective = defectiveResponse.data.data || []

      console.log('Import data:', imports)
      console.log('Export data:', exports)
      console.log('Defective data:', defective)

      setStockImports(imports)
      setStockExports(exports)
      setDefectiveProducts(defective)

      // Extract unique warehouses from all data
      const warehouseSet = new Set()
      imports.forEach(item => warehouseSet.add(JSON.stringify({ id: item.wareId._id, name: item.wareId.name })))
      exports.forEach(item => warehouseSet.add(JSON.stringify({ id: item.wareId._id, name: item.wareId.name })))
      defective.forEach(item => warehouseSet.add(JSON.stringify({ id: item.wareId._id, name: item.wareId.name })))
      
      const uniqueWarehouses = Array.from(warehouseSet).map(item => JSON.parse(item))
      console.log('Unique warehouses:', uniqueWarehouses)
      setWarehouses(uniqueWarehouses)

      // Extract unique products from all data
      const productSet = new Set()
      imports.forEach(item => {
        item.items?.forEach(product => {
          productSet.add(JSON.stringify({ id: product.proId._id, name: product.proId.name }))
        })
      })
      exports.forEach(item => {
        item.items?.forEach(product => {
          productSet.add(JSON.stringify({ id: product.proId._id, name: product.proId.name }))
        })
      })
      defective.forEach(item => {
        productSet.add(JSON.stringify({ id: item.proId._id, name: item.proId.name }))
      })

      const uniqueProducts = Array.from(productSet).map(item => JSON.parse(item))
      setProducts(uniqueProducts)

    } catch (error) {
      console.error('Error fetching data:', error)
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải dữ liệu báo cáo',
        confirmButtonText: 'Đóng'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDateOnly = (isoString) => {
    const date = new Date(isoString)
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const vnTime = new Date(utc + 7 * 60 * 60000)
    const year = vnTime.getFullYear()
    const month = String(vnTime.getMonth() + 1).padStart(2, '0')
    const day = String(vnTime.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isDateInRange = (dateString) => {
    if (!timeRange.start || !timeRange.end) return true
    
    const itemDate = new Date(dateString).getTime()
    const startDate = new Date(timeRange.start).getTime()
    const endDate = new Date(timeRange.end).getTime()
    
    return itemDate >= startDate && itemDate <= endDate
  }

  // Generate report data by combining all sources
  const generateReportData = () => {
    const reportMap = new Map()

    // Process imports
    stockImports.forEach(importItem => {
      if (!isDateInRange(importItem.importDate)) return
      if (selectedWarehouse && importItem.wareId._id !== selectedWarehouse) return

      importItem.items?.forEach(item => {
        if (selectedProduct && item.proId._id !== selectedProduct) return

        const key = `${importItem.wareId._id}-${item.proId._id}`
        if (!reportMap.has(key)) {
          reportMap.set(key, {
            warehouseId: importItem.wareId._id,
            warehouseName: importItem.wareId.name,
            productId: item.proId._id,
            productName: item.proId.name,
            productPrice: item.proId?.price || 0,
            totalIn: 0,
            totalOut: 0,
            totalDamaged: 0,
            pendingOut: 0,
            totalInValue: 0,
            totalOutValue: 0,
            totalDamagedValue: 0,
            pendingOutValue: 0
          })
        }
        
        const report = reportMap.get(key)
        const quantity = item.quantity || 0
        const price = item.proId?.price || 0
        
        report.totalIn += quantity
        report.totalInValue += quantity * price
      })
    })

    // Process exports
    stockExports.forEach(exportItem => {
      if (!isDateInRange(exportItem.exportDate)) return
      if (selectedWarehouse && exportItem.wareId._id !== selectedWarehouse) return

      exportItem.items?.forEach(item => {
        if (selectedProduct && item.proId._id !== selectedProduct) return

        const key = `${exportItem.wareId._id}-${item.proId._id}`
        if (!reportMap.has(key)) {
          reportMap.set(key, {
            warehouseId: exportItem.wareId._id,
            warehouseName: exportItem.wareId.name,
            productId: item.proId._id,
            productName: item.proId.name,
            productPrice: item.proId?.price || 0,
            totalIn: 0,
            totalOut: 0,
            totalDamaged: 0,
            pendingOut: 0,
            totalInValue: 0,
            totalOutValue: 0,
            totalDamagedValue: 0,
            pendingOutValue: 0
          })
        }
        
        const report = reportMap.get(key)
        const quantity = item.quantity || 0
        const price = item.proId?.price || 0
        
        report.totalOut += quantity
        report.totalOutValue += quantity * price
      })
    })

    // Process defective products
    defectiveProducts.forEach(defectiveItem => {
      if (!isDateInRange(defectiveItem.declareDate)) return
      if (selectedWarehouse && defectiveItem.wareId._id !== selectedWarehouse) return
      if (selectedProduct && defectiveItem.proId._id !== selectedProduct) return

      const key = `${defectiveItem.wareId._id}-${defectiveItem.proId._id}`
      if (!reportMap.has(key)) {
        reportMap.set(key, {
          warehouseId: defectiveItem.wareId._id,
          warehouseName: defectiveItem.wareId.name,
          productId: defectiveItem.proId._id,
          productName: defectiveItem.proId.name,
          productPrice: defectiveItem.proId?.price || 0,
          totalIn: 0,
          totalOut: 0,
          totalDamaged: 0,
          pendingOut: 0,
          totalInValue: 0,
          totalOutValue: 0,
          totalDamagedValue: 0,
          pendingOutValue: 0
        })
      }
      
      const report = reportMap.get(key)
      const quantity = defectiveItem.quantity || 0
      const price = defectiveItem.proId?.price || 0
      
      report.totalDamaged += quantity
      report.totalDamagedValue += quantity * price
    })

    return Array.from(reportMap.values())
  }

  const reportData = generateReportData()

  // Calculate totals
  const totals = reportData.reduce((acc, item) => ({
    totalIn: acc.totalIn + item.totalIn,
    totalOut: acc.totalOut + item.totalOut,
    totalDamaged: acc.totalDamaged + item.totalDamaged,
    pendingOut: acc.pendingOut + item.pendingOut,
    totalInValue: acc.totalInValue + item.totalInValue,
    totalOutValue: acc.totalOutValue + item.totalOutValue,
    totalDamagedValue: acc.totalDamagedValue + item.totalDamagedValue,
    pendingOutValue: acc.pendingOutValue + item.pendingOutValue
  }), {
    totalIn: 0,
    totalOut: 0,
    totalDamaged: 0,
    pendingOut: 0,
    totalInValue: 0,
    totalOutValue: 0,
    totalDamagedValue: 0,
    pendingOutValue: 0
  })

  // Calculate remaining stock (pending out could be calculated as totalIn - totalOut - totalDamaged)
  reportData.forEach(item => {
    item.pendingOut = Math.max(0, item.totalIn - item.totalOut - item.totalDamaged)
    item.pendingOutValue = item.pendingOut * item.productPrice
  })

  // Recalculate totals with updated pending out
  totals.pendingOut = reportData.reduce((acc, item) => acc + item.pendingOut, 0)
  totals.pendingOutValue = reportData.reduce((acc, item) => acc + item.pendingOutValue, 0)

  // Reset all filters
  const handleReset = () => {
    setTimeRange({ start: '', end: '' })
    setSelectedWarehouse('')
    setSelectedProduct('')
  }

  const exportToPDF = async () => {
    try {
      console.log('Starting PDF export...')
      
      const pdfMake = await loadPdfMake();

      // Hàm format số
      const formatNumber = (num) => {
        if (!num) return '0'
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      }
      
      // Định nghĩa font tiếng Việt
      pdfMake.fonts = {
        Roboto: {
          normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
          bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
          italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
          bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
        }
      };

      const today = new Date();

      const docDefinition = {
        pageOrientation: 'landscape',
        pageMargins: [40, 40, 40, 40],  // Tăng margin để giống mẫu
        defaultStyle: {
          font: 'Roboto',
          fontSize: 10  // Điều chỉnh font size mặc định
        },
        content: [
          {
            text: 'Metronic Warehouse Management System',
            alignment: 'right',
            fontSize: 11,
            margin: [0, 0, 0, 20]  // Thêm margin bottom
          },
          {
            text: 'BÁO CÁO NHẬP XUẤT TỒN KHO',
            alignment: 'center',
            fontSize: 16,  // Tăng font size
            bold: true,
            margin: [0, 0, 0, 20]  // Thêm margin bottom
          },
          {
            table: {
              headerRows: 1,
              widths: [
                '5%',      // STT
                '15%',     // KHO
                '15%',     // SẢN PHẨM (thu hẹp từ 20%)
                '10%',     // ĐƠN GIÁ
                '10%',     // NHẬP KHO (tăng từ 8%)
                '10%',     // XUẤT KHO (tăng từ 8%)
                '12%',     // SP HỎNG/LỖI (tăng từ 10%)
                '10%',     // TỒN KHO (tăng từ 8%)
                '13%'      // GIÁ TRỊ TỒN (thu hẹp từ 16%)
              ],
              body: [
                [
                  { text: 'STT', alignment: 'center', bold: true, fillColor: '#f2f2f2' },
                  { text: 'KHO', alignment: 'left', bold: true, fillColor: '#f2f2f2' },
                  { text: 'SẢN PHẨM', alignment: 'left', bold: true, fillColor: '#f2f2f2' },
                  { text: 'ĐƠN GIÁ', alignment: 'right', bold: true, fillColor: '#f2f2f2' },
                  { text: 'NHẬP KHO', alignment: 'center', bold: true, fillColor: '#f2f2f2' },
                  { text: 'XUẤT KHO', alignment: 'center', bold: true, fillColor: '#f2f2f2' },
                  { text: 'SP HỎNG/LỖI', alignment: 'center', bold: true, fillColor: '#f2f2f2' },
                  { text: 'TỒN KHO', alignment: 'center', bold: true, fillColor: '#f2f2f2' },
                  { text: 'GIÁ TRỊ TỒN', alignment: 'right', bold: true, fillColor: '#f2f2f2' }
                ],
                ...reportData.map((item, index) => [
                  { text: (index + 1).toString(), alignment: 'center' },
                  { text: item.warehouseName || '', alignment: 'left' },
                  { text: item.productName || '', alignment: 'left' },
                  { text: formatNumber(item.productPrice), alignment: 'right' },
                  { text: item.totalIn?.toString() || '0', alignment: 'center' },
                  { text: item.totalOut?.toString() || '0', alignment: 'center' },
                  { text: item.totalDamaged?.toString() || '0', alignment: 'center' },
                  { text: item.pendingOut?.toString() || '0', alignment: 'center' },
                  { text: formatNumber(item.pendingOutValue), alignment: 'right' }
                ]),
                [
                  { text: '', colSpan: 2 },
                  {},
                  { text: 'Tổng cộng:', bold: true },  // Bỏ border: [false, false, false, false]
                  { text: '' },
                  { text: totals.totalIn?.toString() || '0', alignment: 'center', bold: true },
                  { text: totals.totalOut?.toString() || '0', alignment: 'center', bold: true },
                  { text: totals.totalDamaged?.toString() || '0', alignment: 'center', bold: true },
                  { text: totals.pendingOut?.toString() || '0', alignment: 'center', bold: true },
                  { text: formatNumber(totals.pendingOutValue), alignment: 'right', bold: true }
                ]
              ]
            },
            layout: {
              hLineWidth: function(i, node) {
                return (i === 0 || i === 1 || i === node.table.body.length - 1) ? 1 : 0.5;
              },
              vLineWidth: function(i, node) {
                return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
              },
              hLineColor: function(i, node) {
                return (i === 0 || i === 1) ? '#aaaaaa' : '#dddddd';
              },
              vLineColor: function(i, node) {
                return '#dddddd';
              },
              fillColor: function(rowIndex, node, columnIndex) {
                return (rowIndex === 0) ? '#f2f2f2' : null;
              },
              paddingLeft: function(i, node) { return 8; },
              paddingRight: function(i, node) { return 8; },
              paddingTop: function(i, node) { return 8; },
              paddingBottom: function(i, node) { return 8; }
            }
          },
          {
            columns: [
              { width: '*', text: '' },
              {
                width: '*',
                text: `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`,
                alignment: 'center',
                margin: [0, 30, 0, 30]
              }
            ]
          },
          {
            columns: [
              {
                width: '*',
                text: [
                  { text: 'Nhân Viên Kho\n', alignment: 'center', margin: [0, 0, 0, 5] },
                  { text: '(Chữ ký, họ tên)', fontSize: 9, italics: true }
                ],
                alignment: 'center'
              },
              {
                width: '*',
                text: [
                  { text: 'Chủ Kho\n', alignment: 'center', margin: [0, 0, 0, 5] },
                  { text: '(Chữ ký, họ tên, đóng dấu)', fontSize: 9, italics: true }
                ],
                alignment: 'center'
              }
            ]
          }
        ]
      };

      pdfMake.createPdf(docDefinition).download('bao-cao-xuat-nhap-ton-kho.pdf');

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã xuất báo cáo PDF',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tạo file PDF. Vui lòng thử lại sau.',
        confirmButtonText: 'OK'
      });
    }
  };
  

  return (
    <Content>
      <div className='card'>
        <div className='card-header border-0 pt-6 d-flex justify-content-between'>
          <div className='d-flex align-items-center'>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>Báo cáo xuất nhập kho</span>
            </h3>
          </div>
          <div className='card-toolbar'>
            <button
              type='button'
              className='btn btn-light-primary'
              onClick={exportToPDF}
              disabled={loading || reportData.length === 0}
            >
              <i className='ki-duotone ki-file-down fs-2'>
                <span className='path1'></span>
                <span className='path2'></span>
              </i>
              Xuất PDF
            </button>
          </div>
        </div>

        {/* Filters Section */}
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

        {/* Statistics Cards */}
        <div className='card-body py-4'>
          <div className='row g-6 g-xl-9 mb-6'>
            <div className='col-md-6 col-xl-3'>
              <div className='card h-md-100'>
                <div className='card-body d-flex flex-column flex-center'>
                  <div className='mb-2'>
                    <i className='ki-duotone ki-arrow-down-left fs-3hx text-success'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                    </i>
                  </div>
                  <div className='fs-2hx fw-bold text-gray-800 mb-2 lh-1 ls-n1'>{totals.totalIn}</div>
                  <div className='text-gray-500 fw-semibold fs-6'>Tổng nhập kho</div>
                  <div className='text-success fw-bold fs-7 mt-1'>
                    {totals.totalInValue.toLocaleString()}đ
                  </div>
                </div>
              </div>
            </div>

            <div className='col-md-6 col-xl-3'>
              <div className='card h-md-100'>
                <div className='card-body d-flex flex-column flex-center'>
                  <div className='mb-2'>
                    <i className='ki-duotone ki-arrow-up-right fs-3hx text-danger'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                    </i>
                  </div>
                  <div className='fs-2hx fw-bold text-gray-800 mb-2 lh-1 ls-n1'>{totals.totalOut}</div>
                  <div className='text-gray-500 fw-semibold fs-6'>Tổng xuất kho</div>
                  <div className='text-danger fw-bold fs-7 mt-1'>
                    {totals.totalOutValue.toLocaleString()}đ
                  </div>
                </div>
              </div>
            </div>

            <div className='col-md-6 col-xl-3'>
              <div className='card h-md-100'>
                <div className='card-body d-flex flex-column flex-center'>
                  <div className='mb-2'>
                    <i className='ki-duotone ki-cross fs-3hx text-warning'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                    </i>
                  </div>
                  <div className='fs-2hx fw-bold text-gray-800 mb-2 lh-1 ls-n1'>{totals.totalDamaged}</div>
                  <div className='text-gray-500 fw-semibold fs-6'>SP hỏng, lỗi</div>
                  <div className='text-warning fw-bold fs-7 mt-1'>
                    {totals.totalDamagedValue.toLocaleString()}đ
                  </div>
                </div>
              </div>
            </div>

            <div className='col-md-6 col-xl-3'>
              <div className='card h-md-100'>
                <div className='card-body d-flex flex-column flex-center'>
                  <div className='mb-2'>
                    <i className='ki-duotone ki-package fs-3hx text-primary'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                      <span className='path3'></span>
                    </i>
                  </div>
                  <div className='fs-2hx fw-bold text-gray-800 mb-2 lh-1 ls-n1'>{totals.pendingOut}</div>
                  <div className='text-gray-500 fw-semibold fs-6'>Tồn kho hiện tại</div>
                  <div className='text-primary fw-bold fs-7 mt-1'>
                    {totals.pendingOutValue.toLocaleString()}đ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Table */}
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
                    <th>Kho</th>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Nhập kho</th>
                    <th>Giá trị nhập</th>
                    <th>Xuất kho</th>
                    <th>Giá trị xuất</th>
                    <th>SP hỏng/lỗi</th>
                    <th>Giá trị hỏng</th>
                    <th>Tồn kho</th>
                    <th>Giá trị tồn</th>
                  </tr>
                </thead>
                <tbody className='text-gray-600 fw-semibold'>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={12} className='text-center py-10'>
                        <div className='text-muted fs-4'>
                          Không có dữ liệu báo cáo trong khoảng thời gian đã chọn
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reportData.map((item, index) => (
                      <tr key={`${item.warehouseId}-${item.productId}`}>
                        <td>{index + 1}</td>
                        <td>
                          <div className='d-flex align-items-center'>
                            <i className='ki-duotone ki-home fs-3 text-primary me-2'></i>
                            {item.warehouseName}
                          </div>
                        </td>
                        <td>
                          <div className='fw-bold text-gray-800'>{item.productName}</div>
                        </td>
                        <td>
                          <span className='fw-bold text-primary'>
                            {item.productPrice.toLocaleString()}đ
                          </span>
                        </td>
                        <td>
                          <span className='badge badge-light-success'>{item.totalIn}</span>
                        </td>
                        <td>
                          <span className='fw-bold text-success'>
                            {item.totalInValue.toLocaleString()}đ
                          </span>
                        </td>
                        <td>
                          <span className='badge badge-light-danger'>{item.totalOut}</span>
                        </td>
                        <td>
                          <span className='fw-bold text-danger'>
                            {item.totalOutValue.toLocaleString()}đ
                          </span>
                        </td>
                        <td>
                          <span className='badge badge-light-warning'>{item.totalDamaged}</span>
                        </td>
                        <td>
                          <span className='fw-bold text-warning'>
                            {item.totalDamagedValue.toLocaleString()}đ
                          </span>
                        </td>
                        <td>
                          <span className='badge badge-light-primary'>{item.pendingOut}</span>
                        </td>
                        <td>
                          <span className='fw-bold text-primary'>
                            {item.pendingOutValue.toLocaleString()}đ
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {reportData.length > 0 && (
                  <tfoot>
                    <tr className='fw-bold border-top'>
                      <td colSpan={4}>Tổng cộng:</td>
                      <td>
                        <span className='badge badge-success'>{totals.totalIn}</span>
                      </td>
                      <td>
                        <span className='fw-bold text-success'>
                          {totals.totalInValue.toLocaleString()}đ
                        </span>
                      </td>
                      <td>
                        <span className='badge badge-danger'>{totals.totalOut}</span>
                      </td>
                      <td>
                        <span className='fw-bold text-danger'>
                          {totals.totalOutValue.toLocaleString()}đ
                        </span>
                      </td>
                      <td>
                        <span className='badge badge-warning'>{totals.totalDamaged}</span>
                      </td>
                      <td>
                        <span className='fw-bold text-warning'>
                          {totals.totalDamagedValue.toLocaleString()}đ
                        </span>
                      </td>
                      <td>
                        <span className='badge badge-primary'>{totals.pendingOut}</span>
                      </td>
                      <td>
                        <span className='fw-bold text-primary'>
                          {totals.pendingOutValue.toLocaleString()}đ
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>
        </div>
      </div>
    </Content>
  )
}

export default InventoryReport