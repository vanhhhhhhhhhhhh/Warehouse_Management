import { Product, ProductListing, ProductRequest } from '../schemas/productSchema'
import client, { GetParams, PaginatedResponse, withDefaults } from './client'
import { API_URL } from '../config/api.config'

export async function getProducts(params?: GetParams): Promise<PaginatedResponse<ProductListing>> {
  const paramsWithDefaults = withDefaults(params)
  const response = await client.get<PaginatedResponse<ProductListing>>(API_URL.PRODUCTS.LIST, { params: paramsWithDefaults })
  return response.data
}

export async function getProduct(id: string): Promise<Product> {
  const response = await client.get<Product>(API_URL.PRODUCTS.DETAIL(id))
  return response.data
}

export async function createProduct(product: ProductRequest): Promise<Product> {
  const response = await client.post<Product>(API_URL.PRODUCTS.CREATE, product, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export async function updateProduct(id: string, product: ProductRequest): Promise<Product> {
  const response = await client.put<Product>(API_URL.PRODUCTS.UPDATE(id), product, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export async function deactivateProducts(ids: string[]): Promise<void> {
  await client.post(API_URL.PRODUCTS.DEACTIVATE, { ids })
}

export async function activateProducts(ids: string[]): Promise<void> {
  await client.post(API_URL.PRODUCTS.ACTIVATE, { ids })
}