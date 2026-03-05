import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Ticket, DollarSign, Users, MapPin, PlusCircle, ArrowRight } from 'lucide-react'
import { eventsApi } from '../../utils/api'

interface DashboardStats {
  totalEvents: number
  upcomingEvents: number
  totalTickets: number
  totalRevenue: number
}

interface RecentEvent {
  id: string
  title: string
  startDateTime: string
  venueName: string
  status: string
  ticketsSold: number
  totalTickets: number
}

export function OrganizerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalTickets: 0,
    totalRevenue: 0
  })
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await eventsApi.getMyEvents()
        const events = response.data || []
        
        const upcoming = events.filter((e: any) => e.isUpcoming)
        const totalTickets = events.reduce((sum: number, e: any) => 
          sum + (e.ticketTypes?.reduce((t: number, tt: any) => t + (tt.quantitySold || 0), 0) || 0), 0)
        
        setStats({
          totalEvents: events.length,
          upcomingEvents: upcoming.length,
          totalTickets: totalTickets,
          totalRevenue: 0
        })

        setRecentEvents(events.slice(0, 5).map((e: any) => ({
          id: e.id,
          title: e.title,
          startDateTime: e.startDateTime,
          venueName: e.venueName,
          status: e.status,
          ticketsSold: e.ticketTypes?.reduce((sum: number, tt: any) => sum + (tt.quantitySold || 0), 0) || 0,
          totalTickets: e.ticketTypes?.reduce((sum: number, tt: any) => sum + (tt.quantityAvailable || 0), 0) || 0
        })))
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'coral', link: '/organizer/manage-events' },
    { label: 'Upcoming', value: stats.upcomingEvents, icon: Calendar, color: 'green', link: '/organizer/manage-events' },
    { label: 'Tickets Sold', value: stats.totalTickets, icon: Ticket, color: 'violet', link: '/organizer/orders' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'amber', link: '/organizer/orders' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-lg font-bold text-warmgray-900">Organizer Dashboard</h1>
          <p className="text-warmgray-600 mt-1">Welcome back! Here's what's happening with your events.</p>
        </div>
        <Link to="/organizer/create-event" className="btn-primary">
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} to={stat.link} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warmgray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-warmgray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/organizer/create-event" className="card p-6 hover:shadow-lg transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="h-6 w-6 text-coral-600" />
          </div>
          <h3 className="font-semibold text-warmgray-900">Create Event</h3>
          <p className="text-sm text-warmgray-600 mt-1">Set up a new event with tickets and details.</p>
          <div className="flex items-center text-coral-600 text-sm font-medium mt-4">
            Get Started
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>

        <Link to="/organizer/hosts" className="card p-6 hover:shadow-lg transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6 text-violet-600" />
          </div>
          <h3 className="font-semibold text-warmgray-900">Manage Hosts</h3>
          <p className="text-sm text-warmgray-600 mt-1">Add or edit host profiles for your events.</p>
          <div className="flex items-center text-violet-600 text-sm font-medium mt-4">
            View Hosts
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>

        <Link to="/organizer/locations" className="card p-6 hover:shadow-lg transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-warmgray-900">Locations</h3>
          <p className="text-sm text-warmgray-600 mt-1">Manage venues and event locations.</p>
          <div className="flex items-center text-blue-600 text-sm font-medium mt-4">
            View Locations
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>

        <Link to="/organizer/orders" className="card p-6 hover:shadow-lg transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Ticket className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-warmgray-900">Orders</h3>
          <p className="text-sm text-warmgray-600 mt-1">View ticket sales and check-in guests.</p>
          <div className="flex items-center text-amber-600 text-sm font-medium mt-4">
            View Orders
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>
      </div>

      {/* Recent Events */}
      <div className="card">
        <div className="p-6 border-b border-warmgray-200 flex items-center justify-between">
          <h2 className="text-heading-sm font-bold text-warmgray-900">Recent Events</h2>
          <Link to="/organizer/manage-events" className="text-coral-600 hover:text-coral-700 text-sm font-medium">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-coral-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : recentEvents.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-warmgray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-warmgray-900">No events yet</h3>
            <p className="text-warmgray-600 mt-1 mb-4">Create your first event to get started.</p>
            <Link to="/organizer/create-event" className="btn-primary">
              Create Event
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-warmgray-200">
            {recentEvents.map((event) => (
              <div key={event.id} className="p-4 flex items-center justify-between hover:bg-warmgray-50">
                <div className="flex-1">
                  <h3 className="font-semibold text-warmgray-900">{event.title}</h3>
                  <p className="text-sm text-warmgray-600">
                    {new Date(event.startDateTime).toLocaleDateString()} • {event.venueName}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-warmgray-900">{event.ticketsSold} sold</p>
                    <p className="text-xs text-warmgray-500">of {event.totalTickets}</p>
                  </div>
                  <Link 
                    to={`/events/${event.id}`}
                    className="btn-ghost text-sm py-2"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
