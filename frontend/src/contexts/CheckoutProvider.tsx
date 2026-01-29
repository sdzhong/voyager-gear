import React, { createContext, useContext, useState, ReactNode } from 'react'
import { CheckoutState, Address, PaymentInfo } from '@/types/checkout.types'

interface CheckoutContextType {
  checkoutState: CheckoutState
  updateCheckoutState: (updates: Partial<CheckoutState>) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  resetCheckout: () => void
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

const initialAddress: Address = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'USA',
  phone: '',
}

const initialPayment: PaymentInfo = {
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  cardholderName: '',
}

const initialState: CheckoutState = {
  step: 1,
  guestEmail: '',
  shippingAddress: { ...initialAddress },
  billingAddress: { ...initialAddress },
  billingIsSameAsShipping: true,
  isGift: false,
  giftMessage: '',
  giftWrap: false,
  payment: { ...initialPayment },
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialState)

  const updateCheckoutState = (updates: Partial<CheckoutState>) => {
    setCheckoutState((prev) => ({ ...prev, ...updates }))
  }

  const goToNextStep = () => {
    setCheckoutState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 5) }))
  }

  const goToPreviousStep = () => {
    setCheckoutState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }))
  }

  const resetCheckout = () => {
    setCheckoutState(initialState)
  }

  return (
    <CheckoutContext.Provider
      value={{
        checkoutState,
        updateCheckoutState,
        goToNextStep,
        goToPreviousStep,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider')
  }
  return context
}
