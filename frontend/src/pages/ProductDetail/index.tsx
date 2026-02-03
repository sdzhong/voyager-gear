/**
 * Product Detail Page
 * Displays detailed information about a single product
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productService } from '@/services/product.service'
import type { Product } from '@/types/product.types'
import { useCart } from '@/hooks/useCart'
import * as Sentry from '@sentry/react'

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addToCartSuccess, setAddToCartSuccess] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)
      try {
        const data = await productService.getProduct(parseInt(id))
        setProduct(data)

        // Track product page view metric
        Sentry.metrics.count('products_page_views', 1, {
          tags: {
            product_id: id,
            product_category: data.category,
          },
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleAddToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    setAddToCartSuccess(false)

    try {
      await addToCart(product.id, quantity)
      setAddToCartSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setAddToCartSuccess(false)
      }, 3000)
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      alert(error.message || 'Failed to add item to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="text-blue-600 hover:text-blue-800">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
              {formatCategory(product.category)}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock === 0 ? (
                <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Out of Stock
                </div>
              ) : product.stock < 10 ? (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Only {product.stock} left in stock
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  In Stock
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <label htmlFor="quantity" className="text-gray-700 font-medium">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding...' : addToCartSuccess ? '✓ Added to Cart!' : 'Add to Cart'}
                </button>
                {addToCartSuccess && (
                  <p className="text-green-600 text-center font-medium">
                    Item added to cart successfully!
                  </p>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="text-gray-900 font-medium">{formatCategory(product.category)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Product ID:</dt>
                  <dd className="text-gray-900 font-medium">#{product.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Availability:</dt>
                  <dd className="text-gray-900 font-medium">
                    {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Products
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
