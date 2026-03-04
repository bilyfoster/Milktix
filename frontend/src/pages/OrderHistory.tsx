import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Calendar, CheckCircle, Download, Clock } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { format } from 'date-fns'

interface Order {
  id: string
  eventTitle: string
  eventDate: string
  venueName: string
  venueCity: string
  ticketType: string
  quantity: number
  totalPrice: number
  orderDate: string
  status: 'confirmed' | 'pending' | 'cancelled'
  qrCode?: string
}

export function OrderHistory() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual orders API
      // Mock data for now
      setOrders([
        {
          id: 'ord-001',
          eventTitle: 'Summer Music Festival',
          eventDate: '2026-06-15T19:00:00',
          venueName: 'Central Park',
          venueCity: 'Phoenix, AZ',
          ticketType: 'General Admission',
          quantity: 2,
          totalPrice: 120.00,
          orderDate: '2026-03-01T10:30:00',
          status: 'confirmed'
        },
        {
          id: 'ord-002',
          eventTitle: 'Tech Conference 2026',
          eventDate: '2026-04-20T09:00:00',
          venueName: 'Convention Center',
          venueCity: 'Scottsdale, AZ',
          ticketType: 'VIP Pass',
          quantity: 1,
          totalPrice: 299.00,
          orderDate: '2026-02-15T14:20:00',
          status: 'confirmed'
        }
      ])
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Ticket className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed'
      case 'pending':
        return 'Pending'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view orders</h2>
          <p className="text-gray-600 mb-6">Create an account to see your ticket purchases.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
              <p className="text-sm text-gray-600 mt-1">{orders.length} orders</p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Buy Tickets
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Tickets you purchase will appear here.</p>
            <Link
              to="/events"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.status)}
                        <span className={`text-sm font-medium ${
                          order.status === 'confirmed' ? 'text-green-600' :
                          order.status === 'pending' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">
                          Order #{order.id}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{order.eventTitle}</h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {format(new Date(order.eventDate), 'EEEE, MMMM d, yyyy • h:mm a')}
                        </div>
                        <div>{order.venueName}, {order.venueCity}</div>
                        <div className="text-gray-900 font-medium">
                          {order.quantity} × {order.ticketType}
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${order.totalPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(order.orderDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Ticket className="h-4 w-4 mr-2" />
                        View Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedOrder.eventTitle}</h2>
              <p className="text-gray-600 mt-1">
                {format(new Date(selectedOrder.eventDate), 'EEEE, MMM d, yyyy')}
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-gray-100 rounded-xl p-8 mb-6 text-center">
              <div className="w-48 h-48 bg-white mx-auto rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR Code</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Show this at the entrance
              </p>
            </div>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket Type</span>
                <span className="font-medium">{selectedOrder.ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium">{selectedOrder.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium">{selectedOrder.id}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
