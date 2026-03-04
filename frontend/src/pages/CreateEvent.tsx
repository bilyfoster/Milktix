import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  FileText, 
  ChevronLeft,
  Plus,
  X
} from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { eventsApi, categoriesApi } from '../utils/api'
import type { Category } from '../types'

interface TicketTypeForm {
  id: string
  name: string
  description: string
  price: string
  quantityAvailable: string
  minPerOrder: string
  maxPerOrder: string
}

export function CreateEvent() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  
  // Event details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  
  // Venue details
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [venueCity, setVenueCity] = useState('')
  const [venueState, setVenueState] = useState('')
  const [venueZip, setVenueZip] = useState('')
  
  // Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Ticket types
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    {
      id: '1',
      name: 'General Admission',
      description: 'Standard entry ticket',
      price: '',
      quantityAvailable: '',
      minPerOrder: '1',
      maxPerOrder: '10'
    }
  ])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll()
      return response.data as Category[]
    },
  })

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return eventsApi.create(data)
    },
    onSuccess: () => {
      navigate('/dashboard')
    },
  })

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: '',
      quantityAvailable: '',
      minPerOrder: '1',
      maxPerOrder: '10'
    }])
  }

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter(tt => tt.id !== id))
    }
  }

  const updateTicketType = (id: string, field: keyof TicketTypeForm, value: string) => {
    setTicketTypes(ticketTypes.map(tt => 
      tt.id === id ? { ...tt, [field]: value } : tt
    ))
  }

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const eventData = {
      title,
      description,
      startDateTime: `${startDate}T${startTime}`,
      endDateTime: `${endDate}T${endTime}`,
      venueName,
      venueAddress,
      venueCity,
      venueState,
      venueZip,
      categoryIds: selectedCategories,
      ticketTypes: ticketTypes.map(tt => ({
        name: tt.name,
        description: tt.description,
        price: parseFloat(tt.price),
        quantityAvailable: parseInt(tt.quantityAvailable),
        minPerOrder: parseInt(tt.minPerOrder),
        maxPerOrder: parseInt(tt.maxPerOrder)
      }))
    }
    
    createEventMutation.mutate(eventData)
  }

  const isStep1Valid = title && description && startDate && startTime && endDate && endTime
  const isStep2Valid = venueName && venueAddress && venueCity && venueState && venueZip
  const isStep3Valid = selectedCategories.length > 0
  const isStep4Valid = ticketTypes.every(tt => 
    tt.name && tt.price && tt.quantityAvailable
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Event</h1>
              <p className="text-sm text-gray-600">Set up your event details and tickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: 'Venue' },
              { num: 3, label: 'Category' },
              { num: 4, label: 'Tickets' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    step === s.num
                      ? 'bg-indigo-600 text-white'
                      : step > s.num
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </button>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${
                  step === s.num ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {s.label}
                </span>
                {i < 3 && (
                  <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-4 ${
                    step > s.num ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Event Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Summer Music Festival"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your event..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Venue */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                  Venue Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g., Madison Square Garden"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      placeholder="e.g., 123 Main Street"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={venueCity}
                        onChange={(e) => setVenueCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={venueState}
                        onChange={(e) => setVenueState(e.target.value)}
                        placeholder="State"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={venueZip}
                        onChange={(e) => setVenueZip(e.target.value)}
                        placeholder="ZIP"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Categories */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-indigo-600" />
                  Select Categories *
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories?.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedCategories.includes(category.id)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                    </button>
                  ))}
                </div>

                {selectedCategories.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">Please select at least one category</p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!isStep3Valid}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Ticket Types */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-indigo-600" />
                    Ticket Types *
                  </h2>
                  <button
                    type="button"
                    onClick={addTicketType}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Ticket Type
                  </button>
                </div>
                
                <div className="space-y-4">
                  {ticketTypes.map((ticketType, index) => (
                    <div key={ticketType.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Ticket Type {index + 1}</h3>
                        {ticketTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTicketType(ticketType.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={ticketType.name}
                            onChange={(e) => updateTicketType(ticketType.id, 'name', e.target.value)}
                            placeholder="e.g., VIP"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Price ($) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ticketType.price}
                            onChange={(e) => updateTicketType(ticketType.id, 'price', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={ticketType.description}
                            onChange={(e) => updateTicketType(ticketType.id, 'description', e.target.value)}
                            placeholder="What's included with this ticket?"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantity Available *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={ticketType.quantityAvailable}
                            onChange={(e) => updateTicketType(ticketType.id, 'quantityAvailable', e.target.value)}
                            placeholder="100"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Min per order
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={ticketType.minPerOrder}
                              onChange={(e) => updateTicketType(ticketType.id, 'minPerOrder', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Max per order
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={ticketType.maxPerOrder}
                              onChange={(e) => updateTicketType(ticketType.id, 'maxPerOrder', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isStep4Valid || createEventMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
