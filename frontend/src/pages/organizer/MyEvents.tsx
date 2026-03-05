import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, PlusCircle, Eye, Loader2, Edit, Copy, Trash2, CheckSquare, Square, TrendingUp, DollarSign, Ticket } from 'lucide-react'
import { eventsApi } from '../../utils/api'

interface Event {
  id: string
  title: string
  startDateTime: string
  venueName: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  ticketTypes: Array<{
    id?: string
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
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await eventsApi.getMyEvents()
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
      DRAFT: 'bg-warmgray-100 text-warmgray-700 border-warmgray-200',
      PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
      COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200'
    }
    const icons = {
      DRAFT: <div className="w-1.5 h-1.5 rounded-full bg-warmgray-500 mr-1.5" />,
      PUBLISHED: <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />,
      CANCELLED: <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />,
      COMPLETED: <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  const handleSelectAll = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set())
    } else {
      setSelectedEvents(new Set(filteredEvents.map(e => e.id)))
    }
  }

  const handleSelectEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId)
    } else {
      newSelected.add(eventId)
    }
    setSelectedEvents(newSelected)
  }

  const handleDuplicate = async (eventId: string) => {
    setIsDuplicating(eventId)
    setActionError('')
    try {
      const response = await eventsApi.duplicateEvent(eventId)
      if (response.data) {
        // Add the duplicated event to the list
        setEvents(prev => [response.data, ...prev])
        // Show success feedback could be added here
      }
    } catch (err: any) {
      setActionError(err.response?.data || 'Failed to duplicate event')
    } finally {
      setIsDuplicating(null)
    }
  }

  const handleDeleteClick = (eventId: string) => {
    setShowDeleteConfirm(eventId)
    setActionError('')
  }

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return
    
    setIsDeleting(true)
    try {
      await eventsApi.delete(showDeleteConfirm)
      setEvents(prev => prev.filter(e => e.id !== showDeleteConfirm))
      setShowDeleteConfirm(null)
      // Remove from selection if present
      const newSelected = new Set(selectedEvents)
      newSelected.delete(showDeleteConfirm)
      setSelectedEvents(newSelected)
    } catch (err: any) {
      setActionError(err.response?.data || 'Failed to delete event')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) return
    
    setIsDeleting(true)
    setActionError('')
    
    try {
      // Delete events one by one
      const deletePromises = Array.from(selectedEvents).map(eventId => 
        eventsApi.delete(eventId)
      )
      await Promise.all(deletePromises)
      
      // Remove deleted events from list
      setEvents(prev => prev.filter(e => !selectedEvents.has(e.id)))
      setSelectedEvents(new Set())
    } catch (err: any) {
      setActionError(err.response?.data || 'Failed to delete some events')
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate aggregated stats for filtered events
  const getFilteredStats = () => {
    const totalRevenue = filteredEvents.reduce((sum, event) => sum + getRevenue(event), 0)
    const totalSold = filteredEvents.reduce((sum, event) => sum + getTotalSold(event), 0)
    const totalCapacity = filteredEvents.reduce((sum, event) => sum + getTotalAvailable(event), 0)
    return { totalRevenue, totalSold, totalCapacity }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  const { totalRevenue, totalSold, totalCapacity } = getFilteredStats()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading-lg font-bold text-warmgray-900">My Events</h1>
          <p className="text-warmgray-600 mt-1">Manage and track all your events.</p>
        </div>
        <Link to="/organizer/create-event" className="btn-primary">
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Error Display */}
      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {actionError}
        </div>
      )}

      {/* Stats Overview */}
      {filteredEvents.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-warmgray-200">
            <div className="flex items-center gap-2 text-warmgray-500 mb-1">
              <Ticket className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Tickets Sold</span>
            </div>
            <p className="text-2xl font-bold text-warmgray-900">{totalSold}</p>
            {totalCapacity > 0 && (
              <p className="text-xs text-warmgray-500">of {totalCapacity} available</p>
            )}
          </div>
          <div className="bg-white p-4 rounded-xl border border-warmgray-200">
            <div className="flex items-center gap-2 text-warmgray-500 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-coral-600">${totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-warmgray-500">from {filteredEvents.length} events</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-warmgray-200">
            <div className="flex items-center gap-2 text-warmgray-500 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Avg per Event</span>
            </div>
            <p className="text-2xl font-bold text-warmgray-900">
              ${filteredEvents.length > 0 ? (totalRevenue / filteredEvents.length).toFixed(0) : '0'}
            </p>
            <p className="text-xs text-warmgray-500">revenue average</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'UPCOMING', 'PAST', 'DRAFT'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                filter === f
                  ? 'bg-coral-600 text-white'
                  : 'bg-white text-warmgray-600 hover:bg-warmgray-100 border border-warmgray-200'
              }`}
            >
              {f === 'ALL' ? 'All Events' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        {/* Bulk Actions */}
        {selectedEvents.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-warmgray-600">
              {selectedEvents.size} selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
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
          <Link to="/organizer/create-event" className="btn-primary">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All Header */}
          <div className="flex items-center px-4 py-2 bg-warmgray-50 rounded-lg">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-warmgray-600 hover:text-warmgray-900"
            >
              {selectedEvents.size === filteredEvents.length ? (
                <CheckSquare className="h-5 w-5 text-coral-600" />
              ) : (
                <Square className="h-5 w-5" />
              )}
              Select All
            </button>
          </div>

          {filteredEvents.map((event) => {
            const sold = getTotalSold(event)
            const available = getTotalAvailable(event)
            const revenue = getRevenue(event)
            const isSelected = selectedEvents.has(event.id)
            
            return (
              <div 
                key={event.id} 
                className={`card p-6 hover:shadow-lg transition-all ${
                  isSelected ? 'ring-2 ring-coral-500 bg-coral-50/30' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleSelectEvent(event.id)}
                    className="hidden sm:flex items-center justify-center"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-coral-600" />
                    ) : (
                      <Square className="h-5 w-5 text-warmgray-400" />
                    )}
                  </button>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-warmgray-900 truncate">{event.title}</h3>
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
                    <p className="text-sm text-warmgray-500 truncate">
                      {event.location?.name || event.venueName}
                      {event.host?.name && ` • Hosted by ${event.host.name}`}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 lg:gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-warmgray-900">{sold}</p>
                      <p className="text-xs text-warmgray-500">Tickets Sold</p>
                      {available > 0 && (
                        <p className="text-xs text-warmgray-400">/ {available}</p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-coral-600">${revenue.toFixed(0)}</p>
                      <p className="text-xs text-warmgray-500">Revenue</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/events/${event.id}`}
                      className="btn-ghost text-sm py-2 px-3"
                      title="View Event"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/organizer/events/${event.id}/edit`}
                      className="btn-ghost text-sm py-2 px-3"
                      title="Edit Event"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(event.id)}
                      disabled={isDuplicating === event.id}
                      className="btn-ghost text-sm py-2 px-3 disabled:opacity-50"
                      title="Duplicate Event"
                    >
                      {isDuplicating === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(event.id)}
                      className="btn-ghost text-sm py-2 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-warmgray-900 mb-2">Delete Event?</h3>
            <p className="text-warmgray-600 mb-6">
              Are you sure you want to delete "{events.find(e => e.id === showDeleteConfirm)?.title}"? 
              This action cannot be undone.
              {getTotalSold(events.find(e => e.id === showDeleteConfirm)!) > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This event has ticket sales!
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-outline flex-1"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
