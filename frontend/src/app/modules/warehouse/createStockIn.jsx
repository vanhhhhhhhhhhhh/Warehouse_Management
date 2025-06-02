import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { KTSVG } from '../../../_metronic/helpers'

// Mock data cho sản phẩm
const mockProducts = [
    {
        id: '1',
        name: '3 SỐ',
        code: '3SO',
        price: 0,
        unit: 'Thùng'
    },
    {
        id: '2',
        name: 'JET',
        code: 'JET',
        price: 0,
        unit: 'Thùng'
    },
    {
        id: '3',
        name: 'SHISHA',
        code: 'SHISHA',
        price: 0,
        unit: 'Thùng'
    },
    {
        id: '4',
        name: 'TIGER',
        code: 'TIGER',
        price: 0,
        unit: 'Thùng'
    },
    {
        id: '5',
        name: 'HEINIKEN',
        code: 'HEINIKEN',
        price: 0,
        unit: 'Thùng'
    },
    {
        id: '6',
        name: 'BIA SÀI GÒN',
        code: 'BSG',
        price: 0,
        unit: 'Thùng'
    }
]

// Mock data cho kho
const mockWarehouses = [
    {
        id: '1',
        name: 'Kho Hà Nội',
        address: '123 Đường Láng, Đống Đa, Hà Nội'
    },
    {
        id: '2', 
        name: 'Kho Hồ Chí Minh',
        address: '456 Điện Biên Phủ, Quận 3, TP.HCM'
    },
    {
        id: '3',
        name: 'Kho Đà Nẵng',
        address: '789 Ngô Quyền, Sơn Trà, Đà Nẵng'
    }
]

const CreateStockInPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        type: 'Nhập hàng',
        code: '',
        name: '',
        warehouseId: '',
        file: null,
        items: [],
        note: '',
        isPaid: false
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [showProductModal, setShowProductModal] = useState(false)
    const [selectedProductIds, setSelectedProductIds] = useState([])
    const [modalSearchTerm, setModalSearchTerm] = useState('')

    const handleGoBack = () => {
        navigate('/apps/stockIn')
    }

    const handleSubmit = (saveAndImport = false) => {
        // Xử lý submit form
        console.log('Form data:', formData)
        if (saveAndImport) {
            // Lưu và nhập kho
        } else {
            // Chỉ lưu
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({
                ...prev,
                file: file
            }))
        }
    }

    const handleSearch = () => {
        setShowProductModal(true)
    }

    const handleSelectProduct = (productId) => {
        setSelectedProductIds(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId)
            } else {
                return [...prev, productId]
            }
        })
    }

    const handleAddProducts = () => {
        const selectedProducts = mockProducts
            .filter(product => selectedProductIds.includes(product.id))
            .map(product => ({
                ...product,
                quantity: 1
            }))

        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                ...selectedProducts.filter(newProduct => 
                    !prev.items.some(existingProduct => existingProduct.id === newProduct.id)
                )
            ]
        }))
        setShowProductModal(false)
        setSelectedProductIds([])
        setModalSearchTerm('')
    }

    const filteredModalProducts = mockProducts.filter(product =>
        product.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(modalSearchTerm.toLowerCase())
    )

    return (
        <>
            <div className='d-flex flex-column gap-7'>
                <div className='px-9'>
                    <Link
                        to='/apps/stockIn'
                        className='fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center'
                    >
                        <i className='bi bi-arrow-left fs-2 me-2'></i>
                        Quay lại danh sách phiếu nhập kho
                    </Link>
                </div>

                <div className='px-9'>
                    <div className='card'>
                        <div className='card-header border-0 pt-6'>
                            <div className='card-title'>
                                <h3 className='fw-bold'>Thêm mới phiếu nhập</h3>
                            </div>
                        </div>

                        <div className='card-body'>
                            {/* Form content */}
                            <div className='row mb-6'>
                                <div className='col-md-6'>
                                    <label className='form-label required'>Mã phiếu</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        placeholder='Mã sinh tự động nếu để trống'
                                        value={formData.code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                    />
                                </div>
                                <div className='col-md-6'>
                                    <label className='form-label required'>Tên phiếu</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        placeholder='Nhập tên phiếu'
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className='row mb-6'>
                                <div className='col-md-12'>
                                    <label className='form-label required'>Chọn kho</label>
                                    <select 
                                        className='form-select'
                                        value={formData.warehouseId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, warehouseId: e.target.value }))}
                                    >
                                        <option value=''>Chọn kho nhập hàng</option>
                                        {mockWarehouses.map(warehouse => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name} - {warehouse.address}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Thông tin mặt hàng */}
                            <div className='separator separator-dashed my-8'></div>
                            <h3 className='card-title align-items-start flex-column mb-5'>
                                <span className='card-label fw-bold fs-3 mb-1'>Thông tin sản phẩm</span>
                            </h3>

                            <div className='row mb-6'>
                                <div className='col-md-12'>
                                    <div className='input-group mb-5'>
                                        <input
                                            type='text'
                                            className='form-control'
                                            placeholder='Tìm sản phẩm'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button
                                            className='btn btn-primary'
                                            type='button'
                                            onClick={handleSearch}
                                        >
                                            <KTSVG path='/media/icons/duotune/general/gen021.svg' className='svg-icon-2' />
                                            Tìm kiếm
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bảng sản phẩm đã chọn */}
                            <div className='table-responsive'>
                                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                                    <thead>
                                        <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                                            <th>Tên sản phẩm</th>
                                            <th>Đơn vị</th>
                                            <th>Đơn giá (VNĐ)</th>
                                            <th>Số lượng</th>
                                            <th>Thành tiền (VNĐ)</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className='text-center py-5'>
                                                    <div className='text-muted'>Chưa có sản phẩm nào được chọn</div>
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.items.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{item.name}</td>
                                                    <td>{item.unit}</td>
                                                    <td>
                                                        <input
                                                            type='number'
                                                            className='form-control form-control-sm w-100px'
                                                            value={item.price}
                                                            onChange={(e) => {
                                                                const newItems = [...formData.items]
                                                                newItems[index].price = Number(e.target.value)
                                                                setFormData(prev => ({ ...prev, items: newItems }))
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='number'
                                                            className='form-control form-control-sm w-100px'
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const newItems = [...formData.items]
                                                                newItems[index].quantity = Number(e.target.value)
                                                                setFormData(prev => ({ ...prev, items: newItems }))
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{(item.price * item.quantity).toLocaleString()}đ</td>
                                                    <td>
                                                        <button
                                                            type='button'
                                                            className='btn btn-icon btn-sm btn-light-danger'
                                                            onClick={() => {
                                                                const newItems = formData.items.filter((_, i) => i !== index)
                                                                setFormData(prev => ({ ...prev, items: newItems }))
                                                            }}
                                                        >
                                                            <i className='fas fa-times'></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Buttons */}
                            <div className='d-flex justify-content-end gap-2'>
                                <button
                                    type='button'
                                    className='btn btn-light'
                                    onClick={() => navigate('/apps/stockIn')}
                                >
                                    Hủy
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={() => handleSubmit(true)}
                                >
                                    Nhập kho
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal chọn sản phẩm */}
            {showProductModal && (
                <div className='modal fade show d-block' tabIndex='-1' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog modal-dialog-centered modal-lg'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Chọn nguyên liệu, mặt hàng</h5>
                                <button
                                    type='button'
                                    className='btn-close'
                                    onClick={() => {
                                        setShowProductModal(false)
                                        setSelectedProductIds([])
                                        setModalSearchTerm('')
                                    }}
                                ></button>
                            </div>
                            <div className='modal-body'>
                                {/* Search box */}
                                <div className='mb-5'>
                                    <div className='input-group'>
                                        <span className='input-group-text'>
                                            <KTSVG path='/media/icons/duotune/general/gen021.svg' className='svg-icon-2' />
                                        </span>
                                        <input
                                            type='text'
                                            className='form-control'
                                            placeholder='Tìm kiếm theo tên'
                                            value={modalSearchTerm}
                                            onChange={(e) => setModalSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Product list */}
                                <div className='table-responsive' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table className='table align-middle table-row-dashed fs-6 gy-5'>
                                        <thead className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                                            <tr>
                                                <th className='w-35px'></th>
                                                <th>Mặt hàng</th>
                                                <th>Đơn giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredModalProducts.map((product) => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <div className='form-check form-check-sm form-check-custom form-check-solid'>
                                                            <input
                                                                className='form-check-input'
                                                                type='checkbox'
                                                                checked={selectedProductIds.includes(product.id)}
                                                                onChange={() => handleSelectProduct(product.id)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='d-flex flex-column'>
                                                            <span className='text-gray-800 fw-bold'>{product.name}</span>
                                                            <span className='text-gray-600'>{product.code}</span>
                                                        </div>
                                                    </td>
                                                    <td>{product.price.toLocaleString()}đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button
                                    type='button'
                                    className='btn btn-light'
                                    onClick={() => {
                                        setShowProductModal(false)
                                        setSelectedProductIds([])
                                        setModalSearchTerm('')
                                    }}
                                >
                                    Đóng
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={handleAddProducts}
                                    disabled={selectedProductIds.length === 0}
                                >
                                    Chọn ({selectedProductIds.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CreateStockInPage
