import { useEffect, useState } from 'react'
import { 
  Calendar, 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Eye,
  Trash2,
  Download,
  Filter,
  X,
  MapPin,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../utils/api'

interface AdminEvent {
  id: string
  title: string
  startDateTime: string
  endDateTime: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  venueName: string
  location?: {
    name: string
    city: string
  }
  host?: {
    name: string
  }
  organizer?: {
    id: string
    fullName: string
    email: string
  }
  ticketTypes: Array<{
    name: string
    quantityAvailable: number
    quantitySold: number
    price: number
  }>
  ticketsSold: number
  totalCapacity: number
  revenue: number
}

interface DateRange {
  start: string
  end: string
}

interface FilterState {
  search: string
  status: string
  host: string
  location: string
  dateRange: DateRange
}

const STATUSES = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
]

const ITEMS_PER_PAGE = 10

// Mock data for demo
const MOCK_HOSTS = ['All Hosts', 'Sarah\'s Events', 'Tech Conference Inc', 'Music Festival LLC', 'Art Gallery Co']
const MOCK_LOCATIONS = ['All Locations', 'Convention Center', 'City Hall', 'Music Hall', 'Art Space', 'Stadium']

const MOCK_EVENTS: AdminEvent[] = [
  {
    id: '1',
    title: 'Summer Music Festival 2024',
    startDateTime: '2024-06-15T14:00:00Z',
    endDateTime: '2024-06-15T23:00:00Z',
    status: 'PUBLISHED',
    venueName: 'Central Park',
    location: { name: 'Central Park', city: 'New York' },
    host: { name: 'Music Festival LLC' },
    organizer: { id: '1', fullName: 'John Smith', email: 'john@musicfest.com' },
    ticketTypes: [{ name: 'General', quantityAvailable: 1000, quantitySold: 850, price: 50 }],
    ticketsSold: 850,
    totalCapacity: 1000,
    revenue: 42500,
  },
  {
    id: '2',
    title: 'Tech Summit 2024',
    startDateTime: '2024-03-20T09:00:00Z',
    endDateTime: '2024-03-22T18:00:00Z',
    status: 'PUBLISHED',
    venueName: 'Convention Center',
    location: { name: 'Convention Center', city: 'San Francisco' },
    host: { name: 'Tech Conference Inc' },
    organizer: { id: '2', fullName: 'Sarah Chen', email: 'sarah@techconf.com' },
    ticketTypes: [{ name: 'Standard', quantityAvailable: 500, quantitySold: 320, price: 299 }],
    ticketsSold: 320,
    totalCapacity: 500,
    revenue: 95680,
  },
  {
    id: '3',
    title: 'Art Exhibition: Modern Perspectives',
    startDateTime: '2024-04-01T10:00:00Z',
    endDateTime: '2024-04-30T18:00:00Z',
    status: 'DRAFT',
    venueName: 'Modern Art Museum',
    location: { name: 'Art Space', city: 'Chicago' },
    host: { name: 'Art Gallery Co' },
    organizer: { id: '3', fullName: 'Emma Davis', email: 'emma@artgallery.com' },
    ticketTypes: [{ name: 'Admission', quantityAvailable: 200, quantitySold: 0, price: 25 }],
    ticketsSold: 0,
    totalCapacity: 200,
    revenue: 0,
  },
  {
    id: '4',
    title: 'Business Networking Night',
    startDateTime: '2024-03-10T18:00:00Z',
    endDateTime: '2024-03-10T21:00:00Z',
    status: 'COMPLETED',
    venueName: 'Downtown Business Center',
    location: { name: 'City Hall', city: 'Boston' },
    host: { name: 'Sarah\'s Events' },
    organizer: { id: '1', fullName: 'John Smith', email: 'john@business.com' },
    ticketTypes: [{ name: 'Entry', quantityAvailable: 150, quantitySold: 145, price: 30 }],
    ticketsSold: 145,
    totalCapacity: 150,
    revenue: 4350,
  },
  {
    id: '5',
    title: 'Jazz in the Park',
    startDateTime: '2024-05-20T19:00:00Z',
    endDateTime: '2024-05-20T22:00:00Z',
    status: 'PUBLISHED',
    venueName: 'Riverside Park',
    location: { name: 'Music Hall', city: 'New Orleans' },
    host: { name: 'Music Festival LLC' },
    organizer: { id: '4', fullName: 'Michael Brown', email: 'mike@jazz.com' },
    ticketTypes: [{ name: 'General', quantityAvailable: 300, quantitySold: 180, price: 35 }],
    ticketsSold: 180,
    totalCapacity: 300,
    revenue: 6300,
  },
  {
    id: '6',
    title: 'Startup Pitch Competition',
    startDateTime: '2024-04-15T13:00:00Z',
    endDateTime: '2024-04-15T17:00:00Z',
    status: 'CANCELLED',
    venueName: 'Innovation Hub',
    location: { name: 'Convention Center', city: 'Austin' },
    host: { name: 'Tech Conference Inc' },
    organizer: { id: '2', fullName: 'Sarah Chen', email: 'sarah@techconf.com' },
    ticketTypes: [{ name: 'Spectator', quantityAvailable: 100, quantitySold: 45, price: 20 }],
    ticketsSold: 45,
    totalCapacity: 100,
    revenue: 900,
  },
  {
    id: '7',
    title: 'Wine Tasting Experience',
    startDateTime: '2024-06-01T17:00:00Z',
    endDateTime: '2024-06-01T20:00:00Z',
    status: 'PUBLISHED',
    venueName: 'Vineyard Estate',
    location: { name: 'Art Space', city: 'Napa Valley' },
    host: { name: 'Sarah\'s Events' },
    organizer: { id: '5', fullName: 'Lisa Wilson', email: 'lisa@wine.com' },
    ticketTypes: [{ name: 'Tasting', quantityAvailable: 80, quantitySold: 75, price: 85 }],
    ticketsSold: 75,
    totalCapacity: 80,
    revenue: 6375,
  },
  {
    id: '8',
    title: 'Comedy Night Live',
    startDateTime: '2024-03-25T20:00:00Z',
    endDateTime: '2024-03-25T23:00:00Z',
    status: 'DRAFT',
    venueName: 'Laugh Factory',
    location: { name: 'Stadium', city: 'Los Angeles' },
    host: { name: 'Art Gallery Co' },
    organizer: { id: '6', fullName: 'David Lee', email: 'david@comedy.com' },
    ticketTypes: [{ name: 'General', quantityAvailable: 250, quantitySold: 0, price: 40 }],
    ticketsSold: 0,
    totalCapacity: 250,
    revenue: 0,
  },
  {
    id: '9',
    title: 'Marathon 2024',
    startDateTime: '2024-09-20T06:00:00Z',
    endDateTime: '2024-09-20T14:00:00Z',
    status: 'PUBLISHED',
    venueName: 'City Streets',
    location: { name: 'Stadium', city: 'Chicago' },
    host: { name: 'Sports Events Inc' },
    organizer: { id: '7', fullName: 'Tom Johnson', email: 'tom@marathon.com' },
    ticketTypes: [{ name: 'Runner', quantityAvailable: 5000, quantitySold: 3200, price: 75 }],
    ticketsSold: 3200,
    totalCapacity: 5000,
    revenue: 240000,
  },
  {
    id: '10',
    title: 'Cooking Masterclass',
    startDateTime: '2024-04-10T11:00:00Z',
    endDateTime: '2024-04-10T14:00:00Z',
    status: 'PUBLISHED',
    venueName: 'Culinary Institute',
    location: { name: 'City Hall', city: 'Seattle' },
    host: { name: 'Sarah\'s Events' },
    organizer: { id: '5', fullName: 'Lisa Wilson', email: 'lisa@cooking.com' },
    ticketTypes: [{ name: 'Class', quantityAvailable: 30, quantitySold: 28, price: 150 }],
    ticketsSold: 28,
    totalCapacity: 30,
    revenue: 4200,
  },
  {
    id: '11',
    title: 'Film Festival Opening',
    startDateTime: '2024-05-05T18:30:00Z',
    endDateTime: '2024-05-05T22:00:00Z',
    status: 'DRAFT',
    venueName: 'Cinema Complex',
    location: { name: 'Art Space', city: 'Toronto' },
    host: { name: 'Art Gallery Co' },
    organizer: { id: '8', fullName: 'Alex Turner', email: 'alex@film.com' },
    ticketTypes: [{ name: 'Premiere', quantityAvailable: 400, quantitySold: 0, price: 45 }],
    ticketsSold: 0,
    totalCapacity: 400,
    revenue: 0,
  },
  {
    id: '12',
    title: 'Charity Gala Dinner',
    startDateTime: '2024-06-30T19:00:00Z',
    endDateTime: '2024-06-30T23:00:00Z',
    status: 'PUBLISHED',
    venueName: 'Grand Ballroom',
    location: { name: 'Convention Center', city: 'Miami' },
    host: { name: 'Music Festival LLC' },
    organizer: { id: '9', fullName: 'Rachel Green', email: 'rachel@charity.com' },
    ticketTypes: [{ name: 'Dinner', quantityAvailable: 200, quantitySold: 185, price: 250 }],
    ticketsSold: 185,
    totalCapacity: 200,
    revenue: 46250,
  },
]

export function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    host: 'All Hosts',
    location: 'All Locations',
    dateRange: { start: '', end: '' },
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call: const response = await adminApi.getAdminEvents({})
      setEvents(MOCK_EVENTS)
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    if (filters.status !== 'ALL' && event.status !== filters.status) return false
    if (filters.host !== 'All Hosts' && event.host?.name !== filters.host) return false
    if (filters.location !== 'All Locations' && !event.location?.name.includes(filters.location)) return false
    if (filters.dateRange.start && new Date(event.startDateTime) < new Date(filters.dateRange.start)) return false
    if (filters.dateRange.end && new Date(event.startDateTime) > new Date(filters.dateRange.end)) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        event.title.toLowerCase().includes(search) ||
        event.venueName.toLowerCase().includes(search) ||
        event.host?.name.toLowerCase().includes(search) ||
        event.organizer?.fullName.toLowerCase().includes(search)
      )
    }
    return true
  })

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const activeFiltersCount = 
    (filters.status !== 'ALL' ? 1 : 0) + 
    (filters.host !== 'All Hosts' ? 1 : 0) + 
    (filters.location !== 'All Locations' ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(new Set(paginatedEvents.map(e => e.id)))
    } else {
      setSelectedEvents(new Set())
    }
  }

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    const newSelected = new Set(selectedEvents)
    if (checked) {
      newSelected.add(eventId)
    } else {
      newSelected.delete(eventId)
    }
    setSelectedEvents(newSelected)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedEvents.size === 0) return
    try {
      await adminApi.bulkUpdateEvents(Array.from(selectedEvents), action)
      await loadEvents()
      setSelectedEvents(new Set())
    } catch (err) {
      console.error('Failed to perform bulk action:', err)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    try {
      await adminApi.exportEvents(format)
      // In a real implementation, this would download the file
      alert(`Exporting ${filteredEvents.length} events as ${format.toUpperCase()}...`)
    } catch (err) {
      console.error('Failed to export:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      // await adminApi.deleteEvent(eventId)
      setEvents(events.filter(e => e.id !== eventId))
    } catch (err) {
      console.error('Failed to delete event:', err)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      host: 'All Hosts',
      location: 'All Locations',
      dateRange: { start: '', end: '' },
    })
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-warmgray-100 text-warmgray-700',
      PUBLISHED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-heading-lg font-bold text-warmgray-900">All Events</h2>
          <p className="text-warmgray-600 mt-1">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && ` (filtered from ${events.length})`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting || filteredEvents.length === 0}
            className="btn-outline text-sm py-2"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
            <input
              type="text"
              placeholder="Search events by title, venue, host..."
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
              className="input py-2 text-sm w-32"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-warmgray-200 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-warmgray-600 mb-1.5">Date Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="input py-2 text-sm flex-1"
                />
                <span className="text-warmgray-400">to</span>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="input py-2 text-sm flex-1"
                />
              </div>
            </div>

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

            {/* Location Filter */}
            <div>
              <label className="block text-xs font-medium text-warmgray-600 mb-1.5">Location</label>
              <select
                value={filters.location}
                onChange={(e) => {
                  setFilters({ ...filters, location: e.target.value })
                  setCurrentPage(1)
                }}
                className="input py-2 text-sm w-full"
              >
                {MOCK_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
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
            {filters.location !== 'All Locations' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                Location: {filters.location}
                <button onClick={() => setFilters({ ...filters, location: 'All Locations' })}><X className="h-3 w-3" /></button>
              </span>
            )}
            {(filters.dateRange.start || filters.dateRange.end) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                Date Range
                <button onClick={() => setFilters({ ...filters, dateRange: { start: '', end: '' } })}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedEvents.size > 0 && (
        <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-coral-800 font-medium">
            {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="btn-primary text-xs py-1.5 px-3"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              className="btn-outline text-xs py-1.5 px-3"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Unpublish
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn-ghost text-xs py-1.5 px-3 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No events found</h3>
          <p className="text-warmgray-600 mt-1">
            {filters.search || activeFiltersCount > 0 
              ? 'Try adjusting your filters.' 
              : 'No events in the system yet.'}
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
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={paginatedEvents.length > 0 && paginatedEvents.every(e => selectedEvents.has(e.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-warmgray-300 text-coral-600 focus:ring-coral-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Host</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Tickets</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray-100">
                  {paginatedEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-warmgray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedEvents.has(event.id)}
                          onChange={(e) => handleSelectEvent(event.id, e.target.checked)}
                          className="rounded border-warmgray-300 text-coral-600 focus:ring-coral-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-warmgray-900">{event.title}</p>
                          <p className="text-xs text-warmgray-500">by {event.organizer?.fullName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-warmgray-600">
                        {new Date(event.startDateTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-warmgray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-warmgray-400" />
                          {event.host?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-warmgray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-warmgray-400" />
                          {event.location?.name || event.venueName}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(event.status)}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span className="font-medium text-warmgray-900">{event.ticketsSold}</span>
                          <span className="text-warmgray-500"> / {event.totalCapacity}</span>
                          <div className="w-16 h-1.5 bg-warmgray-200 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-coral-500 rounded-full"
                              style={{ width: `${Math.min(100, (event.ticketsSold / event.totalCapacity) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/events/${event.id}`}
                            target="_blank"
                            className="btn-ghost text-xs py-1.5 px-2"
                            title="View Event"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            className="btn-ghost text-xs py-1.5 px-2"
                            title="Edit Event"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="btn-ghost text-xs py-1.5 px-2 text-red-600 hover:bg-red-50"
                            title="Delete Event"
                          >
                            <Trash2 className="h-4 w-4" />
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
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} events
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
    </div>
  )
}
