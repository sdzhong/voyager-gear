/**
 * Product service for API calls
 */

import type { Product, ProductFilters, ProductListResponse } from '@/types/product.types'
import { apiClient } from './api'

export const productService = {
  /**
   * Get paginated list of products with filters
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const params = new URLSearchParams()

    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString())
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString())
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_order) params.append('sort_order', filters.sort_order)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.page_size) params.append('page_size', filters.page_size.toString())

    const queryString = params.toString()
    const url = `/api/products${queryString ? `?${queryString}` : ''}`

    return apiClient.get<ProductListResponse>(url)
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(`/api/products/${id}`)
  },
}
