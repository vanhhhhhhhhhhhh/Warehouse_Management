import React, { useState, useEffect } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { KTSVG } from '../../../_metronic/helpers'

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([
    { id: 1, name: 'Điện thoại', productsCount: 10 },
    { id: 2, name: 'Laptop', productsCount: 15 },
    { id: 3, name: 'Máy tính bảng', productsCount: 8 },
  ])
  const [loading, setLoading] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedMessage, setSelectedMessage] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked)
    if (e.target.checked) {
      const allIds = categories.map(category => category.id)
      setSelectedItems(allIds)
      setSelectedMessage(`Đã chọn ${allIds.length} danh mục`)
    } else {
      setSelectedItems([])
      setSelectedMessage('')
    }
  }

  // Handle individual checkbox selection
  const handleSelectItem = (categoryId) => {
    if (selectedItems.includes(categoryId)) {
      setSelectedItems(prev => prev.filter(id => id !== categoryId))
    } else {
      setSelectedItems(prev => [...prev, categoryId])
    }
  }

  // Update selected message when selectedItems changes
  useEffect(() => {
    if (selectedItems.length > 0) {
      setSelectedMessage(`Đã chọn ${selectedItems.length} danh mục`)
    } else {
      setSelectedMessage('')
    }
    setSelectAll(categories.length > 0 && selectedItems.length === categories.length)
  }, [selectedItems, categories.length])

  // Handle bulk actions
  const handleSelectAction = (action) => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một danh mục')
      return
    }
    setSelectedAction(action)
    if (action === 'delete') {
      setShowDeleteModal(true)
    }
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    // Implement delete logic here
    const newCategories = categories.filter(cat => !selectedItems.includes(cat.id))
    setCategories(newCategories)
    setSelectedItems([])
    setSelectedMessage('')
    setSelectedAction('')
    setShowDeleteModal(false)
  }

  return (
    <>
      <ToolbarWrapper />
      <Content>
        <div className='card'>
          <div className='card-header border-0 pt-6 d-flex justify-content-between'>
            <div className='card-title'>
              <h3 className='fw-bold'>Danh sách danh mục</h3>
            </div>
          </div>

          {/* Card Header */}
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
                  placeholder='Tìm kiếm danh mục'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className='card-toolbar'>
              {/* Add new button */}
              <button type='button' className='btn btn-primary'>
                <KTSVG
                  path='/media/icons/duotune/arrows/arr075.svg'
                  className='svg-icon-2'
                />
                Thêm danh mục
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
                  <option value="">-- Chọn thao tác --</option>
                  <option value="delete">Xóa các mục đã chọn</option>
                </select>
                <button
                  className='btn btn-sm btn-primary'
                  onClick={() => handleSelectAction(selectedAction)}
                  disabled={!selectedAction}
                >
                  Thực hiện
                </button>
              </div>
            </div>
          )}

          {/* Card Body */}
          <div className='card-body py-4'>
            {loading ? (
              <div className='d-flex justify-content-center'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>
            ) : (
              <div className='table-responsive'>
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
                            disabled={categories.length === 0}
                          />
                        </div>
                      </th>
                      <th className='min-w-125px'>Tên danh mục</th>
                      <th className='text-end min-w-100px'>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan='3' className='text-center'>
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      categories
                        .filter((category) =>
                          category.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((category) => (
                          <tr key={category.id}>
                            <td>
                              <div className='form-check form-check-sm form-check-custom form-check-solid'>
                                <input
                                  className='form-check-input'
                                  type='checkbox'
                                  checked={selectedItems.includes(category.id)}
                                  onChange={() => handleSelectItem(category.id)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className='d-flex align-items-center'>
                                <div className='d-flex justify-content-start flex-column'>
                                  <span className='text-dark fw-bold text-hover-primary fs-6'>
                                    {category.name}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className='text-end'>
                              <button className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'>
                                <KTSVG
                                  path='/media/icons/duotune/art/art005.svg'
                                  className='svg-icon-3'
                                />
                              </button>
                              <button className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'>
                                <KTSVG
                                  path='/media/icons/duotune/general/gen027.svg'
                                  className='svg-icon-3'
                                />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Content>

      {/* Delete Confirmation Modal */}
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
                <h5 className='modal-title'>Xóa danh mục</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className='modal-body'>
                <p>Bạn có chắc chắn muốn xóa những danh mục này? Thao tác này không thể khôi phục.</p>
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

      <style>
        {`
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
        `}
      </style>
    </>
  )
}

export default CategoriesPage