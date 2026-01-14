/**
 * Product types for the catalog
 */

export enum ProductCategory {
  LUGGAGE = 'luggage',
  BAGS = 'bags',
  TRAVEL_ACCESSORIES = 'travel_accessories',
  DIGITAL_NOMAD = 'digital_nomad',
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: ProductCategory
  image_url: string
  stock: number
  created_at: string
  updated_at: string
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ProductFilters {
  category?: ProductCategory
  search?: string
  min_price?: number
  max_price?: number
  sort_by?: 'price' | 'name' | 'created_at'
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}
