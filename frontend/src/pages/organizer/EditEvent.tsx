import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, MapPin, Ticket, Plus, X, ChevronRight, Loader2, Search, Repeat, ArrowLeft, Save } from 'lucide-react'
import { eventsApi, hostsApi, locationsApi } from '../../utils/api'

interface TicketType {
  id?: string
  name: string
  description: string
  price: number
  quantityAvailable: number
  quantitySold?: number
  minPerOrder: number
  maxPerOrder: number
  saleStartDate?: string
  saleEndDate?: string
}

interface Host {
  id: string
  name: string
  bio?: string
  imageUrl?: string
}

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
}

interface EventData {
  id: string
  title: string
  description: string
  startDateTime: string
  endDateTime?: string
  imageUrl?: string
  hostId?: string
  locationId?: string
  categoryIds: string[]
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  ticketTypes: TicketType[]
  isRecurring?: boolean
  recurrencePattern?: string
  recurrenceEndDate?: string
  recurrenceDaysOfWeek?: string[]
}

export function EditEvent() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [step, setStep] = useState(1)
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    imageUrl: '',
    hostId: '',
    locationId: '',
    categoryIds: [] as string[],
  })

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: 'General Admission', description: '', price: 0, quantityAvailable: 100, minPerOrder: 1, maxPerOrder: 10 }
  ])

  const [hosts, setHosts] = useState<Host[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [showNewHostForm, setShowNewHostForm] = useState(false)
  const [showNewLocationForm, setShowNewLocationForm] = useState(false)
  
  // Search states
  const [hostSearch, setHostSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  
  // New host form
  const [newHost, setNewHost] = useState({ name: '', bio: '', email: '', phone: '', website: '' })
  const [isCreatingHost, setIsCreatingHost] = useState(false)
  
  // New location form
  const [newLocation, setNewLocation] = useState({ 
    name: '', address: '', city: '', state: '', zipCode: '', description: '', website: '', phone: ''
  })
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState({
    pattern: 'WEEKLY' as 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY',
    endDate: '',
    daysOfWeek: [] as string[],
  })

  // Original event data for comparison
  const [originalEvent, setOriginalEvent] = useState<EventData | null>(null)

  // Load event data and hosts/locations on mount
  useEffect(() => {
    const loadData = async () => {
      if (!eventId) return
      
      setIsFetching(true)
      try {
        const [eventRes, hostsRes, locationsRes] = await Promise.all([
          eventsApi.getById(eventId),
          hostsApi.getAll(),
          locationsApi.getAll()
        ])
        
        const eventData: EventData = eventRes.data
        setOriginalEvent(eventData)
        setHosts(hostsRes.data || [])
        setLocations(locationsRes.data || [])
        
        // Parse date and time
        const startDate = new Date(eventData.startDateTime)
        const endDate = eventData.endDateTime ? new Date(eventData.endDateTime) : null
        
        // Format dates for input fields
        const formatDate = (date: Date) => date.toISOString().split('T')[0]
        const formatTime = (date: Date) => date.toTimeString().slice(0, 5)
        
        setFormData({
          title: eventData.title,
          description: eventData.description || '',
          startDate: formatDate(startDate),
          startTime: formatTime(startDate),
          endDate: endDate ? formatDate(endDate) : '',
          endTime: endDate ? formatTime(endDate) : '',
          imageUrl: eventData.imageUrl || '',
          hostId: eventData.hostId || '',
          locationId: eventData.locationId || '',
          categoryIds: eventData.categoryIds || [],
        })
        
        // Set ticket types
        if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
          setTicketTypes(eventData.ticketTypes.map((tt: TicketType) => ({
            ...tt,
            quantitySold: tt.quantitySold || 0
          })))
        } else {
          setTicketTypes([])
        }
        
        // Set recurrence data if present
        if (eventData.isRecurring) {
          setIsRecurring(true)
          setRecurrence({
            pattern: (eventData.recurrencePattern as any) || 'WEEKLY',
            endDate: eventData.recurrenceEndDate ? formatDate(new Date(eventData.recurrenceEndDate)) : '',
            daysOfWeek: eventData.recurrenceDaysOfWeek || [],
          })
        }
        
      } catch (err: any) {
        setFetchError(err.response?.data || 'Failed to load event data')
      } finally {
        setIsFetching(false)
      }
    }
    
    loadData()
  }, [eventId])

  const handleAddTicketType = () => {
    setTicketTypes([...ticketTypes, { 
      name: '', description: '', price: 0, quantityAvailable: 100, minPerOrder: 1, maxPerOrder: 10 
    }])
  }

  const handleRemoveTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index))
  }

  const handleTicketChange = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...ticketTypes]
    updated[index] = { ...updated[index], [field]: value }
    setTicketTypes(updated)
  }

  const handleCreateHost = async () => {
    if (!newHost.name) return
    setIsCreatingHost(true)
    try {
      const response = await hostsApi.create(newHost)
      const createdHost = response.data
      setHosts([...hosts, createdHost])
      setFormData({ ...formData, hostId: createdHost.id })
      setNewHost({ name: '', bio: '', email: '', phone: '', website: '' })
      setShowNewHostForm(false)
    } catch (err: any) {
      alert('Failed to create host: ' + (err.response?.data || err.message))
    } finally {
      setIsCreatingHost(false)
    }
  }

  const handleCreateLocation = async () => {
    if (!newLocation.name || !newLocation.address) return
    setIsCreatingLocation(true)
    try {
      const response = await locationsApi.create({
        name: newLocation.name,
        address: newLocation.address,
        city: newLocation.city,
        state: newLocation.state,
        zip: newLocation.zipCode,
        description: newLocation.description,
        website: newLocation.website,
        phone: newLocation.phone
      })
      const createdLocation = response.data
      setLocations([...locations, createdLocation])
      setFormData({ ...formData, locationId: createdLocation.id })
      setNewLocation({ name: '', address: '', city: '', state: '', zipCode: '', description: '', website: '', phone: '' })
      setShowNewLocationForm(false)
    } catch (err: any) {
      alert('Failed to create location: ' + (err.response?.data || err.message))
    } finally {
      setIsCreatingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault()
    if (!eventId) return
    
    setIsSaving(true)
    setError('')

    try {
      // Combine date and time
      const startDateTime = `${formData.startDate}T${formData.startTime}`
      const endDateTime = formData.endDate && formData.endTime 
        ? `${formData.endDate}T${formData.endTime}` 
        : undefined

      const eventData = {
        title: formData.title,
        description: formData.description,
        startDateTime,
        endDateTime,
        venueName: locations.find(l => l.id === formData.locationId)?.name || 'TBD',
        venueAddress: locations.find(l => l.id === formData.locationId)?.address,
        venueCity: locations.find(l => l.id === formData.locationId)?.city,
        venueState: locations.find(l => l.id === formData.locationId)?.state,
        imageUrl: formData.imageUrl,
        hostId: formData.hostId || undefined,
        locationId: formData.locationId || undefined,
        categoryIds: formData.categoryIds,
        status: asDraft ? 'DRAFT' : 'PUBLISHED',
        ticketTypes: ticketTypes.length > 0 ? ticketTypes.map(tt => ({
          ...tt,
          price: Number(tt.price),
          quantityAvailable: Number(tt.quantityAvailable),
          minPerOrder: Number(tt.minPerOrder),
          maxPerOrder: Number(tt.maxPerOrder)
        })) : undefined,
        // Add recurrence data if enabled
        ...(isRecurring && {
          isRecurring: true,
          recurrencePattern: recurrence.pattern,
          recurrenceEndDate: recurrence.endDate,
          recurrenceDaysOfWeek: recurrence.daysOfWeek.length > 0 ? recurrence.daysOfWeek : undefined,
        })
      }

      await eventsApi.update(eventId, eventData)
      navigate('/organizer/manage-events')
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/organizer/manage-events')
  }

  const steps = [
    { number: 1, title: 'Basic Info', icon: Calendar },
    { number: 2, title: 'Host & Location', icon: MapPin },
    { number: 3, title: 'Tickets', icon: Ticket },
  ]

  // Filter hosts and locations based on search
  const filteredHosts = hosts.filter(h => 
    h.name.toLowerCase().includes(hostSearch.toLowerCase())
  )
  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
    l.address.toLowerCase().includes(locationSearch.toLowerCase()) ||
    l.city.toLowerCase().includes(locationSearch.toLowerCase())
  )

  // Calculate total tickets sold
  const getTotalSold = () => {
    return ticketTypes.reduce((sum, tt) => sum + (tt.quantitySold || 0), 0)
  }

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate('/organizer/manage-events')} className="btn-ghost mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </button>
          <h1 className="text-heading-lg font-bold text-warmgray-900">Edit Event</h1>
        </div>
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-700 mb-4">{fetchError}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/organizer/manage-events')} className="btn-ghost mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </button>
        <h1 className="text-heading-lg font-bold text-warmgray-900">Edit Event</h1>
        <p className="text-warmgray-600 mt-1">Update your event details below.</p>
        {originalEvent && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              originalEvent.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
              originalEvent.status === 'DRAFT' ? 'bg-warmgray-100 text-warmgray-700' :
              originalEvent.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {originalEvent.status.charAt(0) + originalEvent.status.slice(1).toLowerCase()}
            </span>
            {getTotalSold() > 0 && (
              <span className="text-sm text-warmgray-500">
                {getTotalSold()} tickets sold
              </span>
            )}
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => {
          const isActive = step === s.number
          const isCompleted = step > s.number
          
          return (
            <div key={s.number} className="flex items-center flex-1">
              <button
                onClick={() => setStep(s.number)}
                className={`flex items-center gap-3 px-4 py-2 rounded-full font-medium transition-colors ${
                  isActive 
                    ? 'bg-coral-600 text-white' 
                    : isCompleted 
                      ? 'bg-coral-100 text-coral-700'
                      : 'bg-warmgray-100 text-warmgray-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  isActive ? 'bg-white text-coral-600' : isCompleted ? 'bg-coral-600 text-white' : 'bg-warmgray-300 text-warmgray-600'
                }`}>
                  {isCompleted ? '✓' : s.number}
                </div>
                <span className="hidden sm:block">{s.title}</span>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 text-warmgray-300 mx-2" />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-heading-sm font-bold text-warmgray-900">Event Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g., Summer Pool Party 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                className="input"
                placeholder="Describe your event..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  className="input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  className="input"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  className="input"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Event Image URL
              </label>
              <input
                type="url"
                className="input"
                placeholder="https://example.com/event-image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              <p className="text-xs text-warmgray-500 mt-1">
                Enter a URL for your event banner image
              </p>
            </div>

            {/* Recurrence Section */}
            <div className="border-t border-warmgray-200 pt-6">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5 rounded border-warmgray-300 text-coral-600"
                />
                <div>
                  <span className="font-medium text-warmgray-900 flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Make this a recurring event
                  </span>
                  <p className="text-sm text-warmgray-500">Create multiple instances of this event</p>
                </div>
              </label>

              {isRecurring && (
                <div className="bg-warmgray-50 p-4 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-warmgray-700 mb-2">
                      Repeat Pattern
                    </label>
                    <select
                      className="input"
                      value={recurrence.pattern}
                      onChange={(e) => setRecurrence({ ...recurrence, pattern: e.target.value as any, daysOfWeek: [] })}
                    >
                      <option value="DAILY">Every Day</option>
                      <option value="WEEKLY">Every Week</option>
                      <option value="BIWEEKLY">Every 2 Weeks</option>
                      <option value="MONTHLY">Every Month (same date)</option>
                    </select>
                  </div>

                  {recurrence.pattern === 'WEEKLY' && (
                    <div>
                      <label className="block text-sm font-medium text-warmgray-700 mb-2">
                        Repeat on
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const dayUpper = day.toUpperCase()
                              setRecurrence(prev => ({
                                ...prev,
                                daysOfWeek: prev.daysOfWeek.includes(dayUpper)
                                  ? prev.daysOfWeek.filter(d => d !== dayUpper)
                                  : [...prev.daysOfWeek, dayUpper]
                              }))
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              recurrence.daysOfWeek.includes(day.toUpperCase())
                                ? 'bg-coral-600 text-white'
                                : 'bg-white text-warmgray-600 hover:bg-warmgray-100'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-warmgray-700 mb-2">
                      Repeat until *
                    </label>
                    <input
                      type="date"
                      required={isRecurring}
                      className="input"
                      value={recurrence.endDate}
                      onChange={(e) => setRecurrence({ ...recurrence, endDate: e.target.value })}
                    />
                    <p className="text-xs text-warmgray-500 mt-1">
                      Events will be created from {formData.startDate || 'start date'} until this date
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary"
              >
                Next: Host & Location
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Host & Location */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Host Selection */}
            <div className="card p-6">
              <h2 className="text-heading-sm font-bold text-warmgray-900 mb-4">Event Host</h2>
              
              <div className="space-y-4">
                {/* Host Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
                  <input
                    type="text"
                    placeholder="Search hosts..."
                    className="input pl-10"
                    value={hostSearch}
                    onChange={(e) => setHostSearch(e.target.value)}
                  />
                </div>

                <select
                  className="input"
                  value={formData.hostId}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setShowNewHostForm(true)
                    } else {
                      setFormData({ ...formData, hostId: e.target.value })
                      setShowNewHostForm(false)
                    }
                  }}
                >
                  <option value="">Select a host...</option>
                  {filteredHosts.map(host => (
                    <option key={host.id} value={host.id}>{host.name}</option>
                  ))}
                  <option value="new">+ Create New Host</option>
                </select>

                {filteredHosts.length === 0 && hostSearch && (
                  <p className="text-sm text-warmgray-500">No hosts found. Try a different search or create a new one.</p>
                )}

                {showNewHostForm && (
                  <div className="bg-warmgray-50 p-4 rounded-xl space-y-4">
                    <h3 className="font-medium text-warmgray-900">Create New Host</h3>
                    <input
                      type="text"
                      placeholder="Host Name *"
                      className="input"
                      value={newHost.name}
                      onChange={(e) => setNewHost({ ...newHost, name: e.target.value })}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="input"
                      value={newHost.email}
                      onChange={(e) => setNewHost({ ...newHost, email: e.target.value })}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      className="input"
                      value={newHost.phone}
                      onChange={(e) => setNewHost({ ...newHost, phone: e.target.value })}
                    />
                    <input
                      type="url"
                      placeholder="Website"
                      className="input"
                      value={newHost.website}
                      onChange={(e) => setNewHost({ ...newHost, website: e.target.value })}
                    />
                    <textarea
                      placeholder="Host Bio"
                      rows={3}
                      className="input"
                      value={newHost.bio}
                      onChange={(e) => setNewHost({ ...newHost, bio: e.target.value })}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowNewHostForm(false)}
                        className="btn-outline flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary flex-1"
                        onClick={handleCreateHost}
                        disabled={isCreatingHost || !newHost.name}
                      >
                        {isCreatingHost ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2 inline" /> Creating...</>
                        ) : (
                          'Create Host'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Selection */}
            <div className="card p-6">
              <h2 className="text-heading-sm font-bold text-warmgray-900 mb-4">Event Location</h2>
              
              <div className="space-y-4">
                {/* Location Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
                  <input
                    type="text"
                    placeholder="Search locations by name, address, or city..."
                    className="input pl-10"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                </div>

                <select
                  className="input"
                  value={formData.locationId}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setShowNewLocationForm(true)
                    } else {
                      setFormData({ ...formData, locationId: e.target.value })
                      setShowNewLocationForm(false)
                    }
                  }}
                >
                  <option value="">Select a location...</option>
                  {filteredLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.city ? `- ${loc.city}` : ''}
                    </option>
                  ))}
                  <option value="new">+ Create New Location</option>
                </select>

                {filteredLocations.length === 0 && locationSearch && (
                  <p className="text-sm text-warmgray-500">No locations found. Try a different search or create a new one.</p>
                )}

                {showNewLocationForm && (
                  <div className="bg-warmgray-50 p-4 rounded-xl space-y-4">
                    <h3 className="font-medium text-warmgray-900">Create New Location</h3>
                    <input
                      type="text"
                      placeholder="Venue Name *"
                      className="input"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Address *"
                      className="input"
                      value={newLocation.address}
                      onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        className="input"
                        value={newLocation.city}
                        onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        className="input"
                        value={newLocation.state}
                        onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="ZIP"
                        className="input"
                        value={newLocation.zipCode}
                        onChange={(e) => setNewLocation({ ...newLocation, zipCode: e.target.value })}
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone"
                      className="input"
                      value={newLocation.phone}
                      onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                    />
                    <input
                      type="url"
                      placeholder="Website"
                      className="input"
                      value={newLocation.website}
                      onChange={(e) => setNewLocation({ ...newLocation, website: e.target.value })}
                    />
                    <textarea
                      placeholder="Description"
                      rows={3}
                      className="input"
                      value={newLocation.description}
                      onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowNewLocationForm(false)}
                        className="btn-outline flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary flex-1"
                        onClick={handleCreateLocation}
                        disabled={isCreatingLocation || !newLocation.name || !newLocation.address}
                      >
                        {isCreatingLocation ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2 inline" /> Creating...</>
                        ) : (
                          'Create Location'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-primary"
              >
                Next: Tickets
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Tickets */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-heading-sm font-bold text-warmgray-900">Tickets</h2>
                  <p className="text-sm text-warmgray-600 mt-1">
                    Manage ticket types for your event
                    {getTotalSold() > 0 && (
                      <span className="text-coral-600 ml-2">
                        ({getTotalSold()} tickets already sold)
                      </span>
                    )}
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ticketTypes.length === 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTicketTypes([])
                      } else {
                        setTicketTypes([{ name: 'General Admission', description: '', price: 0, quantityAvailable: 100, minPerOrder: 1, maxPerOrder: 10 }])
                      }
                    }}
                    className="w-4 h-4 rounded border-warmgray-300 text-coral-600"
                  />
                  <span className="text-sm text-warmgray-700">Free/No tickets</span>
                </label>
              </div>

              {ticketTypes.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-blue-800">This event will have no ticket sales. Attendees can RSVP or attend for free.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketTypes.map((ticket, index) => (
                    <div key={index} className="bg-warmgray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-warmgray-900">Ticket Type {index + 1}</h3>
                          {ticket.quantitySold && ticket.quantitySold > 0 && (
                            <span className="text-xs bg-coral-100 text-coral-700 px-2 py-0.5 rounded-full">
                              {ticket.quantitySold} sold
                            </span>
                          )}
                        </div>
                        {ticketTypes.length > 1 && (!ticket.quantitySold || ticket.quantitySold === 0) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTicketType(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-warmgray-600 mb-1">Ticket Name *</label>
                          <input
                            type="text"
                            placeholder="e.g., General Admission, VIP, Early Bird"
                            className="input"
                            value={ticket.name}
                            onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warmgray-600 mb-1">Price ($) *</label>
                          <input
                            type="number"
                            placeholder="0.00 for free events"
                            className="input"
                            value={ticket.price}
                            onChange={(e) => handleTicketChange(index, 'price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warmgray-600 mb-1">
                            Quantity Available *
                            {ticket.quantitySold && ticket.quantitySold > 0 && (
                              <span className="text-warmgray-400 ml-1">(min: {ticket.quantitySold} sold)</span>
                            )}
                          </label>
                          <input
                            type="number"
                            placeholder="Number of tickets"
                            className="input"
                            value={ticket.quantityAvailable}
                            onChange={(e) => handleTicketChange(index, 'quantityAvailable', parseInt(e.target.value) || 0)}
                            min={ticket.quantitySold || 1}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warmgray-600 mb-1">Description</label>
                          <input
                            type="text"
                            placeholder="What's included with this ticket?"
                            className="input"
                            value={ticket.description}
                            onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warmgray-600 mb-1">Min Per Order</label>
                          <input
                            type="number"
                            placeholder="1"
                            className="input"
                            value={ticket.minPerOrder}
                            onChange={(e) => handleTicketChange(index, 'minPerOrder', parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warmgray-600 mb-1">Max Per Order</label>
                          <input
                            type="number"
                            placeholder="10"
                            className="input"
                            value={ticket.maxPerOrder}
                            onChange={(e) => handleTicketChange(index, 'maxPerOrder', parseInt(e.target.value) || 10)}
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleAddTicketType}
                    className="btn-outline text-sm w-full"
                  >
                    <Plus className="h-4 w-4 mr-1 inline" />
                    Add Another Ticket Type
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-outline"
              >
                Back
              </button>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, true)}
                  className="btn-outline"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save as Draft
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
