/**
 * Cart Provider Component
 * Manages shopping cart state for both authenticated and guest users
 */

import React, { createContext, useEffect, useState, useCallback } from 'react'
import type {
  Cart,
  CartContextType,
  CartState,
  GuestCartItem,
  PromoCode,
  ShippingTaxInfo,
} from '@/types/cart.types'
import { cartService } from '@/services/cart.service'
import {
  getStoredCart,
  setStoredCart,
  removeStoredCart,
  addToGuestCart as addToGuestCartStorage,
  updateGuestCartItem as updateGuestCartItemStorage,
  removeFromGuestCart as removeFromGuestCartStorage,
} from '@/utils/storage'
import { useAuth } from '@/hooks/useAuth'
import { productService } from '@/services/product.service'
import * as Sentry from '@sentry/react'

// Create cart context
export const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: React.ReactNode
}

/**
 * CartProvider component that wraps the app and provides cart state
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [state, setState] = useState<CartState>({
    cart: null,
    guestCart: getStoredCart(),
    isLoading: true,
    error: null,
    promoCode: null,
    shippingTax: null,
  })

  /**
   * Refresh cart from backend (authenticated users only)
   */
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const cart = await cartService.getCart()
      setState((prev) => ({ ...prev, cart, isLoading: false }))
    } catch (error: any) {
      console.error('Failed to fetch cart:', error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load cart',
      }))
    }
  }, [isAuthenticated])

  /**
   * Initialize cart on mount and auth changes
   */
  useEffect(() => {
    const initCart = async () => {
      if (authLoading) return

      if (isAuthenticated) {
        // Load guest cart from storage
        const guestCart = getStoredCart()

        // If guest cart has items, merge with user cart
        if (guestCart.length > 0) {
          try {
            await cartService.mergeGuestCart(guestCart)
            removeStoredCart() // Clear guest cart after merge
            setState((prev) => ({ ...prev, guestCart: [] }))
          } catch (error) {
            console.error('Failed to merge guest cart:', error)
          }
        }

        // Fetch user's cart
        await refreshCart()
      } else {
        // Guest user - load from localStorage
        const guestCart = getStoredCart()

        // Fetch product details for guest cart items
        try {
          const enrichedCart = await Promise.all(
            guestCart.map(async (item) => {
              try {
                const product = await productService.getProduct(item.product_id)
                return { ...item, product }
              } catch {
                return item
              }
            })
          )

          setState({
            cart: null,
            guestCart: enrichedCart,
            isLoading: false,
            error: null,
            promoCode: null,
            shippingTax: null,
          })
        } catch (error) {
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    initCart()
  }, [isAuthenticated, authLoading, refreshCart])

  /**
   * Track cart size metric whenever cart changes
   */
  useEffect(() => {
    if (state.isLoading) return

    const cartSize = isAuthenticated && state.cart
      ? state.cart.items.reduce((total, item) => total + item.quantity, 0)
      : state.guestCart.reduce((total, item) => total + item.quantity, 0)

    // Track cart size using Sentry metrics
    Sentry.metrics.gauge('cart_size', cartSize, {
      tags: {
        user_type: isAuthenticated ? 'authenticated' : 'guest',
      },
    })
  }, [state.cart, state.guestCart, state.isLoading, isAuthenticated])

  /**
   * Add item to cart
   */
  const addToCart = useCallback(
    async (productId: number, quantity: number): Promise<void> => {
      setState((prev) => ({ ...prev, error: null }))

      try {
        if (isAuthenticated) {
          const updatedCart = await cartService.addToCart(productId, quantity)
          setState((prev) => ({ ...prev, cart: updatedCart }))
        } else {
          // Guest user - add to localStorage
          addToGuestCartStorage(productId, quantity)
          const guestCart = getStoredCart()

          // Fetch product details
          try {
            const product = await productService.getProduct(productId)
            const enrichedCart = guestCart.map((item) =>
              item.product_id === productId ? { ...item, product } : item
            )
            setState((prev) => ({ ...prev, guestCart: enrichedCart }))
          } catch {
            setState((prev) => ({ ...prev, guestCart }))
          }
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to add item to cart'
        setState((prev) => ({ ...prev, error: errorMessage }))
        throw new Error(errorMessage)
      }
    },
    [isAuthenticated]
  )

  /**
   * Update cart item quantity
   */
  const updateCartItem = useCallback(
    async (itemId: number, quantity: number): Promise<void> => {
      if (!isAuthenticated) return

      setState((prev) => ({ ...prev, error: null }))

      try {
        const updatedCart = await cartService.updateCartItem(itemId, quantity)
        setState((prev) => ({ ...prev, cart: updatedCart }))
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update item'
        setState((prev) => ({ ...prev, error: errorMessage }))
        throw new Error(errorMessage)
      }
    },
    [isAuthenticated]
  )

  /**
   * Remove item from cart
   */
  const removeCartItem = useCallback(
    async (itemId: number): Promise<void> => {
      if (!isAuthenticated) return

      setState((prev) => ({ ...prev, error: null }))

      try {
        const updatedCart = await cartService.removeCartItem(itemId)
        setState((prev) => ({ ...prev, cart: updatedCart }))
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to remove item'
        setState((prev) => ({ ...prev, error: errorMessage }))
        throw new Error(errorMessage)
      }
    },
    [isAuthenticated]
  )

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, error: null }))

    try {
      if (isAuthenticated) {
        await cartService.clearCart()
        setState((prev) => ({ ...prev, cart: null }))
      } else {
        removeStoredCart()
        setState((prev) => ({ ...prev, guestCart: [] }))
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to clear cart'
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw new Error(errorMessage)
    }
  }, [isAuthenticated])

  /**
   * Save item for later
   */
  const saveForLater = useCallback(
    async (itemId: number): Promise<void> => {
      if (!isAuthenticated) return

      setState((prev) => ({ ...prev, error: null }))

      try {
        const updatedCart = await cartService.saveForLater(itemId)
        setState((prev) => ({ ...prev, cart: updatedCart }))
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to save item'
        setState((prev) => ({ ...prev, error: errorMessage }))
        throw new Error(errorMessage)
      }
    },
    [isAuthenticated]
  )

  /**
   * Restore saved item to cart
   */
  const restoreSavedItem = useCallback(
    async (savedId: number): Promise<void> => {
      if (!isAuthenticated) return

      setState((prev) => ({ ...prev, error: null }))

      try {
        const updatedCart = await cartService.restoreSavedItem(savedId)
        setState((prev) => ({ ...prev, cart: updatedCart }))
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to restore item'
        setState((prev) => ({ ...prev, error: errorMessage }))
        throw new Error(errorMessage)
      }
    },
    [isAuthenticated]
  )

  /**
   * Remove saved item
   */
  const removeSavedItem = useCallback(
    async (savedId: number): Promise<void> => {
      if (!isAuthenticated) return

      setState((prev) => ({ ...prev, error: null }))

      try {
        const updatedCart = await cartService.removeSavedItem(savedId)
        setState((prev) => ({ ...prev, cart: updatedCart }))
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to remove saved item'
        setState((prev) => ({ ...prev, error: errorMessage }))
        throw new Error(errorMessage)
      }
    },
    [isAuthenticated]
  )

  /**
   * Apply promo code
   */
  const applyPromoCode = useCallback(async (code: string): Promise<void> => {
    setState((prev) => ({ ...prev, error: null }))

    try {
      const promoCode = await cartService.validatePromoCode(code)

      if (!promoCode.is_valid) {
        setState((prev) => ({
          ...prev,
          error: promoCode.message || 'Invalid promo code',
        }))
        throw new Error(promoCode.message || 'Invalid promo code')
      }

      setState((prev) => ({ ...prev, promoCode }))
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to apply promo code'
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw new Error(errorMessage)
    }
  }, [])

  /**
   * Remove promo code
   */
  const removePromoCode = useCallback((): void => {
    setState((prev) => ({ ...prev, promoCode: null }))
  }, [])

  /**
   * Calculate shipping and tax
   */
  const calculateShippingTax = useCallback(
    async (zipCode: string): Promise<void> => {
      setState((prev) => ({ ...prev, error: null }))

      try {
        const subtotal = getSubtotal()
        const shippingTax = await cartService.calculateShippingTax(zipCode, subtotal)
        setState((prev) => ({ ...prev, shippingTax }))
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to calculate shipping'
        setState((prev) => ({ ...prev, error: errorMessage }))
        throw new Error(errorMessage)
      }
    },
    [state.cart, state.guestCart]
  )

  /**
   * Get total number of items in cart
   */
  const getCartItemCount = useCallback((): number => {
    if (isAuthenticated && state.cart) {
      return state.cart.items.reduce((total, item) => total + item.quantity, 0)
    } else {
      return state.guestCart.reduce((total, item) => total + item.quantity, 0)
    }
  }, [isAuthenticated, state.cart, state.guestCart])

  /**
   * Get cart subtotal (before tax, shipping, and discounts)
   */
  const getSubtotal = useCallback((): number => {
    if (isAuthenticated && state.cart) {
      return state.cart.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      )
    } else {
      return state.guestCart.reduce((total, item) => {
        if (item.product) {
          return total + item.product.price * item.quantity
        }
        return total
      }, 0)
    }
  }, [isAuthenticated, state.cart, state.guestCart])

  const value: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart,
    saveForLater,
    restoreSavedItem,
    removeSavedItem,
    applyPromoCode,
    removePromoCode,
    calculateShippingTax,
    getCartItemCount,
    getSubtotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
