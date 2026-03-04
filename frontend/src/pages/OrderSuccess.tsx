import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Ticket, Mail, Calendar, MapPin, Download, Share2, Loader2 } from 'lucide-react'
import { ordersApi } from '../utils/api'

interface OrderDetails {
  id: string
  orderNumber: string
  event: {
    id: string
    title: string
    startDateTime: string
    venueName: string
  }
  tickets: {
    id: string
    ticketNumber: string
    ticketType: {
      name: string
    }
    attendeeName?: string
    qrCodeData?: string
  }[]
  totalAmount: number
  status: string
  paymentStatus: string
}

export function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Get order_id from URL
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        // If we have an orderId from the purchase flow
        if (orderId) {
          const response = await ordersApi.getById(orderId)
          setOrder(response.data)
        } else {
          // Otherwise fetch most recent order
          const response = await ordersApi.getMyOrders()
          const orders = response.data
          if (orders && orders.length > 0) {
            setOrder(orders[0])
          }
        }
      } catch (err) {
        console.error('Failed to load order:', err)
        setError('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  if (isLoading) {
    return (
      <div className="container-custom py-16 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-coral-600" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container-custom py-16 max-w-2xl mx-auto text-center">
        <div className="card p-12">
          <h1 className="text-2xl font-bold text-warmgray-900 mb-4">Order Not Found</h1>
          <p className="text-warmgray-600 mb-6">We couldn't find your order details.</p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8 max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-heading-lg font-bold text-warmgray-900 mb-2">Order Confirmed!</h1>
        <p className="text-warmgray-600">
          Your tickets have been booked. We've sent a confirmation email to you.
        </p>
      </div>

      {/* Order Card */}
      <div className="card overflow-hidden mb-6">
        <div className="bg-coral-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-coral-100 text-sm">Order Number</p>
              <p className="text-2xl font-bold">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-coral-100 text-sm">Total Paid</p>
              <p className="text-2xl font-bold">${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Event Details */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-warmgray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="h-8 w-8 text-warmgray-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-warmgray-900">{order.event.title}</h2>
              <p className="text-warmgray-600 flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" />
                {new Date(order.event.startDateTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-warmgray-600 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {order.event.venueName}
              </p>
            </div>
          </div>

          {/* Tickets */}
          <div className="border-t border-warmgray-200 pt-6">
            <h3 className="text-heading-xs font-bold text-warmgray-900 mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Your Tickets ({order.tickets.length})
            </h3>

            <div className="space-y-4">
              {order.tickets.map((ticket) => (
                <div key={ticket.id} className="bg-warmgray-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Ticket className="h-6 w-6 text-coral-600" />
                    </div>
                    <div>
                      <p className="font-medium text-warmgray-900">{ticket.ticketType.name}</p>
                      <p className="text-sm text-warmgray-500">{ticket.ticketNumber}</p>
                      {ticket.attendeeName && (
                        <p className="text-sm text-warmgray-600">{ticket.attendeeName}</p>
                      )}
                    </div>
                  </div>
                  {ticket.qrCodeData && (
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-warmgray-200">
                      {/* QR Code placeholder - would use a QR library in production */}
                      <div className="text-[8px] text-center leading-tight text-warmgray-400">
                        QR<br/>CODE
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button className="btn-outline flex items-center justify-center gap-2">
          <Download className="h-5 w-5" />
          Download Tickets
        </button>
        <button className="btn-outline flex items-center justify-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Event
        </button>
      </div>

      {/* Email Notice */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
        <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">Check your email</p>
          <p className="text-sm text-blue-700">
            We've sent your tickets and receipt to your email address. You can also access them anytime from your account.
          </p>
        </div>
      </div>

      {/* Back to Events */}
      <div className="text-center mt-8">
        <Link to="/events" className="text-coral-600 hover:text-coral-700 font-medium">
          Browse More Events →
        </Link>
      </div>
    </div>
  )
}
