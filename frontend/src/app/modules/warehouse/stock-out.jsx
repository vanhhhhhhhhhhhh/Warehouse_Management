import { useState, useEffect } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import { KTSVG } from '../../../_metronic/helpers'
import { useNavigate } from 'react-router-dom'

// Mock data dựa trên cấu trúc DB
const stockImports = [
    {
        _id: 'NK000024',
        code: 'NK000024',
        wareId: {
            _id: 'WH001',
            name: 'Kho Hà Nội',
            address: '123 Láng Hạ, Đống Đa, Hà Nội'
        },
        adminId: {
            _id: 'AD001',
            username: 'admin1',
            phone: '0987654321'
        },
        importDate: '2024-01-21T09:47:00',
        items: [
            {
                proId: {
                    _id: 'P001',
                    name: 'Honda Wave Alpha',
                    code: 'WAVE-ALPHA',
                    price: 10000000
                },
                quantity: 10,
                unitPrice: 9500000
            }
        ]
    },
    {
        _id: 'NK000023',
        code: 'NK000023',
        wareId: {
            _id: 'WH002',
            name: 'Kho HCM',
            address: '456 CMT8, Q.3, TP.HCM'
        },
        adminId: {
            _id: 'AD002',
            username: 'admin2',
            phone: '0987654322'
        },
        importDate: '2024-01-21T08:30:00',
        items: [
            {
                proId: {
                    _id: 'P002',
                    name: 'Honda Vision',
                    code: 'VISION',
                    price: 31000000
                },
                quantity: 5,
                unitPrice: 29000000
            }
        ]
    }
]

const StockInPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRecords, setSelectedRecords] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState('')
    const [selectedAction, setSelectedAction] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSelectAll = (e) => {
        setSelectAll(e.target.checked)
        if (e.target.checked) {
            const allIds = stockImports.map(record => record._id)
            setSelectedRecords(allIds)
            setSelectedMessage(`Đã chọn ${allIds.length} phiếu nhập`)
        } else {
            setSelectedRecords([])
            setSelectedMessage('')
        }
    }

    const handleSelectRecord = (recordId) => {
        const newSelectedRecords = selectedRecords.includes(recordId)
            ? selectedRecords.filter(id => id !== recordId)
            : [...selectedRecords, recordId]

        setSelectedRecords(newSelectedRecords)
        setSelectAll(newSelectedRecords.length === stockImports.length)

        if (newSelectedRecords.length > 0) {
            setSelectedMessage(`Đã chọn ${newSelectedRecords.length} phiếu nhập`)
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

    const handleConfirmDelete = () => {
        // Xử lý xóa phiếu nhập
        setShowDeleteModal(false)
        setSelectedAction('')
        setSelectedRecords([])
        setSelectedMessage('')
        setSelectAll(false)
    }

    const calculateTotalValue = (items) => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN')
    }

    const filteredRecords = stockImports.filter(record =>
        record.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.wareId.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            <div className='d-flex flex-column gap-7'>
                <div className='px-9'>
                    <div className='card'>
                        <div className='card-header border-0 pt-6 d-flex justify-content-between'>
                            <div className='card-title'>
                                <h3 className='fw-bold'>Danh sách phiếu xuất kho</h3>
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
                                        className='form-control form-control-solid w-300px ps-14'
                                        placeholder='Tìm kiếm theo Mã phiếu hoặc Kho'
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
                                        onClick={() => navigate('/apps/stockOut/create')}
                                    >
                                        <i className='ki-duotone ki-plus fs-2'></i>
                                        Thêm phiếu xuất
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Card body */}
                        <div className='card-body py-4'>
                            {selectedRecords.length > 0 && (
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
                                            <option value="delete">Xóa các phiếu đã chọn</option>
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
                            ) : filteredRecords.length === 0 ? (
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
                                            <th className='min-w-100px text-black'>Thời gian nhập</th>
                                            <th className='min-w-100px text-black'>Mã phiếu</th>
                                            <th className='min-w-150px text-black'>Kho xuất</th>
                                            <th className='min-w-100px text-black'>Người tạo</th>
                                            <th className='min-w-100px text-black'>Số lượng SP</th>
                                            <th className='min-w-100px text-black'>Tổng giá trị</th>
                                            <th className='min-w-100px text-black'>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-gray-600 fw-semibold'>
                                        <tr>
                                            <td colSpan={8} className='text-center py-5'>
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
                                            <th className='min-w-100px text-black'>Thời gian nhập</th>
                                            <th className='min-w-100px text-black'>Mã phiếu</th>
                                            <th className='min-w-150px text-black'>Kho xuất</th>
                                            <th className='min-w-100px text-black'>Người tạo</th>
                                            <th className='min-w-100px text-black'>Số lượng SP</th>
                                            <th className='min-w-100px text-black'>Tổng giá trị</th>
                                            <th className='min-w-100px text-black'>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-gray-600 fw-semibold'>
                                        {filteredRecords.map((record) => (
                                            <tr key={record._id}>
                                                <td>
                                                    <div className='form-check form-check-sm form-check-custom form-check-solid'>
                                                        <input
                                                            className='form-check-input'
                                                            type='checkbox'
                                                            checked={selectedRecords.includes(record._id)}
                                                            onChange={() => handleSelectRecord(record._id)}
                                                        />
                                                    </div>
                                                </td>
                                                <td>{formatDate(record.importDate)}</td>
                                                <td>{record.code}</td>
                                                <td>
                                                    <div className='d-flex flex-column'>
                                                        <span className='text-gray-800 fw-bold'>{record.wareId.name}</span>
                                                        <span className='text-gray-600 fs-7'>{record.wareId.address}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className='d-flex flex-column'>
                                                        <span className='text-gray-800'>{record.adminId.username}</span>
                                                        <span className='text-gray-600 fs-7'>{record.adminId.phone}</span>
                                                    </div>
                                                </td>
                                                <td>{record.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                                <td>{calculateTotalValue(record.items).toLocaleString()}đ</td>
                                                <td>
                                                    <button
                                                        className='btn btn-icon btn-bg-light btn-active-color-success btn-sm ms-5'
                                                        onClick={() => navigate(`/apps/warehouse/stock-in/print/${record._id}`)}
                                                    >
                                                        <i className='fas fa-print'></i>
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
                                <h5 className='modal-title'>Xóa phiếu xuất</h5>
                                <button
                                    type='button'
                                    className='btn-close'
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <p>Bạn có chắc chắn muốn xóa những phiếu xuất này? Thao tác này không thể khôi phục.</p>
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

export default StockInPage
