import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { KTSVG } from '../../../_metronic/helpers'
import Swal from 'sweetalert2'

export default function CreateStockOutPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [wareId, setWareId] = useState('')
  const [reason, setReason] = useState('')
  const [warehouses, setWarehouses] = useState([])
  const [stockProducts, setStockProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState([])

  const token = localStorage.getItem('token')

  // Fetch kho
  useEffect(() => {
    axios.get('http://localhost:9999/import/warehouse', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setWarehouses(res.data.data))
  }, [])

  // Fetch sản phẩm trong kho khi chọn kho
  useEffect(() => {
    if (!wareId) {
      setStockProducts([])
      return
    }

    const fetchInventory = async () => {
      try {
        // Gọi API inventory với filter theo wareId
        const [inventoryRes, productsRes] = await Promise.all([
          axios.get(`http://localhost:9999/inventory?warehouseId=${wareId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:9999/products', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        // Tạo map giá sản phẩm
        const productPrices = {};
        productsRes.data.data.forEach(product => {
          productPrices[product._id] = product.price;
        });

        // Format lại data để phù hợp với cấu trúc hiện tại
        const formattedData = inventoryRes.data.data.map(item => ({
          product: {
            _id: item.productId,
            name: item.productName,
            code: item.productCode,
            price: productPrices[item.productId] || 0
          },
          quantity: item.currentStock
        })).filter(item => item.quantity > 0); // Chỉ lấy những sản phẩm còn tồn

        setStockProducts(formattedData);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin tồn kho:', err);
        setStockProducts([]);
      }
    }

    fetchInventory();
  }, [wareId, token]);


  const filterProducts = stockProducts.filter(p =>
    p.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = () => {
    setShowProductModal(true)
  }

  const handleCloseModal = () => {
    setShowProductModal(false)
    setSelectedProductIds([])
    setSearchTerm('')
  }

  const handleToggleProduct = (item) => {
    const id = item.product._id
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(prev => prev.filter(p => p !== id))
    } else {
      setSelectedProductIds(prev => [...prev, id])
    }
  }

  const handleConfirmSelect = () => {
    const selectedItems = stockProducts.filter(s =>
      selectedProductIds.includes(s.product._id)
    )

    const updatedList = [...selectedProducts]

    selectedItems.forEach(stockItem => {
      const existingIndex = updatedList.findIndex(p => p._id === stockItem.product._id)
      if (existingIndex !== -1) {
        updatedList[existingIndex].quantity += 1
      } else {
        updatedList.push({
          ...stockItem.product,
          availableQuantity: stockItem.quantity,
          quantity: 1
        })
      }
    })

    setSelectedProducts(updatedList)
    handleCloseModal()
  }

  const handleQuantityChange = (index, value) => {
    const updated = [...selectedProducts]
    updated[index].quantity = value
    setSelectedProducts(updated)
  }

const handleSubmitExport = async () => {
  if (!code || !name || !wareId || selectedProducts.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Vui lòng nhập đầy đủ thông tin và chọn ít nhất một sản phẩm',
      confirmButtonText: 'Đóng'
    });
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const items = selectedProducts.map(item => ({
      proId: item._id,
      quantity: item.quantity,
      unitPrice: item.price || 0  // Thêm đơn giá
    }));

    const response = await axios.post('http://localhost:9999/export/fromWarehouse', {
      receiptCode: code,
      receiptName: name,
      wareId,
      items
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Xuất sản phẩm khỏi kho thành công',
      showConfirmButton: false,
      timer: 1500
    });

    navigate('/apps/stockOut');
  } catch (error) {
    console.error('Export error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: error.response?.data?.message || 'Có lỗi xảy ra khi xuất kho. Vui lòng thử lại.',
      confirmButtonText: 'Đóng'
    });
  }
};


  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='px-9'>
          <Link
            to='/apps/stockOut'
            className='fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center'
          >
            <i className='bi bi-arrow-left fs-2 me-2'></i>
            Quay lại danh sách phiếu xuất kho
          </Link>
        </div>

        <div className='px-9'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <h3 className='fw-bold'>Thêm mới phiếu xuất</h3>
              </div>
            </div>

            <div className='card-body'>
              <div className='row mb-6'>
                <div className='col-md-6'>
                  <label className='form-label required'>Mã phiếu</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Nhập mã phiếu'
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label required'>Tên phiếu</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Nhập tên phiếu'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className='row mb-6'>
                <div className='col-md-12'>
                  <label className='form-label required'>Chọn kho</label>
                  <select
                    className='form-select'
                    value={wareId}
                    onChange={(e) => {
                      setWareId(e.target.value)
                      setSelectedProducts([])
                    }}
                  >
                    <option value=''>Chọn kho xuất hàng</option>
                    {warehouses.map((ware) => (
                      <option key={ware._id} value={ware._id}>{ware.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='separator separator-dashed my-8'></div>
              <h3 className='card-title align-items-start flex-column mb-5'>
                <span className='card-label fw-bold fs-3 mb-1'>Thông tin sản phẩm</span>
                {wareId && (
                  <span className='text-muted mt-1 fw-semibold fs-7'>
                    (Tổng {stockProducts.length} sản phẩm trong kho)
                  </span>
                )}
              </h3>

              <div className='row mb-6'>
                <div className='col-md-12'>
                  <div className='input-group mb-5'>
                    <input type='text' className='form-control' placeholder='Tìm sản phẩm trong kho' />
                    <button className='btn btn-primary' type='button' onClick={handleSearch}>
                      <KTSVG path='/media/icons/duotune/general/gen021.svg' className='svg-icon-2' />
                      Tìm kiếm
                    </button>
                  </div>
                </div>
              </div>

              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <th>Tên sản phẩm</th>
                      <th>Đơn giá (VNĐ)</th>
                      <th>Tồn kho</th>
                      <th>Số lượng xuất</th>
                      <th>Thành tiền (VNĐ)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className='text-center py-5'>
                          <div className='text-muted'>Chưa có sản phẩm nào được chọn</div>
                        </td>
                      </tr>
                    ) : (
                      selectedProducts.map((item, index) => (
                        <tr key={item._id}>
                          <td>
                            <div className='d-flex flex-column'>
                              <span className='text-gray-800 fw-bold'>{item.name}</span>
                              <span className='text-gray-600'>{item.code}</span>
                            </div>
                          </td>
                          <td>{item.price?.toLocaleString()}đ</td>
                          <td><span className='badge badge-light-info'>{item.availableQuantity}</span></td>
                          <td>
                            <input
                              type='number'
                              className='form-control form-control-sm w-100px'
                              value={item.quantity}
                              min={1}
                              max={item.availableQuantity}
                              onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                            />
                          </td>
                          <td>{(item.quantity * item.price).toLocaleString()}đ</td>
                          <td>
                            <button
                              type='button'
                              className='btn btn-icon btn-sm btn-light-danger'
                              onClick={() =>
                                setSelectedProducts(prev => prev.filter(p => p._id !== item._id))
                              }
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

              <div className='d-flex justify-content-end gap-2'>
                <button type='button' className='btn btn-light' onClick={() => navigate('/apps/stockOut')}>
                  Hủy
                </button>
                <button type='button' className='btn btn-danger' onClick={handleSubmitExport}>
                  Xuất kho
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
                <h5 className='modal-title'>Chọn sản phẩm xuất kho</h5>
                <button type='button' className='btn-close' onClick={handleCloseModal}></button>
              </div>
              <div className='modal-body'>
                <div className='mb-5'>
                  <div className='input-group'>
                    <span className='input-group-text'>
                      <KTSVG path='/media/icons/duotune/general/gen021.svg' className='svg-icon-2' />
                    </span>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Tìm kiếm theo tên'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className='table-responsive' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className='table align-middle table-row-dashed fs-6 gy-5'>
                    <thead className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <tr>
                        <th className='w-35px'></th>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Tồn kho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterProducts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className='text-center py-5'>
                            <div className='text-muted'>
                              {stockProducts.length === 0
                                ? 'Kho này chưa có sản phẩm nào'
                                : 'Không tìm thấy sản phẩm phù hợp'}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filterProducts.map((stockItem) => (
                          <tr key={stockItem.product._id}>
                            <td className='w-35px'>
                              <div className='form-check form-check-sm form-check-custom form-check-solid'>
                                <input
                                  className='form-check-input'
                                  type='checkbox'
                                  checked={selectedProductIds.includes(stockItem.product._id)}
                                  onChange={() => handleToggleProduct(stockItem)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className='d-flex flex-column'>
                                <span className='text-gray-800 fw-bold'>{stockItem.product.name}</span>
                                <span className='text-gray-600'>{stockItem.product.code}</span>
                              </div>
                            </td>
                            <td>{stockItem.product.price?.toLocaleString() || 0}đ</td>
                            <td>
                              <span className='badge badge-light-success'>
                                {stockItem.quantity}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
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
