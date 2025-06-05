import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { KTSVG } from '../../../_metronic/helpers'
import axios from 'axios'
import { API_URL, getAxiosConfig } from '../../config/api.config'

const EmployeeRolePage = () => {
    const navigate = useNavigate()
    const [roles, setRoles] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectAll, setSelectAll] = useState(false)
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedMessage, setSelectedMessage] = useState('')
    const [selectedAction, setSelectedAction] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedRole, setSelectedRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const token = localStorage.getItem('token')
            if (!token) {
                setError('Vui lòng đăng nhập để tiếp tục')
                navigate('/auth/login')
                return
            }
            
            const response = await axios.get(API_URL.ROLES.LIST, getAxiosConfig())
            
            if (Array.isArray(response.data)) {
                setRoles(response.data)
            } else {
                setError('Định dạng dữ liệu không hợp lệ')
            }
        } catch (err) {
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.response?.headers,
                config: err.config
            })
            
            if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
                navigate('/auth/login')
            } else if (err.response?.status === 404) {
                setError('Không tìm thấy API endpoint. Vui lòng kiểm tra cấu hình server.')
            } else {
                setError(`Không thể tải danh sách vai trò. Lỗi: ${err.response?.data?.message || err.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

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

    const handleConfirmDelete = async () => {
        try {
            await Promise.all(selectedItems.map(id => 
                axios.delete(`${API_URL.ROLES.BASE}/${id}`, getAxiosConfig())
            ))
            await fetchRoles() // Refresh the list after deletion
            setShowDeleteModal(false)
            setSelectedAction('')
            setSelectedItems([])
            setSelectedMessage('')
            setSelectAll(false)
        } catch (err) {
            console.error('Error deleting roles:', err)
            setError('Không thể xóa vai trò. Vui lòng thử lại sau.')
        }
    }

    const handleViewDetail = (role) => {
        setSelectedRole(role)
        setShowDetailModal(true)
    }

    const renderPermissionDetail = (permissions) => {
        return Object.entries(permissions)
            .filter(([_, perms]) => {
                // Chỉ hiển thị category có quyền
                if (Array.isArray(perms)) {
                    return perms.length > 0;
                }
                return Object.keys(perms).length > 0;
            })
            .map(([category, perms]) => (
                <div key={category} className='mb-4'>
                    <h6 className='fw-bold mb-2'>{category}</h6>
                    <div className='d-flex flex-wrap gap-2'>
                        {Array.isArray(perms) ? (
                            // Nếu là mảng các quyền
                            perms.map((perm, index) => (
                                <span key={index} className='badge badge-light-primary'>
                                    {perm}
                                </span>
                            ))
                        ) : (
                            // Nếu là object chứa các quyền
                            Object.entries(perms)
                                .filter(([_, value]) => value) // Chỉ lấy những quyền có giá trị true
                                .map(([key, _]) => (
                                    <span key={key} className='badge badge-light-primary'>
                                        {key}
                                    </span>
                                ))
                        )}
                    </div>
                </div>
            ))
    }

    if (loading) {
        return (
            <div className='d-flex justify-content-center align-items-center min-h-300px'>
                <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Đang tải...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='alert alert-danger'>
                {error}
            </div>
        )
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
                                        <th className='min-w-100px text-end'>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className='text-gray-600 fw-semibold'>
                                    {roles.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className='text-center'>
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
                                                    <td className='text-end'>
                                                        <button
                                                            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-2'
                                                            onClick={() => handleViewDetail(role)}
                                                            title='Xem chi tiết'
                                                        >
                                                            <i className='fas fa-info-circle'></i>
                                                        </button>
                                                        <button
                                                            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                                                            onClick={() => navigate(`/apps/role/edit/${role._id}`)}
                                                            title='Chỉnh sửa'
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

            {/* Modal Chi tiết vai trò */}
            {showDetailModal && selectedRole && (
                <div
                    className='modal fade show d-block'
                    tabIndex={-1}
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    <div
                        className='modal-dialog modal-lg modal-dialog-centered'
                        style={{
                            opacity: 1,
                            transform: 'translateY(0)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h4 className='modal-title'>Chi tiết vai trò: {selectedRole.name}</h4>
                                <button
                                    type='button'
                                    className='btn-close'
                                    onClick={() => setShowDetailModal(false)}
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <div className='mb-4'>
                                    <h5 className='fw-bold mb-2'>Thông tin chung</h5>
                                    <div className='table-responsive'>
                                        <table className='table table-borderless'>
                                            <tbody>
                                                <tr>
                                                    <td className='fw-bold'>Tên vai trò:</td>
                                                    <td>{selectedRole.name}</td>
                                                </tr>
                                                <tr>
                                                    <td className='fw-bold'>Ngày tạo:</td>
                                                    <td>{new Date(selectedRole.createdAt).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className='fw-bold'>Cập nhật lần cuối:</td>
                                                    <td>{new Date(selectedRole.updatedAt).toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div>
                                    <h5 className='fw-bold mb-3'>Danh sách quyền hạn</h5>
                                    {renderPermissionDetail(selectedRole.permissions)}
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Đóng
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