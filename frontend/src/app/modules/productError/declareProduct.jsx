import { useEffect, useState } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useAuth } from '../../modules/auth'

const DeclareProduct = () => {
    const { auth } = useAuth()
    const [stockImports, setStockImports] = useState([])
    const [selectedImportId, setSelectedImportId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await axios.get('http://localhost:9999/error/stockImport', {
                    headers: {
                        'Authorization': `Bearer ${auth?.api_token}`
                    }
                })
                if (response.data.success) {
                    setStockImports(response.data.data)
                } else {
                    setError(response.data.message || 'Có lỗi xảy ra khi tải dữ liệu')
                }
            } catch (error) {
                console.error('Fetch stock imports error:', error)
                setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }
        if (auth?.api_token) {
            fetchData()
        }
    }, [auth])

    const selectedImport = stockImports.find((stock) => stock.importId === selectedImportId)
    const listProductByReceipt = selectedImport ? selectedImport.items : []

    const [formData, setFormData] = useState({
        importId: '',
        proId: '',
        quantity: 0,
        reason: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            setError(null)
            const response = await axios.post('http://localhost:9999/error/declare', 
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${auth?.api_token}`
                    }
                }
            )
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: response.data.message,
                    showConfirmButton: false,
                    timer: 1500
                })
                // Reset form
                setFormData({
                    importId: '',
                    proId: '',
                    quantity: 0,
                    reason: '',
                })
                setSelectedImportId(null)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: response.data.message,
                    confirmButtonText: 'Đóng'
                })
            }
        } catch (error) {
            console.error('Declare error stock error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Có lỗi xảy ra khi khai báo sản phẩm lỗi',
                confirmButtonText: 'Đóng'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setFormData({
            importId: '',
            proId: '',
            quantity: 0,
            reason: '',
        })
        setSelectedImportId(null)
    }

    if (loading) {
        return (
            <div className='d-flex flex-column gap-7'>
                <div className='px-9'>
                    <div className='card'>
                        <div className='card-body py-4 text-center'>
                            <div className='spinner-border text-primary' role='status'>
                                <span className='visually-hidden'>Đang tải...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='d-flex flex-column gap-7'>
                <div className='px-9'>
                    <div className='card'>
                        <div className='card-body py-4 text-center text-danger'>
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        )
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
                                            {stockImports.map((stock) => (
                                                <option key={stock.importId} value={stock.importId}>
                                                    {stock.receiptCode}
                                                </option>
                                            ))}
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
                                            disabled={!formData.importId}
                                        >
                                            <option value=''>Chọn sản phẩm</option>
                                            {listProductByReceipt.map((product) => (
                                                <option key={product.proId} value={product.proId}>
                                                    {product.proName} (Số lượng: {product.quantity})
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
                                            min={1}
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                            disabled={!formData.proId}
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
                                            disabled={!formData.proId}
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className='d-flex justify-content-end gap-2 mt-6'>
                                    <button
                                        type='button'
                                        className='btn btn-light'
                                        onClick={handleReset}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type='submit'
                                        className='btn btn-primary'
                                        disabled={loading || !formData.proId}
                                    >
                                        {loading ? (
                                            <>
                                                <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
                                                <span className='ms-2'>Đang xử lý...</span>
                                            </>
                                        ) : 'Lưu'}
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