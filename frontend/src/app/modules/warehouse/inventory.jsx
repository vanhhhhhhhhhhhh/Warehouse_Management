import { useState } from 'react'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'

const StockOverview = () => {
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedWarehouse, setSelectedWarehouse] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // Mock data với nhiều sản phẩm và đa dạng các trường
    const stockData = [
        {
            id: '1',
            name: 'Honda Wave Alpha',
            category: 'xe-so',
            warehouseId: 'hanoi',
            totalImport: 100,
            totalExport: 30,
            totalDamaged: 2,
            currentStock: 68,
            originalPrice: 18800000,
            lastUpdated: '2024-03-20'
        },
        {
            id: '2',
            name: 'Honda Vision',
            category: 'xe-ga',
            warehouseId: 'hanoi',
            totalImport: 80,
            totalExport: 45,
            totalDamaged: 1,
            currentStock: 34,
            originalPrice: 31000000,
            lastUpdated: '2024-03-20'
        },
        {
            id: '3',
            name: 'Honda Air Blade',
            category: 'xe-ga',
            warehouseId: 'hcm',
            totalImport: 60,
            totalExport: 25,
            totalDamaged: 0,
            currentStock: 35,
            originalPrice: 42000000,
            lastUpdated: '2024-03-19'
        },
        {
            id: '4',
            name: 'Honda Winner X',
            category: 'xe-con-tay',
            warehouseId: 'hcm',
            totalImport: 40,
            totalExport: 20,
            totalDamaged: 1,
            currentStock: 19,
            originalPrice: 46000000,
            lastUpdated: '2024-03-19'
        },
        {
            id: '5',
            name: 'Honda Future',
            category: 'xe-so',
            warehouseId: 'hanoi',
            totalImport: 70,
            totalExport: 35,
            totalDamaged: 0,
            currentStock: 35,
            originalPrice: 32000000,
            lastUpdated: '2024-03-18'
        },
        {
            id: '6',
            name: 'Honda SH Mode',
            category: 'xe-ga',
            warehouseId: 'hcm',
            totalImport: 50,
            totalExport: 28,
            totalDamaged: 2,
            currentStock: 20,
            originalPrice: 63000000,
            lastUpdated: '2024-03-18'
        }
    ]

    // Xử lý filter data
    const getFilteredData = () => {
        return stockData.filter(item => {
            // Filter theo thời gian
            if (selectedDate && item.lastUpdated !== selectedDate) {
                return false
            }

            // Filter theo kho
            if (selectedWarehouse && item.warehouseId !== selectedWarehouse) {
                return false
            }

            // Filter theo danh mục
            if (selectedCategory && item.category !== selectedCategory) {
                return false
            }

            // Filter theo search term
            if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false
            }

            return true
        })
    }

    // Lấy dữ liệu đã filter
    const filteredData = getFilteredData()

    // Tính toán tổng số dựa trên dữ liệu đã filter
    const totals = {
        totalImport: filteredData.reduce((sum, item) => sum + item.totalImport, 0),
        totalExport: filteredData.reduce((sum, item) => sum + item.totalExport, 0),
        totalDamaged: filteredData.reduce((sum, item) => sum + item.totalDamaged, 0),
        totalStock: filteredData.reduce((sum, item) => sum + item.currentStock, 0),
        totalValue: filteredData.reduce((sum, item) => sum + (item.currentStock * item.originalPrice), 0)
    }

    // Các hằng số cho labels
    const categoryLabels = {
        'xe-so': 'Xe số',
        'xe-ga': 'Xe ga',
        'xe-con-tay': 'Xe côn tay'
    }

    const warehouseLabels = {
        'hanoi': 'Kho Hà Nội',
        'hcm': 'Kho HCM'
    }

    // Reset filters
    const handleReset = () => {
        setSelectedDate('')
        setSelectedWarehouse('')
        setSelectedCategory('')
        setSearchTerm('')
    }

    return (
        <Content>
            <div className='card'>
                <div className='card-header border-0 pt-6 d-flex justify-content-between'>
                    <div className='d-flex align-items-center'>
                        <h3 className='card-title align-items-start flex-column'>
                            <span className='card-label fw-bold fs-3 mb-1'>Danh sách tồn kho</span>
                        </h3>
                    </div>
                </div>

                <div className='card-toolbar ms-10'>
                    <div className='d-flex align-items-center position-relative gap-5'>
                    <span className='fw-bold me-2'>Lọc theo:</span>
                        {/* Filter Thời gian */}
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

                        {/* Filter Kho */}
                        <div className='d-flex align-items-center position-relative'>
                            <i className='ki-duotone ki-home fs-3 position-absolute ms-4'></i>
                            <select
                                className='form-select form-select-solid w-200px ps-12'
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                data-control='select2'
                                data-hide-search='true'
                            >
                                <option value=''>Tất cả kho</option>
                                <option value='hanoi'>Kho Hà Nội</option>
                                <option value='hcm'>Kho HCM</option>
                            </select>
                        </div>

                        {/* Filter Danh mục */}
                        <div className='d-flex align-items-center position-relative'>
                            <i className='ki-duotone ki-category fs-3 position-absolute ms-4'></i>
                            <select
                                className='form-select form-select-solid w-200px ps-12'
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                data-control='select2'
                                data-hide-search='true'
                            >
                                <option value=''>Tất cả danh mục</option>
                                <option value='xe-so'>Xe số</option>
                                <option value='xe-ga'>Xe ga</option>
                                <option value='xe-con-tay'>Xe côn tay</option>
                            </select>
                        </div>

                        {/* Reset Filters Button */}
                        <button
                            type='button'
                            className='btn btn-light-primary'
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

                {/* Statistics Cards - Using filtered data */}
                <div className='card-body py-4'>
                    <div className='row g-6 g-xl-9 mb-8'>
                        <div className='col-md-6 col-lg-3'>
                            <div className='card h-100'>
                                <div className='card-body d-flex flex-column p-9'>
                                    <div className='fs-2hx fw-bold text-primary mb-2'>
                                        {totals.totalImport}
                                    </div>
                                    <div className='fs-4 fw-semibold text-gray-400'>Tổng số nhập</div>
                                </div>
                            </div>
                        </div>

                        <div className='col-md-6 col-lg-3'>
                            <div className='card h-100'>
                                <div className='card-body d-flex flex-column p-9'>
                                    <div className='fs-2hx fw-bold text-success mb-2'>
                                        {totals.totalExport}
                                    </div>
                                    <div className='fs-4 fw-semibold text-gray-400'>Tổng số xuất</div>
                                </div>
                            </div>
                        </div>

                        <div className='col-md-6 col-lg-3'>
                            <div className='card h-100'>
                                <div className='card-body d-flex flex-column p-9'>
                                    <div className='fs-2hx fw-bold text-danger mb-2'>
                                        {totals.totalDamaged}
                                    </div>
                                    <div className='fs-4 fw-semibold text-gray-400'>Tổng số hỏng</div>
                                </div>
                            </div>
                        </div>

                        <div className='col-md-6 col-lg-3'>
                            <div className='card h-100'>
                                <div className='card-body d-flex flex-column p-9'>
                                    <div className='fs-2hx fw-bold text-dark mb-2'>
                                        {totals.totalStock}
                                    </div>
                                    <div className='fs-4 fw-semibold text-gray-400'>Tổng số tồn kho</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Value Alert */}
                    <div className='alert alert-primary d-flex align-items-center p-5 mb-8'>
                        <i className='ki-duotone ki-information-5 fs-2qx text-primary me-4'></i>
                        <div className='d-flex flex-column'>
                            <span className='fs-4 fw-semibold text-primary'>
                                Tổng giá trị tồn kho: {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(totals.totalValue)}
                            </span>
                            <span className='fs-6 text-gray-600'>(Tính theo giá gốc)</span>
                        </div>
                    </div>

                    {/* Table - Using filtered data */}
                    <div className='table-responsive'>
                        <table className='table align-middle table-row-dashed fs-6 gy-5'>
                            <thead>
                                <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                                    <th>Sản phẩm</th>
                                    <th className='text-end'>Số lượng nhập</th>
                                    <th className='text-end'>Số lượng xuất</th>
                                    <th className='text-end'>Số lượng hỏng</th>
                                    <th className='text-end'>Tồn kho</th>
                                    <th className='text-end'>Giá trị tồn</th>
                                </tr>
                            </thead>
                            <tbody className='text-gray-600 fw-semibold'>
                                {filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td className='text-end'>{item.totalImport}</td>
                                        <td className='text-end'>{item.totalExport}</td>
                                        <td className='text-end'>{item.totalDamaged}</td>
                                        <td className='text-end'>{item.currentStock}</td>
                                        <td className='text-end'>
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(item.currentStock * item.originalPrice)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Content>
    )
}

export default StockOverview
