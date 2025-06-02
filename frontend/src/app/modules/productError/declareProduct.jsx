import { useState } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import { Link } from 'react-router-dom'

// Mock data cho sản phẩm và kho
const mockWarehouses = [
    { id: 'hn', name: 'Kho Hà Nội' },
    { id: 'hcm', name: 'Kho HCM' }
]

const mockProducts = [
    { id: '1', name: 'Honda Wave Alpha' },
    { id: '2', name: 'Honda Vision' },
    { id: '3', name: 'Honda Air Blade' }
]

const DeclareProduct = () => {
    const [formData, setFormData] = useState({
        warehouse: '',
        product: '',
        quantity: 0,
        reason: '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        // Xử lý gửi dữ liệu
    }

    const handleReset = () => {
        setFormData({
            warehouse: '',
            product: '',
            quantity: 0,
            reason: ''
        })
    }

    return (
        <>
            <div className='d-flex flex-column gap-7'>
                <div className='px-9'>
                    <Link
                        to='/apps/defectiveProduct'
                        className='fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center'
                    >
                        <i className='bi bi-arrow-left fs-2 me-2'></i>
                        Quay lại danh sách sản phẩm hỏng, lỗi
                    </Link>
                </div>

                <div className='px-9'>
                    <div className='card'>
                        {/* Header */}
                        <div className='card-header border-0 pt-6'>
                            <div className='card-title'>
                                <h3 className='fw-bold m-0'>Khai báo sản phẩm hỏng, lỗi, rơi vỡ</h3>
                            </div>
                        </div>

                        {/* Form */}
                        <div className='card-body'>
                            <form onSubmit={handleSubmit}>
                                <div className='row mb-8'>
                                    {/* Chọn Kho */}
                                    <div className='col-md-6 mb-4'>
                                        <label className='form-label required'>Chọn Kho</label>
                                        <select
                                            className='form-select form-select-solid'
                                            value={formData.warehouse}
                                            onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                                            required
                                        >
                                            <option value=''>Chọn kho</option>
                                            {mockWarehouses.map(warehouse => (
                                                <option key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Chọn Sản phẩm */}
                                    <div className='col-md-6 mb-4'>
                                        <label className='form-label required'>Chọn Sản phẩm</label>
                                        <select
                                            className='form-select form-select-solid'
                                            value={formData.product}
                                            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                            required
                                        >
                                            <option value=''>Chọn sản phẩm</option>
                                            {mockProducts.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Số lượng */}
                                    <div className='col-md-6 mb-4'>
                                        <label className='form-label required'>Số lượng</label>
                                        <input
                                            type='number'
                                            className='form-control form-control-solid'
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                            min={1}
                                            required
                                        />
                                    </div>

                                    {/* Nguyên nhân */}
                                    <div className='col-md-12'>
                                        <label className='form-label required'>Nguyên nhân</label>
                                        <textarea
                                            className='form-control form-control-solid'
                                            rows={4}
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            required
                                            placeholder='Nhập nguyên nhân chi tiết...'
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className='d-flex justify-content-end gap-2 mt-6'>
                                    <button
                                        type='button'
                                        className='btn btn-light'
                                        onClick={handleReset}
                                    >
                                        Hủy
                                    </button>
                                    <button type='submit' className='btn btn-primary'>
                                        Lưu
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DeclareProduct