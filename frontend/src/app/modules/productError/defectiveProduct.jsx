import { useState, useEffect } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import { KTSVG } from '../../../_metronic/helpers'
import { useNavigate } from 'react-router-dom'
import ErrorModal from '../errors/components/modalErros'


// Mock data cho sản phẩm lỗi
const mockDefectiveProducts = [
    {
        id: 'DP001',
        date: '2024-03-20',
        warehouse: 'Kho Hà Nội',
        product: 'Honda Wave Alpha',
        quantity: 2,
        reason: 'Xe bị trầy xước trong quá trình vận chuyển',
        status: 'PENDING',
        createdBy: 'Nguyễn Văn A'
    },
    {
        id: 'DP002',
        date: '2024-03-19',
        warehouse: 'Kho HCM',
        product: 'Honda Vision',
        quantity: 1,
        reason: 'Xe bị lỗi động cơ',
        status: 'APPROVED',
        createdBy: 'Trần Văn B'
    },
    {
        id: 'DP003',
        date: '2024-03-18',
        warehouse: 'Kho Hà Nội',
        product: 'Honda Air Blade',
        quantity: 3,
        reason: 'Xe bị móp trong quá trình lưu kho',
        status: 'REJECTED',
        createdBy: 'Lê Thị C'
    }
]

const DefectiveProductPage = () => {
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedWarehouse, setSelectedWarehouse] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectAll, setSelectAll] = useState(false)
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedMessage, setSelectedMessage] = useState('')
    const [selectedAction, setSelectedAction] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [defectiveProducts] = useState(mockDefectiveProducts)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [permissions, setPermissions] = useState({
        create: false,
        update: false,
        delete: false
    })

    useEffect(() => {
        // Kiểm tra vai trò admin và permissions từ localStorage
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                setIsAdmin(user.roleName === 'Admin')
                
                // Chỉ kiểm tra quyền nếu không phải admin
                if (user.roleName !== 'Admin') {
                    const permissions = user.permissions || {}
                    console.log('Permissions:', permissions)
                    
                    // Kiểm tra các loại quyền
                    const hasCreatePermission = Array.isArray(permissions.DEFECT_PRODUCTS) && 
                                            permissions.DEFECT_PRODUCTS.includes('CREATE')
                    const hasUpdatePermission = Array.isArray(permissions.DEFECT_PRODUCTS) && 
                                            permissions.DEFECT_PRODUCTS.includes('UPDATE')
                    const hasDeletePermission = Array.isArray(permissions.DEFECT_PRODUCTS) && 
                                            permissions.DEFECT_PRODUCTS.includes('DELETE')
                    
                    setPermissions({
                        create: hasCreatePermission,
                        update: hasUpdatePermission,
                        delete: hasDeletePermission
                    })
                }
            } catch (error) {
                console.error('Error parsing user data:', error)
                setIsAdmin(false)
                setPermissions({
                    create: false,
                    update: false,
                    delete: false
                })
            }
        }
    }, [])

    const getStatusClass = (status) => {
        const classes = {
            PENDING: 'badge-light-warning',
            APPROVED: 'badge-light-success',
            REJECTED: 'badge-light-danger'
        }
        return classes[status] || 'badge-light-primary'
    }

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Chờ duyệt',
            APPROVED: 'Đã duyệt',
            REJECTED: 'Từ chối'
        }
        return labels[status] || status
    }

    // Xử lý filter data
    const getFilteredData = () => {
        return defectiveProducts.filter(item => {
            if (selectedDate && item.date !== selectedDate) {
                return false
            }
            if (selectedWarehouse && item.warehouse !== selectedWarehouse) {
                return false
            }
            if (selectedStatus && item.status !== selectedStatus) {
                return false
            }
            return true
        })
    }

    // Reset filters
    const handleReset = () => {
        setSelectedDate('')
        setSelectedWarehouse('')
        setSelectedStatus('')
    }

    const navigate = useNavigate()

    // Xử lý chọn tất cả
    const handleSelectAll = (e) => {
        setSelectAll(e.target.checked)
        if (e.target.checked) {
            const allIds = defectiveProducts.map(item => item.id)
            setSelectedItems(allIds)
            setSelectedMessage(`Đã chọn ${allIds.length} sản phẩm`)
        } else {
            setSelectedItems([])
            setSelectedMessage('')
        }
    }

    // Xử lý chọn từng item
    const handleSelectItem = (id) => {
        const newSelectedItems = selectedItems.includes(id)
            ? selectedItems.filter(item => item !== id)
            : [...selectedItems, id]

        setSelectedItems(newSelectedItems)
        setSelectAll(newSelectedItems.length === defectiveProducts.length)

        if (newSelectedItems.length > 0) {
            setSelectedMessage(`Đã chọn ${newSelectedItems.length} sản phẩm`)
        } else {
            setSelectedMessage('')
        }
    }

    // Xử lý thực hiện action với kiểm tra quyền
    const handleExecuteAction = () => {
        if (!selectedAction) return;

        switch (selectedAction) {
            case 'delete':
                if (!isAdmin && !permissions.delete) {
                    setErrorMessage('Bạn không có quyền xóa sản phẩm lỗi')
                    setShowErrorModal(true)
                    return
                }
                setShowDeleteModal(true)
                break;
            default:
                break;
        }
    }

    // Xử lý xác nhận xóa
    const handleConfirmDelete = () => {
        console.log('Xóa sản phẩm:', selectedItems)
        setShowDeleteModal(false)
        setSelectedAction('')
        setSelectedItems([])
        setSelectedMessage('')
    }

    // Xử lý chuyển đến trang khai báo sản phẩm với kiểm tra quyền
    const handleNavigateToCreate = () => {
        if (!isAdmin && !permissions.create) {
            setErrorMessage('Bạn không có quyền khai báo sản phẩm lỗi')
            setShowErrorModal(true)
            return
        }
        navigate('/apps/declareProduct')
    }

    const filteredData = getFilteredData()

    return (
        <>
            <div className='d-flex flex-column gap-7'>
                <div className='px-9'>
                    <div className='card'>
                        {/* Header */}
                        <div className='card-header border-0 pt-6'>
                            <div className='card-title'>
                                <h3 className='fw-bold m-0'>Danh sách sản phẩm hỏng, lỗi</h3>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className='card-header border-0'>
                            <div className='d-flex align-items-center position-relative gap-5'>
                                <span className='fw-bold me-2'>Lọc theo:</span>
                                {/* Date Filter */}
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

                                {/* Warehouse Filter */}
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

                                {/* Status Filter */}
                                <div className='d-flex align-items-center position-relative'>
                                    <i className='ki-duotone ki-status fs-3 position-absolute ms-4'></i>
                                    <select
                                        className='form-select form-select-solid w-200px ps-12'
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        <option value=''>Tất cả trạng thái</option>
                                        <option value='PENDING'>Chờ duyệt</option>
                                        <option value='APPROVED'>Đã duyệt</option>
                                        <option value='REJECTED'>Từ chối</option>
                                    </select>
                                </div>

                                {/* Reset Button */}
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
                            {/* Hiển thị nút khai báo cho tất cả nhân viên */}
                            {!isAdmin && (
                                <div className='card-toolbar'>
                                    <div className='d-flex justify-content-end'>
                                        <button
                                            type='button'
                                            className='btn btn-primary'
                                            onClick={handleNavigateToCreate}
                                        >
                                            <i className='ki-duotone ki-plus fs-2'></i>
                                            Khai báo sản phẩm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className='card-body py-4'>
                            {/* Hiển thị thông báo số lượng đã chọn cho tất cả nhân viên */}
                            {!isAdmin && selectedItems.length > 0 && (
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

                            <div className='table-responsive'>
                                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                                    <thead>
                                        <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                                            {/* Hiển thị checkbox cho tất cả nhân viên */}
                                            {!isAdmin && (
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
                                            <th>ID</th>
                                            <th>Ngày khai báo</th>
                                            <th>Kho</th>
                                            <th>Sản phẩm</th>
                                            <th>Số lượng</th>
                                            <th>Nguyên nhân</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-gray-600 fw-semibold'>
                                        {filteredData.map((item) => (
                                            <tr key={item.id}>
                                                {/* Hiển thị checkbox cho tất cả nhân viên */}
                                                {!isAdmin && (
                                                    <td>
                                                        <div className='form-check form-check-sm form-check-custom form-check-solid'>
                                                            <input
                                                                className='form-check-input'
                                                                type='checkbox'
                                                                checked={selectedItems.includes(item.id)}
                                                                onChange={() => handleSelectItem(item.id)}
                                                            />
                                                        </div>
                                                    </td>
                                                )}
                                                <td>{item.id}</td>
                                                <td>{item.date}</td>
                                                <td>{item.warehouse}</td>
                                                <td>{item.product}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.reason}</td>
                                                <td>
                                                    <span className={`badge ${getStatusClass(item.status)}`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                    <h5 className='modal-title'>Xóa sản phẩm</h5>
                                    <button
                                        type='button'
                                        className='btn-close'
                                        onClick={() => setShowDeleteModal(false)}
                                    ></button>
                                </div>
                                <div className='modal-body'>
                                    <p>Bạn có chắc chắn muốn xóa những sản phẩm này? Thao tác này không thể khôi phục.</p>
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

                {/* Style cho animation */}
                <style>{`
                    @keyframes modal-fade-in {
                        from { opacity: 0; transform: translateY(-60px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                {/* Error Modal */}
                <ErrorModal
                    show={showErrorModal}
                    onHide={() => setShowErrorModal(false)}
                    message={errorMessage}
                />
            </div>
        </>
    )
}

export default DefectiveProductPage