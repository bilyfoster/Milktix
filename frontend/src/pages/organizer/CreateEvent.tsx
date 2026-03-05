import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Ticket, Plus, X, ChevronRight, Loader2 } from 'lucide-react'
import { eventsApi } from '../../utils/api'

interface TicketType {
  name: string
  description: string
  price: number
  quantityAvailable: number
  minPerOrder: number
  maxPerOrder: number
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

export function CreateEvent() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
  
  // New host form
  const [newHost, setNewHost] = useState({ name: '', bio: '', email: '', phone: '' })
  
  // New location form
  const [newLocation, setNewLocation] = useState({ 
    name: '', address: '', city: '', state: '', zipCode: '', description: '' 
  })

  // Load hosts and locations
  useEffect(() => {
    // These would be real API calls in production
    // For now, we'll use mock data
    setHosts([
      { id: '1', name: 'Your Organization', bio: 'Default host profile' }
    ])
    setLocations([
      { id: '1', name: 'Virtual Event', address: 'Online', city: '', state: '' }
    ])
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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
        ticketTypes: ticketTypes.map(tt => ({
          ...tt,
          price: Number(tt.price),
          quantityAvailable: Number(tt.quantityAvailable),
          minPerOrder: Number(tt.minPerOrder),
          maxPerOrder: Number(tt.maxPerOrder)
        }))
      }

      await eventsApi.create(eventData)
      navigate('/organizer/events')
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info', icon: Calendar },
    { number: 2, title: 'Host & Location', icon: MapPin },
    { number: 3, title: 'Tickets', icon: Ticket },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-warmgray-900">Create New Event</h1>
        <p className="text-warmgray-600 mt-1">Fill in the details below to create your event.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
                  {hosts.map(host => (
                    <option key={host.id} value={host.id}>{host.name}</option>
                  ))}
                  <option value="new">+ Create New Host</option>
                </select>

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
                        onClick={() => {
                          // Would create host via API
                          setShowNewHostForm(false)
                        }}
                      >
                        Create Host
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
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name} - {loc.address}</option>
                  ))}
                  <option value="new">+ Create New Location</option>
                </select>

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
                        onClick={() => {
                          // Would create location via API
                          setShowNewLocationForm(false)
                        }}
                      >
                        Create Location
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
                  <p className="text-sm text-warmgray-600 mt-1">Add ticket types for your event or make it free/RSVP only</p>
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
                        <h3 className="font-medium text-warmgray-900">Ticket Type {index + 1}</h3>
                        {ticketTypes.length > 1 && (
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
                          <label className="block text-xs font-medium text-warmgray-600 mb-1">Quantity Available *</label>
                          <input
                            type="number"
                            placeholder="Number of tickets"
                            className="input"
                            value={ticket.quantityAvailable}
                            onChange={(e) => handleTicketChange(index, 'quantityAvailable', parseInt(e.target.value) || 0)}
                            min="1"
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

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-outline"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
