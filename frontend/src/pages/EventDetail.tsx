import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Ticket, Share2, Heart, Minus, Plus, ShoppingCart, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { eventsApi, ordersApi } from '../utils/api'
import { CheckoutModal } from '../components/CheckoutModal'
import { useAuthStore } from '../stores/authStore'
import type { Event } from '../types'

export function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { data: event, isLoading, error: queryError } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await eventsApi.getById(id!)
      return response.data as Event
    },
    enabled: !!id,
  })

  const updateTicketQuantity = (ticketId: string, delta: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0
      const newQuantity = Math.max(0, current + delta)
      if (newQuantity === 0) {
        const { [ticketId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [ticketId]: newQuantity }
    })
  }

  const getTicketQuantity = (ticketId: string) => selectedTickets[ticketId] || 0

  const getSelectedTicketsList = () => {
    if (!event) return []
    return Object.entries(selectedTickets)
      .filter(([, qty]) => qty > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = event.ticketTypes.find(t => t.id === ticketId)
        return { ...ticketType!, quantity }
      })
  }

  const calculateTotals = () => {
    const tickets = getSelectedTicketsList()
    const subtotal = tickets.reduce((sum, t) => sum + (t.price * t.quantity), 0)
    const fees = subtotal * 0.029 + 0.30 // 2.9% + $0.30
    return { subtotal, fees, total: subtotal + fees }
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }

    if (!event) return

    setIsProcessing(true)
    setError('')

    try {
      const tickets = getSelectedTicketsList()

      // Create order
      const orderResponse = await ordersApi.create({
        eventId: event.id,
        items: tickets.map(t => ({
          ticketTypeId: t.id,
          quantity: t.quantity
        })),
        billingName: '', // Will be collected by Stripe
        billingEmail: ''
      })

      const newOrderId = orderResponse.data.id
      setOrderId(newOrderId)

      // Create payment intent
      const paymentResponse = await ordersApi.createPaymentIntent(newOrderId)
      setClientSecret(paymentResponse.data.clientSecret)
      setShowCheckout(true)
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.response?.data || 'Failed to start checkout. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowCheckout(false)
    navigate(`/order-success?order_id=${orderId}`)
  }

  const hasSelectedTickets = Object.values(selectedTickets).some(qty => qty > 0)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    )
  }

  if (queryError || !event) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-warmgray-900 mb-2">Event not found</h2>
        <p className="text-warmgray-600">This event may have been removed or is no longer available.</p>
      </div>
    )
  }

  const { subtotal, fees, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-warmgray-50">
      {/* Hero Image */}
      <div className="h-64 md:h-96 bg-warmgray-200 relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center gradient-coral">
            <Calendar className="h-24 w-24 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="container-custom -mt-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.categories.map((category) => (
                  <span key={category.id} className="badge-coral">
                    {category.name}
                  </span>
                ))}
              </div>

              <h1 className="text-display-sm md:text-heading-lg font-bold text-warmgray-900">{event.title}</h1>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-coral-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-warmgray-900">
                      {format(new Date(event.startDateTime), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-warmgray-600">
                      {format(new Date(event.startDateTime), 'h:mm a')} - {format(new Date(event.endDateTime), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-warmgray-900">{event.venueName}</p>
                    <p className="text-warmgray-600">
                      {event.venueAddress}, {event.venueCity}, {event.venueState} {event.venueZip}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 md:p-8 mt-6">
              <h2 className="text-heading-sm font-bold text-warmgray-900 mb-4">About This Event</h2>
              <div className="prose prose-warmgray max-w-none">
                {event.description?.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-warmgray-600 whitespace-pre-line">
                    {paragraph}
                  </p>
                )) || <p className="text-warmgray-500">No description available.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-coral-600" />
                </div>
                <h2 className="text-heading-sm font-bold text-warmgray-900">Tickets</h2>
              </div>

              {event.ticketTypes.length === 0 ? (
                <p className="text-warmgray-500">No tickets available.</p>
              ) : (
                <div className="space-y-4">
                  {event.ticketTypes.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`border-2 rounded-xl p-4 transition-all ${
                        ticket.isAvailable 
                          ? 'border-warmgray-200 hover:border-coral-300' 
                          : 'border-warmgray-100 bg-warmgray-50 opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-warmgray-900">{ticket.name}</h3>
                          <p className="text-sm text-warmgray-500 mt-1">{ticket.description}</p>
                          {!ticket.isAvailable && (
                            <p className="text-xs text-red-500 mt-1 font-medium">Sold out</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-warmgray-900">${ticket.price.toFixed(2)}</p>
                        </div>
                      </div>

                      {ticket.isAvailable && (
                        <div className="flex items-center justify-between pt-3 border-t border-warmgray-100">
                          <span className="text-sm text-warmgray-500">
                            {ticket.quantityAvailable - ticket.quantitySold} left
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateTicketQuantity(ticket.id, -1)}
                              disabled={getTicketQuantity(ticket.id) === 0}
                              className="w-8 h-8 rounded-lg bg-warmgray-100 flex items-center justify-center hover:bg-warmgray-200 disabled:opacity-50 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {getTicketQuantity(ticket.id)}
                            </span>
                            <button
                              onClick={() => updateTicketQuantity(ticket.id, 1)}
                              disabled={getTicketQuantity(ticket.id) >= (ticket.quantityAvailable - ticket.quantitySold)}
                              className="w-8 h-8 rounded-lg bg-warmgray-100 flex items-center justify-center hover:bg-warmgray-200 disabled:opacity-50 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {hasSelectedTickets && (
                    <div className="border-t border-warmgray-200 pt-4 mt-4">
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between text-warmgray-600">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-warmgray-500 text-xs">
                          <span>Service Fees</span>
                          <span>${fees.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-warmgray-200">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {error}
                        </div>
                      )}

                      <button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-5 w-5" />
                            Checkout
                          </>
                        )}
                      </button>

                      {!isAuthenticated && (
                        <p className="text-xs text-warmgray-500 text-center mt-2">
                          You'll be asked to sign in
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={handlePaymentSuccess}
        clientSecret={clientSecret}
        orderSummary={{
          eventTitle: event.title,
          tickets: getSelectedTicketsList().map(t => ({
            name: t.name,
            quantity: t.quantity,
            price: t.price
          })),
          subtotal,
          fees,
          total
        }}
      />
    </div>
  )
}
