import { useEffect, useState } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'

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
                                        </select>
                                    </div>

                                    {/* Chọn Sản phẩm */}
                                    <div className='col-md-6 mb-4'>
                                        <label className='form-label required'>Chọn Sản phẩm</label>
                                        <select
                                            className='form-select form-select-solid'
                                            required
                                        >
                                            <option value=''>Chọn sản phẩm</option>
                                        </select>
                                    </div>

                                    {/* Số lượng */}
                                    <div className='col-md-6 mb-4'>
                                        <label className='form-label required'>Số lượng</label>
                                        <input
                                            type='number'
                                            className='form-control form-control-solid'
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