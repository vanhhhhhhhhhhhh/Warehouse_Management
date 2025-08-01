import { Product, ProductListing, ProductRequest } from './api';
import client, {
  GetParams,
  PaginatedResponse,
  withPaginationDefaults,
} from './client';
import { API_URL } from '../config/api.config';

export async function getProducts(
  params?: GetParams,
): Promise<PaginatedResponse<ProductListing>> {
  const paginationParamsWithDefaults = withPaginationDefaults(
    params?.pagination,
  );
  const response = await client.get<PaginatedResponse<ProductListing>>(
    API_URL.PRODUCTS.LIST,
    {
      params: {
        ...paginationParamsWithDefaults,
        ...params?.search,
      },
    },
  );
  return response.data;
}

function patchImageUrl(product: Product) {
  if (product.imageId) {
    //add base url to image id
    product.imageId = API_URL.IMAGES.GET(product.imageId);
  }

  return product;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await client.get<Product>(API_URL.PRODUCTS.DETAIL(id));
  return patchImageUrl(response.data);
}

export async function createProduct(product: ProductRequest): Promise<Product> {
  const response = await client.post<Product>(
    API_URL.PRODUCTS.CREATE,
    product,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return patchImageUrl(response.data);
}

export async function updateProduct(
  id: string,
  product: ProductRequest,
): Promise<Product> {
  const response = await client.put<Product>(
    API_URL.PRODUCTS.UPDATE(id),
    product,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return patchImageUrl(response.data);
}

export async function deactivateProducts(ids: string[]): Promise<void> {
  await client.post(API_URL.PRODUCTS.DEACTIVATE, { ids });
}

export async function activateProducts(ids: string[]): Promise<void> {
  await client.post(API_URL.PRODUCTS.ACTIVATE, { ids });
}
