import axios, { AxiosError } from 'axios'
//@ts-ignore
import { AXIOS_CONFIG, getAxiosConfig } from '../config/api.config'

export interface GetParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
}

export function withDefaults(params?: GetParams) {
  let page = params?.page || 1
  let limit = params?.limit || 10

  if (page < 1) {
    page = 1
  }

  if (limit < 1) {
    limit = 10
  }

  return {
    page,
    limit
  }
}


const client = axios.create({
  timeout: AXIOS_CONFIG.timeout
})

client.interceptors.request.use((config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      ...getAxiosConfig().headers
    }
  }
})

class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public error?: AxiosError
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', error?: AxiosError) {
    super(message, 401, error);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', error?: AxiosError) {
    super(message, 403, error);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Not Found', error?: AxiosError) {
    super(message, 404, error);
    this.name = 'NotFoundError';
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', error?: AxiosError) {
    super(message, 400, error);
    this.name = 'BadRequestError';
  }
}

class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', error?: AxiosError) {
    super(message, 500, error);
    this.name = 'InternalServerError';
  }
}

const CODE_TO_ERROR: Record<number, new (message?: string, error?: AxiosError) => HttpError> = {
  401: UnauthorizedError,
  403: ForbiddenError,
  404: NotFoundError,
  400: BadRequestError,
  500: InternalServerError
}

client.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response.data?.message || error.response.message
    const code = error.response.status
    const ErrorClass = CODE_TO_ERROR[code]
    if (ErrorClass) {
      return Promise.reject(new ErrorClass(message, error))
    }
    return Promise.reject(new HttpError(message, code, error))
  }
)

export default client