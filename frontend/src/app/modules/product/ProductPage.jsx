import { useState, useEffect, useRef } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../_metronic/helpers'
import Select from 'react-select'
import ErrorModal from '../errors/components/modalErros'

// Mock data for products
const mockProducts = [
  {
    _id: '1',
    code: 'SP001',
    name: 'Sản phẩm 1',
    category: { name: 'Điện tử' },
    status: 'Active'
  },
  {
    _id: '2',
    code: 'SP002',
    name: 'Sản phẩm 2',
    category: { name: 'Gia dụng' },
    status: 'Active'
  },
  {
    _id: '3',
    code: 'SP003',
    name: 'Sản phẩm 3',
    category: { name: 'Thời trang' },
    status: 'Inactive'
  },
  {
    _id: '4',
    code: 'SP004',
    name: 'Sản phẩm 4',
    category: { name: 'Điện tử' },
    status: 'Active'
  },
  {
    _id: '5',
    code: 'SP005',
    name: 'Sản phẩm 5',
    category: { name: 'Gia dụng' },
    status: 'Active'
  }
]

// Mock data for categories
const mockCategories = [
  { _id: '1', name: 'Điện tử' },
  { _id: '2', name: 'Gia dụng' },
  { _id: '3', name: 'Thời trang' }
]

const ProductsPage = () => {
  const navigate = useNavigate()
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedMessage, setSelectedMessage] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState(mockProducts)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importCategory, setImportCategory] = useState('')
  const [importing, setImporting] = useState(false)
  const [categories, setCategories] = useState(mockCategories)
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [overrideExisting, setOverrideExisting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [permissions, setPermissions] = useState({
    create: false,
    update: false,
    delete: false
  })

  useEffect(() => {
    // Kiểm tra vai trò admin từ localStorage
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
          const hasCreatePermission = Array.isArray(permissions.PRODUCTS) && 
                                    permissions.PRODUCTS.includes('CREATE')
          const hasUpdatePermission = Array.isArray(permissions.PRODUCTS) && 
                                    permissions.PRODUCTS.includes('UPDATE')
          const hasDeletePermission = Array.isArray(permissions.PRODUCTS) && 
                                    permissions.PRODUCTS.includes('DELETE')
          
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

  // Filter products
  const filteredProducts = products?.filter((product) => {
    if (!product) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      product.code?.toLowerCase().includes(searchLower) ||
      product.name?.toLowerCase().includes(searchLower) ||
      product.category?.name?.toLowerCase().includes(searchLower)
    )
  }) || []

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked)
    if (e.target.checked) {
      const allIds = filteredProducts.map(product => product._id)
      setSelectedItems(allIds)
      setSelectedMessage(`Đã chọn ${allIds.length} sản phẩm`)
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
    setSelectAll(newSelectedItems.length === filteredProducts.length)

    if (newSelectedItems.length > 0) {
      setSelectedMessage(`Đã chọn ${newSelectedItems.length} sản phẩm`)
    } else {
      setSelectedMessage('')
    }
  }

  const handleExecuteAction = () => {
    if (!selectedAction) return;

    switch (selectedAction) {
      case 'delete':
        if (!isAdmin && !permissions.delete) {
          setErrorMessage('Bạn không có quyền xóa sản phẩm')
          setShowErrorModal(true)
          return
        }
        setShowDeleteModal(true)
        break;
      default:
        break;
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProducts(prevProducts => 
        prevProducts.filter(product => !selectedItems.includes(product._id))
      )

      // Reset states
      setShowDeleteModal(false)
      setSelectedAction('')
      setSelectedItems([])
      setSelectedMessage('')
      setSelectAll(false)
      
      console.log(`Đã xóa ${selectedItems.length} sản phẩm thành công`)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShow = () => {
    if (!isAdmin && !permissions.create) {
      setErrorMessage('Bạn không có quyền thêm sản phẩm mới')
      setShowErrorModal(true)
      return
    }
    navigate('/apps/products/create')
  }

  const handleEdit = (id) => {
    if (!isAdmin && !permissions.update) {
      setErrorMessage('Bạn không có quyền chỉnh sửa sản phẩm')
      setShowErrorModal(true)
      return
    }
    navigate(`/apps/products/update/${id}`)
  }

  const handleCreateProduct = async (productData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProducts(prev => [...prev, productData])
      console.log('Tạo sản phẩm thành công')
      navigate('/apps/products/productsPage')
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleDownloadTemplate = () => {
    if (!isAdmin && !permissions.create) {
      setErrorMessage('Bạn không có quyền tải mẫu Excel')
      setShowErrorModal(true)
      return
    }
    console.log('Downloading template...')
  }

  // Handle drag and drop functionality
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileValidation(file)
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      handleFileValidation(file)
    }
  }

  const handleFileValidation = (file) => {
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const isExcel = fileExtension === 'xlsx' || fileExtension === 'xls'
    const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB

    if (!isExcel) {
      console.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (!isValidSize) {
      console.error('File không được vượt quá 5MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setImportFile(file)
  }

  // Xử lý click nút import
  const handleImportClick = () => {
    if (!isAdmin && !permissions.create) {
      setErrorMessage('Bạn không có quyền nhập sản phẩm từ Excel')
      setShowErrorModal(true)
      return
    }
    setShowImportModal(true)
  }

  // Xử lý click nút chọn file trong modal
  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleImportProducts = async () => {
    if (!importFile) {
      console.error('Vui lòng chọn file Excel')
      return
    }

    try {
      setImporting(true)
      // Simulate import delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowImportModal(false)
      setImportFile(null)
      setImportCategory('')
      setOverrideExisting(false)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='px-9'>
          <div className='card'>
            {/* Card header */}
            <div className='card-header border-0 pt-6 d-flex justify-content-between'>
              <div className='card-title'>
                <h3 className='fw-bold'>Danh sách sản phẩm</h3>
              </div>
            </div>
            {/* Begin Header */}
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                {/* Begin Search */}
                <div className='d-flex align-items-center position-relative my-1'>
                  <KTSVG
                    path='/media/icons/duotune/general/gen021.svg'
                    className='svg-icon-1 position-absolute ms-6'
                  />
                  <input
                    type='text'
                    className='form-control form-control-solid w-250px ps-14'
                    placeholder='Tìm kiếm sản phẩm'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* End Search */}
              </div>

              {/* Hiển thị các nút thao tác cho tất cả nhân viên */}
              {!isAdmin && (
                <div className='card-toolbar'>
                  <div className='d-flex justify-content-end gap-2'>
                    <button
                      type='button'
                      className='btn btn-light-primary'
                      onClick={handleDownloadTemplate}
                    >
                      <i className='bi bi-file-earmark-arrow-down fs-2'></i>
                      Tải mẫu Excel
                    </button>
                    <button
                      type='button'
                      className='btn btn-light-success'
                      onClick={handleImportClick}
                    >
                      <i className='bi bi-file-earmark-arrow-up fs-2'></i>
                      Nhập Excel
                    </button>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={handleShow}
                    >
                      <i className='ki-duotone ki-plus fs-2'></i>
                      Thêm sản phẩm
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card body */}
            <div className='card-body py-4'>
              {/* Thông báo số lượng đã chọn - Hiển thị cho tất cả nhân viên */}
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

              {/* Products table */}
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
                    <th className='min-w-100px text-black'>Mã sản phẩm</th>
                    <th className='min-w-100px text-black'>Sản phẩm</th>
                    <th className='min-w-100px text-black'>Danh mục</th>
                    <th className='min-w-100px text-black'>Trạng thái</th>
                    {/* Hiển thị cột thao tác cho tất cả nhân viên */}
                    {!isAdmin && <th className='min-w-100px text-black'>Thao tác</th>}
                  </tr>
                </thead>
                <tbody className='text-gray-600 fw-semibold'>
                  {loading ? (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 6} className='text-center'>
                        <div className='d-flex justify-content-center p-5'>
                          <div className='spinner-border text-primary' role='status'>
                            <span className='visually-hidden'>Đang tải...</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 6} className='text-center'>
                        Không có sản phẩm nào
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => product && (
                      <tr key={product._id || `product-${Math.random()}`}>
                        {/* Hiển thị checkbox cho tất cả nhân viên */}
                        {!isAdmin && (
                          <td>
                            <div className='form-check form-check-sm form-check-custom form-check-solid'>
                              <input
                                className='form-check-input'
                                type='checkbox'
                                checked={selectedItems.includes(product._id)}
                                onChange={() => handleSelectItem(product._id)}
                              />
                            </div>
                          </td>
                        )}
                        <td>{product.code || 'N/A'}</td>
                        <td>{product.name || 'N/A'}</td>
                        <td>{product.category?.name || 'Không có danh mục'}</td>
                        <td>
                          <span className={`badge badge-light-${product.status === 'Active' ? 'success' : 'danger'}`}
                            style={{ marginLeft: '12px' }}
                          >
                            {product.status || 'N/A'}
                          </span>
                        </td>
                        {/* Hiển thị nút thao tác cho tất cả nhân viên */}
                        {!isAdmin && (
                          <td>
                            <button
                              className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 ms-4'
                              onClick={() => handleEdit(product._id)}
                            >
                              <i className='fas fa-edit'></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận xóa - Hiển thị cho tất cả nhân viên */}
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

      {/* Modal nhập Excel - Hiển thị cho tất cả nhân viên */}
      {showImportModal && (
        <div
          className='modal fade show d-block'
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
          }}
        >
          <div className='modal-dialog modal-dialog-centered' style={{
            marginTop: '2rem',
            maxWidth: '700px',
            opacity: 1,
            transform: 'translateY(0)',
            transition: 'all 0.5s ease',
            animation: 'modal-fade-in 0.5s ease'
          }}>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Nhập sản phẩm từ Excel</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    setImportCategory('')
                    setOverrideExisting(false)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  disabled={importing}
                ></button>
              </div>
              <div className='modal-body'>
                {/* Drag and drop area */}
                <div
                  className={`border-2 border-dashed d-flex flex-column align-items-center justify-content-center p-7 ${
                    isDragging ? 'border-primary bg-light-primary' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{ borderRadius: '8px', minHeight: '200px' }}
                >
                  <KTSVG
                    path='/media/icons/duotune/files/fil003.svg'
                    className='svg-icon-3x svg-icon-primary mb-5'
                  />

                  {importFile ? (
                    <div className='text-center'>
                      <h3 className='fs-5 fw-bold mb-2'>{importFile.name}</h3>
                      <p className='fs-6 text-gray-600 mb-0'>
                        {(importFile.size / 1024).toFixed(2)} KB
                      </p>
                      <button
                        className='btn btn-sm btn-icon btn-light-danger mt-5'
                        onClick={() => {
                          setImportFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                        disabled={importing}
                      >
                        <i className='bi bi-x fs-2'></i>
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className='fs-5 fw-bold mb-2'>Kéo thả file vào đây</h3>
                      <p className='fs-6 text-gray-600 mb-5'>hoặc</p>
                      <button
                        className='btn btn-sm btn-primary'
                        onClick={handleChooseFile}
                        disabled={importing}
                      >
                        Chọn file
                      </button>
                    </>
                  )}

                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.xlsx,.xls'
                    className='d-none'
                    onChange={handleFileSelect}
                    disabled={importing}
                  />
                </div>
                
                {/* Override existing option */}
                <div className='mt-5'>
                  <div className='form-check form-check-custom form-check-solid'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      checked={overrideExisting}
                      onChange={(e) => setOverrideExisting(e.target.checked)}
                      id='overrideExisting'
                      disabled={importing}
                    />
                    <label className='form-check-label fs-6 text-black' htmlFor='overrideExisting'>
                      Ghi đè thông tin các sản phẩm đã có
                    </label>
                  </div>
                  <p className='ms-9 fs-6 text-gray-600 mt-2 mb-0'>
                    Bắt buộc cần có mã sản phẩm để xác định sản phẩm.
                  </p>
                </div>

                {/* Template download link */}
                <div className='mt-8'>
                  <a href='#' className='fs-6 text-primary' onClick={(e) => { e.preventDefault(); handleDownloadTemplate() }}>
                    <i className='bi bi-download fs-2 me-2'></i>
                    Tải file mẫu sản phẩm
                  </a>
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-light'
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    setImportCategory('')
                    setOverrideExisting(false)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  disabled={importing}
                >
                  Hủy
                </button>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleImportProducts}
                  disabled={!importFile || importing}
                >
                  {importing ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                      Đang xử lý...
                    </>
                  ) : 'Nhập dữ liệu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        message={errorMessage}
      />

      {/* Style cho animation */}
      <style>{`
        @keyframes modal-fade-in {
          from { opacity: 0; transform: translateY(-60px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

export default ProductsPage