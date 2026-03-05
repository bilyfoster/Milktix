import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Search, PlusCircle, Eye, Edit, User, MapPin, Loader2 } from 'lucide-react'
import { eventsApi } from '../utils/api'

interface Event {
  id: string
  title: string
  startDateTime: string
  venueName: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  eventType: 'PUBLIC' | 'PRIVATE' | 'MEMBERS_ONLY'
  templateId?: string
  ticketTypes: Array<{
    name: string
    quantityAvailable: number
    quantitySold: number
    price: number
  }>
  organizer?: {
    id: string
    fullName: string
    email: string
  }
  host?: {
    name: string
  }
  location?: {
    name: string
  }
}

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'DRAFT' | 'PUBLISHED'>('ALL')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await eventsApi.getAllAdmin()
      setEvents(response.data || [])
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    // First apply status/date filter
    if (filter === 'DRAFT') return event.status === 'DRAFT'
    if (filter === 'PUBLISHED') return event.status === 'PUBLISHED'
    if (filter === 'UPCOMING') return new Date(event.startDateTime) > new Date()
    if (filter === 'PAST') return new Date(event.startDateTime) <= new Date()
    
    // Then apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        event.title.toLowerCase().includes(search) ||
        event.venueName?.toLowerCase().includes(search) ||
        event.organizer?.fullName.toLowerCase().includes(search) ||
        event.host?.name?.toLowerCase().includes(search)
      )
    }
    
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

  const getEventTypeBadge = (type: string) => {
    const styles = {
      PUBLIC: 'bg-coral-100 text-coral-700',
      PRIVATE: 'bg-purple-100 text-purple-700',
      MEMBERS_ONLY: 'bg-amber-100 text-amber-700'
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type as keyof typeof styles]}`}>
        {type === 'MEMBERS_ONLY' ? 'Members' : type.charAt(0) + type.slice(1).toLowerCase()}
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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-heading-lg font-bold text-warmgray-900">Manage Events</h2>
          <p className="text-warmgray-600 mt-1">View and manage all events in the system.</p>
        </div>
        <Link to="/organizer/create-event" className="btn-primary">
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-warmgray-600">Total Events</p>
          <p className="text-2xl font-bold text-warmgray-900">{events.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-warmgray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(e => e.status === 'PUBLISHED').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-warmgray-600">Drafts</p>
          <p className="text-2xl font-bold text-warmgray-600">
            {events.filter(e => e.status === 'DRAFT').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-warmgray-600">From Templates</p>
          <p className="text-2xl font-bold text-coral-600">
            {events.filter(e => e.templateId).length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
          <input
            type="text"
            placeholder="Search events by title, venue, organizer, or host..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'UPCOMING', 'PAST', 'DRAFT', 'PUBLISHED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                filter === f
                  ? 'bg-coral-600 text-white'
                  : 'bg-warmgray-100 text-warmgray-600 hover:bg-warmgray-200'
              }`}
            >
              {f === 'ALL' ? 'All Events' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No events found</h3>
          <p className="text-warmgray-600 mt-1">
            {searchTerm ? 'Try a different search term.' : 'No events match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-warmgray-900 truncate">{event.title}</h3>
                    {getStatusBadge(event.status)}
                    {getEventTypeBadge(event.eventType)}
                    {event.templateId && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        Template
                      </span>
                    )}
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
                  
                  <div className="flex items-center gap-4 text-sm text-warmgray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location?.name || event.venueName}
                    </span>
                    {event.host?.name && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {event.host.name}
                      </span>
                    )}
                    {event.organizer && (
                      <span className="text-warmgray-400">
                        by {event.organizer.fullName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 lg:gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warmgray-900">{getTotalSold(event)}</p>
                    <p className="text-xs text-warmgray-500">Sold</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warmgray-900">{getTotalAvailable(event)}</p>
                    <p className="text-xs text-warmgray-500">Capacity</p>
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
                    target="_blank"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
