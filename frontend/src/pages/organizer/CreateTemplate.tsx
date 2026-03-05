import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Plus, X, ChevronRight, Loader2, Repeat } from 'lucide-react'
import { templatesApi, hostsApi, locationsApi } from '../../utils/api'

interface TicketType {
  name: string
  description: string
  price: number
  quantityAvailable: number
  minPerOrder: number
  maxPerOrder: number
}

export function CreateTemplate() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    imageUrl: '',
    hostId: '',
    locationId: '',
  })

  // Recurrence settings
  const [recurrence, setRecurrence] = useState({
    recurrenceType: 'WEEKLY',
    daysOfWeek: ['SUNDAY'] as string[],
    weekOfMonth: 4,
    dayOfWeek: 'WEDNESDAY',
    interval: 1,
    startDate: '',
    endDate: '',
    startTime: '11:00',
    endTime: '14:00',
  })

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: 'General Admission', description: '', price: 0, quantityAvailable: 100, minPerOrder: 1, maxPerOrder: 10 }
  ])

  const [hosts, setHosts] = useState<{id: string, name: string}[]>([])
  const [locations, setLocations] = useState<{id: string, name: string, city?: string}[]>([])
  const [showNewHostForm, setShowNewHostForm] = useState(false)
  const [showNewLocationForm, setShowNewLocationForm] = useState(false)

  // New host/location forms
  const [newHost, setNewHost] = useState({ name: '', bio: '', email: '', phone: '' })
  const [newLocation, setNewLocation] = useState({ name: '', address: '', city: '', state: '', zipCode: '' })

  // Load hosts and locations
  useEffect(() => {
    const loadData = async () => {
      try {
        const [hostsRes, locationsRes] = await Promise.all([
          hostsApi.getAll(),
          locationsApi.getAll()
        ])
        setHosts(hostsRes.data || [])
        setLocations(locationsRes.data || [])
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }
    loadData()
    
    // Set default start date to today
    setRecurrence(prev => ({ ...prev, startDate: new Date().toISOString().split('T')[0] }))
  }, [])

  const DAYS_OF_WEEK = [
    { value: 'MONDAY', label: 'Mon' },
    { value: 'TUESDAY', label: 'Tue' },
    { value: 'WEDNESDAY', label: 'Wed' },
    { value: 'THURSDAY', label: 'Thu' },
    { value: 'FRIDAY', label: 'Fri' },
    { value: 'SATURDAY', label: 'Sat' },
    { value: 'SUNDAY', label: 'Sun' },
  ]

  const weekOptions = [
    { value: 1, label: '1st' },
    { value: 2, label: '2nd' },
    { value: 3, label: '3rd' },
    { value: 4, label: '4th' },
    { value: -1, label: 'Last' },
  ]

  const toggleDay = (dayValue: string) => {
    setRecurrence(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayValue)
        ? prev.daysOfWeek.filter(d => d !== dayValue)
        : [...prev.daysOfWeek, dayValue]
    }))
  }

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
    try {
      const response = await hostsApi.create(newHost)
      setHosts([...hosts, response.data])
      setFormData({ ...formData, hostId: response.data.id })
      setNewHost({ name: '', bio: '', email: '', phone: '' })
      setShowNewHostForm(false)
    } catch (err: any) {
      alert('Failed to create host: ' + (err.response?.data || err.message))
    }
  }

  const handleCreateLocation = async () => {
    if (!newLocation.name || !newLocation.address) return
    try {
      const response = await locationsApi.create(newLocation)
      setLocations([...locations, response.data])
      setFormData({ ...formData, locationId: response.data.id })
      setNewLocation({ name: '', address: '', city: '', state: '', zipCode: '' })
      setShowNewLocationForm(false)
    } catch (err: any) {
      alert('Failed to create location: ' + (err.response?.data || err.message))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const templateData = {
        ...formData,
        recurrence: {
          ...recurrence,
          daysOfWeek: recurrence.recurrenceType === 'WEEKLY' || recurrence.recurrenceType === 'BIWEEKLY' 
            ? recurrence.daysOfWeek 
            : undefined,
          weekOfMonth: recurrence.recurrenceType === 'MONTHLY_WEEKDAY' 
            ? recurrence.weekOfMonth 
            : undefined,
          dayOfWeek: recurrence.recurrenceType === 'MONTHLY_WEEKDAY' 
            ? recurrence.dayOfWeek 
            : undefined,
        },
        ticketTypes
      }

      await templatesApi.create(templateData)
      navigate('/organizer/templates')
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create template')
    } finally {
      setIsLoading(false)
    }
  }

  const getRecurrencePreview = () => {
    const { recurrenceType, daysOfWeek, weekOfMonth, dayOfWeek, interval } = recurrence
    
    switch (recurrenceType) {
      case 'DAILY':
        return interval === 1 ? 'Every day' : `Every ${interval} days`
      case 'WEEKLY':
        const days = daysOfWeek.map(d => DAYS_OF_WEEK.find(x => x.value === d)?.label).join(', ')
        return interval === 1 ? `Every ${days}` : `Every ${interval} weeks on ${days}`
      case 'BIWEEKLY':
        const biDays = daysOfWeek.map(d => DAYS_OF_WEEK.find(x => x.value === d)?.label).join(', ')
        return `Every other week on ${biDays}`
      case 'MONTHLY':
        return `Every month on the same date`
      case 'MONTHLY_WEEKDAY':
        const weekLabel = weekOptions.find(w => w.value === weekOfMonth)?.label
        return `${weekLabel} ${dayOfWeek} of each month`
      default:
        return ''
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info', icon: Calendar },
    { number: 2, title: 'Recurrence', icon: Repeat },
    { number: 3, title: 'Host & Venue', icon: MapPin },
    { number: 4, title: 'Tickets', icon: Users },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-warmgray-900">Create Event Template</h1>
        <p className="text-warmgray-600 mt-1">Set up a reusable template for recurring events.</p>
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
                  isActive ? 'bg-coral-600 text-white' : isCompleted ? 'bg-coral-100 text-coral-700' : 'bg-warmgray-100 text-warmgray-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  isActive ? 'bg-white text-coral-600' : isCompleted ? 'bg-coral-600 text-white' : 'bg-warmgray-300 text-warmgray-600'
                }`}>
                  {isCompleted ? '✓' : s.number}
                </div>
                <span className="hidden sm:block">{s.title}</span>
              </button>
              {i < steps.length - 1 && <ChevronRight className="h-5 w-5 text-warmgray-300 mx-2" />}
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
            <h2 className="text-heading-sm font-bold text-warmgray-900">Template Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g., Sunday Drag Brunch"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-xs text-warmgray-500 mt-1">Internal name for this template</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g., Drag Brunch Sundays"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <p className="text-xs text-warmgray-500 mt-1">Title shown on each generated event</p>
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

            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="btn-primary">
                Next: Recurrence
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Recurrence */}
        {step === 2 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-heading-sm font-bold text-warmgray-900">Recurrence Pattern</h2>
            
            {/* Recurrence Type */}
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Repeat
              </label>
              <select
                className="input"
                value={recurrence.recurrenceType}
                onChange={(e) => setRecurrence({ ...recurrence, recurrenceType: e.target.value })}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Every other week</option>
                <option value="MONTHLY">Monthly (same date)</option>
                <option value="MONTHLY_WEEKDAY">Monthly (specific weekday)</option>
              </select>
            </div>

            {/* Days of Week (for weekly/biweekly) */}
            {(recurrence.recurrenceType === 'WEEKLY' || recurrence.recurrenceType === 'BIWEEKLY') && (
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Days of Week
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        recurrence.daysOfWeek.includes(day.value)
                          ? 'bg-coral-600 text-white'
                          : 'bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Weekday Options */}
            {recurrence.recurrenceType === 'MONTHLY_WEEKDAY' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">
                    Week of Month
                  </label>
                  <select
                    className="input"
                    value={recurrence.weekOfMonth}
                    onChange={(e) => setRecurrence({ ...recurrence, weekOfMonth: parseInt(e.target.value) })}
                  >
                    {weekOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    className="input"
                    value={recurrence.dayOfWeek}
                    onChange={(e) => setRecurrence({ ...recurrence, dayOfWeek: e.target.value })}
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day.value} value={day.value}>{day.value}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  className="input"
                  value={recurrence.startTime}
                  onChange={(e) => setRecurrence({ ...recurrence, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  className="input"
                  value={recurrence.endTime}
                  onChange={(e) => setRecurrence({ ...recurrence, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  className="input"
                  value={recurrence.startDate}
                  onChange={(e) => setRecurrence({ ...recurrence, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  className="input"
                  value={recurrence.endDate}
                  onChange={(e) => setRecurrence({ ...recurrence, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="bg-coral-50 border border-coral-200 rounded-xl p-4">
              <p className="text-sm font-medium text-coral-800 mb-1">Pattern Preview:</p>
              <p className="text-coral-700">{getRecurrencePreview()}</p>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="btn-outline">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary">
                Next: Host & Venue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Host & Location */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Host */}
            <div className="card p-6">
              <h2 className="text-heading-sm font-bold text-warmgray-900 mb-4">Host</h2>
              <select
                className="input mb-4"
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
                {hosts.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                <option value="new">+ Create New Host</option>
              </select>

              {showNewHostForm && (
                <div className="bg-warmgray-50 p-4 rounded-xl space-y-3">
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
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowNewHostForm(false)} className="btn-outline flex-1">Cancel</button>
                    <button type="button" onClick={handleCreateHost} className="btn-primary flex-1" disabled={!newHost.name}>
                      Create Host
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="card p-6">
              <h2 className="text-heading-sm font-bold text-warmgray-900 mb-4">Venue</h2>
              <select
                className="input mb-4"
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
                <option value="">Select a venue...</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name} {l.city ? `- ${l.city}` : ''}</option>)}
                <option value="new">+ Create New Venue</option>
              </select>

              {showNewLocationForm && (
                <div className="bg-warmgray-50 p-4 rounded-xl space-y-3">
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
                  <div className="grid grid-cols-3 gap-2">
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
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowNewLocationForm(false)} className="btn-outline flex-1">Cancel</button>
                    <button type="button" onClick={handleCreateLocation} className="btn-primary flex-1" disabled={!newLocation.name || !newLocation.address}>
                      Create Venue
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="btn-outline">Back</button>
              <button type="button" onClick={() => setStep(4)} className="btn-primary">Next: Tickets</button>
            </div>
          </div>
        )}

        {/* Step 4: Tickets */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading-sm font-bold text-warmgray-900">Default Ticket Types</h2>
                <button type="button" onClick={handleAddTicketType} className="btn-outline text-sm">
                  <Plus className="h-4 w-4 mr-1 inline" />
                  Add Ticket
                </button>
              </div>

              <div className="space-y-4">
                {ticketTypes.map((ticket, index) => (
                  <div key={index} className="bg-warmgray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-warmgray-900">Ticket {index + 1}</h3>
                      {ticketTypes.length > 1 && (
                        <button type="button" onClick={() => handleRemoveTicketType(index)} className="text-red-500 hover:text-red-700">
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-warmgray-600 mb-1">Name</label>
                        <input
                          type="text"
                          placeholder="e.g., General Admission"
                          className="input"
                          value={ticket.name}
                          onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-warmgray-600 mb-1">Price ($)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="input"
                          value={ticket.price}
                          onChange={(e) => handleTicketChange(index, 'price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-warmgray-600 mb-1">Quantity</label>
                        <input
                          type="number"
                          placeholder="100"
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
                          placeholder="What's included"
                          className="input"
                          value={ticket.description}
                          onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(3)} className="btn-outline">Back</button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? <><Loader2 className="h-5 w-5 animate-spin mr-2 inline" /> Creating...</> : 'Create Template'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
