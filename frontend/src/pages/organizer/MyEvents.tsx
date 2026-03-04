import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, PlusCircle, MoreHorizontal, Eye, Edit, BarChart3, Loader2 } from 'lucide-react'
import { eventsApi } from '../../utils/api'

interface Event {
  id: string
  title: string
  startDateTime: string
  venueName: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  ticketTypes: Array<{
    name: string
    quantityAvailable: number
    quantitySold: number
    price: number
  }>
  host?: {
    name: string
  }
  location?: {
    name: string
  }
}

export function MyEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'DRAFT'>('ALL')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await eventsApi.getAll()
      setEvents(response.data || [])
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'ALL') return true
    if (filter === 'DRAFT') return event.status === 'DRAFT'
    if (filter === 'UPCOMING') return new Date(event.startDateTime) > new Date()
    if (filter === 'PAST') return new Date(event.startDateTime) <= new Date()
    return true
  })

  const getTotalSold = (event: Event) => {
    return event.ticketTypes?.reduce((sum, tt) => sum + (tt.quantitySold || 0), 0) || 0
  }

  const getTotalAvailable = (event: Event) => {
    return event.ticketTypes?.reduce((sum, tt) => sum + (tt.quantityAvailable || 0), 0) || 0
  }

  const getRevenue = (event: Event) => {
    return event.ticketTypes?.reduce((sum, tt) => sum + ((tt.quantitySold || 0) * (tt.price || 0)), 0) || 0
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-warmgray-100 text-warmgray-700',
      PUBLISHED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700'
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
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
          <h1 className="text-heading-lg font-bold text-warmgray-900">My Events</h1>
          <p className="text-warmgray-600 mt-1">Manage and track all your events.</p>
        </div>
        <Link to="/organizer/events/create" className="btn-primary">
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['ALL', 'UPCOMING', 'PAST', 'DRAFT'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
              filter === f
                ? 'bg-coral-600 text-white'
                : 'bg-white text-warmgray-600 hover:bg-warmgray-100'
            }`}
          >
            {f === 'ALL' ? 'All Events' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No events found</h3>
          <p className="text-warmgray-600 mt-1 mb-6">
            {filter === 'ALL' 
              ? "You haven't created any events yet."
              : `No ${filter.toLowerCase()} events found.`}
          </p>
          <Link to="/organizer/events/create" className="btn-primary">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Event Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-warmgray-900">{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>
                  <p className="text-sm text-warmgray-600 mb-1">
                    {new Date(event.startDateTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-warmgray-500">
                    {event.location?.name || event.venueName}
                    {event.host?.name && ` • Hosted by ${event.host.name}`}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 lg:gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warmgray-900">{getTotalSold(event)}</p>
                    <p className="text-xs text-warmgray-500">Tickets Sold</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warmgray-900">{getTotalAvailable(event)}</p>
                    <p className="text-xs text-warmgray-500">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-coral-600">${getRevenue(event).toFixed(0)}</p>
                    <p className="text-xs text-warmgray-500">Revenue</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="btn-ghost text-sm py-2"
                    title="View Event"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className="btn-ghost text-sm py-2"
                    title="Edit Event"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    className="btn-ghost text-sm py-2"
                    title="Analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button
                    className="btn-ghost text-sm py-2"
                    title="More Options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
