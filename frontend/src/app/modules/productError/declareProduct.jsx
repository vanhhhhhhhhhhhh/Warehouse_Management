import { useEffect, useState } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'

const DeclareProduct = () => {

    const [stockImports, setStockImports] = useState([])
    const [selectedImportId, setSelectedImportId] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:9999/error/stockImport')
                setStockImports(response.data.data)
            } catch (error) {
                console.log(error);
            }
        }
        fetchData()
    }, [])

    const selectedImport = stockImports.find((stock) => stock.importId === selectedImportId)
    const listProductByReceipt = selectedImport ? selectedImport.items : []


    const [formData, setFormData] = useState({
        importId: '',
        wareId: '',
        proId: '',
        quantity: 0,
        reason: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`http://localhost:9999/error/declare`, formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )
            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Khai báo sản phẩm lỗi thành công',
                    showConfirmButton: false,
                    timer: 1500
                })
                setFormData({
                    importId: '',
                    wareId: '',
                    proId: '',
                    quantity: 0,
                    reason: '',
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: error.response.data.message,
                confirmButtonText: 'Đóng'
            })
        }
    }

    const handleReset = () => {
        setFormData({
            importId: '',
            wareId: '',
            proId: '',
            quantity: 0,
            reason: '',
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
                                    {/* Chọn phiếu */}
                                    <div className='col-md-6 mb-4'>
                                        <label className='form-label required'>Chọn phiếu</label>
                                        <select
                                            className='form-select form-select-solid'
                                            required
                                            value={formData.importId}
                                            onChange={(e) => {
                                                setSelectedImportId(e.target.value)
                                                setFormData({ ...formData, importId: e.target.value })
                                            }}
                                        >
                                            <option value=''>Chọn phiếu</option>
                                            {
                                                stockImports.map((stock) => {
                                                    return <option value={stock.importId}>{stock.receiptCode}</option>
                                                })
                                            }
                                        </select>
                                    </div>

                                    {/* Chọn Sản phẩm */}
                                    <div className='col-md-6 mb-4'>
                                        <label className='form-label required'>Chọn sản phẩm</label>
                                        <select
                                            className='form-select form-select-solid'
                                            required
                                            value={formData.proId}
                                            onChange={(e) => setFormData({ ...formData, proId: e.target.value })}
                                        >
                                            <option value=''>Chọn sản phẩm</option>
                                            {
                                                listProductByReceipt.map((product) => {
                                                    return <option value={product.proId}>{product.proName}</option>
                                                })
                                            }
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
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                    </div>

                                    {/* Nguyên nhân */}
                                    <div className='col-md-12'>
                                        <label className='form-label required'>Nguyên nhân</label>
                                        <textarea
                                            className='form-control form-control-solid'
                                            rows={4}
                                            required
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
                                    <button
                                        type='submit'
                                        className='btn btn-primary'
                                        onSubmit={handleSubmit}
                                    >
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