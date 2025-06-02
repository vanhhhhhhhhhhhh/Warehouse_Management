const BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:9999';

export const API_URL = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    VERIFY_TOKEN: `${BASE_URL}/auth/verify-token`,
  },

  // Products endpoints
  PRODUCTS: {
    LIST: `${BASE_URL}/products`,
    CATEGORIES: `${BASE_URL}/products/categories`,
    DETAIL: (id) => `${BASE_URL}/products/${id}`,
    CREATE: `${BASE_URL}/products`,
    UPDATE: (id) => `${BASE_URL}/products/${id}`,
    DELETE: (id) => `${BASE_URL}/products/${id}`,
    DEFECTIVE: {
      LIST: `${BASE_URL}/products/defective`,
      CREATE: `${BASE_URL}/products/defective`,
      UPDATE: (id) => `${BASE_URL}/products/defective/${id}`,
      DELETE: (id) => `${BASE_URL}/products/defective/${id}`,
    }
  },

  // Staff endpoints
  STAFF: {
    LIST: `${BASE_URL}/staff`,
    DETAIL: (id) => `${BASE_URL}/staff/${id}`,
    CREATE: `${BASE_URL}/staff`,
    UPDATE: (id) => `${BASE_URL}/staff/${id}`,
    DELETE: (id) => `${BASE_URL}/staff/${id}`,
    ROLES: {
      LIST: `${BASE_URL}/staff/roles`,
      CREATE: `${BASE_URL}/staff/roles`,
      UPDATE: (id) => `${BASE_URL}/staff/roles/${id}`,
      DELETE: (id) => `${BASE_URL}/staff/roles/${id}`,
    }
  },

  // Warehouse endpoints
  WAREHOUSE: {
    LIST: `${BASE_URL}/warehouse`,
    DETAIL: (id) => `${BASE_URL}/warehouse/${id}`,
    CREATE: `${BASE_URL}/warehouse`,
    UPDATE: (id) => `${BASE_URL}/warehouse/${id}`,
    DELETE: (id) => `${BASE_URL}/warehouse/${id}`,
    STOCK: {
      IN: {
        CREATE: `${BASE_URL}/warehouse/stock-in`,
        HISTORY: `${BASE_URL}/warehouse/stock-in/history`,
      },
      OUT: {
        CREATE: `${BASE_URL}/warehouse/stock-out`,
        HISTORY: `${BASE_URL}/warehouse/stock-out/history`,
      },
      INVENTORY: `${BASE_URL}/warehouse/inventory`,
      REPORT: `${BASE_URL}/warehouse/report`,
    }
  },

  // Common endpoints for file handling
  COMMON: {
    UPLOAD_FILE: `${BASE_URL}/upload`,
    DELETE_FILE: (fileId) => `${BASE_URL}/files/${fileId}`,
  }
};

// Axios configuration
export const AXIOS_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
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
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
}; 