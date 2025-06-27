import React, { useRef, ChangeEvent, DragEvent, useState, useMemo } from 'react'
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik'
import * as Yup from 'yup'
import { KTSVG } from '../../../../_metronic/helpers'
import ProperBadge from '../../../reusableWidgets/ProperBadge'

interface FileParsingOptions {
  overrideExisting: boolean,
  errorHandlingStrategy: "skip" | "fail"
}

interface FileUploadRequest {
  mappings: Record<string, string>,
  options: FileParsingOptions
}

interface FileFieldLabel {
  key: string
  label: string
  required: boolean
}

interface FileUploadState extends FileUploadRequest {
  fileFields: string[]
  availableFields: FileFieldLabel[]
}

interface ImportModalProps {
  show: boolean
  fileUploadState?: FileUploadState
  onClose: () => void
  onPrepareFile: (file: File) => Promise<void>
  onFinishUpload: (newState: FileUploadRequest) => Promise<void>
}

const AskForFileScreen: React.FC<{
  onFileChosen: (file: File) => Promise<void>
  onClose: () => void
}> = ({ onFileChosen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)


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
      await onFileChosen(importFile)
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
                onClick={onClose}
                disabled={importing}
              ></button>
            </div>
            <div className='modal-body'>
              {/* Drag and drop area */}
              <div
                className={`border-2 border-dashed d-flex flex-column align-items-center justify-content-center p-7 ${isDragging ? 'border-primary bg-light-primary' : 'border-gray-300'
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
                  accept='.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
                  multiple={false}
                  required
                  className='d-none'
                  onChange={handleFileSelect}
                  disabled={importing}
                />
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
                onClick={handleImport}
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

const renderFields = (fileUploadState: FileUploadState, formikOptions: FormikProps<FileUploadRequest>) => {
  return fileUploadState.fileFields.map(fileField => (
    <tr key={fileField}>
      <td>
        <span className='fw-bold'>{fileField}</span>
      </td>
      <td>
        <Field name={`mappings.${fileField}`}>
          {({ field }: any) => (
            <select
              {...field}
              className={`form-select ${formikOptions.errors.mappings && formikOptions.touched.mappings &&
                (formikOptions.errors.mappings as any)[fileField] ? 'is-invalid' : ''
                }`}
              disabled={formikOptions.isSubmitting}
              onChange={(e) => formikOptions.setFieldValue(`mappings.${fileField}`, e.target.value)}
            >
              <option value=''>-- Không ánh xạ --</option>
              {fileUploadState.availableFields.map(availableField => (
                <option key={availableField.key} value={availableField.key}>
                  {availableField.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <ErrorMessage
          name={`mappings.${fileField}`}
          component="div"
          className="invalid-feedback d-block"
        />
      </td>
    </tr>
  ));
}


const UploadConfigurationScreen: React.FC<{
  onFinishUpload: (newState: FileUploadRequest) => Promise<void>
  onClose: () => void
  fileUploadState: FileUploadState
}> = ({ onFinishUpload, onClose, fileUploadState }) => {
  const [isUploading, setIsUploading] = useState(false)

  const mappingValidationSchema = useMemo(() => Yup.object().shape({
    mappings: Yup.object().test('required-mappings', 'Vui lòng chọn cột cho các trường bắt buộc', function (value) {
      const requiredFields = fileUploadState.availableFields.filter(field => field.required)
      const enteredFields = new Set(Object.values(value as Record<string, string>))
      const requiredFieldsNotEntered = requiredFields.filter(field => !enteredFields.has(field.key))

      if (requiredFieldsNotEntered.length > 0) {
        return this.createError({
          message: `Vui lòng ánh xạ các trường bắt buộc: ${requiredFieldsNotEntered.map(field => field.label).join(', ')}`
        })
      }

      return true
    }),
    options: Yup.object().shape({
      overrideExisting: Yup.boolean(),
      errorHandlingStrategy: Yup.string().oneOf(['skip', 'fail'])
    })
  }), [fileUploadState.availableFields])


  const initialValues = {
    mappings: fileUploadState.mappings || {} as Record<string, string>,
    options: fileUploadState.options || {
      overrideExisting: false,
      errorHandlingStrategy: 'skip' as const
    }
  }

  const handleSubmit = async (values: typeof initialValues) => {
    setIsUploading(true)
    try {
      await onFinishUpload(values)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
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
      <div className='modal-dialog modal-dialog-centered modal-lg' style={{
        marginTop: '2rem',
        maxWidth: '900px',
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'all 0.5s ease',
        animation: 'modal-fade-in 0.5s ease'
      }}>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Cấu hình nhập dữ liệu</h5>
            <button
              type='button'
              className='btn-close'
              onClick={onClose}
              disabled={isUploading}
            ></button>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={mappingValidationSchema}
            onSubmit={handleSubmit}
          >
            {(formikOptions) => (
              <Form placeholder=''>
                <div className='modal-body'>
                  <div className='row'>
                    <div className='col-12'>
                      <h6 className='mb-4'>Ánh xạ cột Excel với trường sản phẩm</h6>

                      <div className='table-responsive' style={{ marginBottom: 10, maxHeight: 400, overflowY: 'auto' }}>
                        <table className='table table-bordered table-hover table-striped'>
                          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>
                            <tr>
                              <th>Cột trong file Excel</th>
                              <th>Trường sản phẩm</th>
                            </tr>
                          </thead>
                          <tbody>
                            {renderFields(fileUploadState, formikOptions)}
                          </tbody>
                        </table>
                      </div>

                      <ErrorMessage name='mappings' component='div' className='alert alert-danger' />

                      <div className='separator my-6'></div>

                      <h6 className='mb-4'>Tùy chọn nhập dữ liệu</h6>

                      <div className='form-check form-switch mb-4'>
                        <Field name="options.overrideExisting">
                          {({ field }: any) => (
                            <input
                              {...field}
                              className='form-check-input'
                              type='checkbox'
                              id='overrideExisting'
                              checked={formikOptions.values.options.overrideExisting}
                              onChange={(e) => formikOptions.setFieldValue('options.overrideExisting', e.target.checked)}
                              disabled={isUploading}
                            />
                          )}
                        </Field>
                        <label className='form-check-label' htmlFor='overrideExisting'>
                          Ghi đè sản phẩm đã tồn tại
                        </label>
                        <div className='form-text'>
                          Nếu bật, sản phẩm có cùng SKU sẽ được cập nhật thay vì bỏ qua
                        </div>
                      </div>

                      <div className='mb-4'>
                        <label className='form-label'>Xử lý lỗi</label>
                        <div className='form-check'>
                          <Field name="options.errorHandlingStrategy">
                            {({ field }: any) => (
                              <input
                                {...field}
                                className='form-check-input'
                                type='radio'
                                id='errorSkip'
                                value='skip'
                                checked={formikOptions.values.options.errorHandlingStrategy === 'skip'}
                                onChange={(e) => formikOptions.setFieldValue('options.errorHandlingStrategy', e.target.value)}
                                disabled={isUploading}
                              />
                            )}
                          </Field>
                          <label className='form-check-label' htmlFor='errorSkip'>
                            Bỏ qua dòng lỗi và tiếp tục
                          </label>
                        </div>
                        <div className='form-check'>
                          <Field name="options.errorHandlingStrategy">
                            {({ field }: any) => (
                              <input
                                {...field}
                                className='form-check-input'
                                type='radio'
                                id='errorFail'
                                value='fail'
                                checked={formikOptions.values.options.errorHandlingStrategy === 'fail'}
                                onChange={(e) => formikOptions.setFieldValue('options.errorHandlingStrategy', e.target.value)}
                                disabled={isUploading}
                              />
                            )}
                          </Field>
                          <label className='form-check-label' htmlFor='errorFail'>
                            Dừng lại khi gặp lỗi
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-light'
                    onClick={onClose}
                    disabled={isUploading}
                  >
                    Hủy
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={isUploading || !formikOptions.isValid}
                  >
                    {isUploading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                        Đang xử lý...
                      </>
                    ) : 'Bắt đầu nhập'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Style cho animation */}
      <style>{`
        @keyframes modal-fade-in {
          from { opacity: 0; transform: translateY(-60px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export const ImportModal: React.FC<ImportModalProps> = ({
  show,
  onClose,
  onPrepareFile,
  onFinishUpload,
  fileUploadState
}) => {
  if (!show) return null

  if (!fileUploadState) {
    return <AskForFileScreen onFileChosen={onPrepareFile} onClose={onClose} />
  }

  return <UploadConfigurationScreen onFinishUpload={onFinishUpload} onClose={onClose} fileUploadState={fileUploadState} />
}
