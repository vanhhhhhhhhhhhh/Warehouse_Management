import { Category, CategoryListing, CategoryRequest } from './api'
import client, { GetParams, PaginatedResponse, withPaginationDefaults } from './client'
import { API_URL } from '../config/api.config'

export async function getCategories(params?: GetParams): Promise<PaginatedResponse<CategoryListing>> {
  const paginationParamsWithDefaults = withPaginationDefaults(params?.pagination)
  const response = await client.get<PaginatedResponse<CategoryListing>>(API_URL.CATEGORIES.LIST, {
    params: {
      ...paginationParamsWithDefaults,
      ...params?.search
    },
  });
  return response.data
}

export async function getCategory(id: string): Promise<Category> {
  const response = await client.get<Category>(API_URL.CATEGORIES.DETAIL(id))
  return response.data
}

export async function createCategory(category: CategoryRequest): Promise<Category> {
  const response = await client.post<Category>(API_URL.CATEGORIES.CREATE, category)
  return response.data
}

export async function updateCategory(id: string, category: CategoryRequest): Promise<Category> {
  const response = await client.put<Category>(API_URL.CATEGORIES.UPDATE(id), category)
  return response.data
}

export async function activateCategories(ids: string[]): Promise<void> {
  await client.post(API_URL.CATEGORIES.ACTIVATE, { ids })
}

export async function deactivateCategories(ids: string[]): Promise<void> {
  await client.post(API_URL.CATEGORIES.DEACTIVATE, { ids })
}
