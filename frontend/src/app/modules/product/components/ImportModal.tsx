import React, { useRef, ChangeEvent, DragEvent } from 'react'
import { KTSVG } from '../../../../_metronic/helpers'

interface ImportModalProps {
  show: boolean
  onClose: () => void
  onImport: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  importing: boolean
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
  overrideExisting: boolean
  setOverrideExisting: (override: boolean) => void
  onDownloadTemplate: () => void
  onFileValidation: (file: File) => void
}

export const ImportModal: React.FC<ImportModalProps> = ({
  show,
  onClose,
  onImport,
  importFile,
  setImportFile,
  importing,
  isDragging,
  setIsDragging,
  overrideExisting,
  setOverrideExisting,
  onDownloadTemplate,
  onFileValidation
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!show) return null

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      onFileValidation(file)
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      onFileValidation(file)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleClose = () => {
    setImportFile(null)
    setOverrideExisting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  return (
    <>
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
                onClick={handleClose}
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
                      onClick={handleImportClick}
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
                <a href='#' className='fs-6 text-primary' onClick={(e) => { e.preventDefault(); onDownloadTemplate() }}>
                  <i className='bi bi-download fs-2 me-2'></i>
                  Tải file mẫu sản phẩm
                </a>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-light'
                onClick={handleClose}
                disabled={importing}
              >
                Hủy
              </button>
              <button
                type='button'
                className='btn btn-primary'
                onClick={onImport}
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
