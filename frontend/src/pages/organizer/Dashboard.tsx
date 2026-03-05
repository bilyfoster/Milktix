import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, Ticket, DollarSign, Users, MapPin, PlusCircle, 
  TrendingUp, Eye, Clock, Zap, BarChart3, ChevronRight, Loader2 
} from 'lucide-react'
import { eventsApi } from '../../utils/api'

interface DashboardStats {
  totalEvents: number
  upcomingEvents: number
  ticketsSoldThisMonth: number
  totalRevenue: number
  ticketsSoldTotal: number
}

interface RecentEvent {
  id: string
  title: string
  startDateTime: string
  venueName: string
  status: string
  ticketsSold: number
  totalTickets: number
  revenue: number
}

export function OrganizerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    ticketsSoldThisMonth: 0,
    totalRevenue: 0,
    ticketsSoldTotal: 0
  })
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await eventsApi.getMyEvents()
        const events = response.data || []
        
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const upcoming = events.filter((e: any) => new Date(e.startDateTime) > now)
        
        // Calculate stats
        let ticketsSoldThisMonth = 0
        let totalRevenue = 0
        let ticketsSoldTotal = 0
        
        events.forEach((e: any) => {
          const eventTickets = e.ticketTypes?.reduce((sum: number, tt: any) => {
            const sold = tt.quantitySold || 0
            totalRevenue += sold * (tt.price || 0)
            ticketsSoldTotal += sold
            return sum + sold
          }, 0) || 0
          
          // Check if event has sales this month (simplified)
          if (new Date(e.startDateTime) >= firstDayOfMonth || e.status === 'PUBLISHED') {
            ticketsSoldThisMonth += eventTickets
          }
        })
        
        setStats({
          totalEvents: events.length,
          upcomingEvents: upcoming.length,
          ticketsSoldThisMonth: ticketsSoldThisMonth,
          totalRevenue: totalRevenue,
          ticketsSoldTotal: ticketsSoldTotal
        })

        // Map recent events with revenue
        setRecentEvents(events.slice(0, 5).map((e: any) => {
          const ticketsSold = e.ticketTypes?.reduce((sum: number, tt: any) => sum + (tt.quantitySold || 0), 0) || 0
          const totalTickets = e.ticketTypes?.reduce((sum: number, tt: any) => sum + (tt.quantityAvailable || 0), 0) || 0
          const revenue = e.ticketTypes?.reduce((sum: number, tt: any) => sum + ((tt.quantitySold || 0) * (tt.price || 0)), 0) || 0
          
          return {
            id: e.id,
            title: e.title,
            startDateTime: e.startDateTime,
            venueName: e.venueName,
            status: e.status,
            ticketsSold,
            totalTickets,
            revenue
          }
        }))
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // Enhanced Stats Cards
  const statCards = [
    { 
      label: 'Total Events', 
      value: stats.totalEvents, 
      icon: Calendar, 
      color: 'coral', 
      link: '/organizer/manage-events',
      subtitle: `${stats.upcomingEvents} upcoming`
    },
    { 
      label: 'Tickets Sold This Month', 
      value: stats.ticketsSoldThisMonth, 
      icon: Ticket, 
      color: 'violet', 
      link: '/organizer/orders',
      subtitle: `${stats.ticketsSoldTotal} total sold`
    },
    { 
      label: 'Total Revenue', 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'green', 
      link: '/organizer/orders',
      subtitle: 'Lifetime earnings'
    },
    { 
      label: 'Upcoming Events', 
      value: stats.upcomingEvents, 
      icon: Clock, 
      color: 'amber', 
      link: '/organizer/manage-events',
      subtitle: 'Scheduled events'
    },
  ]

  // Quick Actions
  const quickActions = [
    {
      title: 'Create New Event',
      description: 'Set up a new event with tickets and details',
      icon: PlusCircle,
      color: 'coral',
      link: '/organizer/create-event',
      primary: true
    },
    {
      title: 'View All Events',
      description: 'Manage and track all your events',
      icon: Eye,
      color: 'blue',
      link: '/organizer/manage-events',
      primary: false
    },
    {
      title: 'Manage Locations',
      description: 'Add or edit venues and event locations',
      icon: MapPin,
      color: 'violet',
      link: '/organizer/locations',
      primary: false
    },
    {
      title: 'Manage Hosts',
      description: 'Add or edit host profiles for events',
      icon: Users,
      color: 'amber',
      link: '/organizer/hosts',
      primary: false
    },
  ]

  // Get color classes based on color name
  const getColorClasses = (color: string, isBg = false) => {
    const colors: Record<string, { bg: string, text: string, light: string, border: string }> = {
      coral: { bg: 'bg-coral-600', text: 'text-coral-600', light: 'bg-coral-100', border: 'border-coral-200' },
      violet: { bg: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-100', border: 'border-violet-200' },
      green: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-100', border: 'border-green-200' },
      amber: { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-100', border: 'border-amber-200' },
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-100', border: 'border-blue-200' },
    }
    const c = colors[color] || colors.coral
    return isBg ? c.light : c.text
  }

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
          const colorClass = getColorClasses(stat.color)
          const bgClass = getColorClasses(stat.color, true)
          return (
            <Link key={stat.label} to={stat.link} className="card p-6 hover:shadow-lg transition-shadow group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-warmgray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-warmgray-900 mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className={`text-xs mt-1 ${colorClass}`}>{stat.subtitle}</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${colorClass}`} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-heading-sm font-bold text-warmgray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            const colorClass = getColorClasses(action.color)
            const bgClass = getColorClasses(action.color, true)
            
            return (
              <Link 
                key={action.title} 
                to={action.link} 
                className={`card p-5 hover:shadow-lg transition-all group ${
                  action.primary ? `ring-2 ring-coral-500 ${bgClass}` : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${action.primary ? 'bg-coral-600' : bgClass} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 ${action.primary ? 'text-white' : colorClass}`} />
                </div>
                <h3 className="font-semibold text-warmgray-900 text-sm">{action.title}</h3>
                <p className="text-xs text-warmgray-600 mt-1 line-clamp-2">{action.description}</p>
                <div className={`flex items-center text-xs font-medium mt-3 ${colorClass}`}>
                  Get Started
                  <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Events - Takes 2 columns */}
        <div className="lg:col-span-2 card">
          <div className="p-6 border-b border-warmgray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-coral-600" />
              <h2 className="text-heading-sm font-bold text-warmgray-900">Recent Events</h2>
            </div>
            <Link to="/organizer/manage-events" className="text-coral-600 hover:text-coral-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin h-8 w-8 text-coral-600 mx-auto" />
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
                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-warmgray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-warmgray-900 truncate">{event.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                        event.status === 'DRAFT' ? 'bg-warmgray-100 text-warmgray-700' :
                        event.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-sm text-warmgray-600">
                      {new Date(event.startDateTime).toLocaleDateString()} • {event.venueName}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-warmgray-900">{event.ticketsSold} sold</p>
                      <p className="text-xs text-warmgray-500">of {event.totalTickets}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-coral-600">${event.revenue.toFixed(0)}</p>
                      <p className="text-xs text-warmgray-500">revenue</p>
                    </div>
                    <div className="flex gap-1">
                      <Link 
                        to={`/events/${event.id}`}
                        className="p-2 text-warmgray-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link 
                        to={`/organizer/events/${event.id}/edit`}
                        className="p-2 text-warmgray-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Zap className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips & Resources - Takes 1 column */}
        <div className="space-y-6">
          {/* Performance Tip */}
          <div className="card p-5 bg-gradient-to-br from-coral-50 to-white border-coral-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-coral-600" />
              <h3 className="font-semibold text-warmgray-900">Pro Tip</h3>
            </div>
            <p className="text-sm text-warmgray-600 mb-3">
              Events with detailed descriptions and high-quality images sell 3x more tickets on average.
            </p>
            <Link to="/organizer/create-event" className="text-sm font-medium text-coral-600 hover:text-coral-700">
              Create an event →
            </Link>
          </div>

          {/* Quick Links */}
          <div className="card p-5">
            <h3 className="font-semibold text-warmgray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/organizer/templates" className="flex items-center justify-between p-3 rounded-lg hover:bg-warmgray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium text-warmgray-700">Event Templates</span>
                </div>
                <ChevronRight className="h-4 w-4 text-warmgray-400" />
              </Link>
              <Link to="/organizer/orders" className="flex items-center justify-between p-3 rounded-lg hover:bg-warmgray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Ticket className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-warmgray-700">View Orders</span>
                </div>
                <ChevronRight className="h-4 w-4 text-warmgray-400" />
              </Link>
              <Link to="/organizer/locations" className="flex items-center justify-between p-3 rounded-lg hover:bg-warmgray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-warmgray-700">Manage Locations</span>
                </div>
                <ChevronRight className="h-4 w-4 text-warmgray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
