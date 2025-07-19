import { ImportProductRequest, ImportProductResponse } from './api'
import client, { GetParams, PaginatedResponse, withPaginationDefaults } from './client'
import { API_URL } from '../config/api.config'

export async function importFile(request: ImportProductRequest): Promise<ImportProductResponse> {
  const response = await client.post<ImportProductResponse>(
    API_URL.EXCEL.IMPORT,
    request,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

export async function exportFile(): Promise<void> {
  const response = await client.get(API_URL.EXCEL.EXPORT, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'products.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
