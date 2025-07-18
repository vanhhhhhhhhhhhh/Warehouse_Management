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
