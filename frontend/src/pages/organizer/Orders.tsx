import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Download, ShoppingCart, Eye, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  eventTitle: string
  ticketCount: number
  total: number
  status: 'confirmed' | 'cancelled' | 'refunded' | 'pending'
  orderDate: string
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-001',
          customerName: 'John Smith',
          customerEmail: 'john@example.com',
          eventTitle: 'Spring Music Festival 2025',
          ticketCount: 2,
          total: 112.50,
          status: 'confirmed',
          orderDate: '2025-03-10'
        },
        {
          id: 'ORD-002',
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com',
          eventTitle: 'Tech Conference 2025',
          ticketCount: 1,
          total: 299.00,
          status: 'confirmed',
          orderDate: '2025-03-09'
        },
        {
          id: 'ORD-003',
          customerName: 'Bob Wilson',
          customerEmail: 'bob@example.com',
          eventTitle: 'Spring Music Festival 2025',
          ticketCount: 4,
          total: 225.00,
          status: 'pending',
          orderDate: '2025-03-08'
        }
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading-lg font-bold text-warmgray-900">Orders</h1>
          <p className="text-warmgray-600 mt-1">Manage ticket sales and customer orders.</p>
        </div>
        <button className="btn-outline">
          <Download className="h-5 w-5 mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
            <input
              type="text"
              placeholder="Search orders, customers, events..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-warmgray-400" />
            <select
              className="input py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warmgray-900">No orders found</h3>
            <p className="text-warmgray-600 mt-1">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Orders will appear here when customers purchase tickets.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-warmgray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-warmgray-900">Order</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-warmgray-900">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-warmgray-900">Event</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-warmgray-900">Tickets</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-warmgray-900">Total</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-warmgray-900">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-warmgray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-warmgray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-warmgray-900">{order.id}</p>
                      <p className="text-sm text-warmgray-500">{order.orderDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-warmgray-900">{order.customerName}</p>
                      <p className="text-sm text-warmgray-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-warmgray-900">{order.eventTitle}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium">{order.ticketCount}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to={`/organizer/orders/${order.id}`}
                          className="btn-ghost text-sm py-1.5"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
