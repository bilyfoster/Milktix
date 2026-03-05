import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TrendingUp, DollarSign, Ticket, ShoppingCart, BarChart3, Calendar } from 'lucide-react'
import api from '../../utils/api'

interface EventAnalytics {
  eventTitle: string
  totalTickets: number
  ticketsSold: number
  totalRevenue: number
  totalOrders: number
  salesByTicketType: Record<string, number>
  revenueByTicketType: Record<string, number>
  salesTrend: Array<{date: string; tickets: number; revenue: number}>
}

export function Analytics() {
  const { eventId } = useParams<{ eventId: string }>()
  const [data, setData] = useState<EventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [eventId])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/event/${eventId}`)
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12 text-warmgray-500">Failed to load analytics</div>
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-900">Event Analytics</h1>
          <p className="text-warmgray-600">{data.eventTitle}</p>
        </div>
        <button className="btn-outline flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Last 30 Days
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-coral-600" />
            </div>
            <span className="text-sm text-warmgray-600">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-warmgray-900">{formatCurrency(data.totalRevenue)}</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Ticket className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-warmgray-600">Tickets Sold</span>
          </div>
          <div className="text-2xl font-bold text-warmgray-900">{data.ticketsSold}</div>
          <div className="text-xs text-warmgray-500 mt-1">
            of {data.totalTickets} available
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-warmgray-600">Orders</span>
          </div>
          <div className="text-2xl font-bold text-warmgray-900">{data.totalOrders}</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-warmgray-600">Avg Order Value</span>
          </div>
          <div className="text-2xl font-bold text-warmgray-900">
            {formatCurrency(data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0)}
          </div>
        </div>
      </div>

      {/* Sales by Ticket Type */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-coral-600" />
            Sales by Ticket Type
          </h3>
          <div className="space-y-3">
            {Object.entries(data.salesByTicketType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-warmgray-700">{type}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-warmgray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-coral-500 rounded-full"
                      style={{ width: `${(count / data.ticketsSold) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-coral-600" />
            Revenue by Ticket Type
          </h3>
          <div className="space-y-3">
            {Object.entries(data.revenueByTicketType).map(([type, revenue]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-warmgray-700">{type}</span>
                <span className="font-medium">{formatCurrency(revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Trend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-coral-600" />
          Sales Trend (Last 30 Days)
        </h3>
        <div className="h-64 flex items-end gap-1">
          {data.salesTrend.map((day, index) => {
            const maxRevenue = Math.max(...data.salesTrend.map(d => d.revenue))
            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
            
            return (
              <div
                key={index}
                className="flex-1 bg-coral-100 hover:bg-coral-200 rounded-t transition-all relative group"
                style={{ height: `${Math.max(height, 5)}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-warmgray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                  {new Date(day.date).toLocaleDateString()}: {formatCurrency(day.revenue)}
                  <br />{day.tickets} tickets
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-warmgray-500">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}
