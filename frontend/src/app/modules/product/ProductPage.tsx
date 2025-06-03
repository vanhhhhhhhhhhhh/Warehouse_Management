import React, { useState, useRef, useCallback } from 'react'
import { createColumnHelper, CellContext, ColumnDef } from '@tanstack/react-table'
import CRUDTable from '../../../_metronic/partials/widgets/tables/CRUDTable'
import {
  DeleteModal,
  ImportModal,
  ProductToolbar,
  SelectedItemsActions
} from './components'
import ProperBadge from '../../../_metronic/partials/widgets/ProperBadge'

export interface Product {
  _id: string
  code: string
  name: string
  category: {
    name: string
  }
  status: 'Active' | 'Inactive'
}

export interface Category {
  _id: string
  name: string
}

export interface Pagination {
  page: number
  limit: 10
  total: number
}

// Mock data for products
const mockProducts: Product[] = [
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
const mockCategories: Category[] = [
  { _id: '1', name: 'Điện tử' },
  { _id: '2', name: 'Gia dụng' },
  { _id: '3', name: 'Thời trang' }
]

/**
 * Hook for managing modal states
 */
const useModals = () => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [showImportModal, setShowImportModal] = useState<boolean>(false)

  const openDeleteModal = useCallback(() => setShowDeleteModal(true), [])
  const closeDeleteModal = useCallback(() => setShowDeleteModal(false), [])
  const openImportModal = useCallback(() => setShowImportModal(true), [])
  const closeImportModal = useCallback(() => setShowImportModal(false), [])

  return {
    showDeleteModal,
    showImportModal,
    openDeleteModal,
    closeDeleteModal,
    openImportModal,
    closeImportModal
  }
}

const useProductImport = (closeImportModal: () => void) => {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importCategory, setImportCategory] = useState<string>('')
  const [importing, setImporting] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [overrideExisting, setOverrideExisting] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileValidation = useCallback((file: File) => {
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
  }, [])

  const handleImportProducts = useCallback(async () => {
    if (!importFile) {
      console.error('Vui lòng chọn file Excel')
      return
    }

    try {
      setImporting(true)
      // Simulate import delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Nhập sản phẩm thành công')
      closeImportModal()
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
  }, [importFile, closeImportModal])

  const handleDownloadTemplate = useCallback(() => {
    console.log('Downloading template...')
  }, [])

  return {
    importFile,
    setImportFile,
    importCategory,
    setImportCategory,
    importing,
    isDragging,
    setIsDragging,
    overrideExisting,
    setOverrideExisting,
    fileInputRef,
    handleFileValidation,
    handleImportProducts,
    handleDownloadTemplate
  }
}

// Table column configuration
const columnHelper = createColumnHelper<Product>()

const columns: ColumnDef<Product, any>[] = [
  columnHelper.accessor('code', {
    header: 'Mã sản phẩm',
    cell: (info: CellContext<Product, string>) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Tên sản phẩm',
    cell: (info: CellContext<Product, string>) => info.getValue(),
  }),
  columnHelper.accessor('category.name', {
    header: 'Danh mục',
    cell: (info: CellContext<Product, string>) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: (info: CellContext<Product, 'Active' | 'Inactive'>) => (
      <ProperBadge
        variant={info.getValue() === 'Active' ? 'success' : 'danger'}
      >
        {info.getValue()}
      </ProperBadge>
    ),
  }),
];

const noop = () => {}

const ProductsPage: React.FC = () => {
  const {
    showDeleteModal,
    showImportModal,
    closeDeleteModal,
    openImportModal,
    closeImportModal
  } = useModals()

  const {
    importFile,
    setImportFile,
    importing,
    isDragging,
    setIsDragging,
    overrideExisting,
    setOverrideExisting,
    handleFileValidation,
    handleImportProducts,
    handleDownloadTemplate
  } = useProductImport(closeImportModal)

  const [searchTerm, setSearchTerm] = useState<string>('')

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

            {/* Product Toolbar */}
            <ProductToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDownloadTemplate={handleDownloadTemplate}
              onShowImportModal={openImportModal}
              onAddProduct={noop}
            />

            {/* Card body */}
            <div className='card-body py-4'>
              {/* Selected Items Actions */}
              <SelectedItemsActions
                selectedItems={[]}
                selectedMessage={''}
                selectedAction={''}
                onActionChange={noop}
                onExecuteAction={noop}
              />

              <CRUDTable
                data={mockProducts}
                columns={columns}
                onEdit={noop}
                onDelete={noop}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={noop}
        loading={false}
      />

      {/* Import Modal */}
      <ImportModal
        show={showImportModal}
        onClose={closeImportModal}
        onImport={handleImportProducts}
        importFile={importFile}
        setImportFile={setImportFile}
        importing={importing}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        overrideExisting={overrideExisting}
        setOverrideExisting={setOverrideExisting}
        onDownloadTemplate={handleDownloadTemplate}
        onFileValidation={handleFileValidation}
      />
    </>
  )
}

export default ProductsPage
