import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { KTSVG } from '../../../_metronic/helpers'

// Dữ liệu mẫu
const FAKE_ROLES = [
    {
        _id: '1',
        name: 'Quản lý kho',
        status: 'Active'
    },
    {
        _id: '2',
        name: 'Nhân viên bán hàng',
        status: 'Active'
    },
    {
        _id: '3',
        name: 'Kế toán',
        status: 'Inactive'
    },
    {
        _id: '4',
        name: 'Nhân viên giao hàng',
        status: 'Active'
    },
    {
        _id: '5',
        name: 'Chăm sóc khách hàng',
        status: 'Active'
    }
]

const EmployeeRolePage = () => {
    const navigate = useNavigate()
    const [roles, setRoles] = useState(FAKE_ROLES)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectAll, setSelectAll] = useState(false)
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedMessage, setSelectedMessage] = useState('')
    const [selectedAction, setSelectedAction] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleSelectAll = (e) => {
        setSelectAll(e.target.checked)
        if (e.target.checked) {
            const allIds = roles.map(role => role._id)
            setSelectedItems(allIds)
            setSelectedMessage(`Đã chọn ${allIds.length} vai trò`)
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
        setSelectAll(newSelectedItems.length === roles.length)

        if (newSelectedItems.length > 0) {
            setSelectedMessage(`Đã chọn ${newSelectedItems.length} vai trò`)
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
        const newRoles = roles.filter(role => !selectedItems.includes(role._id))
        setRoles(newRoles)
        setShowDeleteModal(false)
        setSelectedAction('')
        setSelectedItems([])
        setSelectedMessage('')
        setSelectAll(false)
    }

    return (
        <>
            <div className='d-flex flex-column gap-7'>
                <div className='px-9'>
                    <div className='card'>
                        {/* Card header */}
                        <div className='card-header border-0 pt-6'>
                            <div className='card-title'>
                                <h3 className='fw-bold'>Vai trò nhân viên</h3>
                            </div>
                        </div>

                        {/* Search and Add */}
                        <div className='card-header border-0 pt-6'>
                            <div className='card-title'>
                                {/* Search */}
                                <div className='d-flex align-items-center position-relative my-1'>
                                    <KTSVG
                                        path='/media/icons/duotune/general/gen021.svg'
                                        className='svg-icon-1 position-absolute ms-6'
                                    />
                                    <input
                                        type='text'
                                        className='form-control form-control-solid w-250px ps-14'
                                        placeholder='Tìm kiếm vai trò'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className='card-toolbar'>
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={() => navigate('/apps/role/create')}
                                >
                                    <i className='ki-duotone ki-plus fs-2' />
                                    Thêm vai trò
                                </button>
                            </div>
                        </div>

                        {/* Selected items actions */}
                        {selectedItems.length > 0 && (
                            <div className='card-header border-0 pt-6'>
                                <div className='d-flex align-items-center'>
                                    <KTSVG
                                        path='/media/icons/duotune/general/gen043.svg'
                                        className='svg-icon-2 me-2 text-primary'
                                    />
                                    <span className='text-gray-600 me-5'>{selectedMessage}</span>
                                    <select
                                        className='form-select form-select-sm me-2'
                                        style={{ width: '180px' }}
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

                        {/* Card Body */}
                        <div className='card-body py-4'>
                            {/* Table */}
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
                                        <th className='min-w-125px'>Tên vai trò</th>
                                        <th className='min-w-125px'>Trạng thái</th>
                                        <th className='min-w-125px text-end'>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className='text-gray-600 fw-semibold'>
                                    {roles.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className='text-center'>
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    ) : (
                                        roles
                                            .filter((role) =>
                                                role.name.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map((role) => (
                                                <tr key={role._id}>
                                                    <td>
                                                        <div className='form-check form-check-sm form-check-custom form-check-solid'>
                                                            <input
                                                                className='form-check-input'
                                                                type='checkbox'
                                                                checked={selectedItems.includes(role._id)}
                                                                onChange={() => handleSelectItem(role._id)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>{role.name}</td>
                                                    <td>
                                                        <span className={`badge badge-light-${role.status === 'Active' ? 'success' : 'danger'}`}>
                                                            {role.status}
                                                        </span>
                                                    </td>
                                                    <td className='text-end'>
                                                        <button
                                                            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-4'
                                                            onClick={() => navigate(`/apps/role/edit/${role._id}`)}
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
                                <h5 className='modal-title'>Xóa vai trò</h5>
                                <button
                                    type='button'
                                    className='btn-close'
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <p>Bạn có chắc chắn muốn xóa những vai trò này? Thao tác này không thể khôi phục.</p>
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

export default EmployeeRolePage