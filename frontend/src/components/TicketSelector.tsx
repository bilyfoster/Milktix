import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { ordersApi } from '../utils/api'
import { CheckoutModal } from './CheckoutModal'
import type { TicketType } from '../types'

interface CartItem {
  ticketType: TicketType
  quantity: number
}

interface TicketSelectorProps {
  ticketTypes: TicketType[]
  eventId: string
  eventTitle: string
}

export function TicketSelector({ ticketTypes, eventId, eventTitle }: TicketSelectorProps) {
  const { isAuthenticated } = useAuthStore()
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const addToCart = (ticketType: TicketType) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.ticketType.id === ticketType.id)
      if (existing) {
        if (existing.quantity < ticketType.maxPerOrder && existing.quantity < ticketType.quantityRemaining) {
          return prev.map((item) =>
            item.ticketType.id === ticketType.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
        return prev
      }
      return [...prev, { ticketType, quantity: 1 }]
    })
  }

  const subtotal = cart.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
  const fees = subtotal * 0.029 + 0.30
  const total = subtotal + fees

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    setIsLoading(true)
    try {
      const orderResponse = await ordersApi.create({
        eventId,
        items: cart.map((item) => ({
          ticketTypeId: item.ticketType.id,
          quantity: item.quantity,
        })),
        billingName: '',
        billingEmail: '',
      })

      const paymentResponse = await ordersApi.createPaymentIntent(orderResponse.data.id)
      setClientSecret(paymentResponse.data.clientSecret)
      setShowCheckout(true)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <>
      <div className="space-y-4">
        {ticketTypes.map((ticket) => (
          <div
            key={ticket.id}
            className={`border rounded-lg p-4 ${
              ticket.isAvailable
                ? 'border-gray-200 hover:border-primary-300'
                : 'border-gray-100 bg-gray-50 opacity-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{ticket.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {ticket.quantityRemaining} remaining
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${ticket.price.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => addToCart(ticket)}
              disabled={!ticket.isAvailable}
              className={`w-full mt-3 py-2 px-4 rounded-md font-medium ${
                ticket.isAvailable
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {ticket.isAvailable ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Cart Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fees</span>
              <span>${fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full mt-4 bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      )}

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => {
          setShowCheckout(false)
          setCart([])
          alert('Payment successful! Your tickets have been sent to your email.')
        }}
        clientSecret={clientSecret}
        orderSummary={{
          eventTitle,
          tickets: cart.map((item) => ({
            name: item.ticketType.name,
            quantity: item.quantity,
            price: item.ticketType.price,
          })),
          subtotal,
          fees,
          total,
        }}
      />
    </>
  )
}