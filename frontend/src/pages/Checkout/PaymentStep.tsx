import React, { useState } from 'react'
import { useCheckout } from '@/contexts/CheckoutProvider'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { checkoutService } from '@/services/checkout.service'
import { CheckoutData } from '@/types/checkout.types'
import * as Sentry from '@sentry/react'

export default function PaymentStep() {
  const { checkoutState, updateCheckoutState, goToNextStep, goToPreviousStep } =
    useCheckout()
  const { cart, guestCart, getSubtotal, shippingTax } = useCart()
  const { isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>('')

  const { payment, shippingAddress, billingAddress, billingIsSameAsShipping, guestEmail } =
    checkoutState

  const items = cart?.items || guestCart || []
  const subtotal = getSubtotal()
  const taxAmount = shippingTax?.tax_amount || 0
  const shippingAmount = shippingTax?.shipping_amount || 0
  const total = subtotal + taxAmount + shippingAmount

  const handleChange = (field: string, value: string) => {
    updateCheckoutState({
      payment: {
        ...payment,
        [field]: value,
      },
    })
  }

  const getCardBrand = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0)
    if (firstDigit === '4') return 'Visa'
    if (firstDigit === '5') return 'Mastercard'
    if (firstDigit === '3') return 'Amex'
    return 'Unknown'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsProcessing(true)

    try {
      const checkoutData: CheckoutData = {
        ...((!isAuthenticated && guestEmail) ? { guest_email: guestEmail } : {}),
        shipping_address: {
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          address_line1: shippingAddress.addressLine1,
          address_line2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip_code: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        billing_address: billingIsSameAsShipping
          ? {
              first_name: shippingAddress.firstName,
              last_name: shippingAddress.lastName,
              address_line1: shippingAddress.addressLine1,
              address_line2: shippingAddress.addressLine2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zip_code: shippingAddress.zipCode,
              country: shippingAddress.country,
            }
          : {
              first_name: billingAddress.firstName,
              last_name: billingAddress.lastName,
              address_line1: billingAddress.addressLine1,
              address_line2: billingAddress.addressLine2,
              city: billingAddress.city,
              state: billingAddress.state,
              zip_code: billingAddress.zipCode,
              country: billingAddress.country,
            },
        billing_same_as_shipping: billingIsSameAsShipping,
        is_gift: checkoutState.isGift,
        gift_message: checkoutState.giftMessage,
        gift_wrap: checkoutState.giftWrap,
        payment_method: 'credit_card',
        card_last_four: payment.cardNumber.slice(-4),
        card_brand: getCardBrand(payment.cardNumber),
        items: items.map((item: any) => ({
          product_id: item.product_id || item.product?.id,
          product_name: item.product?.name || '',
          product_price: item.product?.price || 0,
          quantity: item.quantity,
          subtotal: (item.product?.price || 0) * item.quantity,
        })),
        subtotal,
        discount_amount: 0,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: total,
      }

      // Call appropriate checkout method based on authentication status
      const response = isAuthenticated
        ? await checkoutService.processCheckout(checkoutData)
        : await checkoutService.processGuestCheckout(checkoutData)

      setOrderNumber(response.order_number)
      goToNextStep()
    } catch (err: any) {
      // Determine error type and message
      let errorMessage = 'Failed to process checkout'
      const isNetworkError = err.message?.includes('fetch') || err.name === 'TypeError'

      if (isNetworkError) {
        errorMessage = 'Unable to connect to checkout service. The service may be unavailable. Please try again later.'
      } else {
        errorMessage = err.message || errorMessage
      }

      setError(errorMessage)

      // Capture error in Sentry with additional context
      Sentry.captureException(err, {
        level: 'error',
        tags: {
          component: 'PaymentStep',
          action: 'place_order',
          checkout_type: isAuthenticated ? 'authenticated' : 'guest',
          error_type: isNetworkError ? 'network_error' : 'checkout_error',
        },
        contexts: {
          checkout: {
            isAuthenticated,
            itemCount: items.length,
            totalAmount: total,
            hasGuestEmail: !!guestEmail,
            billingIsSameAsShipping,
          },
        },
        extra: {
          errorMessage,
          originalError: err.message,
          checkoutServiceUrl: 'http://localhost:5002',
        },
      })

      console.error('Checkout error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="payment-step">
      <h2 className="text-2xl font-bold mb-6">Payment Information</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Card Number *
              </label>
              <input
                type="text"
                required
                maxLength={16}
                pattern="[0-9]{16}"
                placeholder="1234567812345678"
                value={payment.cardNumber}
                onChange={(e) =>
                  handleChange('cardNumber', e.target.value.replace(/\D/g, ''))
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiration Month *
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  pattern="[0-9]{2}"
                  placeholder="MM"
                  value={payment.expiryMonth}
                  onChange={(e) =>
                    handleChange('expiryMonth', e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiration Year *
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  pattern="[0-9]{2}"
                  placeholder="YY"
                  value={payment.expiryYear}
                  onChange={(e) =>
                    handleChange('expiryYear', e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">CVV *</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  pattern="[0-9]{3,4}"
                  placeholder="123"
                  value={payment.cvv}
                  onChange={(e) =>
                    handleChange('cvv', e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  value={payment.cardholderName}
                  onChange={(e) => handleChange('cardholderName', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={isProcessing}
                className="bg-gray-200 text-gray-800 py-3 px-6 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>${shippingAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              {checkoutState.giftWrap && (
                <div className="flex justify-between text-sm">
                  <span>Gift Wrap:</span>
                  <span>$5.00</span>
                </div>
              )}
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
