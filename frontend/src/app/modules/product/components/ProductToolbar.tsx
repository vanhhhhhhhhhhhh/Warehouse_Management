import React from 'react'
import { KTSVG } from '../../../../_metronic/helpers'

interface ProductToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onDownloadTemplate: () => void
  onShowImportModal: () => void
  onAddProduct: () => void
}

export const ProductToolbar: React.FC<ProductToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onDownloadTemplate,
  onShowImportModal,
  onAddProduct
}) => {
  return (
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
            className='form-control form-control-solid w-250px ps-14 me-4'
            placeholder='Tìm kiếm sản phẩm'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {/* End Search */}
      </div>

      <div className='card-toolbar'>
        <div className='d-flex justify-content-end gap-2'>
          {/* Excel Import/Export buttons */}
          <button
            type='button'
            className='btn btn-light-primary'
            onClick={onDownloadTemplate}
          >
            <i className='bi bi-file-earmark-arrow-down fs-2'></i>
            Tải mẫu Excel
          </button>
          <button
            type='button'
            className='btn btn-light-success'
            onClick={onShowImportModal}
          >
            <i className='bi bi-file-earmark-arrow-up fs-2'></i>
            Nhập Excel
          </button>
          <button
            type='button'
            className='btn btn-primary'
            onClick={onAddProduct}
          >
            <i className='ki-duotone ki-plus fs-2'></i>
            Thêm sản phẩm
          </button>
        </div>
      </div>
    </div>
  )
}