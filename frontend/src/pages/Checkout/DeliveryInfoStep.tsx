import React from 'react'
import { useCheckout } from '@/contexts/CheckoutProvider'
import { useAuth } from '@/hooks/useAuth'

export default function DeliveryInfoStep() {
  const { checkoutState, updateCheckoutState, goToNextStep } = useCheckout()
  const { shippingAddress, isGift, guestEmail } = checkoutState
  const { isAuthenticated } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToNextStep()
  }

  const handleChange = (field: string, value: string) => {
    updateCheckoutState({
      shippingAddress: {
        ...shippingAddress,
        [field]: value,
      },
    })
  }

  return (
    <div className="delivery-info-step">
      <h2 className="text-2xl font-bold mb-6">Delivery Information</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field for guest checkout */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <label className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={guestEmail || ''}
              onChange={(e) => updateCheckoutState({ guestEmail: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border rounded"
            />
            <p className="text-xs text-gray-600 mt-1">
              We'll send your order confirmation to this email
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={shippingAddress.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={shippingAddress.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Street Address *
          </label>
          <input
            type="text"
            required
            value={shippingAddress.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Apartment, suite, etc. (optional)
          </label>
          <input
            type="text"
            value={shippingAddress.addressLine2 || ''}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input
              type="text"
              required
              value={shippingAddress.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State *</label>
            <input
              type="text"
              required
              maxLength={2}
              value={shippingAddress.state}
              onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              required
              value={shippingAddress.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={shippingAddress.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div style={{ display: 'none' }} aria-hidden="true">
          <input
            type="checkbox"
            id="isGift"
            checked={isGift}
            onChange={(e) => updateCheckoutState({ isGift: e.target.checked })}
          />
          <label htmlFor="isGift">Send as gift</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700"
        >
          Continue to Billing
        </button>
      </form>
    </div>
  )
}
