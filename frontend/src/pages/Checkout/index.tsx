import React, { useEffect } from 'react'
import { CheckoutProvider, useCheckout } from '@/contexts/CheckoutProvider'
import { useCart } from '@/hooks/useCart'
import CartReviewStep from './CartReviewStep'
import DeliveryInfoStep from './DeliveryInfoStep'
import BillingInfoStep from './BillingInfoStep'
import PaymentStep from './PaymentStep'
import ConfirmationStep from './ConfirmationStep'
import * as Sentry from '@sentry/react'

const steps = [
  { number: 1, name: 'Cart', component: CartReviewStep },
  { number: 2, name: 'Delivery', component: DeliveryInfoStep },
  { number: 3, name: 'Billing', component: BillingInfoStep },
  { number: 4, name: 'Payment', component: PaymentStep },
  { number: 5, name: 'Confirmation', component: ConfirmationStep },
]

function CheckoutContent() {
  const { checkoutState } = useCheckout()
  const { getSubtotal } = useCart()
  const currentStep = checkoutState.step

  const CurrentStepComponent = steps[currentStep - 1].component

  // Track all metrics when user visits checkout page
  useEffect(() => {
    const cartTotal = getSubtotal()

    // Gauge metric - tracks a value that can go up or down
    Sentry.metrics.gauge('checkout_current_step', currentStep, {
      tags: {
        step_name: steps[currentStep - 1].name.toLowerCase(),
      },
    })

    // Distribution metric - tracks distribution of order amounts
    Sentry.metrics.distribution('order.amount_usd', cartTotal, {
      unit: 'usd',
      tags: {
        session_type: 'web',
      },
    })
  }, []) // Only run once when component mounts

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg
                        className="w-6 h-6"
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
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      currentStep === step.number
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <CurrentStepComponent />
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  )
}
