export interface ProductAttributes {
  name: string
  value: string
}

// Product API response type (used for GET /products/:id and PUT /products/:id)
export interface Product {
  _id: string
  createdAt: string
  updatedAt: string
  code: string
  name: string
  description: string
  price: number
  attributes: ProductAttributes[]
  isDelete: boolean
  imageId: string
  categoryId: string
  adminId: string
}

// Product request type for POST/PUT operations
export interface ProductRequest {
  code: string
  name: string
  description: string
  price: number
  attributes: ProductAttributes[]
  isDelete: boolean
  image?: File
  categoryId: string
}

// Product listing type for GET /products (list view)
export interface ProductListing {
  _id: string
  code: string
  name: string
  category: string
  price: number
  isDelete: boolean
}

// Category API response type (used for GET /categories/:id and PUT /categories/:id)
export interface Category {
  _id: string
  createdAt: string
  updatedAt: string
  name: string
  adminId: string
  isDelete: boolean
}

// Category request type for POST/PUT operations
export interface CategoryRequest {
  name: string
}

// Category listing type for GET /categories (list view)
export interface CategoryListing {
  _id: string
  name: string
  isDelete: boolean
  createdAt: string
}
