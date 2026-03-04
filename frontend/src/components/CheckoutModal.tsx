import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { X, AlertCircle, CreditCard } from 'lucide-react'

const stripeKey = (import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY || ''
const stripePromise = stripeKey && stripeKey.startsWith('pk_') ? loadStripe(stripeKey) : null

interface CheckoutFormProps {
  clientSecret: string
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/order-success',
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message || 'Payment failed')
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess()
    }

    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 border border-warmgray-300 rounded-lg text-warmgray-700 hover:bg-warmgray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-2.5 px-4 bg-coral-600 text-white rounded-lg hover:bg-coral-700 disabled:opacity-50 font-medium transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Processing...
            </span>
          ) : (
            'Pay Now'
          )}
        </button>
      </div>
    </form>
  )
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clientSecret: string | null
  orderSummary: {
    eventTitle: string
    tickets: { name: string; quantity: number; price: number }[]
    subtotal: number
    fees: number
    total: number
  }
}

export function CheckoutModal({ isOpen, onClose, onSuccess, clientSecret, orderSummary }: CheckoutModalProps) {
  const [stripeReady, setStripeReady] = useState(false)
  const [configError, setConfigError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (!stripeKey || !stripeKey.startsWith('pk_')) {
        setConfigError('Payment system is not configured. Please contact support.')
      } else if (!stripePromise) {
        setConfigError('Failed to load payment system. Please try again.')
      } else {
        setStripeReady(true)
        setConfigError('')
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-warmgray-900">Complete Your Purchase</h2>
            <button onClick={onClose} className="text-warmgray-400 hover:text-warmgray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-warmgray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-warmgray-900 mb-3">{orderSummary.eventTitle}</h3>
            <div className="space-y-2 text-sm">
              {orderSummary.tickets.map((ticket, idx) => (
                <div key={idx} className="flex justify-between text-warmgray-600">
                  <span>{ticket.quantity}x {ticket.name}</span>
                  <span className="font-medium">${(ticket.price * ticket.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="border-t border-warmgray-200 pt-2 mt-2">
                <div className="flex justify-between text-warmgray-600">
                  <span>Subtotal</span>
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-warmgray-500 text-xs mt-1">
                  <span>Service Fees</span>
                  <span>${orderSummary.fees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-warmgray-900 pt-2 mt-2">
                  <span>Total</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form or Error */}
          {configError ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Payment Temporarily Unavailable</p>
                  <p className="text-sm text-yellow-700 mt-1">{configError}</p>
                  <button
                    onClick={onClose}
                    className="mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          ) : stripeReady && clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onClose} />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-coral-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
