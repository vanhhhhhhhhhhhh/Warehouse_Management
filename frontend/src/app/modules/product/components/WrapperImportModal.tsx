import React, { useState, useCallback } from 'react'
import { ImportModal } from './ImportModal'
import Swal from 'sweetalert2'

interface FileFieldLabel {
  key: string
  label: string
  required: boolean
}

interface FileParsingOptions {
  overrideExisting: boolean
  errorHandlingStrategy: "skip" | "fail"
}

interface FileUploadRequest {
  mappings: Record<string, string>
  options: FileParsingOptions
}

interface FileUploadState extends FileUploadRequest {
  fileFields: string[]
  availableFields: FileFieldLabel[]
}

interface WrapperImportModalProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Simulated available fields in the product system
const AVAILABLE_PRODUCT_FIELDS: FileFieldLabel[] = [
  { key: 'name', label: 'Tên sản phẩm', required: true },
  { key: 'code', label: 'Mã sản phẩm', required: false },
  { key: 'description', label: 'Mô tả', required: false },
  { key: 'price', label: 'Giá bán', required: true },
  { key: 'cost', label: 'Giá vốn', required: false },
  { key: 'quantity', label: 'Số lượng', required: true },
  { key: 'category', label: 'Danh mục', required: false },
  { key: 'brand', label: 'Thương hiệu', required: false },
  { key: 'sku', label: 'SKU', required: false },
  { key: 'weight', label: 'Trọng lượng', required: false },
  { key: 'dimensions', label: 'Kích thước', required: false },
  { key: 'color', label: 'Màu sắc', required: false },
  { key: 'size', label: 'Kích cỡ', required: false },
  { key: 'tags', label: 'Tags', required: false },
]

// Simulate parsing Excel file to extract column headers
const simulateExcelParsing = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate parsing the Excel file and extracting headers
      // In a real implementation, you would use libraries like xlsx or exceljs

      // Simulate some common Excel column names that might be found
      const mockExcelHeaders = [
        'Tên sản phẩm',
        'Mã SP',
        'Giá',
        'Số lượng',
        'Danh mục',
        'Mô tả',
        'Thương hiệu',
        'Màu sắc',
        'Kích thước',
        'Trọng lượng'
      ]

      // Simulate potential parsing errors
      if (file.size > 5 * 1024 * 1024) { // > 5MB
        reject(new Error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB'))
        return
      }

      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        reject(new Error('Định dạng file không hợp lệ. Vui lòng chọn file Excel'))
        return
      }

      resolve(mockExcelHeaders)
    }, 1500) // Simulate network delay
  })
}

// Simulate the actual import process
const simulateProductImport = async (fileUploadRequest: FileUploadRequest): Promise<{
  imported: number
  errors: string[]
  skipped: number
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate validation of mappings
      const requiredFields = AVAILABLE_PRODUCT_FIELDS.filter(field => field.required)
      const mappedRequiredFields = Object.values(fileUploadRequest.mappings).filter(mapped =>
        requiredFields.some(field => field.key === mapped)
      )

      if (mappedRequiredFields.length < requiredFields.length) {
        reject(new Error('Thiếu các trường bắt buộc trong mapping'))
        return
      }

      // Simulate processing with some results
      const mockResults = {
        imported: Math.floor(Math.random() * 45) + 5, // 5-50 products imported
        errors: [
          'Dòng 15: Giá không hợp lệ',
          'Dòng 23: Tên sản phẩm trống',
          'Dòng 31: Số lượng phải là số dương'
        ].slice(0, Math.floor(Math.random() * 3)), // 0-3 errors
        skipped: Math.floor(Math.random() * 5) // 0-5 skipped
      }

      // Simulate potential failure
      if (Math.random() < 0.1) { // 10% chance of failure
        reject(new Error('Lỗi hệ thống khi xử lý file. Vui lòng thử lại sau.'))
        return
      }

      resolve(mockResults)
    }, 3000) // Simulate processing time
  })
}

export const WrapperImportModal: React.FC<WrapperImportModalProps> = ({
  show,
  onClose,
  onSuccess
}) => {
  const [fileUploadState, setFileUploadState] = useState<FileUploadState | undefined>(undefined)

  const handlePrepareFile = useCallback(async (file: File) => {
    try {
      // Show loading state
      Swal.fire({
        title: 'Đang xử lý file...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // Simulate parsing the Excel file
      const fileFields = await simulateExcelParsing(file)

      // Close loading dialog
      Swal.close()

      // Set up the file upload state for configuration
      setFileUploadState({
        fileFields,
        availableFields: AVAILABLE_PRODUCT_FIELDS,
        mappings: {},
        options: {
          overrideExisting: false,
          errorHandlingStrategy: 'skip'
        }
      })

    } catch (error) {
      Swal.close()
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý file'
      })
    }
  }, [])

  const handleFinishUpload = useCallback(async (uploadRequest: FileUploadRequest) => {
    console.log(uploadRequest)
    try {
      // Show loading state
      Swal.fire({
        title: 'Đang nhập dữ liệu...',
        text: 'Quá trình này có thể mất vài phút',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // Simulate the import process
      const results = await simulateProductImport(uploadRequest)

      // Close loading dialog
      Swal.close()

      // Show results
      const hasErrors = results.errors.length > 0
      const hasSkipped = results.skipped > 0

      let message = `Đã nhập thành công ${results.imported} sản phẩm.`
      if (hasSkipped) {
        message += `\nBỏ qua ${results.skipped} sản phẩm.`
      }
      if (hasErrors) {
        message += `\n\nLỗi gặp phải:\n${results.errors.join('\n')}`
      }

      await Swal.fire({
        icon: hasErrors ? 'warning' : 'success',
        title: hasErrors ? 'Hoàn thành với lỗi' : 'Thành công!',
        text: message,
        confirmButtonText: 'OK'
      })

      // Reset state and close modal
      setFileUploadState(undefined)
      onClose()

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      Swal.close()
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi nhập dữ liệu'
      })
    }
  }, [onClose, onSuccess])

  const handleClose = useCallback(() => {
    setFileUploadState(undefined)
    onClose()
  }, [onClose])

  return (
    <ImportModal
      show={show}
      fileUploadState={fileUploadState}
      onClose={handleClose}
      onPrepareFile={handlePrepareFile}
      onFinishUpload={handleFinishUpload}
    />
  )
}
