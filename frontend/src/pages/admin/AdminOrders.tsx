import { useEffect, useState, useMemo } from 'react'
import { 
  Search, 
  ShoppingBag, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Filter,
  X,
  Calendar,
  DollarSign,
  Clock,
  Package,
  Mail,
  RotateCcw,
  Ban,
  CreditCard,
  Tag,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'


interface OrderItem {
  id: string
  ticketTypeName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  customerName: string
  customerEmail: string
  eventName: string
  eventId: string
  hostName: string
  hostId: string
  items: OrderItem[]
  totalTickets: number
  totalAmount: number
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  paymentMethod: string
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED'
  promoCode?: string
  discountAmount?: number
}

interface OrderStats {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  pendingOrders: number
}

type DateRangeFilter = 'ALL' | 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'CUSTOM'

interface FilterState {
  search: string
  status: string
  dateRange: DateRangeFilter
  customDateStart: string
  customDateEnd: string
  host: string
}

const STATUSES = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded' },
]

const DATE_RANGE_OPTIONS = [
  { value: 'ALL', label: 'All Time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
  { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { value: 'CUSTOM', label: 'Custom Range' },
]

const ITEMS_PER_PAGE = 10

// Mock data for demo
const MOCK_HOSTS = ['All Hosts', 'Music Festival LLC', 'Tech Conference Inc', 'Sarah\'s Events', 'Art Gallery Co', 'Sports Events Inc']

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    createdAt: '2024-03-05T10:30:00Z',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    eventName: 'Summer Music Festival 2024',
    eventId: 'evt-1',
    hostName: 'Music Festival LLC',
    hostId: 'host-1',
    items: [
      { id: 'item-1', ticketTypeName: 'General Admission', quantity: 2, unitPrice: 50, subtotal: 100 },
      { id: 'item-2', ticketTypeName: 'VIP Pass', quantity: 1, unitPrice: 150, subtotal: 150 }
    ],
    totalTickets: 3,
    totalAmount: 250,
    status: 'CONFIRMED',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    promoCode: 'SUMMER20',
    discountAmount: 20
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    createdAt: '2024-03-05T09:15:00Z',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@company.com',
    eventName: 'Tech Summit 2024',
    eventId: 'evt-2',
    hostName: 'Tech Conference Inc',
    hostId: 'host-2',
    items: [
      { id: 'item-3', ticketTypeName: 'Standard Pass', quantity: 1, unitPrice: 299, subtotal: 299 }
    ],
    totalTickets: 1,
    totalAmount: 299,
    status: 'PENDING',
    paymentMethod: 'PayPal',
    paymentStatus: 'PENDING'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    createdAt: '2024-03-04T16:45:00Z',
    customerName: 'Michael Brown',
    customerEmail: 'mbrown@email.com',
    eventName: 'Jazz in the Park',
    eventId: 'evt-5',
    hostName: 'Music Festival LLC',
    hostId: 'host-1',
    items: [
      { id: 'item-4', ticketTypeName: 'General', quantity: 4, unitPrice: 35, subtotal: 140 }
    ],
    totalTickets: 4,
    totalAmount: 140,
    status: 'CONFIRMED',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    createdAt: '2024-03-04T14:20:00Z',
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@email.com',
    eventName: 'Wine Tasting Experience',
    eventId: 'evt-7',
    hostName: 'Sarah\'s Events',
    hostId: 'host-3',
    items: [
      { id: 'item-5', ticketTypeName: 'Tasting', quantity: 2, unitPrice: 85, subtotal: 170 }
    ],
    totalTickets: 2,
    totalAmount: 170,
    status: 'REFUNDED',
    paymentMethod: 'Credit Card',
    paymentStatus: 'REFUNDED'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    createdAt: '2024-03-03T11:00:00Z',
    customerName: 'David Wilson',
    customerEmail: 'david.w@example.org',
    eventName: 'Marathon 2024',
    eventId: 'evt-9',
    hostName: 'Sports Events Inc',
    hostId: 'host-7',
    items: [
      { id: 'item-6', ticketTypeName: 'Runner', quantity: 1, unitPrice: 75, subtotal: 75 }
    ],
    totalTickets: 1,
    totalAmount: 75,
    status: 'CONFIRMED',
    paymentMethod: 'Debit Card',
    paymentStatus: 'PAID'
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    createdAt: '2024-03-03T08:30:00Z',
    customerName: 'Lisa Chen',
    customerEmail: 'lisa.chen@tech.io',
    eventName: 'Cooking Masterclass',
    eventId: 'evt-10',
    hostName: 'Sarah\'s Events',
    hostId: 'host-3',
    items: [
      { id: 'item-7', ticketTypeName: 'Class', quantity: 2, unitPrice: 150, subtotal: 300 }
    ],
    totalTickets: 2,
    totalAmount: 300,
    status: 'PARTIALLY_REFUNDED',
    paymentMethod: 'Credit Card',
    paymentStatus: 'REFUNDED',
    promoCode: 'COOK10',
    discountAmount: 30
  },
  {
    id: '7',
    orderNumber: 'ORD-2024-007',
    createdAt: '2024-03-02T15:45:00Z',
    customerName: 'Robert Taylor',
    customerEmail: 'robert.t@business.com',
    eventName: 'Charity Gala Dinner',
    eventId: 'evt-12',
    hostName: 'Music Festival LLC',
    hostId: 'host-1',
    items: [
      { id: 'item-8', ticketTypeName: 'Dinner', quantity: 4, unitPrice: 250, subtotal: 1000 }
    ],
    totalTickets: 4,
    totalAmount: 1000,
    status: 'CONFIRMED',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID'
  },
  {
    id: '8',
    orderNumber: 'ORD-2024-008',
    createdAt: '2024-03-01T10:20:00Z',
    customerName: 'Amanda Martinez',
    customerEmail: 'amanda.m@startup.io',
    eventName: 'Tech Summit 2024',
    eventId: 'evt-2',
    hostName: 'Tech Conference Inc',
    hostId: 'host-2',
    items: [
      { id: 'item-9', ticketTypeName: 'Standard Pass', quantity: 2, unitPrice: 299, subtotal: 598 }
    ],
    totalTickets: 2,
    totalAmount: 598,
    status: 'CANCELLED',
    paymentMethod: 'PayPal',
    paymentStatus: 'REFUNDED'
  },
  {
    id: '9',
    orderNumber: 'ORD-2024-009',
    createdAt: '2024-02-28T09:00:00Z',
    customerName: 'James Anderson',
    customerEmail: 'james.a@email.com',
    eventName: 'Summer Music Festival 2024',
    eventId: 'evt-1',
    hostName: 'Music Festival LLC',
    hostId: 'host-1',
    items: [
      { id: 'item-10', ticketTypeName: 'General Admission', quantity: 3, unitPrice: 50, subtotal: 150 },
      { id: 'item-11', ticketTypeName: 'VIP Pass', quantity: 2, unitPrice: 150, subtotal: 300 }
    ],
    totalTickets: 5,
    totalAmount: 450,
    status: 'CONFIRMED',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID'
  },
  {
    id: '10',
    orderNumber: 'ORD-2024-010',
    createdAt: '2024-02-27T14:30:00Z',
    customerName: 'Jennifer Lee',
    customerEmail: 'jennifer.lee@company.com',
    eventName: 'Business Networking Night',
    eventId: 'evt-4',
    hostName: 'Sarah\'s Events',
    hostId: 'host-3',
    items: [
      { id: 'item-12', ticketTypeName: 'Entry', quantity: 1, unitPrice: 30, subtotal: 30 }
    ],
    totalTickets: 1,
    totalAmount: 30,
    status: 'CONFIRMED',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID'
  },
  {
    id: '11',
    orderNumber: 'ORD-2024-011',
    createdAt: '2024-02-26T11:15:00Z',
    customerName: 'Christopher White',
    customerEmail: 'chris.white@email.com',
    eventName: 'Marathon 2024',
    eventId: 'evt-9',
    hostName: 'Sports Events Inc',
    hostId: 'host-7',
    items: [
      { id: 'item-13', ticketTypeName: 'Runner', quantity: 3, unitPrice: 75, subtotal: 225 }
    ],
    totalTickets: 3,
    totalAmount: 225,
    status: 'PENDING',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PENDING'
  },
  {
    id: '12',
    orderNumber: 'ORD-2024-012',
    createdAt: '2024-02-25T16:00:00Z',
    customerName: 'Michelle Garcia',
    customerEmail: 'michelle.g@music.com',
    eventName: 'Jazz in the Park',
    eventId: 'evt-5',
    hostName: 'Music Festival LLC',
    hostId: 'host-1',
    items: [
      { id: 'item-14', ticketTypeName: 'General', quantity: 2, unitPrice: 35, subtotal: 70 }
    ],
    totalTickets: 2,
    totalAmount: 70,
    status: 'CONFIRMED',
    paymentMethod: 'PayPal',
    paymentStatus: 'PAID'
  },
]

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    dateRange: 'ALL',
    customDateStart: '',
    customDateEnd: '',
    host: 'All Hosts',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [refundData, setRefundData] = useState({
    type: 'full' as 'full' | 'partial',
    amount: 0,
    reason: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // Load mock data for demo
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      // Mock data - replace with actual API call: const response = await api.get('/admin/orders')
      setOrders(MOCK_ORDERS)
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const stats: OrderStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today)).length
    const totalRevenue = orders
      .filter(o => o.status === 'CONFIRMED' || o.status === 'PARTIALLY_REFUNDED')
      .reduce((sum, o) => sum + o.totalAmount, 0)
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length

    return {
      totalOrders: orders.length,
      todayOrders,
      totalRevenue,
      pendingOrders
    }
  }, [orders])

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (filters.status !== 'ALL' && order.status !== filters.status) return false

      // Host filter
      if (filters.host !== 'All Hosts' && order.hostName !== filters.host) return false

      // Date range filter
      const orderDate = new Date(order.createdAt)
      const now = new Date()
      
      switch (filters.dateRange) {
        case 'TODAY':
          if (orderDate.toDateString() !== now.toDateString()) return false
          break
        case 'LAST_7_DAYS':
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (orderDate < sevenDaysAgo) return false
          break
        case 'LAST_30_DAYS':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (orderDate < thirtyDaysAgo) return false
          break
        case 'CUSTOM':
          if (filters.customDateStart && orderDate < new Date(filters.customDateStart)) return false
          if (filters.customDateEnd && orderDate > new Date(filters.customDateEnd + 'T23:59:59')) return false
          break
      }

      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase()
        return (
          order.orderNumber.toLowerCase().includes(search) ||
          order.customerName.toLowerCase().includes(search) ||
          order.customerEmail.toLowerCase().includes(search) ||
          order.eventName.toLowerCase().includes(search)
        )
      }

      return true
    })
  }, [orders, filters])

  // Sort by date (newest first)
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [filteredOrders])

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const activeFiltersCount = 
    (filters.status !== 'ALL' ? 1 : 0) + 
    (filters.host !== 'All Hosts' ? 1 : 0) +
    (filters.dateRange !== 'ALL' ? 1 : 0)

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      dateRange: 'ALL',
      customDateStart: '',
      customDateEnd: '',
      host: 'All Hosts',
    })
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      CONFIRMED: 'bg-green-100 text-green-700',
      PENDING: 'bg-amber-100 text-amber-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-warmgray-100 text-warmgray-600',
      PARTIALLY_REFUNDED: 'bg-blue-100 text-blue-700',
    }
    const icons = {
      CONFIRMED: CheckCircle,
      PENDING: Clock,
      CANCELLED: XCircle,
      REFUNDED: RotateCcw,
      PARTIALLY_REFUNDED: AlertCircle,
    }
    const Icon = icons[status as keyof typeof icons]
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    )
  }

  const handleResendEmail = async (_orderId: string) => {
    try {
      // await api.post(`/admin/orders/${orderId}/resend-email`)
      alert('Confirmation email resent successfully!')
    } catch (err) {
      console.error('Failed to resend email:', err)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      // await api.post(`/admin/orders/${orderId}/cancel`)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as Order['status'] } : o))
      alert('Order cancelled successfully!')
    } catch (err) {
      console.error('Failed to cancel order:', err)
    }
  }

  const openRefundModal = (order: Order) => {
    setSelectedOrder(order)
    setRefundData({
      type: 'full',
      amount: order.totalAmount,
      reason: ''
    })
    setIsRefundModalOpen(true)
  }

  const handleRefund = async () => {
    if (!selectedOrder) return
    setIsProcessing(true)
    try {
      // await api.post(`/admin/orders/${selectedOrder.id}/refund`, refundData)
      const newStatus = refundData.type === 'full' ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
      setIsRefundModalOpen(false)
      setSelectedOrder(null)
      alert(`Refund processed successfully!`)
    } catch (err) {
      console.error('Failed to process refund:', err)
    } finally {
      setIsProcessing(false)
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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-heading-lg font-bold text-warmgray-900">Manage Orders</h2>
          <p className="text-warmgray-600 mt-1">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && ` (filtered from ${orders.length})`}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-warmgray-600">Total Orders</p>
            <p className="text-2xl font-bold text-warmgray-900">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-warmgray-600">Today's Orders</p>
            <p className="text-2xl font-bold text-warmgray-900">{stats.todayOrders}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-coral-600" />
          </div>
          <div>
            <p className="text-sm text-warmgray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-warmgray-900">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-warmgray-600">Pending Orders</p>
            <p className="text-2xl font-bold text-warmgray-900">{stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer, email, event..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setCurrentPage(1)
              }}
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost text-sm py-2 px-3 ${showFilters ? 'bg-coral-50 text-coral-600' : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value })
                setCurrentPage(1)
              }}
              className="input py-2 text-sm w-36"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => {
                setFilters({ ...filters, dateRange: e.target.value as DateRangeFilter })
                setCurrentPage(1)
              }}
              className="input py-2 text-sm w-36"
            >
              {DATE_RANGE_OPTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-warmgray-200 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            {filters.dateRange === 'CUSTOM' && (
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-warmgray-600 mb-1.5">Custom Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.customDateStart}
                    onChange={(e) => setFilters({ ...filters, customDateStart: e.target.value })}
                    className="input py-2 text-sm flex-1"
                  />
                  <span className="text-warmgray-400">to</span>
                  <input
                    type="date"
                    value={filters.customDateEnd}
                    onChange={(e) => setFilters({ ...filters, customDateEnd: e.target.value })}
                    className="input py-2 text-sm flex-1"
                  />
                </div>
              </div>
            )}

            {/* Host Filter */}
            <div>
              <label className="block text-xs font-medium text-warmgray-600 mb-1.5">Host</label>
              <select
                value={filters.host}
                onChange={(e) => {
                  setFilters({ ...filters, host: e.target.value })
                  setCurrentPage(1)
                }}
                className="input py-2 text-sm w-full"
              >
                {MOCK_HOSTS.map(host => (
                  <option key={host} value={host}>{host}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="btn-ghost text-sm py-2 px-3 w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warmgray-100">
            <span className="text-xs text-warmgray-500">Active filters:</span>
            {filters.status !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                Status: {filters.status}
                <button onClick={() => setFilters({ ...filters, status: 'ALL' })}><X className="h-3 w-3" /></button>
              </span>
            )}
            {filters.host !== 'All Hosts' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                Host: {filters.host}
                <button onClick={() => setFilters({ ...filters, host: 'All Hosts' })}><X className="h-3 w-3" /></button>
              </span>
            )}
            {filters.dateRange !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                {DATE_RANGE_OPTIONS.find(d => d.value === filters.dateRange)?.label}
                <button onClick={() => setFilters({ ...filters, dateRange: 'ALL' })}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No orders found</h3>
          <p className="text-warmgray-600 mt-1">
            {filters.search || activeFiltersCount > 0 
              ? 'Try adjusting your filters.' 
              : 'No orders in the system yet.'}
          </p>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="btn-primary mt-4">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-warmgray-50 border-b border-warmgray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Host</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Tickets</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray-100">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-warmgray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-coral-600">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-warmgray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-warmgray-900">{order.customerName}</p>
                          <p className="text-xs text-warmgray-500">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-warmgray-600">{order.eventName}</td>
                      <td className="px-4 py-3 text-sm text-warmgray-600">{order.hostName}</td>
                      <td className="px-4 py-3 text-sm text-warmgray-600">
                        <div className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-warmgray-400" />
                          {order.totalTickets}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-warmgray-900">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn-ghost text-xs py-1.5 px-2"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-warmgray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedOrders.length)} of {sortedOrders.length} orders
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-ghost text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-warmgray-600 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-ghost text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && !isRefundModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-warmgray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-warmgray-900">Order Details</h3>
                <p className="text-sm text-warmgray-500">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-ghost p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedOrder.status)}
                <span className="text-sm text-warmgray-500">
                  {new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-warmgray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-warmgray-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-warmgray-500">Name</p>
                    <p className="font-medium text-warmgray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-warmgray-500">Email</p>
                    <p className="font-medium text-warmgray-900">{selectedOrder.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div className="bg-warmgray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-warmgray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Information
                </h4>
                <div className="space-y-2">
                  <p className="font-medium text-warmgray-900">{selectedOrder.eventName}</p>
                  <p className="text-sm text-warmgray-600">Host: {selectedOrder.hostName}</p>
                </div>
              </div>

              {/* Ticket Details */}
              <div>
                <h4 className="text-sm font-semibold text-warmgray-900 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ticket Details
                </h4>
                <div className="border border-warmgray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-warmgray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-warmgray-600">Ticket Type</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-warmgray-600">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-warmgray-600">Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-warmgray-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warmgray-100">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-warmgray-900">{item.ticketTypeName}</td>
                          <td className="px-4 py-3 text-sm text-warmgray-600 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-warmgray-600 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-warmgray-900 text-right">${item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-warmgray-50">
                      {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-sm text-green-600 text-right">
                            Discount {selectedOrder.promoCode && `(${selectedOrder.promoCode})`}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-green-600 text-right">
                            -${selectedOrder.discountAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-warmgray-900 text-right">Total</td>
                        <td className="px-4 py-3 text-lg font-bold text-coral-600 text-right">${selectedOrder.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-warmgray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-warmgray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-warmgray-500">Payment Method</p>
                    <p className="font-medium text-warmgray-900">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-warmgray-500">Payment Status</p>
                    <p className="font-medium text-warmgray-900">{selectedOrder.paymentStatus}</p>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              {selectedOrder.promoCode && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-coral-600" />
                  <span className="text-warmgray-600">Promo code used:</span>
                  <span className="font-medium text-coral-600">{selectedOrder.promoCode}</span>
                  {selectedOrder.discountAmount && (
                    <span className="text-green-600">(-${selectedOrder.discountAmount.toFixed(2)})</span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-warmgray-200">
                {(selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PENDING') && (
                  <>
                    <button
                      onClick={() => openRefundModal(selectedOrder)}
                      className="btn-outline text-sm flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Issue Refund
                    </button>
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="btn-ghost text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      Cancel Order
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleResendEmail(selectedOrder.id)}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Resend Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-warmgray-900 mb-2">Issue Refund</h3>
            <p className="text-sm text-warmgray-600 mb-6">
              Order: <span className="font-medium text-warmgray-900">{selectedOrder.orderNumber}</span>
            </p>

            <div className="space-y-4 mb-6">
              {/* Refund Type */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">Refund Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={refundData.type === 'full'}
                      onChange={() => setRefundData({ ...refundData, type: 'full', amount: selectedOrder.totalAmount })}
                      className="text-coral-600 focus:ring-coral-500"
                    />
                    <span className="text-sm text-warmgray-700">Full Refund</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={refundData.type === 'partial'}
                      onChange={() => setRefundData({ ...refundData, type: 'partial', amount: 0 })}
                      className="text-coral-600 focus:ring-coral-500"
                    />
                    <span className="text-sm text-warmgray-700">Partial Refund</span>
                  </label>
                </div>
              </div>

              {/* Refund Amount */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Refund Amount
                  {refundData.type === 'partial' && (
                    <span className="text-warmgray-500 font-normal ml-1">
                      (Max: ${selectedOrder.totalAmount.toFixed(2)})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedOrder.totalAmount}
                    value={refundData.amount}
                    onChange={(e) => setRefundData({ ...refundData, amount: parseFloat(e.target.value) || 0 })}
                    disabled={refundData.type === 'full'}
                    className="input pl-10 disabled:bg-warmgray-50 disabled:text-warmgray-500"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Reason for Refund <span className="text-warmgray-500">(Optional)</span>
                </label>
                <textarea
                  value={refundData.reason}
                  onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                  placeholder="Enter reason for refund..."
                  rows={3}
                  className="input resize-none"
                />
              </div>
            </div>

            {/* Confirmation */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Confirm Refund</p>
                  <p className="text-sm text-amber-700">
                    You are about to refund <span className="font-semibold">${refundData.amount.toFixed(2)}</span> to the customer. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRefundModalOpen(false)
                  setRefundData({ type: 'full', amount: 0, reason: '' })
                }}
                className="btn-outline flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={isProcessing || refundData.amount <= 0 || refundData.amount > selectedOrder.totalAmount}
                className="btn-primary flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Refund'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
