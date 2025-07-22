const BASE_URL = (
  import.meta.env.VITE_APP_API_URL || "http://localhost:9999"
).replace(/\/$/, "");

import * as authHelper from "../modules/auth/core/AuthHelpers";

export const API_URL = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    VERIFY_TOKEN: `${BASE_URL}/auth/verify-token`,
  },
  IMAGES: {
    GET: (id) => `${BASE_URL}/images/${id}`,
  },
  // Role endpoints
  ROLES: {
    LIST: `${BASE_URL}/roles`,
    CREATE: `${BASE_URL}/roles`,
    UPDATE: (id) => `${BASE_URL}/roles/${id}`,
    DELETE: (id) => `${BASE_URL}/roles/${id}`,
    GET: (id) => `${BASE_URL}/roles/${id}`,
  },

  // Users/Staff endpoints
  USERS: {
    LIST: `${BASE_URL}/users`,
    CREATE: `${BASE_URL}/users`,
    UPDATE: (userId) => `${BASE_URL}/users/${userId}`,
    DELETE: (userId) => `${BASE_URL}/users/${userId}`,
    DETAIL: (userId) => `${BASE_URL}/users/${userId}`,
  },

  // Categories endpoints
  CATEGORIES: {
    LIST: `${BASE_URL}/categories`,
    DETAIL: (id) => `${BASE_URL}/categories/${id}`,
    CREATE: `${BASE_URL}/categories`,
    UPDATE: (id) => `${BASE_URL}/categories/${id}`,
    DEACTIVATE: `${BASE_URL}/categories/deactivate`,
    ACTIVATE: `${BASE_URL}/categories/activate`,
  },

  EXCEL: {
    IMPORT: `${BASE_URL}/excel/import`,
    EXPORT: `${BASE_URL}/excel/export`,
    SAMPLE_URL: `${BASE_URL}/static/SampleExcel.xlsx`,
  },

  // Products endpoints
  PRODUCTS: {
    LIST: `${BASE_URL}/products`,
    CATEGORIES: `${BASE_URL}/products/categories`,
    DETAIL: (id) => `${BASE_URL}/products/${id}`,
    CREATE: `${BASE_URL}/products`,
    UPDATE: (id) => `${BASE_URL}/products/${id}`,
    DEACTIVATE: `${BASE_URL}/products/deactivate`,
    ACTIVATE: `${BASE_URL}/products/activate`,
    DEFECTIVE: {
      LIST: `${BASE_URL}/products/defective`,
      CREATE: `${BASE_URL}/products/defective`,
      UPDATE: (id) => `${BASE_URL}/products/defective/${id}`,
      DELETE: (id) => `${BASE_URL}/products/defective/${id}`,
    },
  },

  // Warehouse endpoints
  WAREHOUSE: {
    LIST: `${BASE_URL}/warehouses`,
    DETAIL: (id) => `${BASE_URL}/warehouses/${id}`,
    CREATE: `${BASE_URL}/warehouses`,
    UPDATE: (id) => `${BASE_URL}/warehouses/${id}`,
    DELETE: (id) => `${BASE_URL}/warehouses/${id}`,
    IMPORT: {
      LIST: `${BASE_URL}/import/warehouse`,
      PRODUCTS: `${BASE_URL}/import/product`,
      CREATE: `${BASE_URL}/import/intoWarehouse`,
      HISTORY: `${BASE_URL}/import/history`,
      RECEIPT: (id) => `${BASE_URL}/import/receipt/${id}`
    },
    EXPORT: {
      LIST: `${BASE_URL}/export/warehouse`,
      CREATE: `${BASE_URL}/export/fromWarehouse`,
      HISTORY: `${BASE_URL}/export/history`,
      RECEIPT: (id) => `${BASE_URL}/export/receipt/${id}`
    },
    STOCK: {
      INVENTORY: `${BASE_URL}/inventory`
    },
    REPORT: `${BASE_URL}/warehouse/report`,
  },

  // Common endpoints for file handling
  COMMON: {
    UPLOAD_FILE: `${BASE_URL}/upload`,
    DELETE_FILE: (fileId) => `${BASE_URL}/files/${fileId}`,
  },
};

// Axios configuration
export const AXIOS_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Function to get axios config with auth token
export const getAxiosConfig = () => {
  const token = authHelper.getAuth()?.api_token;

  const config = {
    ...AXIOS_CONFIG,
    headers: {
      ...AXIOS_CONFIG.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  return config;
};

// API response status codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// API error messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền truy cập tài nguyên này.",
  NOT_FOUND: "Không tìm thấy tài nguyên yêu cầu.",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
};
