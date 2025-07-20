import React, { useRef, ChangeEvent, DragEvent, useState, useMemo } from 'react'
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik'
import * as Yup from 'yup'
import { KTSVG } from '../../../../_metronic/helpers'
import ProperBadge from '../../../reusableWidgets/ProperBadge'
import { API_URL } from '../../../config/api.config'

export interface FileParsingOptions {
  merge: boolean,
  stopOnError: boolean
}

interface ImportModalProps {
  show: boolean,
  onClose: () => void,
  onUploadFile: (file: File, options: FileParsingOptions) => Promise<void>
}

const AskForFileScreen: React.FC<{
  onFileChosen: (file: File, options: FileParsingOptions) => Promise<void>
  onClose: () => void
}> = ({ onFileChosen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [stopOnError, setStopOnError] = useState(false)


  const onFileValidation = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB')
      return
    }

    setImportFile(file)
  }

  const handleImport = async () => {
    if (!importFile) return

    setImporting(true)
    try {
      await onFileChosen(importFile, {
        merge: true,
        stopOnError
      })
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setImporting(false)
    }
  }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  return (
    <>
      <div
        className="modal fade show d-block"
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
        <div
          className="modal-dialog modal-dialog-centered"
          style={{
            marginTop: '2rem',
            maxWidth: '700px',
            opacity: 1,
            transform: 'translateY(0)',
            transition: 'all 0.5s ease',
            animation: 'modal-fade-in 0.5s ease',
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nhập sản phẩm từ Excel</h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={importing}></button>
            </div>
            <div className="modal-body">
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
                <KTSVG path="/media/icons/duotune/files/fil003.svg" className="svg-icon-3x svg-icon-primary mb-5" />

                {importFile ? (
                  <div className="text-center">
                    <h3 className="fs-5 fw-bold mb-2">{importFile.name}</h3>
                    <p className="fs-6 text-gray-600 mb-0">{(importFile.size / 1024).toFixed(2)} KB</p>
                    <button
                      className="btn btn-sm btn-icon btn-light-danger mt-5"
                      onClick={() => {
                        setImportFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={importing}
                    >
                      <i className="bi bi-x fs-2"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="fs-5 fw-bold mb-2">Kéo thả file vào đây</h3>
                    <p className="fs-6 text-gray-600 mb-5">hoặc</p>
                    <button className="btn btn-sm btn-primary" onClick={handleImportClick} disabled={importing}>
                      Chọn file
                    </button>

                    <p className='text-muted text-sm mt-3'>(kích thước tệp tối đa là 3MB)</p>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  multiple={false}
                  required
                  className="d-none"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
              </div>
            </div>
            <div className="modal-footer flex-column align-items-stretch gap-3">
              <div>
                <div className='form-check form-check-solid form-switch fv-row'>
                  <input
                    className='form-check-input w-45px h-30px'
                    type='checkbox'
                    id='stopOnError'
                    checked={stopOnError}
                    onChange={() => {
                      setStopOnError(!stopOnError)
                    }}
                  />
                  <label className='form-check-label' htmlFor='stopOnError'>Dừng khi có lỗi</label>
                </div>
              </div>
              <div className='d-flex justify-content-between'>
                <a href={API_URL.EXCEL.SAMPLE_URL} download className="btn m-0 btn-light-primary">
                  <KTSVG path="/media/icons/duotune/files/fil003.svg" className="svg-icon-2" />
                  Tải mẫu Excel
                </a>
                <div>
                  <button type="button" className="btn btn-light" onClick={handleClose} disabled={importing}>
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleImport}
                    disabled={!importFile || importing}
                  >
                    {importing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      'Nhập dữ liệu'
                    )}
                  </button>
                </div>
              </div>
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
  );
}

export const ImportModal: React.FC<ImportModalProps> = ({
  show,
  onClose,
  onUploadFile,
}) => {
  if (!show) return null;
  return <>
   <AskForFileScreen onFileChosen={onUploadFile} onClose={onClose} />
  </>
}
