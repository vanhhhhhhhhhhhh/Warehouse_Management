import { Product } from '../schemas/productSchema'
import client, { GetParams, PaginatedResponse, withDefaults } from './client'
import { API_URL } from '../config/api.config'

interface ProductListing {
  _id: string
  code: string
  name: string
  category: string
  price: number
}

export async function getProducts(params?: GetParams): Promise<PaginatedResponse<ProductListing>> {
  const paramsWithDefaults = withDefaults(params)
  const response = await client.get<PaginatedResponse<ProductListing>>(API_URL.PRODUCTS.LIST, { params: paramsWithDefaults })
  return response.data
}

export async function getProduct(id: string): Promise<Product> {
  const response = await client.get<Product>(API_URL.PRODUCTS.GET(id))
  return response.data
}

export async function createProduct(product: Product): Promise<Product> {
  const response = await client.post<Product>(API_URL.PRODUCTS.CREATE, product)
  return response.data
}

export async function updateProduct(id: string, product: Product): Promise<Product> {
  const response = await client.put<Product>(API_URL.PRODUCTS.UPDATE(id), product)
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await client.delete(API_URL.PRODUCTS.DELETE(id))
}