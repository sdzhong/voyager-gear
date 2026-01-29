import { apiClient } from './api'
import { CheckoutData, CheckoutResponse } from '@/types/checkout.types'
import { getStoredToken } from '@/utils/storage'

const CHECKOUT_URL = import.meta.env.VITE_CHECKOUT_URL || 'http://localhost:5002'

class CheckoutService {
  async processCheckout(data: CheckoutData): Promise<CheckoutResponse> {
    const token = getStoredToken()
    const response = await fetch(`${CHECKOUT_URL}/api/checkout/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Checkout failed')
    }

    return response.json()
  }

  async processGuestCheckout(data: CheckoutData): Promise<CheckoutResponse> {
    const response = await fetch(`${CHECKOUT_URL}/api/guest-checkout/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Guest checkout failed')
    }

    return response.json()
  }
}

export const checkoutService = new CheckoutService()
