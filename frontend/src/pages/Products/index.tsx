/**
 * Products Catalog Page
 * Displays product catalog with filtering, search, and pagination
 */

import React, { useEffect, useState } from 'react'
import { productService } from '@/services/product.service'
import type { ProductFilters, ProductListResponse, ProductCategory } from '@/types/product.types'
import ProductList from '@/components/products/ProductList'
import * as Sentry from '@sentry/react'

const Products: React.FC = () => {
  const [data, setData] = useState<ProductListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    page_size: 12,
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await productService.getProducts(filters)
        setData(response)

        // Track product page view metric
        Sentry.metrics.count('product_page_view', 1, {
          tags: {
            category: filters.category || 'all',
            has_search: filters.search ? 'true' : 'false',
          },
        })

        // Track total products as a gauge
        Sentry.metrics.gauge('products_displayed', response.products.length, {
          tags: {
            category: filters.category || 'all',
          },
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category === 'all' ? undefined : (category as ProductCategory),
      page: 1,
    }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value

    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
      page: 1,
    }))
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-')
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy as 'price' | 'name' | 'created_at',
      sort_order: sortOrder as 'asc' | 'desc',
      page: 1,
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'luggage', label: 'Luggage' },
    { value: 'bags', label: 'Bags' },
    { value: 'travel_accessories', label: 'Travel Accessories' },
    { value: 'digital_nomad', label: 'Digital Nomad' },
  ]

  const sortOptions = [
    { value: 'created_at-desc', label: 'Newest First' },
    { value: 'created_at-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Product Catalog</h1>
          <p className="text-blue-100">
            Discover premium travel gear for your next adventure
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or description..."
                value={filters.search || ''}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={`${filters.sort_by}-${filters.sort_order}`}
                onChange={handleSortChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    (category.value === 'all' && !filters.category) ||
                    filters.category === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Info */}
        {data && !isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {data.products.length} of {data.total} products
            {filters.category && (
              <span className="ml-2 text-blue-600 font-medium">
                in {categories.find((c) => c.value === filters.category)?.label}
              </span>
            )}
          </div>
        )}

        {/* Product Grid */}
        <ProductList products={data?.products || []} isLoading={isLoading} />

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === data.total_pages ||
                    Math.abs(page - data.page) <= 1
                  )
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1]
                  const showEllipsis = prevPage && page - prevPage > 1

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          page === data.page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  )
                })}
            </div>

            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page === data.total_pages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
