import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { KTSVG } from '../../../_metronic/helpers'
import Swal from 'sweetalert2'
import axios from 'axios'
import { API_URL } from '../../config/api.config'

const CreateStockInPage = () => {
    const navigate = useNavigate()
    const [showProductModal, setShowProductModal] = useState(false)
    const [warehouses, setWarehouses] = useState([])
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProducts, setSelectedProducts] = useState([])
    const [selectedProductIds, setSelectedProductIds] = useState([])
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [wareId, setWareId] = useState('')
    const [loading, setLoading] = useState(false)

    const token = localStorage.getItem('token')
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [warehousesResponse, productsResponse] = await Promise.all([
                    axios.get(`${API_URL.WAREHOUSE.IMPORT.LIST}`, config),
                    axios.get(`${API_URL.WAREHOUSE.IMPORT.PRODUCTS}`, config)
                ])
                setWarehouses(warehousesResponse.data.data)
                setProducts(productsResponse.data.data)
            } catch (error) {
                console.error('Error fetching data:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: error.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
                    confirmButtonText: 'Đóng'
                })
            }
        }
        fetchData()
    }, [])

    const handleSearch = () => {
        setShowProductModal(true)
    }

    const filterProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggleProduct = (id) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(prev => prev.filter(pid => pid !== id))
        } else {
            setSelectedProductIds(prev => [...prev, id])
        }
    }

    const handleConfirmSelect = () => {
        const newlySelected = products.filter(p => selectedProductIds.includes(p._id))
        setSelectedProducts(prev => {
            const existingIds = prev.map(p => p._id)
            const merged = [...prev, ...newlySelected.filter(p => !existingIds.includes(p._id))]
            return merged.map(p => ({ ...p, quantity: 1, price: p.price || 0 }))
        })
        setShowProductModal(false)
        setSelectedProductIds([])
    }

    const handleCloseModal = () => {
        setShowProductModal(false)
    }

    const handleSubmitImport = async() => {
        if(!code.trim() || !name.trim() || !wareId || selectedProducts.length === 0){
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Vui lòng nhập đầy đủ thông tin và chọn ít nhất một sản phẩm',
                confirmButtonText: 'Đóng'
            })
            return
        }

        try {
            setLoading(true)
            const items = selectedProducts.map((item) => ({
                proId: item._id,
                quantity: item.quantity
            }))

            const response = await axios.post(`${API_URL.WAREHOUSE.IMPORT.CREATE}`, {
                receiptCode: code,
                receiptName: name,
                wareId: wareId,
                items
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: response.data.message || 'Nhập sản phẩm vào kho thành công',
                    showConfirmButton: false,
                    timer: 1500
                })
                navigate('/apps/stockIn')
            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error importing products:', error)
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Có lỗi xảy ra khi nhập kho. Vui lòng thử lại.',
                confirmButtonText: 'Đóng'
            })
        } finally {
            setLoading(false)
        }
    }


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
                            {/* Mã & Tên phiếu */}
                            <div className='row mb-6'>
                                <div className='col-md-6'>
                                    <label className='form-label required'>Mã phiếu</label>
                                    <input type='text' className='form-control' placeholder='Nhập mã phiếu'
                                     value={code} onChange={(e) => setCode(e.target.value)} />
                                </div>
                                <div className='col-md-6'>
                                    <label className='form-label required'>Tên phiếu</label>
                                    <input type='text' className='form-control' placeholder='Nhập tên phiếu' 
                                     value={name} onChange={(e) => setName(e.target.value)}/>
                                </div>
                            </div>

                            {/* Chọn kho */}
                            <div className='row mb-6'>
                                <div className='col-md-12'>
                                    <label className='form-label required'>Chọn kho</label>
                                    <select className='form-select' value={wareId} onChange={(e) => setWareId(e.target.value)}>
                                        <option value=''>Chọn kho nhập hàng</option>
                                        {
                                            warehouses.map((ware) => {
                                                return <option value={ware._id}>{ware.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>

                            {/* Tìm kiếm sản phẩm */}
                            <div className='separator separator-dashed my-8'></div>
                            <h3 className='card-title align-items-start flex-column mb-5'>
                                <span className='card-label fw-bold fs-3 mb-1'>Thông tin sản phẩm</span>
                            </h3>

                            <div className='row mb-6'>
                                <div className='col-md-12'>
                                    <div className='input-group mb-5'>
                                        <input type='text' className='form-control' placeholder='Tìm sản phẩm' />
                                        <button className='btn btn-primary' type='button' onClick={handleSearch}>
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
                                            <th>Đơn giá (VNĐ)</th>
                                            <th>Số lượng</th>
                                            <th>Thành tiền (VNĐ)</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className='text-center py-5'>
                                                    <div className='text-muted'>Chưa có sản phẩm nào được chọn</div>
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedProducts.map((item, index) => (
                                                <tr key={item._id}>
                                                    <td>{item.name}</td>
                                                    <td>{item.price.toLocaleString()}đ</td>
                                                    <td>
                                                        <input
                                                            type='number'
                                                            className='form-control form-control-sm w-100px'
                                                            value={item.quantity}
                                                            min={1}
                                                            onChange={(e) => {
                                                                const newList = [...selectedProducts]
                                                                newList[index].quantity = Number(e.target.value)
                                                                setSelectedProducts(newList)
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{(item.quantity * item.price).toLocaleString()}đ</td>
                                                    <td>
                                                        <button
                                                            type='button'
                                                            className='btn btn-icon btn-sm btn-light-danger'
                                                            onClick={() => {
                                                                setSelectedProducts(prev => prev.filter(p => p._id !== item._id))
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
                                <button type='button' className='btn btn-light' onClick={() => navigate('/apps/stockIn')}>
                                    Hủy
                                </button>
                                <button 
                                    type='button' 
                                    className='btn btn-primary' 
                                    onClick={handleSubmitImport}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
                                    ) : (
                                        'Nhập kho'
                                    )}
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
                                <button type='button' className='btn-close' onClick={handleCloseModal}></button>
                            </div>
                            <div className='modal-body'>
                                <div className='mb-5'>
                                    <div className='input-group'>
                                        <span className='input-group-text'>
                                            <KTSVG path='/media/icons/duotune/general/gen021.svg' className='svg-icon-2' />
                                        </span>
                                        <input type='text' className='form-control' placeholder='Tìm kiếm theo tên' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>
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
                                            {
                                                filterProducts.map((product) => {
                                                    return (
                                                        <tr key={product._id}>
                                                            <td className='w-35px'>
                                                                <div className='form-check form-check-sm form-check-custom form-check-solid'>
                                                                    <input
                                                                        className='form-check-input'
                                                                        type='checkbox'
                                                                        checked={selectedProductIds.includes(product._id)}
                                                                        onChange={() => handleToggleProduct(product._id)}
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
                                                    )
                                                })
                                            }
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-light' onClick={handleCloseModal}>
                                    Đóng
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={handleConfirmSelect}
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
