import { useState } from 'react'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'

const StockOutHistory = () => {
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedWarehouse, setSelectedWarehouse] = useState('')
    const [selectedReason, setSelectedReason] = useState('')

    // Mock data - sẽ được thay thế bằng API call
    const historyData = [
        {
            id: '1',
            date: '2024-03-20',
            warehouse: 'Kho Hà Nội',
            reason: 'SALE',
            createdBy: 'Nguyễn Văn A',
            products: [
                { name: 'Honda Wave Alpha', quantity: 2 },
                { name: 'Honda Vision', quantity: 1 }
            ],
        },

        {
            id: '1',
            date: '2024-03-20',
            warehouse: 'Kho Hà Nội',
            reason: 'SALE',
            createdBy: 'Nguyễn Mạnh Huy',
            products: [
                { name: 'Honda Vision', quantity: 2 },
            ],
        },
        
        {
            id: '1',
            date: '2024-03-20',
            warehouse: 'Kho HCM',
            reason: 'SALE',
            createdBy: 'Hoàng Anh Quân',
            products: [
                { name: 'Honda Wave Alpha', quantity: 2 },
                { name: 'Honda Vision', quantity: 1 }
            ],
        },
    ]

    const reasonLabels = {
        SALE: 'Xuất hàng đi',
        TRANSFER: 'Chuyển kho',
        STOCK_ERROR: 'Nhập kho sai'
    }

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

            return true
        })
    }

    // Lấy dữ liệu đã filter
    const filteredData = getFilteredData()

    // Reset filters
    const handleReset = () => {
        setSelectedDate('')
        setSelectedWarehouse('')
    }

    return (
        <Content>
            <div className='card'>
                <div className='card-header border-0 pt-6 d-flex justify-content-between'>
                    <div className='d-flex align-items-center'>
                        <h3 className='card-title align-items-start flex-column'>
                            <span className='card-label fw-bold fs-3 mb-1'>Lịch sử xuất kho</span>
                        </h3>
                    </div>
                </div>
                {/* Search/Filter Section */}
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
                            <i className='ki-duotone ki-home fs-3 position-absolute ms-4'>
                                <span className='path1'></span>
                                <span className='path2'></span>
                            </i>
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
                                    <th>Lý do xuất</th>
                                    <th>Người xuất kho</th>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                </tr>
                            </thead>
                            <tbody className='text-gray-600 fw-semibold'>
                                {filteredData.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.date}</td>
                                        <td>{item.warehouse}</td>
                                        <td>
                                            <span className='badge badge-light-primary'>
                                                {reasonLabels[item.reason]}
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

export default StockOutHistory
