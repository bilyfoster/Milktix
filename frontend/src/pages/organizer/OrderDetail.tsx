import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, Mail, Phone, Calendar, Ticket, CheckCircle2, 
  XCircle, AlertCircle, Printer, Loader2, Download, User 
} from 'lucide-react'

interface OrderDetail {
  id: string
  eventTitle: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  tickets: {
    id: string
    ticketType: string
    attendeeName?: string
    attendeeEmail?: string
    checkedIn: boolean
    checkedInAt?: string
    qrCode: string
  }[]
  subtotal: number
  fees: number
  total: number
  status: 'confirmed' | 'cancelled' | 'refunded' | 'pending'
  createdAt: string
  paymentMethod: string
}

export function OrderDetail() {
  const { orderId } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setOrder({
        id: orderId || 'ORD-001',
        eventTitle: 'Spring Music Festival 2025',
        customer: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567'
        },
        tickets: [
          {
            id: 'TKT-001',
            ticketType: 'General Admission',
            attendeeName: 'John Smith',
            attendeeEmail: 'john.smith@example.com',
            checkedIn: true,
            checkedInAt: '2025-03-15 19:05',
            qrCode: 'QR123456'
          },
          {
            id: 'TKT-002',
            ticketType: 'General Admission',
            attendeeName: 'Jane Smith',
            attendeeEmail: 'jane.smith@example.com',
            checkedIn: false,
            qrCode: 'QR123457'
          }
        ],
        subtotal: 100.00,
        fees: 12.50,
        total: 112.50,
        status: 'confirmed',
        createdAt: '2025-03-10 14:30',
        paymentMethod: 'Visa ending in 4242'
      })
      setIsLoading(false)
    }, 500)
  }, [orderId])

  const handleCheckIn = (ticketId: string) => {
    if (!order) return
    setOrder({
      ...order,
      tickets: order.tickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, checkedIn: true, checkedInAt: new Date().toLocaleString() }
          : ticket
      )
    })
  }

  const handleCancelTicket = (ticketId: string) => {
    if (!order || !confirm('Are you sure you want to cancel this ticket?')) return
    setOrder({
      ...order,
      tickets: order.tickets.filter(ticket => ticket.id !== ticketId)
    })
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-warmgray-100 text-warmgray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-warmgray-900">Order Not Found</h2>
        <p className="text-warmgray-600 mt-2">The order you're looking for doesn't exist.</p>
        <Link to="/organizer/orders" className="btn-primary mt-6 inline-block">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/organizer/orders" className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-heading-lg font-bold text-warmgray-900">{order.id}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-warmgray-600">{order.eventTitle}</p>
        </div>
        <button className="btn-outline">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </button>
        <button className="btn-outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tickets Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-heading-xs font-bold text-warmgray-900 flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Tickets ({order.tickets.length})
              </h2>
            </div>
            <div className="divide-y divide-warmgray-200">
              {order.tickets.map((ticket) => (
                <div key={ticket.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        ticket.checkedIn ? 'bg-green-100' : 'bg-warmgray-100'
                      }`}>
                        <Ticket className={`h-6 w-6 ${
                          ticket.checkedIn ? 'text-green-600' : 'text-warmgray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-warmgray-900">{ticket.ticketType}</p>
                        <p className="text-sm text-warmgray-600">ID: {ticket.id}</p>
                        {ticket.attendeeName && (
                          <p className="text-sm text-warmgray-600 mt-1">
                            <User className="h-3 w-3 inline mr-1" />
                            {ticket.attendeeName}
                          </p>
                        )}
                        {ticket.checkedIn ? (
                          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Checked in {ticket.checkedInAt}
                          </p>
                        ) : (
                          <p className="text-sm text-warmgray-500 mt-1">Not checked in</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!ticket.checkedIn && (
                        <button
                          onClick={() => handleCheckIn(ticket.id)}
                          className="btn-primary text-sm"
                        >
                          Check In
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelTicket(ticket.id)}
                        className="btn-outline text-sm border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {order.tickets.length === 0 && (
                <div className="p-8 text-center">
                  <XCircle className="h-12 w-12 text-warmgray-400 mx-auto mb-3" />
                  <p className="text-warmgray-600">All tickets have been cancelled.</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-heading-xs font-bold text-warmgray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </h2>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-warmgray-900">Order Placed</p>
                  <p className="text-sm text-warmgray-600">{order.createdAt}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-warmgray-900">Payment Confirmed</p>
                  <p className="text-sm text-warmgray-600">{order.createdAt}</p>
                </div>
              </div>
              {order.tickets.some(t => t.checkedIn) && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-warmgray-900">Attendee Check-in</p>
                    <p className="text-sm text-warmgray-600">
                      {order.tickets.find(t => t.checkedIn)?.checkedInAt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-heading-xs font-bold text-warmgray-900">Customer</h2>
            </div>
            <div className="card-body space-y-3">
              <p className="font-medium text-warmgray-900">{order.customer.name}</p>
              <a 
                href={`mailto:${order.customer.email}`}
                className="flex items-center gap-2 text-sm text-warmgray-600 hover:text-coral-600"
              >
                <Mail className="h-4 w-4" />
                {order.customer.email}
              </a>
              {order.customer.phone && (
                <a 
                  href={`tel:${order.customer.phone}`}
                  className="flex items-center gap-2 text-sm text-warmgray-600 hover:text-coral-600"
                >
                  <Phone className="h-4 w-4" />
                  {order.customer.phone}
                </a>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-heading-xs font-bold text-warmgray-900">Payment Summary</h2>
            </div>
            <div className="card-body">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-warmgray-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-warmgray-600">
                  <span>Fees</span>
                  <span>${order.fees.toFixed(2)}</span>
                </div>
                <div className="border-t border-warmgray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-warmgray-900">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-warmgray-200">
                <p className="text-sm text-warmgray-600">
                  <span className="font-medium">Method:</span> {order.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-heading-xs font-bold text-warmgray-900">Actions</h2>
            </div>
            <div className="card-body space-y-2">
              <button className="w-full btn-outline text-sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Customer
              </button>
              {order.status === 'confirmed' && (
                <button className="w-full btn-outline text-sm border-red-300 text-red-600 hover:bg-red-50">
                  <XCircle className="h-4 w-4 mr-2" />
                  Refund Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
