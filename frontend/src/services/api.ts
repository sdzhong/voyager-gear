/**
 * HTTP client with automatic JWT token injection
 */

import { getStoredToken } from '@/utils/storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public detail?: any,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * HTTP client for making API requests
 */
export class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Make an HTTP request with automatic token injection
   */
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { requiresAuth = false, headers = {}, ...restConfig } = config

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    }

    // Add Authorization header if auth is required
    if (requiresAuth) {
      const token = getStoredToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    const url = `${this.baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...restConfig,
        headers: requestHeaders,
      })

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T
      }

      // Parse response JSON
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new ApiError(
          data.detail || response.statusText || 'Request failed',
          response.status,
          data,
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network errors or other issues
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
      )
    }
  }

  /**
   * Make a GET request
   */
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * Make a DELETE request
   */
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
